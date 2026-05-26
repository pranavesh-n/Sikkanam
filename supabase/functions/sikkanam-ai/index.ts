// Sikkanam AI — Tamil Nadu travel companion via Google Gemini API (direct)
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SYSTEM_PROMPT = `You are Sikkanam AI — a smart, friendly Tamil Nadu travel companion. You specialize in:
- Budget trip planning (₹1000–₹25000) across Tamil Nadu
- Destination recommendations (hills, beaches, temples, wildlife, heritage)
- Realistic transport: TNSTC buses, IRCTC trains, autos
- Affordable hotels (TTDC, lodges, mid-range)
- Day-by-day itineraries with local food tips
- Practical advice in INR (₹) only

Keep replies concise, warm, mobile-friendly. Use markdown headings, bullets, and emojis sparingly. Always think like a Tamil Nadu local who travels smart. If asked about places outside Tamil Nadu, gently redirect.`;

const GEMINI_MODEL = "gemini-2.0-flash";
const LOVABLE_MODEL = "google/gemini-3-flash-preview";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractReply(payload: any) {
  return payload?.candidates?.[0]?.content?.parts
    ?.map((part: { text?: string }) => part?.text ?? "")
    .join("")
    .trim() ?? "";
}

async function callGemini(model: string, contents: Array<{ role: string; parts: Array<{ text: string }> }>, apiKey: string) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: AbortSignal.timeout(18000),
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents,
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: 384,
        candidateCount: 1,
      },
    }),
  });
}

async function callLovableAi(messages: Array<{ role: string; content: string }>, apiKey: string) {
  return fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
    },
    signal: AbortSignal.timeout(18000),
    body: JSON.stringify({
      model: LOVABLE_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages,
      ],
      temperature: 0.6,
      max_tokens: 384,
    }),
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

    // Convert OpenAI-style messages to Gemini "contents"
    const contents = (messages as Array<{ role: string; content: string }>).map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    let lastStatus = 500;
    let lastBody = "";
    let reply = "";

    const geminiResponse = await callGemini(GEMINI_MODEL, contents, GEMINI_API_KEY);

    if (geminiResponse.ok) {
      const payload = await geminiResponse.json();
      reply = extractReply(payload);
      if (!reply) {
        lastStatus = 500;
        lastBody = JSON.stringify(payload);
      }
    } else {
      lastStatus = geminiResponse.status;
      lastBody = await geminiResponse.text();
      console.error("Gemini error:", GEMINI_MODEL, geminiResponse.status, lastBody);
    }

    if (!reply && lastStatus === 429 && LOVABLE_API_KEY) {
      await sleep(300);
      const fallbackResponse = await callLovableAi(messages, LOVABLE_API_KEY);
      if (fallbackResponse.ok) {
        const fallbackPayload = await fallbackResponse.json();
        reply = fallbackPayload?.choices?.[0]?.message?.content?.trim?.() ?? "";
        if (!reply) {
          lastStatus = 500;
          lastBody = JSON.stringify(fallbackPayload);
        }
      } else {
        lastStatus = fallbackResponse.status;
        lastBody = await fallbackResponse.text();
        console.error("Lovable AI fallback error:", fallbackResponse.status, lastBody);
      }
    }

    if (!reply) {
      console.error("Gemini empty response:", lastBody);
      return new Response(
        JSON.stringify({
          error: lastStatus === 429
            ? "AI is busy right now. Please retry in a moment."
            : lastStatus === 400
              ? "AI request could not be processed."
              : "AI returned an empty reply.",
        }),
        {
          status: lastStatus === 429 ? 429 : lastStatus === 400 ? 400 : 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("sikkanam-ai error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
