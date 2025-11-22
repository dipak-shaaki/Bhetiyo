import fetch from "node-fetch";

const OPENAI_KEY = process.env.OPENAI_API_KEY;
const EMBEDDING_MODEL = "text-embedding-3-small"; // or change as you prefer

async function getTextEmbedding(text) {
  if (!OPENAI_KEY) return [];
  try {
    const resp = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_KEY}`
      },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        input: text
      })
    });
    const data = await resp.json();
    // data.data[0].embedding is an array of floats
    return data?.data?.[0]?.embedding || [];
  } catch (err) {
    console.error("embedding error", err);
    return [];
  }
}

export default { getTextEmbedding };
