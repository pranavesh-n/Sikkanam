export interface IndoorSpot {
  name: string;
  emoji: string;
}

export const indoorSpotsByDestination: Record<string, IndoorSpot[]> = {
  kodaikanal: [
    { name: "Shenbaganur Museum of Natural History", emoji: "🏛️" },
    { name: "La Saleth Historic Church", emoji: "⛪" },
    { name: "Wax World Museum Kodai", emoji: "🪵" },
    { name: "Orchidarium & Glasshouse", emoji: "🌸" },
  ],
  valparai: [
    { name: "Aliyar Reservoir Interpretive Centre", emoji: "💧" },
    { name: "Sholayar Hydroelectric Visitor Corridor", emoji: "🌊" },
    { name: "Parambikulam Wildlife Interpretation Centre", emoji: "🐅" },
    { name: "Nirar Dam Visitor Hall", emoji: "🏞️" },
  ],
  ooty: [
    { name: "Tribal Research Center Museum", emoji: "🏛️" },
    { name: "Government Museum Ooty", emoji: "📜" },
    { name: "Tea Museum & Factory", emoji: "🍵" },
    { name: "Honey & Bee Museum", emoji: "🐝" },
  ],
  yercaud: [
    { name: "Silk Farm & Processing Centre", emoji: "🧵" },
    { name: "Shevaroy Cave Temple Interior", emoji: "🛕" },
    { name: "Anna Park Indoor Glasshouse", emoji: "🪴" },
    { name: "Heritage Coffee Estate Processing Unit", emoji: "☕" },
  ],
  chennai: [
    { name: "Government Museum Egmore", emoji: "🏛️" },
    { name: "Fort St. George Museum", emoji: "🏰" },
    { name: "B.M. Birla Planetarium", emoji: "🌌" },
    { name: "National Art Gallery", emoji: "🎨" },
  ],
  madurai: [
    { name: "Thirumalai Nayakkar Palace Indoor Court", emoji: "🏰" },
    { name: "Gandhi Memorial Museum", emoji: "🕊️" },
    { name: "Government Museum Madurai", emoji: "🏛️" },
    { name: "Meenakshi Temple Thousand Pillar Mandapam", emoji: "🛕" },
  ],
  thanjavur: [
    { name: "Thanjavur Royal Palace Art Gallery", emoji: "🎨" },
    { name: "Saraswathi Mahal Library", emoji: "📚" },
    { name: "Maratha Palace Museum", emoji: "🏰" },
    { name: "Government Museum Thanjavur", emoji: "🏛️" },
  ],
  kanyakumari: [
    { name: "Vivekananda Rock Memorial Indoor Hall", emoji: "🗿" },
    { name: "Gandhi Memorial Mandapam", emoji: "🕊️" },
    { name: "Government Museum Kanyakumari", emoji: "🏛️" },
    { name: "Mayapuri Wonder Wax Museum", emoji: "🪵" },
  ],
  rameshwaram: [
    { name: "Dr. A.P.J. Abdul Kalam Memorial", emoji: "🚀" },
    { name: "Ramanathaswamy Temple 1000-Pillar Corridor", emoji: "🛕" },
    { name: "Sea Shell Museum Rameshwaram", emoji: "🐚" },
  ],
  coimbatore: [
    { name: "Gass Forest Museum", emoji: "🌲" },
    { name: "G.D. Naidu Industrial & Car Museum", emoji: "🚗" },
    { name: "Textile Museum Coimbatore", emoji: "🧵" },
  ],
  trichy: [
    { name: "Rani Mangammal Mahal Museum", emoji: "🏰" },
    { name: "Railway Heritage Centre", emoji: "🚂" },
    { name: "St. Joseph's Church Interior", emoji: "⛪" },
  ],
  puducherry: [
    { name: "Puducherry Museum", emoji: "🏛️" },
    { name: "French Institute & Archives", emoji: "📖" },
    { name: "Romain Rolland Library", emoji: "📚" },
    { name: "Sacred Heart Basilica Interior", emoji: "⛪" },
  ],
};

export const defaultIndoorByCategory: Record<string, IndoorSpot[]> = {
  hill: [
    { name: "Regional Natural History Museum", emoji: "🏛️" },
    { name: "Heritage Tea & Botanical Glasshouse", emoji: "🌿" },
    { name: "Tribal Craft & Handicrafts Centre", emoji: "🎨" },
    { name: "Local Heritage Cave Sanctum", emoji: "🛕" },
  ],
  temple: [
    { name: "Historic Temple Art & Sculpture Gallery", emoji: "🎨" },
    { name: "Heritage Mandapam Corridor", emoji: "🛕" },
    { name: "District Archaeological Museum", emoji: "📜" },
    { name: "Traditional Craft & Bronze Centre", emoji: "🕯️" },
  ],
  beach: [
    { name: "Maritime & Heritage Museum", emoji: "⚓" },
    { name: "Memorial Cultural Hall", emoji: "🏛️" },
    { name: "Local Aquarium & Shell Art Center", emoji: "🐚" },
    { name: "Coastal Craft Emporium", emoji: "🛍️" },
  ],
  heritage: [
    { name: "Palace Art & Antiquities Museum", emoji: "🏰" },
    { name: "District Archaeological Gallery", emoji: "📜" },
    { name: "Saraswathi Heritage Library & Archives", emoji: "📚" },
    { name: "Royal Armoury & Craft Centre", emoji: "⚔️" },
  ],
  city: [
    { name: "State Government Museum", emoji: "🏛️" },
    { name: "Science & Planetarium Centre", emoji: "🌌" },
    { name: "National Art & Handloom Emporium", emoji: "🎨" },
    { name: "Heritage Cultural Centre", emoji: "🎭" },
  ],
  wildlife: [
    { name: "Forest Ecology & Wildlife Interpretation Museum", emoji: "🐅" },
    { name: "Nature & Conservation Visitor Centre", emoji: "🍃" },
    { name: "Tribal Heritage Museum", emoji: "🏹" },
  ],
};

export function getIndoorAlternatives(destinationId: string, category: string): IndoorSpot[] {
  const normalizedId = destinationId.toLowerCase();
  if (indoorSpotsByDestination[normalizedId]) {
    return indoorSpotsByDestination[normalizedId];
  }
  return defaultIndoorByCategory[category] || defaultIndoorByCategory.hill;
}
