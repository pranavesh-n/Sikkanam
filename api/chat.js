import fs from "fs";
import path from "path";

// Helper to save successful responses to cache
function saveToCache(normalizedQuery, reply) {
  const cachePath = path.join(process.cwd(), "api", "chat_cache.json");
  let cache = {};
  try {
    if (fs.existsSync(cachePath)) {
      cache = JSON.parse(fs.readFileSync(cachePath, "utf8"));
    }
  } catch (err) {
    // Cache file might not exist yet
  }
  cache[normalizedQuery] = reply;
  try {
    fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2), "utf8");
  } catch (err) {
    // Ignore filesystem errors in serverless read-only environments
    console.warn("Could not write cache file (this is normal on serverless platforms):", err.message);
  }
}

// Helper to generate a structured budget itinerary using only destinations.json
function generateLocalFallbackResponse(matchedDestinations) {
  let reply = "### 🧭 Offline Travel Planner (AI Traffic Backup)\n\n";
  reply += "Due to high traffic or API rate limits, I have generated this budget itinerary directly from the verified **Sikkanam Local Database**:\n\n";

  if (matchedDestinations.length > 0) {
    matchedDestinations.forEach((d) => {
      reply += `#### 📍 ${d.name} (${d.district} District)\n`;
      reply += `* **About**: ${d.description}\n`;
      reply += `* **Why Visit**: ${d.whyVisit || "Excellent sightseeing and local experiences."}\n`;
      reply += `* **Best Time to Visit**: ${d.bestMonths?.join(", ") || "All year round"}\n`;
      reply += `* **Nearest Railway Hub**: ${d.nearestStation || "N/A"}\n`;
      reply += `* **Recommended Duration**: ${d.recommendedDays || 2} days\n`;
      reply += `* **Must-See Attractions**:\n`;
      if (d.attractions && d.attractions.length > 0) {
        d.attractions.forEach((attr) => {
          reply += `  - ${attr}\n`;
        });
      }
      
      const days = d.recommendedDays || 2;
      const stayCost = days * 1000; // ~₹1000/night budget lodging
      const foodCost = days * 400;  // ~₹400/day local mess food
      const localTravel = days * 200; // ~₹200/day local transit
      const totalBudget = stayCost + foodCost + localTravel + 1000; // base transit/buffer
      
      reply += `* **Estimated Budget Breakdown (for 1 person, ${days} days)**:\n`;
      reply += `  - 🏨 **Lodging (Budget Lodge)**: ~₹${stayCost} (approx ₹1000/night)\n`;
      reply += `  - 🍛 **Food (Local Eateries)**: ~₹${foodCost} (approx ₹400/day)\n`;
      reply += `  - 🚌 **Local Transit (Buses/Autos)**: ~₹${localTravel}\n`;
      reply += `  - 🎒 **Recommended Carry Amount**: **~₹${totalBudget}** (including entry fees & emergency buffer)\n\n`;
      
      reply += `##### 📅 Day-Wise Plan:\n`;
      const attrs = d.attractions || [];
      if (attrs.length > 0) {
        const perDay = Math.ceil(attrs.length / days);
        for (let i = 0; i < days; i++) {
          const dayAttrs = attrs.slice(i * perDay, (i + 1) * perDay);
          reply += `  * **Day ${i + 1}**: Visit ${dayAttrs.join(", ")}\n`;
        }
      }
      reply += `\n---\n\n`;
    });
  } else {
    reply += "I couldn't find a specific destination in your message, but here are some popular budget travel options in Tamil Nadu:\n\n";
    reply += "1. **Ooty (Nilgiris)**: Famous hill station with UNESCO Nilgiri Mountain Railway, tea estates, and botanical wonderlands.\n";
    reply += "2. **Kodaikanal (Dindigul)**: Beautiful lake town with pine forests, waterfalls, and scenic viewpoints.\n";
    reply += "3. **Rameswaram (Ramanathapuram)**: Spiritual beach town with the Ramanathaswamy Temple, holy wells, and Dhanushkodi beach.\n";
    reply += "4. **Madurai**: Historic temple city famous for the Meenakshi Amman Temple and delicious street food.\n\n";
    reply += "Please try your query again in a few moments, or ask about a specific destination above to generate a offline budget plan!";
  }
  return reply;
}

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

    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    const prompt = messages
      ?.map((m) => `${m.role}: ${m.content}`)
      .join("\n");

    const normalizedQuery = prompt ? prompt.trim().toLowerCase() : "";

    // A. Check Local Cache first (Instant response, zero cost)
    const cachePath = path.join(process.cwd(), "api", "chat_cache.json");
    if (fs.existsSync(cachePath)) {
      try {
        const cache = JSON.parse(fs.readFileSync(cachePath, "utf8"));
        if (cache[normalizedQuery]) {
          console.log("Serving reply from local chat cache.");
          return res.status(200).json({
            reply: cache[normalizedQuery],
          });
        }
      } catch (err) {
        console.error("Failed to parse cache:", err);
      }
    }

    // Load local destinations database for RAG & Fallback
    const filePath = path.join(process.cwd(), "api", "destinations.json");
    let destinations = [];
    try {
      destinations = JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch (err) {
      console.error("Failed to read destinations.json for RAG:", err);
    }

    // Load local tourism assets database (compiled from official booklets)
    const assetsFilePath = path.join(process.cwd(), "api", "tourism_assets.json");
    let tourismAssets = [];
    try {
      if (fs.existsSync(assetsFilePath)) {
        tourismAssets = JSON.parse(fs.readFileSync(assetsFilePath, "utf8"));
      }
    } catch (err) {
      console.error("Failed to read tourism_assets.json for RAG:", err);
    }

    // RAG Retrieval logic: Search for matching destinations or categories in query
    const matchedDestinations = [];
    const queryLower = normalizedQuery;

    for (const dest of destinations) {
      if (
        queryLower.includes(dest.name.toLowerCase()) ||
        (dest.district && queryLower.includes(dest.district.toLowerCase()))
      ) {
        matchedDestinations.push(dest);
      }
    }

    // Category fallback if no specific destination matched
    if (matchedDestinations.length === 0 && destinations.length > 0) {
      let matchedCategory = null;
      if (queryLower.includes("hill") || queryLower.includes("mountain") || queryLower.includes("station")) {
        matchedCategory = "hill";
      } else if (queryLower.includes("beach") || queryLower.includes("sea") || queryLower.includes("coast")) {
        matchedCategory = "beach";
      } else if (queryLower.includes("temple") || queryLower.includes("church") || queryLower.includes("spiritual") || queryLower.includes("landmark")) {
        matchedCategory = "temple";
      } else if (queryLower.includes("wildlife") || queryLower.includes("forest") || queryLower.includes("zoo") || queryLower.includes("safari") || queryLower.includes("nature")) {
        matchedCategory = "wildlife";
      }

      if (matchedCategory) {
        const categoryDests = destinations.filter((d) => d.category === matchedCategory).slice(0, 3);
        matchedDestinations.push(...categoryDests);
      }
    }

    // RAG Retrieval for specific assets (beaches, eco, heritage, culinary)
    const matchedAssets = [];
    if (tourismAssets.length > 0) {
      for (const asset of tourismAssets) {
        const titleLower = asset.title.toLowerCase();
        if (queryLower.includes(titleLower) && matchedAssets.length < 5) {
          matchedAssets.push(asset);
        }
      }
      
      // Fallback: category/keyword matching if not enough specific assets matched
      if (matchedAssets.length < 3) {
        let keyword = null;
        if (queryLower.includes("beach") || queryLower.includes("coast")) {
          keyword = "beach";
        } else if (queryLower.includes("eco") || queryLower.includes("trek") || queryLower.includes("safari") || queryLower.includes("wildlife") || queryLower.includes("nature")) {
          keyword = "eco";
        } else if (queryLower.includes("heritage") || queryLower.includes("temple") || queryLower.includes("palace") || queryLower.includes("fort")) {
          keyword = "heritage";
        } else if (queryLower.includes("food") || queryLower.includes("culinary") || queryLower.includes("dish") || queryLower.includes("cuisine") || queryLower.includes("eat") || queryLower.includes("specialty") || queryLower.includes("sweet") || queryLower.includes("snack")) {
          keyword = "culinary";
        }
        
        if (keyword) {
          const categoryAssets = tourismAssets.filter(a => a.category === keyword).slice(0, 3 - matchedAssets.length);
          matchedAssets.push(...categoryAssets);
        }
      }
    }

    // Build RAG Context block
    let ragContext = "";
    if (matchedDestinations.length > 0) {
      ragContext = "\nHere is verified information about the destinations matching the user's inquiry from the Sikkanam Database:\n";
      matchedDestinations.forEach((d) => {
        ragContext += `- **${d.name}** (District: ${d.district}, Category: ${d.category}): ${d.description}. Key Attractions: ${d.attractions?.join(", ") || "None"}. Recommended duration: ${d.recommendedDays || 2} days. Travel insight: ${d.whyVisit || ""}\n`;
      });
      ragContext += "\nUse the details above as the source of truth for your suggestions and cost estimations.\n";
    }

    if (matchedAssets.length > 0) {
      ragContext += "\nHere is verified information about specific Tamil Nadu tourism assets (beaches, eco-spots, heritage sites, regional cuisines) from official brochures:\n";
      matchedAssets.forEach((a) => {
        ragContext += `- **${a.title}** (${a.location || "Tamil Nadu"}, Category: ${a.category}): USP - ${a.usp}. Details: ${a.description.substring(0, 300)}...\n`;
      });
      ragContext += "\nUse these details to make your food, sightseeing, or travel suggestions highly accurate and descriptive.\n";
    }

    const systemPromptText = `
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
- Focus on budget travel (stays around ₹800-₹1500/night, meals around ₹300-₹500/day)
- Suggest buses (TNSTC) or trains (IRCTC) instead of private cabs to keep costs low
- Prefer Tamil Nadu locations first
- Give day-wise plans for itineraries
- Ensure travel times, routes, and transport modes are realistic:
  * Trains from Chennai to Mettupalayam (Nilgiri Express) or Coimbatore are overnight trains taking 8-9 hours (e.g., depart 9:05 PM, arrive 6:15 AM). There are no day trains that take only 4 hours.
  * The Nilgiri Mountain Railway (Toy Train) from Mettupalayam to Ooty runs ONLY ONCE daily, departing at 07:10 AM and arriving at 11:55 AM. The return train departs Ooty at 2:00 PM. It does not run in the afternoon at 1:30 PM.
  * Suggest frequent local TNSTC buses (approx. ₹80, 2 hours) from Mettupalayam/Coimbatore to Ooty as a primary or fallback option.
  * Chennai to Hogenakkal: The best route from Chennai is to take a train to Salem Junction (approx. 5.5 hours, Sleeper Class ₹240/person) and then take a local TNSTC bus from Salem Central Bus Stand to Hogenakkal Falls (approx. ₹80, 2.5 hours). Keep travel times realistic (approx. 8 hours total transit).
  * Train Seating Classes: For budget trips (e.g., under ₹5000), NEVER suggest 1st AC (1A) or 2nd AC (2A) as they are too expensive. Always suggest Sleeper Class (SL) or Second Seating (2S) which cost ₹150–₹350 per ticket.
  * Travel Speeds & Durations: A distance of 300–450 km (e.g., Chennai to Salem, Madurai, or Trichy) takes 5 to 7 hours by express train or 6 to 8 hours by bus. Do not claim day trains can cover these distances in 3–4 hours.
${ragContext}
`;

    // 1. Prioritize GROQ API if key is present
    if (GROQ_API_KEY && !GROQ_API_KEY.includes("YOUR_")) {
      try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: [
              {
                role: "system",
                content: systemPromptText,
              },
              ...messages,
            ],
            temperature: 0.7,
            max_tokens: 1024,
          }),
        });

        const data = await response.json();
        console.log("Groq response status:", response.status);

        if (data.choices && data.choices[0] && data.choices[0].message) {
          const reply = data.choices[0].message.content;
          saveToCache(normalizedQuery, reply);
          return res.status(200).json({ reply });
        } else {
          console.error("Groq returned status/data error:", data);
        }
      } catch (err) {
        console.error("Groq API request failed, trying fallback:", err);
      }
    }

    // 2. Fallback to Gemini API if key is present
    if (GEMINI_API_KEY && !GEMINI_API_KEY.includes("YOUR_")) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
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
                      text: `${systemPromptText}\nUser query:\n${prompt}`,
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
        console.log("Gemini response status:", response.status);

        if (
          data.candidates &&
          data.candidates[0] &&
          data.candidates[0].content &&
          data.candidates[0].content.parts &&
          data.candidates[0].content.parts[0]
        ) {
          const reply = data.candidates[0].content.parts[0].text;
          saveToCache(normalizedQuery, reply);
          return res.status(200).json({ reply });
        } else {
          console.error("Gemini returned status/data error:", data);
        }
      } catch (err) {
        console.error("Gemini API request failed:", err);
      }
    }

    // 3. Robust Offline Fallback (If all APIs fail or keys are invalid/missing)
    console.log("All AI APIs unavailable. Serving local database response.");
    const offlineReply = generateLocalFallbackResponse(matchedDestinations);
    return res.status(200).json({
      reply: offlineReply,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: error.message,
    });
  }
}
