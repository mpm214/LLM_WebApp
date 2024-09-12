// src/services/arxiv/arxivCall.js

require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
const axios = require('axios');
const xml2js = require('xml2js');
const { OpenAIEmbeddings } = require('@langchain/openai');
const { QdrantClient } = require('@qdrant/js-client-rest');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const { categoryMapping } = require('./arxivCategoryMap');
const { v4: uuidv4 } = require('uuid');

// Constants
const VECTOR_SIZE = 1536;
const MAX_RESULTS = 10; // Adjust as needed

// Setup Qdrant client
const setupQdrantClient = () => {
  const client = new QdrantClient({
    url: process.env.QDRANT_HOST,
    apiKey: process.env.QDRANT_API_KEY,
  });

  return client;
};

// Setup OpenAI embeddings
const setupEmbeddings = () => {
  console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY);
  return new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
  });
};

// Fetch papers from arXiv
const fetchPapers = async (query, maxResults) => {
  const url = `http://export.arxiv.org/api/query?search_query=${encodeURIComponent(query)}&max_results=${maxResults}`;
  const response = await axios.get(url);
  const parser = new xml2js.Parser({ explicitArray: false });
  const result = await parser.parseStringPromise(response.data);
  console.log('ArXiv API response:', JSON.stringify(result, null, 2));
  return Array.isArray(result.feed.entry) ? result.feed.entry : [result.feed.entry];
};

// Extract metadata from arXiv entry
const extractMetadata = (entry) => {
  return {
    title: entry.title,
    URL: entry.id,
    authors: Array.isArray(entry.author) ? entry.author.map(a => a.name) : [entry.author.name],
    summary: entry.summary,
    published: entry.published,
    updated: entry.updated,
    categories: Array.isArray(entry.category) 
      ? entry.category.map(c => categoryMapping[c['$'].term] || 'Unknown category')
      : [categoryMapping[entry.category['$'].term] || 'Unknown category'],
    primary_category: Array.isArray(entry.category) 
      ? (categoryMapping[entry.category[0]['$'].term] || 'Unknown category')
      : (categoryMapping[entry.category['$'].term] || 'Unknown category'),
  };
};

// Split text into chunks
const splitTextIntoChunks = async (text, metadata) => {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 300,
    chunkOverlap: 100,
  });
  
  try {
    const chunks = await splitter.splitText(text);
    
    if (!Array.isArray(chunks)) {
      console.log('Chunks is not an array:', chunks);
      return [{ text, metadata: { ...metadata, text_chunk: text.slice(0, 100) } }];
    }
    
    return chunks.map(chunk => ({
      text: chunk,
      metadata: { ...metadata, text_chunk: chunk.slice(0, 100) }
    }));
  } catch (error) {
    console.error('Error splitting text:', error);
    return [{ text, metadata: { ...metadata, text_chunk: text.slice(0, 100) } }];
  }
};

// Process and store papers
const processPapers = async (query, maxResults, qdrantClient, embeddings) => {
  const papers = await fetchPapers(query, maxResults);
  console.log('Fetched papers:', papers.length);
  let allChunks = [];

  const processedPapers = papers.map(extractMetadata);

  for (const paper of processedPapers) {
    const chunks = await splitTextIntoChunks(paper.summary, paper);
    allChunks = allChunks.concat(chunks);
  }

  const texts = allChunks.map(chunk => chunk.text);
  const vectorsWithPayloads = await Promise.all(texts.map(async (text, index) => {
    const vector = await embeddings.embedQuery(text);
    return {
      id: uuidv4(),
      vector,
      payload: allChunks[index].metadata
    };
  }));

  try {
    await qdrantClient.upsert(process.env.QDRANT_COLLECTION_NAME, {
      wait: true,
      points: vectorsWithPayloads,
    });
    console.log(`Stored ${vectorsWithPayloads.length} text chunks in Qdrant.`);
  } catch (error) {
    console.error('Error upserting points to Qdrant:', error);
    throw error;
  }

  return processedPapers;
};

// Main function
const main = async (query, maxResults) => {
  try {
    const papers = await fetchPapers(query, maxResults);
    console.log('Fetched papers:', papers.length);
    return { feed: { entry: papers } };
  } catch (error) {
    console.error('Error in ArXiv call:', error);
    throw error;
  }
};

// Export the main function
module.exports = { runArxivCall: main };