import fetch from "node-fetch";

const OPENAI_KEY = process.env.OPENAI_API_KEY;
const MODEL = "gpt-4o-mini"; // pick an appropriate model available to you; or "gpt-4o" / "gpt-4" if available

async function generateMatchNotification({ lostItem, foundItem, score }) {
  if (!OPENAI_KEY) {
    return {
      subject: `Possible match for your lost item: ${lostItem.title}`,
      message: `A found item posted by someone closely matches your lost item titled "${lostItem.title}". Confidence: ${(score*100).toFixed(0)}%.`
    };
  }

  const prompt = `
You are an assistant that writes short, polite notifications for a lost-item owner.
Context:
- Lost item title: ${lostItem.title}
- Lost item description: ${lostItem.description}
- Lost item location: ${lostItem.locationText}
- Found item title: ${foundItem.title}
- Found item description: ${foundItem.description}
- Found item location: ${foundItem.locationText}
- Similarity score: ${(score*100).toFixed(1)}%

Task:
Return a JSON object exactly with keys "subject" and "message".
Keep the message 2-4 sentences, polite and instructive. Include a step to verify the item and encourage meeting in a public place.

Example output:
{"subject":"Possible match for your lost item","message":"..."}
`;

  try {
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 200,
        temperature: 0.2
      })
    });
    const data = await resp.json();
    const text = data?.choices?.[0]?.message?.content?.trim();

    // Try to parse JSON from model output
    try {
      const parsed = JSON.parse(text);
      return {
        subject: parsed.subject || `Possible match for your lost item: ${lostItem.title}`,
        message: parsed.message || text
      };
    } catch (err) {
      // fallback
      return { subject: `Possible match for your lost item: ${lostItem.title}`, message: text };
    }
  } catch (err) {
    console.error("notificationAI error", err);
    return {
      subject: `Possible match for your lost item: ${lostItem.title}`,
      message: `A found item likely matches your lost item. Confidence: ${(score*100).toFixed(0)}%. Please verify details safely.`
    };
  }
}

export default { generateMatchNotification };
