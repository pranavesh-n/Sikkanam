export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const { messages } = req.body;

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      return res.status(500).json({
        error: "Missing Gemini API key",
      });
    }

    const prompt = messages
      ?.map((m) => `${m.role}: ${m.content}`)
      .join("\n");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `
You are Sikkanam AI.

You are a smart Tamil Nadu budget travel planner.

Your job:
- suggest trips
- create itineraries
- recommend transport
- estimate budgets
- suggest food and stays
- give practical local travel advice

Rules:
- Give detailed but concise answers
- Use bullet points when useful
- Mention approximate costs
- Focus on budget travel
- Be friendly and practical
- Prefer Tamil Nadu locations first
- Suggest buses/trains when possible
- Give day-wise plans for itineraries

User query:
${prompt}
                  `,
                },
              ],
            },
          ],

          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    const data = await response.json();

    console.log("Gemini response:", data);

   console.log(JSON.stringify(data));

let reply = "No response from AI";

if (
  data.candidates &&
  data.candidates[0] &&
  data.candidates[0].content &&
  data.candidates[0].content.parts &&
  data.candidates[0].content.parts[0]
) {
  reply = data.candidates[0].content.parts[0].text;
}

    return res.status(200).json({
      reply,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: error.message,
    });
  }
}
