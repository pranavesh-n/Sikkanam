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

// Global list of travel-related keywords
const TRAVEL_KEYWORDS = [
  "trip", "travel", "visit", "tour", "vacation", "holiday", "itinerary", "stay", "hotel", "resort", "lodge", "room", "accommodation", 
  "budget", "cost", "price", "expense", "fare", "rupees", "inr", "rs", "transport", "bus", "train", "flight", "cab", "taxi", 
  "route", "reach", "distance", "km", "station", "junction", "railway", "airport", "attraction", "sightseeing", "temple", 
  "beach", "hill", "mountain", "waterfall", "park", "museum", "fort", "palace", "food", "restaurant", "eat", "dining", 
  "cuisine", "specialty", "local dish", "varkey", "halwa", "biryani", "explore", "guide", "plan", "map", "direction", 
  "weekend", "getaway", "journey", "destination", "attractions", "tamil nadu", "sight", "scenic", "monument", "sanctuary"
];

// Global list of common travel-related phrases
const TRAVEL_PHRASES = [
  "where can i go", "where should i go", "where to go", "places to go", 
  "where can we go", "where should we go", "places to visit", "things to do",
  "suggest a", "recommend a", "how to go", "how to reach", "budget trip"
];

// Global list of non-travel indicators to detect out-of-scope requests
const NON_TRAVEL_INDICATORS = [
  "python", "javascript", "coding", "programming", "react", "html", "css", "sql", "function", "compile", "database", 
  "math problem", "solve", "equation", "theorem", "quantum", "physics", "chemistry", "biology", "history of ww2", 
  "essay about", "write a story", "tell a joke", "news today", "stock market", "bitcoin", "crypto",
  "code", "website", "app", "application", "software", "developer", "development", "program"
];

// Helper to check if query is a greeting
function isGreeting(query) {
  const greetings = ["hi", "hello", "hey", "good morning", "good afternoon", "good evening", "greetings", "namaste", "vanakkam", "help", "who are you"];
  const words = query.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/);
  return words.some(w => greetings.includes(w));
}

// Extract parameters from query
function extractParameters(query, destinations) {
  const params = {};
  
  // 1. Extract days (e.g., "5 days", "3 day trip", "trip for 4 days")
  const dayMatch = query.match(/(\d+)\s*(?:day|night|nights|days)/i);
  if (dayMatch) {
    params.days = parseInt(dayMatch[1], 10);
  }
  
  // 2. Extract budget (e.g., "under 5000", "budget 8000", "cost around 10000", "₹12000", "4k")
  const kMatch = query.match(/(?:under|below|around|approx|budget|rs|₹|inr|cost|spend)?\s*(\d+)\s*k\b/i);
  if (kMatch) {
    params.budget = parseInt(kMatch[1], 10) * 1000;
  } else {
    const budgetMatch = query.match(/(?:under|below|around|approx|budget|rs|₹|inr|cost|spend)?\s*(\d{4,6})/i);
    if (budgetMatch) {
      params.budget = parseInt(budgetMatch[1], 10);
    }
  }

  // 2.5 Extract audience preference (e.g., youngsters, friends, adventure)
  if (query.includes("youngster") || query.includes("youth") || query.includes("friend") || query.includes("colleague") || query.includes("trek") || query.includes("adventure") || query.includes("fun")) {
    params.audience = "youngsters";
  }
  
  // 3. Extract route source/destination
  const routeMatch = query.match(/(?:from|starting at|start from|starting in)\s+([a-zA-Z]+)\s+(?:to|towards)\s+([a-zA-Z]+)/i);
  if (routeMatch) {
    params.source = routeMatch[1].trim();
    params.destination = routeMatch[2].trim();
  } else {
    const sourceMatch = query.match(/(?:from|starting at|start from|starting in)\s+([a-zA-Z]+)/i);
    if (sourceMatch) {
      params.source = sourceMatch[1].trim();
    }
  }

  // 3.5 Extract destination if not already set
  if (!params.destination) {
    for (const dest of destinations) {
      if (query.includes(dest.name.toLowerCase())) {
        if (params.source && params.source.toLowerCase() === dest.name.toLowerCase()) {
          continue;
        }
        params.destination = dest.name;
        break;
      }
    }
  }
  
  // 4. Extract category
  if (query.includes("hill") || query.includes("mountain") || query.includes("station") || query.includes("valley")) {
    params.category = "hill";
  } else if (query.includes("beach") || query.includes("sea") || query.includes("coast") || query.includes("ocean")) {
    params.category = "beach";
  } else if (query.includes("temple") || query.includes("church") || query.includes("spiritual") || query.includes("religious") || query.includes("heritage")) {
    params.category = "temple";
  } else if (query.includes("wildlife") || query.includes("forest") || query.includes("safari") || query.includes("national park") || query.includes("nature")) {
    params.category = "wildlife";
  }
  
  // 5. Extract style
  if (query.includes("budget") || query.includes("cheap") || query.includes("economical")) {
    params.style = "budget";
  } else if (query.includes("luxury") || query.includes("premium") || query.includes("expensive")) {
    params.style = "luxury";
  } else {
    params.style = "standard";
  }

  return params;
}

// Intent Classifier
function detectIntent(query, destinations) {
  const queryLower = query.toLowerCase().trim();
  
  if (isGreeting(queryLower)) {
    return { intent: "GENERAL_CHAT", params: { isGreeting: true } };
  }
  
  // Extract source first to prevent it from matching as target destination
  let sourceCity = null;
  const sourceMatch = queryLower.match(/(?:from|starting at|start from|starting in)\s+([a-zA-Z]+)/i);
  if (sourceMatch) {
    sourceCity = sourceMatch[1].trim().toLowerCase();
  }

  let travelScore = 0;
  let nonTravelScore = 0;
  let matchedDest = null;
  
  // Destination and District matching
  for (const dest of destinations) {
    if (sourceCity && sourceCity === dest.name.toLowerCase()) {
      continue;
    }
    if (queryLower.includes(dest.name.toLowerCase())) {
      travelScore += 5;
      matchedDest = dest;
    }
    if (dest.district && queryLower.includes(dest.district.toLowerCase())) {
      travelScore += 3;
    }
  }
  
  TRAVEL_KEYWORDS.forEach(kw => {
    if (queryLower.includes(kw)) {
      travelScore += 1;
    }
  });

  TRAVEL_PHRASES.forEach(phrase => {
    if (queryLower.includes(phrase)) {
      travelScore += 5;
    }
  });
  
  NON_TRAVEL_INDICATORS.forEach(nti => {
    if (queryLower.includes(nti)) {
      nonTravelScore += 5;
    }
  });

  const params = extractParameters(queryLower, destinations);
  if (matchedDest) {
    params.destination = matchedDest.name;
  }

  // Boost travel score if key parameters are present
  if (params.budget) travelScore += 5;
  if (params.days) travelScore += 5;
  if (params.destination) travelScore += 5;
  if (params.source) travelScore += 5;
  if (params.category) travelScore += 3;
  
  // Strict check: if no travel words/phrases/parameters and not a greeting, it's out of scope
  if (travelScore === 0 || (nonTravelScore > 0 && travelScore < 3)) {
    return { intent: "OUT_OF_SCOPE", params: {} };
  }
  
  let intent = "GENERAL_CHAT";
  
  if (
    queryLower.includes("route") || 
    queryLower.includes("how to reach") || 
    queryLower.includes("how to go") || 
    queryLower.includes("transport") || 
    queryLower.includes("bus") || 
    queryLower.includes("train") || 
    queryLower.includes("distance")
  ) {
    intent = "ROUTE_QUERY";
  } else if (
    queryLower.includes("hotel") || 
    queryLower.includes("stay") || 
    queryLower.includes("resort") || 
    queryLower.includes("lodge") || 
    queryLower.includes("accommodation") || 
    queryLower.includes("room")
  ) {
    intent = "HOTEL_SEARCH";
  } else if (
    queryLower.includes("plan") || 
    queryLower.includes("itinerary") || 
    queryLower.includes("trip") || 
    queryLower.includes("tour") || 
    queryLower.includes("where can i go") ||
    queryLower.includes("where should i go") ||
    queryLower.includes("where to go") ||
    queryLower.includes("places to go") ||
    queryLower.includes("suggest") ||
    queryLower.includes("recommend") ||
    params.days
  ) {
    intent = "TRIP_PLANNER";
  } else if (
    queryLower.includes("budget") || 
    queryLower.includes("cost") || 
    queryLower.includes("price") || 
    queryLower.includes("expense") || 
    queryLower.includes("how much") ||
    params.budget
  ) {
    intent = "BUDGET_QUERY";
  } else if (
    queryLower.includes("tell me about") || 
    queryLower.includes("places to visit") || 
    queryLower.includes("attractions") || 
    queryLower.includes("sightseeing") || 
    (matchedDest && (queryLower.includes("about") || queryLower.includes("info") || queryLower.includes("detail")))
  ) {
    intent = "DESTINATION_INFO";
  }
  
  return { intent, params };
}

// Generate structured response using destinations/tourism assets database offline
function generateLocalFallbackResponse(intent, params, destinations, tourismAssets, queryLower) {
  if (intent === "OUT_OF_SCOPE") {
    return "Sorry, it's beyond my knowledge. Ask me some other thing related to travel.";
  }
  
  let reply = "### 🧭 Smart Offline Travel Companion (API Offline)\n\n";
  reply += "I'm running in offline mode using the verified **Sikkanam Local Database**:\n\n";

  if (intent === "TRIP_PLANNER") {
    if (params.destination) {
      const dest = destinations.find(d => d.name.toLowerCase() === params.destination.toLowerCase());
      if (dest) {
        const days = params.days || dest.recommendedDays || 2;
        const stayCost = days * 1000;
        const foodCost = days * 400;
        const localTravel = days * 200;
        const totalBudget = stayCost + foodCost + localTravel + 1000;
        
        reply += `Here is a custom **${days}-Day Budget Itinerary** for **${dest.fullName || dest.name}**:\n\n`;
        reply += `* **About**: ${dest.description}\n`;
        reply += `* **Why Visit**: ${dest.whyVisit || "Excellent sightseeing and local experiences."}\n`;
        reply += `* **Best Time**: ${dest.bestMonths?.join(", ") || "All year round"}\n`;
        reply += `* **Nearest Station**: ${dest.nearestStation || "N/A"}\n\n`;
        
        reply += `#### 💰 Estimated Budget (for 1 person, ${days} days):\n`;
        reply += `- 🏨 **Lodging (Budget Lodge)**: ~₹${stayCost} (approx ₹1000/night)\n`;
        reply += `- 🍛 **Food (Local Eateries)**: ~₹${foodCost} (approx ₹400/day)\n`;
        reply += `- 🚌 **Local Transit (Buses/Autos)**: ~₹${localTravel}\n`;
        reply += `- 🎒 **Recommended Carry Amount**: **~₹${totalBudget}** (includes inter-city transit buffer & entry fees)\n\n`;
        
        reply += `#### 📅 Day-Wise Plan:\n`;
        const attrs = dest.attractions || [];
        if (attrs.length > 0) {
          const perDay = Math.ceil(attrs.length / days);
          for (let i = 0; i < days; i++) {
            const dayAttrs = attrs.slice(i * perDay, (i + 1) * perDay);
            if (dayAttrs.length > 0) {
              reply += `* **Day ${i + 1}**: Visit ${dayAttrs.join(", ")}\n`;
            }
          }
        }
        return reply;
      }
    }

    if (params.budget) {
      let filtered = destinations;
      if (params.audience === "youngsters") {
        filtered = destinations.filter(d => d.category === "hill" || d.category === "beach");
      }
      
      const affordable = [];
      const dailyCost = 1500;
      
      for (const d of filtered) {
        let targetDays = Math.min(d.recommendedDays || 2, Math.floor(params.budget / dailyCost));
        if (targetDays === 0 && params.budget >= 1000) {
          targetDays = 1;
        }
        
        if (targetDays > 0) {
          const cost = targetDays * dailyCost;
          affordable.push({
            name: d.name,
            fullName: d.fullName || d.name,
            category: d.category,
            whyVisit: d.whyVisit || d.description,
            attractions: d.attractions,
            days: targetDays,
            cost: cost
          });
        }
      }
      
      // Sort so that destinations where we can afford more days (or recommended days) appear first
      affordable.sort((a, b) => b.days - a.days);
      const topAffordable = affordable.slice(0, 3);
      
      if (topAffordable.length > 0) {
        reply += `Here are budget-friendly recommendations fitting your **₹${params.budget}** budget ${params.source ? `starting from **${params.source.charAt(0).toUpperCase() + params.source.slice(1)}**` : ""} ${params.audience === "youngsters" ? "for youngsters (beaches & hill stations)" : ""}:\n\n`;
        topAffordable.forEach(d => {
          reply += `#### 📍 ${d.name} (${d.category === "hill" ? "Hill Station" : "Beach" || d.category})\n`;
          reply += `* **Highlight**: ${d.whyVisit}\n`;
          reply += `* **Estimated Cost**: ~₹${d.cost} for a **${d.days}-day trip**\n`;
          reply += `* **Must-See**: ${d.attractions?.slice(0, 3).join(", ") || ""}\n\n`;
        });
        reply += `*Tip: Ask me to plan a trip to a specific place (e.g., "Plan a trip to ${topAffordable[0].name}") for a day-wise plan.*`;
        return reply;
      }
    }
    
    if (params.category) {
      const matching = destinations.filter(d => d.category === params.category).slice(0, 3);
      if (matching.length > 0) {
        reply += `Here are the top **${params.category} destinations** in Tamil Nadu based on your request:\n\n`;
        matching.forEach(dest => {
          reply += `#### 📍 ${dest.name} (${dest.district} District)\n`;
          reply += `* **Description**: ${dest.description}\n`;
          reply += `* **Attractions**: ${dest.attractions?.slice(0, 4).join(", ") || ""}\n`;
          reply += `* **Recommended Stay**: ${dest.recommendedDays} days\n\n`;
        });
        reply += `*To get a full itinerary, try asking: "Plan a trip to ${matching[0].name}"*`;
        return reply;
      }
    }

    reply += `Here is a curated list of budget travel recommendations across Tamil Nadu:\n\n`;
    const sampleDests = [
      { name: "Ooty", cat: "Hill Station", desc: "Misty mountains, UNESCO Toy Train, tea estates." },
      { name: "Madurai", cat: "Heritage & Temple", desc: "Historic temple city, rich culture, and famous street food." },
      { name: "Rameswaram", cat: "Coastal & Spiritual", desc: "Pamban bridge, spiritual temples, and peaceful beaches." }
    ];
    sampleDests.forEach(sd => {
      const dest = destinations.find(d => d.name.toLowerCase() === sd.name.toLowerCase());
      reply += `#### 📍 ${sd.name} (${sd.cat})\n`;
      reply += `* **Highlight**: ${sd.desc}\n`;
      if (dest) {
        reply += `* **Must-See**: ${dest.attractions?.slice(0, 3).join(", ") || ""}\n`;
        reply += `* **Estimated Budget**: ~₹${(dest.recommendedDays || 2) * 1600} for ${dest.recommendedDays || 2} days\n`;
      }
      reply += `\n`;
    });
    reply += `*Tip: Ask me to plan a trip to a specific place (e.g., "Plan a 3 day trip to Ooty") for a day-wise plan.*`;
    return reply;
  }
  
  if (intent === "DESTINATION_INFO") {
    if (params.destination) {
      const dest = destinations.find(d => d.name.toLowerCase() === params.destination.toLowerCase());
      if (dest) {
        reply += `#### 📍 ${dest.fullName || dest.name} (${dest.district} District)\n`;
        reply += `* **Description**: ${dest.description}\n`;
        reply += `* **Why Visit**: ${dest.whyVisit || "Fascinating local tourism and scenic views."}\n`;
        reply += `* **Best Months**: ${dest.bestMonths?.join(", ") || "All year round"}\n`;
        reply += `* **Category**: ${dest.category.toUpperCase()}\n`;
        reply += `* **Accessibility**: Nearest railway station is ${dest.nearestStation || "N/A"}. ${dest.hasRailAccess ? "Has direct rail connectivity." : "Requires bus/taxi from nearest hub."}\n`;
        reply += `* **Must-See Attractions**:\n`;
        dest.attractions?.forEach(attr => {
          reply += `  - ${attr}\n`;
        });
        return reply;
      }
    }
    
    reply += "Which destination would you like to know about? Here are some verified options in our database:\n\n";
    destinations.slice(0, 10).forEach(d => {
      reply += `- **${d.name}** (${d.category} - ${d.district} district)\n`;
    });
    reply += `\nPlease specify one, e.g., "Tell me about ${destinations[0]?.name || "Ooty"}"`;
    return reply;
  }
  
  if (intent === "BUDGET_QUERY") {
    if (params.destination) {
      const dest = destinations.find(d => d.name.toLowerCase() === params.destination.toLowerCase());
      if (dest) {
        const days = params.days || dest.recommendedDays || 2;
        const stayCost = days * 1000;
        const foodCost = days * 400;
        const transitCost = days * 200;
        const total = stayCost + foodCost + transitCost + 1000;
        
        reply += `Here is the estimated cost breakdown for visiting **${dest.name}** for **${days} days**:\n\n`;
        reply += `* 🏨 **Budget Stays**: ~₹${stayCost} (₹1000/night average)\n`;
        reply += `* 🍛 **Meals/Food**: ~₹${foodCost} (₹400/day average)\n`;
        reply += `* 🚌 **Local Transit**: ~₹${transitCost} (local buses and sharing autos)\n`;
        reply += `* 🎟️ **Sightseeing & Entry Fees**: ~₹500\n`;
        reply += `* 🎒 **Recommended Budget Carry**: **~₹${total}** per person (with a ₹500 buffer)\n\n`;
        reply += `*Sikkanam Advice: To keep costs low, travel via state transport (TNSTC) and stay in local guest houses near the central bus stand.*`;
        return reply;
      }
    }
    
    if (params.budget) {
      reply += `Here are destinations you can visit with a budget of **₹${params.budget}**:\n\n`;
      const affordable = destinations.filter(d => {
        const cost = (d.recommendedDays || 2) * 1600;
        return cost <= params.budget;
      }).slice(0, 5);
      
      if (affordable.length > 0) {
        affordable.forEach(d => {
          const cost = (d.recommendedDays || 2) * 1600;
          reply += `- **${d.name}** (~₹${cost} for ${d.recommendedDays || 2} days, ${d.category} destination)\n`;
        });
        reply += `\n*Ask me about a specific place to see its budget details!*`;
      } else {
        reply += `A budget of ₹${params.budget} is a bit tight for standard trips. However, you can plan a short 1-day trip to closer destinations like:\n`;
        destinations.slice(0, 3).forEach(d => {
          reply += `- **${d.name}** (approx ₹1500 for a 1-day quick trip)\n`;
        });
      }
      return reply;
    }
    
    reply += `Typical travel expenses in Tamil Nadu (per person, per day):\n\n`;
    reply += `1. **Pocket Friendly**: ₹1200 - ₹1500/day (Dormitories/budget lodge, local mess food, local buses).\n`;
    reply += `2. **Standard**: ₹2000 - ₹2500/day (Standard AC room, family restaurant meals, auto/cab travel).\n\n`;
    reply += `*Tip: Ask me like "How much budget for Ooty?" or "Plan a trip under 5000" for exact recommendations.*`;
    return reply;
  }
  
  if (intent === "HOTEL_SEARCH") {
    if (params.destination) {
      const dest = destinations.find(d => d.name.toLowerCase() === params.destination.toLowerCase());
      if (dest) {
        reply += `Here are the lodging options in **${dest.name}**:\n\n`;
        reply += `1. 🎒 **Budget Guesthouses / Homestays**: ₹800 - ₹1200 / night\n`;
        reply += `   * Best for solo travelers and budget backpackers.\n`;
        reply += `   * Locations: Usually found near the main Bus Stand or Railway Station.\n`;
        reply += `2. 🏢 **Standard Hotels (Double Bed)**: ₹1500 - ₹2500 / night\n`;
        reply += `   * Best for families. Includes basic amenities like hot water, Wi-Fi, and room service.\n`;
        reply += `3. 🏡 **Premium Resorts / Cottages**: ₹3000+ / night\n`;
        reply += `   * Best for comfort, offering scenic views and in-house restaurants.\n\n`;
        reply += `*Sikkanam Trust Tip: For ${dest.name}, we recommend booking properties verified by Tamil Nadu Tourism (TTDC) or properties with high safety scores near central hubs.*`;
        return reply;
      }
    }
    
    reply += `Lodging options across Tamil Nadu generally range from:\n`;
    reply += `- Budget Room / Lodge: ₹800 - ₹1200 / night\n`;
    reply += `- Standard Room: ₹1500 - ₹2500 / night\n`;
    reply += `- Premium/Resort Room: ₹3000+ / night\n\n`;
    reply += `*Please specify a destination, e.g., "Hotels in Ooty" or "Where to stay in Madurai" to see localized pricing.*`;
    return reply;
  }
  
  if (intent === "ROUTE_QUERY") {
    if (params.destination) {
      const dest = destinations.find(d => d.name.toLowerCase() === params.destination.toLowerCase());
      if (dest) {
        reply += `Here is how you can travel to **${dest.name}**:\n\n`;
        reply += `* 🚉 **By Train**: Nearest railway station is **${dest.nearestStation || "N/A"}**. ${dest.hasRailAccess ? "Direct trains are available from Chennai, Trichy, and Madurai." : `You will need to take a train to ${dest.nearestStation} and then transit by bus or local cab.`}\n`;
        reply += `* 🚌 **By Bus**: State transport (TNSTC) and private SETC buses run regular services to the central bus stand. Fares are highly economical (approx ₹200 - ₹400 for distances under 300km).\n`;
        reply += `* 🚗 **By Road**: Well connected by national and state highways. Private cabs or self-driven vehicles can reach easily.\n\n`;
        
        if (dest.nearestStation && dest.nearestStation !== "N/A") {
          reply += `*Recommended budget route from Chennai:* Take an overnight train to **${dest.nearestStation}** (Sleeper class: ~₹250 - ₹350), followed by a local TNSTC connection bus (₹50 - ₹120).\n`;
        }
        return reply;
      }
    }
    
    reply += `Tamil Nadu features an extensive public transit network:\n\n`;
    reply += `1. **TNSTC Buses**: Highly frequent, connecting all towns and villages. Very cheap (₹50 - ₹300).\n`;
    reply += `2. **IRCTC Trains**: The most comfortable budget option for long distances. Standard Sleeper class fares range between ₹200 and ₹450 across the state.\n\n`;
    reply += `*Specify a destination to get precise routes, e.g., "How to reach Ooty" or "Trains to Madurai".*`;
    return reply;
  }
  
  if (intent === "GENERAL_CHAT") {
    if (params.isGreeting) {
      return `👋 Hello! I am **Sikkanam AI**, your Tamil Nadu budget travel companion.\n\n` +
             `I can help you:\n` +
             `- 🧭 **Plan detailed budget itineraries** (e.g., *"Plan a 3-day trip to Ooty"*)\n` +
             `- 💰 **Analyze travel costs and budgets** (e.g., *"How much budget for Madurai?"* or *"Trip under 5000"*)\n` +
             `- 🏨 **Recommend hotels and stay tiers** (e.g., *"Stays in Kodaikanal"*)\n` +
             `- 🚌 **Provide transit routes and advice** (e.g., *"How to reach Rameshwaram"*)\n\n` +
             `How can I assist you with your travel planning today?`;
    }
  }

  return `I am **Sikkanam AI**, a dedicated travel planning assistant for Tamil Nadu.\n\n` +
         `Please ask me anything related to travel, destinations, itineraries, budgets, hotels, or transport routes in Tamil Nadu. I'll be glad to help!`;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

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

    const lastUserMessage = messages && messages.length > 0 ? messages[messages.length - 1].content : "";
    const normalizedQuery = lastUserMessage ? lastUserMessage.trim().toLowerCase() : "";

    // Load local destinations database
    const filePath = path.join(process.cwd(), "api", "destinations.json");
    let destinations = [];
    try {
      destinations = JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch (err) {
      console.error("Failed to read destinations.json for RAG:", err);
    }

    // Load local tourism assets database
    const assetsFilePath = path.join(process.cwd(), "api", "tourism_assets.json");
    let tourismAssets = [];
    try {
      if (fs.existsSync(assetsFilePath)) {
        tourismAssets = JSON.parse(fs.readFileSync(assetsFilePath, "utf8"));
      }
    } catch (err) {
      console.error("Failed to read tourism_assets.json for RAG:", err);
    }

    // 1. Detect Intent and Extract Parameters
    const { intent, params } = detectIntent(lastUserMessage, destinations);
    console.log(`[Sikkanam AI debug] Query: "${lastUserMessage}" | Detected Intent: ${intent} | Params:`, params);

    // 2. If intent is OUT_OF_SCOPE, immediately return safety response
    if (intent === "OUT_OF_SCOPE") {
      const reply = "Sorry, it's beyond my knowledge. Ask me some other thing related to travel.";
      console.log(`[Sikkanam AI debug] Query is OUT_OF_SCOPE. Serving safety message.`);
      return res.status(200).json({ reply });
    }

    // Check Local Cache first (Instant response, zero cost)
    const fullNormalizedQuery = prompt ? prompt.trim().toLowerCase() : "";
    const cachePath = path.join(process.cwd(), "api", "chat_cache.json");
    if (fs.existsSync(cachePath)) {
      try {
        const cache = JSON.parse(fs.readFileSync(cachePath, "utf8"));
        if (cache[fullNormalizedQuery]) {
          console.log("Serving reply from local chat cache.");
          return res.status(200).json({
            reply: cache[fullNormalizedQuery],
          });
        }
      } catch (err) {
        console.error("Failed to parse cache:", err);
      }
    }

    // Retrieve RAG Context block
    const matchedDestinations = [];
    if (params.destination) {
      const found = destinations.find(d => d.name.toLowerCase() === params.destination.toLowerCase());
      if (found) matchedDestinations.push(found);
    }
    
    // Additional keyword destination matching if none found
    if (matchedDestinations.length === 0) {
      for (const dest of destinations) {
        if (
          normalizedQuery.includes(dest.name.toLowerCase()) ||
          (dest.district && normalizedQuery.includes(dest.district.toLowerCase()))
        ) {
          matchedDestinations.push(dest);
        }
      }
    }

    // Category fallback if no specific destination matched
    if (matchedDestinations.length === 0 && destinations.length > 0) {
      let matchedCategory = params.category;
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
        if (normalizedQuery.includes(titleLower) && matchedAssets.length < 5) {
          matchedAssets.push(asset);
        }
      }
      
      // Fallback: category/keyword matching if not enough specific assets matched
      if (matchedAssets.length < 3) {
        let keyword = params.category === "wildlife" ? "eco" : params.category === "temple" ? "heritage" : null;
        if (!keyword) {
          if (normalizedQuery.includes("beach") || normalizedQuery.includes("coast")) {
            keyword = "beach";
          } else if (normalizedQuery.includes("eco") || normalizedQuery.includes("trek") || normalizedQuery.includes("safari") || normalizedQuery.includes("wildlife") || normalizedQuery.includes("nature")) {
            keyword = "eco";
          } else if (normalizedQuery.includes("heritage") || normalizedQuery.includes("temple") || normalizedQuery.includes("palace") || normalizedQuery.includes("fort")) {
            keyword = "heritage";
          } else if (normalizedQuery.includes("food") || normalizedQuery.includes("culinary") || normalizedQuery.includes("dish") || normalizedQuery.includes("cuisine") || normalizedQuery.includes("eat") || normalizedQuery.includes("specialty") || normalizedQuery.includes("sweet") || normalizedQuery.includes("snack")) {
            keyword = "culinary";
          }
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

CRITICAL SAFETY RULE:
If the user asks a question that is NOT related to travel, tourism, hotel, transport, itineraries, food, or activities in Tamil Nadu/general travel, you MUST reply exactly with the following phrase and nothing else:
"Sorry, it's beyond my knowledge. Ask me some other thing related to travel."
Do not answer any non-travel questions under any circumstances.

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
            max_tokens: 2048,
          }),
        });

        const data = await response.json();
        console.log("Groq response status:", response.status);

        if (response.status === 200 && data.choices && data.choices[0] && data.choices[0].message) {
          const reply = data.choices[0].message.content;
          saveToCache(fullNormalizedQuery, reply);
          return res.status(200).json({ reply });
        } else {
          console.error("Groq returned status/data error:", data);
        }
      } catch (err) {
        console.error("Groq API request failed, trying fallback to Gemini:", err);
      }
    }

    // 2. Fallback to Gemini API if key is present
    if (GEMINI_API_KEY && !GEMINI_API_KEY.includes("YOUR_")) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
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
                maxOutputTokens: 2048,
              },
            }),
          }
        );

        const data = await response.json();
        console.log("Gemini response status:", response.status);

        if (
          response.status === 200 &&
          data.candidates &&
          data.candidates[0] &&
          data.candidates[0].content &&
          data.candidates[0].content.parts &&
          data.candidates[0].content.parts[0]
        ) {
          const reply = data.candidates[0].content.parts[0].text;
          saveToCache(fullNormalizedQuery, reply);
          return res.status(200).json({ reply });
        } else {
          console.error("Gemini returned status/data error:", data);
        }
      } catch (err) {
        console.error("Gemini API request failed:", err);
      }
    }

    // 3. Robust Offline Fallback (If all APIs fail or keys are invalid/missing/rate-limited)
    console.log("All AI APIs unavailable or rate-limited. Serving local database response.");
    const offlineReply = generateLocalFallbackResponse(intent, params, destinations, tourismAssets, normalizedQuery);
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
