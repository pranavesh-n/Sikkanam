export interface AttractionDetail {
  name: string;
  category: string;
  entryFeeAdult: number;
  entryFeeChild: number;
  parkingFee: number;
  cameraFee: number;
  lastVerified: string;
  verificationSource: string;
  databaseVersion: string;
}

export const ACTIVITY_DATABASE: Record<string, AttractionDetail> = {
  // Ooty Attractions
  "ooty-lake": {
    name: "Ooty Lake",
    category: "Boating & Leisure",
    entryFeeAdult: 30,
    entryFeeChild: 15,
    parkingFee: 30,
    cameraFee: 30,
    lastVerified: "2025-06",
    verificationSource: "Tamil Nadu Tourism (TTDC)",
    databaseVersion: "TN-Attractions-v1.0"
  },
  "botanical-garden": {
    name: "Government Botanical Garden",
    category: "Park & Garden",
    entryFeeAdult: 50,
    entryFeeChild: 25,
    parkingFee: 40,
    cameraFee: 50,
    lastVerified: "2025-06",
    verificationSource: "TN Department of Horticulture",
    databaseVersion: "TN-Attractions-v1.0"
  },
  "doddabetta-peak": {
    name: "Doddabetta Peak",
    category: "Viewpoint",
    entryFeeAdult: 10,
    entryFeeChild: 5,
    parkingFee: 30,
    cameraFee: 20,
    lastVerified: "2025-06",
    verificationSource: "TN Forest Department",
    databaseVersion: "TN-Attractions-v1.0"
  },
  "pykara-lake": {
    name: "Pykara Lake & Boating",
    category: "Boating & Lake",
    entryFeeAdult: 20,
    entryFeeChild: 10,
    parkingFee: 20,
    cameraFee: 30,
    lastVerified: "2025-06",
    verificationSource: "TTDC Boating House",
    databaseVersion: "TN-Attractions-v1.0"
  },
  "rose-garden": {
    name: "Government Rose Garden",
    category: "Park & Garden",
    entryFeeAdult: 30,
    entryFeeChild: 15,
    parkingFee: 30,
    cameraFee: 50,
    lastVerified: "2025-06",
    verificationSource: "TN Department of Horticulture",
    databaseVersion: "TN-Attractions-v1.0"
  },
  "mudumalai": {
    name: "Mudumalai Tiger Reserve",
    category: "Wildlife Safari",
    entryFeeAdult: 100,
    entryFeeChild: 50,
    parkingFee: 50,
    cameraFee: 50,
    lastVerified: "2025-06",
    verificationSource: "TN Forest Department Portal",
    databaseVersion: "TN-Attractions-v1.0"
  },

  // Kodaikanal Attractions
  "kodai-lake": {
    name: "Kodaikanal Lake",
    category: "Lake & Walk",
    entryFeeAdult: 0,
    entryFeeChild: 0,
    parkingFee: 20,
    cameraFee: 0,
    lastVerified: "2025-06",
    verificationSource: "Kodaikanal Municipality",
    databaseVersion: "TN-Attractions-v1.0"
  },
  "coaker-s-walk": {
    name: "Coaker's Walk",
    category: "Scenic Path",
    entryFeeAdult: 20,
    entryFeeChild: 10,
    parkingFee: 20,
    cameraFee: 30,
    lastVerified: "2025-06",
    verificationSource: "Kodaikanal Municipality",
    databaseVersion: "TN-Attractions-v1.0"
  },
  "bryant-park": {
    name: "Bryant Park",
    category: "Park & Garden",
    entryFeeAdult: 30,
    entryFeeChild: 15,
    parkingFee: 30,
    cameraFee: 50,
    lastVerified: "2025-06",
    verificationSource: "TN Department of Horticulture",
    databaseVersion: "TN-Attractions-v1.0"
  },
  "pillar-rocks": {
    name: "Pillar Rocks Viewpoint",
    category: "Viewpoint",
    entryFeeAdult: 10,
    entryFeeChild: 5,
    parkingFee: 20,
    cameraFee: 20,
    lastVerified: "2025-06",
    verificationSource: "TN Forest Department",
    databaseVersion: "TN-Attractions-v1.0"
  },
  "pine-forest": {
    name: "Pine Forest",
    category: "Nature Spot",
    entryFeeAdult: 10,
    entryFeeChild: 5,
    parkingFee: 20,
    cameraFee: 20,
    lastVerified: "2025-06",
    verificationSource: "TN Forest Department",
    databaseVersion: "TN-Attractions-v1.0"
  },

  // Trichy Attractions
  "rock-fort-temple": {
    name: "Rock Fort Temple",
    category: "Historic Temple",
    entryFeeAdult: 0,
    entryFeeChild: 0,
    parkingFee: 20,
    cameraFee: 20,
    lastVerified: "2025-06",
    verificationSource: "Hindu Religious & Charitable Endowments",
    databaseVersion: "TN-Attractions-v1.0"
  },
  "sri-ranganathaswamy": {
    name: "Sri Ranganathaswamy Temple",
    category: "Historic Temple",
    entryFeeAdult: 0,
    entryFeeChild: 0,
    parkingFee: 30,
    cameraFee: 50,
    lastVerified: "2025-06",
    verificationSource: "Srirangam Temple Board",
    databaseVersion: "TN-Attractions-v1.0"
  },
  "jambukeswarar-temple": {
    name: "Jambukeswarar Temple",
    category: "Historic Temple",
    entryFeeAdult: 0,
    entryFeeChild: 0,
    parkingFee: 20,
    cameraFee: 0,
    lastVerified: "2025-06",
    verificationSource: "HR&CE Dept Tamil Nadu",
    databaseVersion: "TN-Attractions-v1.0"
  },
  "mukkombu-barrage": {
    name: "Mukkombu Barrage & Park",
    category: "Dam & Park",
    entryFeeAdult: 20,
    entryFeeChild: 10,
    parkingFee: 25,
    cameraFee: 25,
    lastVerified: "2025-06",
    verificationSource: "PWD Tiruchirappalli",
    databaseVersion: "TN-Attractions-v1.0"
  },

  // Chennai Attractions
  "government-museum-chennai": {
    name: "Government Museum Chennai",
    category: "Museum & History",
    entryFeeAdult: 15,
    entryFeeChild: 10,
    parkingFee: 30,
    cameraFee: 25,
    lastVerified: "2025-06",
    verificationSource: "National Museum Council Portal",
    databaseVersion: "TN-Attractions-v1.0"
  },
  "marina-beach": {
    name: "Marina Beach",
    category: "Beach",
    entryFeeAdult: 0,
    entryFeeChild: 0,
    parkingFee: 20,
    cameraFee: 0,
    lastVerified: "2025-06",
    verificationSource: "Greater Chennai Corporation",
    databaseVersion: "TN-Attractions-v1.0"
  },
  "guindy-national-park": {
    name: "Guindy National Park & Snake Park",
    category: "Zoo & Nature",
    entryFeeAdult: 20,
    entryFeeChild: 10,
    parkingFee: 30,
    cameraFee: 25,
    lastVerified: "2025-06",
    verificationSource: "TN Forest Wildlife Division",
    databaseVersion: "TN-Attractions-v1.0"
  },
  "vandalur-zoo": {
    name: "Arignar Anna Zoological Park",
    category: "Zoo & Wildlife",
    entryFeeAdult: 115,
    entryFeeChild: 60,
    parkingFee: 50,
    cameraFee: 100,
    lastVerified: "2025-06",
    verificationSource: "Vandalur Zoo Management Portal",
    databaseVersion: "TN-Attractions-v1.0"
  },

  // Mahabalipuram Attractions
  "shore-temple": {
    name: "Shore Temple & Pancha Rathas",
    category: "UNESCO Heritage Site",
    entryFeeAdult: 40,
    entryFeeChild: 0,
    parkingFee: 40,
    cameraFee: 25,
    lastVerified: "2025-06",
    verificationSource: "Archaeological Survey of India (ASI)",
    databaseVersion: "TN-Attractions-v1.0"
  },

  // Madurai Attractions
  "meenakshi-temple": {
    name: "Meenakshi Amman Temple",
    category: "Historic Temple",
    entryFeeAdult: 0,
    entryFeeChild: 0,
    parkingFee: 30,
    cameraFee: 0,
    lastVerified: "2025-06",
    verificationSource: "Madurai Meenakshi HR&CE Board",
    databaseVersion: "TN-Attractions-v1.0"
  },
  "thirumalai-nayakar-mahal": {
    name: "Thirumalai Nayakkar Mahal",
    category: "Historic Palace",
    entryFeeAdult: 20,
    entryFeeChild: 10,
    parkingFee: 20,
    cameraFee: 50,
    lastVerified: "2025-06",
    verificationSource: "TN Archaeological Department",
    databaseVersion: "TN-Attractions-v1.0"
  },
  "gandhi-museum": {
    name: "Gandhi Memorial Museum",
    category: "Museum",
    entryFeeAdult: 0,
    entryFeeChild: 0,
    parkingFee: 20,
    cameraFee: 10,
    lastVerified: "2025-06",
    verificationSource: "Gandhi Museum Trust Madurai",
    databaseVersion: "TN-Attractions-v1.0"
  },

  // Rameshwaram Attractions
  "ramanathaswamy-temple": {
    name: "Ramanathaswamy Temple",
    category: "Historic Temple",
    entryFeeAdult: 0,
    entryFeeChild: 0,
    parkingFee: 30,
    cameraFee: 0,
    lastVerified: "2025-06",
    verificationSource: "Rameswaram Temple Administration",
    databaseVersion: "TN-Attractions-v1.0"
  },
  "dhanushkodi-beach": {
    name: "Dhanushkodi Lands End",
    category: "Beach & Nature",
    entryFeeAdult: 0,
    entryFeeChild: 0,
    parkingFee: 30,
    cameraFee: 0,
    lastVerified: "2025-06",
    verificationSource: "Ramanathapuram District Authority",
    databaseVersion: "TN-Attractions-v1.0"
  },

  // Kanyakumari Attractions
  "vivekananda-rock": {
    name: "Vivekananda Rock Memorial & Ferry",
    category: "Monument & Ferry",
    entryFeeAdult: 70,
    entryFeeChild: 35,
    parkingFee: 30,
    cameraFee: 30,
    lastVerified: "2025-06",
    verificationSource: "Vivekananda Kendra",
    databaseVersion: "TN-Attractions-v1.0"
  },
  "thiruvalluvar-statue": {
    name: "Thiruvalluvar Statue",
    category: "Monument",
    entryFeeAdult: 0,
    entryFeeChild: 0,
    parkingFee: 0,
    cameraFee: 0,
    lastVerified: "2025-06",
    verificationSource: "TN Tourism Board",
    databaseVersion: "TN-Attractions-v1.0"
  },

  // Thanjavur Attractions
  "brihadeeswarar-temple": {
    name: "Brihadeeswarar Temple (Big Temple)",
    category: "UNESCO Heritage Site",
    entryFeeAdult: 0,
    entryFeeChild: 0,
    parkingFee: 30,
    cameraFee: 0,
    lastVerified: "2025-06",
    verificationSource: "Archaeological Survey of India (ASI)",
    databaseVersion: "TN-Attractions-v1.0"
  },
  "tanjore-palace": {
    name: "Thanjavur Maratha Palace Complex",
    category: "Palace & Museum",
    entryFeeAdult: 50,
    entryFeeChild: 25,
    parkingFee: 30,
    cameraFee: 50,
    lastVerified: "2025-06",
    verificationSource: "Thanjavur Royal Palace Board",
    databaseVersion: "TN-Attractions-v1.0"
  },

  // Chidambaram Attractions
  "natarajar-temple": {
    name: "Natarajar Temple",
    category: "Historic Temple",
    entryFeeAdult: 0,
    entryFeeChild: 0,
    parkingFee: 20,
    cameraFee: 0,
    lastVerified: "2025-06",
    verificationSource: "Natarajar Temple Trust Chidambaram",
    databaseVersion: "TN-Attractions-v1.0"
  },
  "pichavaram-mangrove": {
    name: "Pichavaram Mangrove Boating",
    category: "Boating & Eco-Tourism",
    entryFeeAdult: 120,
    entryFeeChild: 60,
    parkingFee: 30,
    cameraFee: 50,
    lastVerified: "2025-06",
    verificationSource: "Tamil Nadu Forest Department (Chidambaram)",
    databaseVersion: "TN-Attractions-v1.0"
  },

  // Courtallam Attractions
  "courtallam-falls": {
    name: "Courtallam Main Falls",
    category: "Waterfall",
    entryFeeAdult: 0,
    entryFeeChild: 0,
    parkingFee: 20,
    cameraFee: 0,
    lastVerified: "2025-06",
    verificationSource: "Tenkasi District Administration",
    databaseVersion: "TN-Attractions-v1.0"
  },
  "five-falls": {
    name: "Five Falls (Aintharuvi)",
    category: "Waterfall",
    entryFeeAdult: 0,
    entryFeeChild: 0,
    parkingFee: 20,
    cameraFee: 0,
    lastVerified: "2025-06",
    verificationSource: "Tenkasi District Administration",
    databaseVersion: "TN-Attractions-v1.0"
  }
};

export function getAttractionDetail(attractionName: string): AttractionDetail {
  // Clean name
  const clean = attractionName
    .replace(/\(.*\)/g, "") // remove parentheses
    .replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDC00-\uDFFF]/g, "") // remove emojis
    .toLowerCase()
    .trim()
    .replace(/[\s\W]+/g, "-")
    .replace(/^-|-$/g, "");

  // Match clean key directly
  if (clean && ACTIVITY_DATABASE[clean]) {
    return ACTIVITY_DATABASE[clean];
  }

  // Substring matching against keys
  const matchKey = Object.keys(ACTIVITY_DATABASE).find(key => 
    clean.includes(key) || key.includes(clean)
  );

  if (matchKey) {
    return ACTIVITY_DATABASE[matchKey];
  }

  // Fallback defaults if not found (as specified in v4.2 strategy)
  const displayName = attractionName.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDC00-\uDFFF]/g, "").trim();
  const lowerName = displayName.toLowerCase();
  const isFree = lowerName.includes("temple") || 
                 lowerName.includes("beach") || 
                 lowerName.includes("falls") || 
                 lowerName.includes("church") || 
                 lowerName.includes("viewpoint") ||
                 lowerName.includes("statue");

  return {
    name: displayName,
    category: isFree ? "Public Sightseeing" : "Local Attraction",
    entryFeeAdult: 0,
    entryFeeChild: 0,
    parkingFee: 0,
    cameraFee: 0,
    verificationSource: "Unknown",
    lastVerified: "Not Available",
    databaseVersion: "TN-Attractions-v1.0"
  };
}
