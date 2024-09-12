import { QdrantClient } from '@qdrant/js-client-rest';

let qdrantClient = null;

export const getQdrantClient = () => {
  if (!qdrantClient) {
    qdrantClient = new QdrantClient({
      url: process.env.REACT_APP_QDRANT_HOST,
      apiKey: process.env.REACT_APP_QDRANT_API_KEY,
    });
  }
  return qdrantClient;
};

export const ensureCollectionExists = async (collectionName, vectorSize) => {
  const client = getQdrantClient();
  try {
    await client.getCollection(collectionName);
  } catch (error) {
    if (error.status === 404) {
      await client.createCollection(collectionName, {
        vectors: {
          size: vectorSize,
          distance: 'Cosine',
        },
      });
    } else {
      throw error;
    }
  }
};