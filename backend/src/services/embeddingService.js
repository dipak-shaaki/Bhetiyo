import fetch from "node-fetch";
import NodeCache from "node-cache";

// Only load dotenv if environment variables are not already set
// This prevents conflicts when the service is used within the main application
if (!process.env.OPENAI_API_KEY) {
  import('dotenv').then(dotenv => {
    dotenv.config();
  });
}

const OPENAI_KEY = process.env.OPENAI_API_KEY;
const EMBEDDING_MODEL = "text-embedding-3-small";
const CACHE_TTL = 60 * 60; // 1 hour cache
const MAX_RETRIES = 3;

// Initialize cache
const cache = new NodeCache({ stdTTL: CACHE_TTL });

// Function to delay execution
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getTextEmbedding(text) {
  // Check if OPENAI_KEY is available (might not be available immediately due to dynamic import)
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn("OpenAI API key not configured");
    return [];
  }

  if (!text || typeof text !== 'string') {
    console.warn("Invalid text input for embedding");
    return [];
  }

  // Check cache first
  const cacheKey = `embedding_${text}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // Retry mechanism
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const resp = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: EMBEDDING_MODEL,
          input: text
        })
      });

      if (!resp.ok) {
        const errorData = await resp.json();
        throw new Error(`OpenAI API error: ${resp.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await resp.json();
      const embedding = data?.data?.[0]?.embedding || [];

      // Cache the result
      cache.set(cacheKey, embedding);

      return embedding;
    } catch (err) {
      console.error(`Embedding attempt ${attempt} failed:`, err.message);

      // If this is the last attempt, re-throw the error
      if (attempt === MAX_RETRIES) {
        throw err;
      }

      // Wait before retrying (exponential backoff)
      await delay(1000 * Math.pow(2, attempt));
    }
  }
}

// Function to get embeddings for multiple texts
async function getTextEmbeddings(texts) {
  // Check if OPENAI_KEY is available (might not be available immediately due to dynamic import)
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn("OpenAI API key not configured");
    return [];
  }

  if (!Array.isArray(texts) || texts.length === 0) {
    console.warn("Invalid texts input for embeddings");
    return [];
  }

  try {
    const resp = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        input: texts
      })
    });

    if (!resp.ok) {
      const errorData = await resp.json();
      throw new Error(`OpenAI API error: ${resp.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await resp.json();
    return data?.data?.map(item => item.embedding) || [];
  } catch (err) {
    console.error("Batch embedding error:", err);
    throw err;
  }
}

// Function to get image embedding (placeholder for future implementation)
async function getImageEmbedding(imageUrl) {
  // This would require a different approach, possibly using OpenAI's vision API
  // For now, we'll return an empty array
  console.warn("Image embedding not yet implemented");
  return [];
}

export default {
  getTextEmbedding,
  getTextEmbeddings,
  getImageEmbedding
};