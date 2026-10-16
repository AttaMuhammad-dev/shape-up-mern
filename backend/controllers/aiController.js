import asyncHandler from "express-async-handler";
import dns from "node:dns";

// Windows / Node IPv6 connection drop fix
dns.setDefaultResultOrder("ipv4first");

let cachedModel = null;

// Dynamic model discovery for your API key
async function getAvailableModel(apiKey) {
  if (cachedModel) return cachedModel;

  try {
    const listRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    const listData = await listRes.json();

    if (listData.models && Array.isArray(listData.models)) {
      // Find an active model supporting generateContent (prioritizing 2.0-flash, flash, then any gemini)
      const validModel = listData.models.find(
        (m) =>
          m.supportedGenerationMethods?.includes("generateContent") &&
          (m.name.includes("2.0-flash") || m.name.includes("flash") || m.name.includes("gemini"))
      );

      if (validModel) {
        cachedModel = validModel.name;
        return cachedModel;
      }
    }
  } catch (err) {
    console.warn("⚠️ ListModels check skipped:", err.message);
  }

  // Safe fallback for v1beta
  cachedModel = "models/gemini-2.0-flash";
  return cachedModel;
}

const chatWithAI = asyncHandler(async (req, res) => {
  const { message, userData } = req.body;

  if (process.env.AI_ENABLED !== 'true') {
    return res.status(503).json({ reply: 'AI service/API unavailable in this demo. The external AI API is not currently configured. Please try the workout and calculator tools.' });
  }
  if (typeof message !== 'string' || !message.trim() || message.length > 2000) {
    return res.status(400).json({ reply: 'Please enter a message between 1 and 2000 characters.' });
  }

  // 1. Load & sanitize key
  const API_KEY = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : null;

  if (!API_KEY) {
    console.error("❌ CRITICAL: GEMINI_API_KEY is missing.");
    return res.status(503).json({ reply: 'AI coaching is temporarily unavailable.' });
  }

  // 2. Prepare Context
  const name = userData?.name || "Athlete";
  const goal = userData?.goal || "General Fitness";
  const weight = userData?.weight ? `${userData.weight}kg` : "unknown weight";

  const systemInstruction = `
    ROLE:
    You are "Shape Up AI", a world-class personal trainer embedded in the Shape Up app.
    You are talking to **${name}**.
    Their goal is **${goal}**.
    Their weight is **${weight}**.

    APP FEATURES:
    - Nutrition Checker, BMR Calculator, Workout Database, Dashboard.

    RULES:
    1. Be Personalized.
    2. Tone: High energy, professional 🏋️‍♂️🥗.
    3. Brevity: Short answers (max 3 sentences).
    4. Safety: Medical issues -> See a doctor.

    USER SAYS: "${message}"
  `;

  try {
    // 3. Resolve active model dynamically
    let modelName = await getAvailableModel(API_KEY);
    const cleanModel = modelName.startsWith("models/") ? modelName : `models/${modelName}`;
    console.log(`🧠 AI Selected Model: ${cleanModel}`);

    // 4. Generate Content
    let response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/${cleanModel}:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemInstruction }] }],
        }),
      }
    );

    let data = await response.json();

    // 5. Retry fallback with gemini-2.0-flash if the primary model returned 404
    if (!response.ok && response.status === 404 && cleanModel !== "models/gemini-2.0-flash") {
      console.log("Retrying with models/gemini-2.0-flash...");
      cachedModel = "models/gemini-2.0-flash";
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemInstruction }] }],
          }),
        }
      );
      data = await response.json();
    }

    if (!response.ok) {
      cachedModel = null;
      console.error("Google API Error:", JSON.stringify(data));
      throw new Error(data.error?.message || "Google API Error");
    }

    const botReply =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "Let's work out! 💪";

    res.json({ reply: botReply });
  } catch (error) {
    console.error("❌ AI Controller Error:", error.message);
    res.status(500).json({ reply: "My brain is buffering 🧠. Please try again!" });
  }
});

export { chatWithAI };
