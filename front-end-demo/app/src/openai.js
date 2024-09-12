import OpenAI from 'openai';
import { queryQdrant } from './services/api'; // New import for API calls

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: This is not recommended for production
});

export async function sendMsgToOpenAI(message) {
  try {
    // Query Qdrant for relevant information
    const relevantChunks = await queryQdrant(message);

    // Construct a prompt that includes the relevant information
    let prompt = `The user asked: "${message}"\n\n`;
    prompt += "Relevant information from ArXiv papers:\n";
    relevantChunks.forEach((chunk, index) => {
      prompt += `${index + 1}. ${chunk.content}\n`;
      prompt += `   (From: "${chunk.metadata.title}" by ${chunk.metadata.authors})\n\n`;
    });
    prompt += "\nBased on this information, please provide a comprehensive answer to the user's question.";

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {"role": "system", "content": "You are a helpful assistant that provides information based on recent ArXiv papers."},
        {"role": "user", "content": prompt}
      ],
      max_tokens: 150
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error in sendMsgToOpenAI:", error);
    throw error;
  }
}