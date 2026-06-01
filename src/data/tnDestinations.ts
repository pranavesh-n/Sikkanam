// Auto-generated from Sikkanam destinations dataset (75 destinations)
export type DestinationCategory = 'hill' | 'beach' | 'temple' | 'city' | 'heritage' | 'wildlife';

export interface TNDestination {
  id: string; name: string; fullName: string; category: DestinationCategory;
  emoji: string; district: string; description: string; attractions: string[];
  nearestStation: string; hasRailAccess: boolean; lat: number; lng: number;
  hotels?: Hotel[]; // Optional hotels field for trip planning
}
export interface Hotel {
  name: string;
  pricePerNight?: number;
  priceCategory?: "budget" | "standard" | "comfort" | "premium";
  rating: number;
  distanceKm: number;
  tier: string;
  // Backward compatibility fields from hotelservice.ts
  type?: string;
  amenities?: string[];
  lat?: number;
  lng?: number;
}

export type Destination = TNDestination;
export const tnDestinations: TNDestination[] = [
  {
    "id": "ooty",
    "name": "Ooty",
    "fullName": "Ooty (Udhagamandalam)",
    "category": "hill",
    "emoji": "🍵",
    "district": "Nilgiris",
    "description": "Queen of Hill Stations. UNESCO Nilgiri Mountain Railway. Tea estates and rose gardens.",
    "attractions": [
      "Ooty Lake 🚣",
      "Botanical Garden 🌸",
      "Doddabetta Peak 🏔️",
      "Pykara Lake 💧",
      "Rose Garden 🌹",
      "Mudumalai (Day Trip) 🐘",
      "Avalanche Lake 🏞️",
      "Sim's Park 🌿",
      "Dolphin's Nose 🦅",
      "Coonoor Tea Factory ☕"
    ],
    "nearestStation": "Mettupalayam",
    "hasRailAccess": false,
    "lat": 11.41,
    "lng": 76.69
  },
  {
    "id": "kodaikanal",
    "name": "Kodaikanal",
    "fullName": "Kodaikanal (Princess of Hill Stations)",
    "category": "hill",
    "emoji": "🌸",
    "district": "Dindigul",
    "description": "Princess of Hill Stations. Star-shaped lake, pine forests, Coaker's Walk. Less crowded than Ooty.",
    "attractions": [
      "Kodai Lake 🚣",
      "Coaker's Walk 🌄",
      "Pillar Rocks 🗿",
      "Bryant Park 🌸",
      "Pine Forest 🌲",
      "Berijam Lake 💧",
      "Green Valley View 🌿",
      "Silver Cascade Falls 💦",
      "La Saleth Church ⛪",
      "Pambar Falls 🌊"
    ],
    "nearestStation": "Dindigul Junction",
    "hasRailAccess": false,
    "lat": 10.24,
    "lng": 77.49
  },
  {
    "id": "yercaud",
    "name": "Yercaud",
    "fullName": "Yercaud (Poor Man's Ooty)",
    "category": "hill",
    "emoji": "☕",
    "district": "Salem",
    "description": "Salem's hidden gem. Coffee & orange estates, peaceful lake, budget-friendly. Called 'Poor Man's Ooty' — actually the perfect compliment.",
    "attractions": [
      "Yercaud Lake 🚣",
      "Shevaroy Temple 🛕",
      "Pagoda Point 🏔️",
      "Lady's Seat 🌄",
      "Kiliyur Falls 💦",
      "Bear's Cave 🦎",
      "Botanical Garden 🌸",
      "Rose Garden 🌹",
      "Montfort School (Heritage) 🏫",
      "Spider Cave 🕷️"
    ],
    "nearestStation": "Salem Junction / Erode Junction",
    "hasRailAccess": false,
    "lat": 11.77,
    "lng": 78.2
  },
  {
    "id": "yelagiri",
    "name": "Yelagiri",
    "fullName": "Yelagiri Hills",
    "category": "hill",
    "emoji": "🌿",
    "district": "Tirupattur",
    "description": "Criminally underrated. Peaceful, affordable, beautiful lake. Best bang for money in all of Tamil Nadu.",
    "attractions": [
      "Yelagiri Lake 🚣",
      "Swamimalai Hill (3km trek) 🏔️",
      "Punganoor Lake 🦢",
      "Nilavoor Lake 🌊",
      "Palamathi Hills 🌄",
      "Nature Magic Park 🎡",
      "Thalagayathri Falls 💦",
      "Jalagamparai Falls 🌊",
      "Telescope View Point 🔭",
      "Vel Murugan Temple 🛕"
    ],
    "nearestStation": "Jolarpettai Junction",
    "hasRailAccess": false,
    "lat": 12.58,
    "lng": 78.64
  },
  {
    "id": "kolli-hills",
    "name": "Kolli Hills",
    "fullName": "Kolli Hills (Kollimalai)",
    "category": "hill",
    "emoji": "🌫️",
    "district": "Namakkal",
    "description": "The mysterious hill. 70 hairpin bends to reach it. Agaya Gangai waterfall is stunning. Very few tourists.",
    "attractions": [
      "Agaya Gangai Waterfall 💦",
      "Arapaleeswarar Temple 🛕",
      "Seethala Amman Temple 🛕",
      "Meditation Centre 🧘",
      "Hill Top Viewpoint 🌄",
      "Anjaneyar Temple 🛕",
      "DRDO Farm 🌿",
      "Botanical Garden 🌸"
    ],
    "nearestStation": "Salem Junction",
    "hasRailAccess": false,
    "lat": 11.25,
    "lng": 78.34
  },
  {
    "id": "valparai",
    "name": "Valparai",
    "fullName": "Valparai (Tea & Coffee Estates)",
    "category": "hill",
    "emoji": "🍃",
    "district": "Coimbatore",
    "description": "Pristine tea estates, elephants on roads, shola forests. Completely unspoiled. Best for nature lovers.",
    "attractions": [
      "Aliyar Reservoir 💧",
      "Sholayar Dam 🌊",
      "Parambikulam Tiger Reserve 🐯",
      "Monkey Falls 🐒",
      "Top Slip (nearby) 🐘",
      "Tea Estate Walks 🍃",
      "Waterfalls (12 total) 💦",
      "Lion-Tailed Macaque Spotting 🐒"
    ],
    "nearestStation": "Pollachi Junction",
    "hasRailAccess": false,
    "lat": 10.32,
    "lng": 76.96
  },
  {
    "id": "javadi-hills",
    "name": "Javadi Hills",
    "fullName": "Javadi Hills (Mel Nagiri)",
    "category": "hill",
    "emoji": "🏕️",
    "district": "Tirupattur",
    "description": "Raw, undiscovered hill. Home to Palaiyar tribes. Mel Nagiri viewpoint is spectacular.",
    "attractions": [
      "Mel Nagiri Viewpoint 🌄",
      "Palamathi Village 🏡",
      "Agni Theertham 💧",
      "Forest Trek 🌲",
      "Tribal Village Tour 🏕️"
    ],
    "nearestStation": "Ambur",
    "hasRailAccess": false,
    "lat": 12.5,
    "lng": 78.57
  },
  {
    "id": "mahabalipuram",
    "name": "Mahabalipuram",
    "fullName": "Mahabalipuram (Mamallapuram)",
    "category": "beach",
    "emoji": "🏛️",
    "district": "Chengalpattu",
    "description": "UNESCO World Heritage Site. Shore Temple, Pancha Rathas, Arjuna's Penance. Easy day trip from Chennai.",
    "attractions": [
      "Shore Temple (UNESCO) 🏛️",
      "Pancha Rathas 🗿",
      "Arjuna's Penance (Rock) 🪨",
      "Krishna's Butter Ball 🎯",
      "Lighthouse Beach 🏖️",
      "Tiger Cave 🐯",
      "Mahabalipuram Beach 🌊",
      "Dakshinachitra Museum 🎭",
      "Snake Farm (ECR) 🐍"
    ],
    "nearestStation": "Chengalpattu Junction",
    "hasRailAccess": false,
    "lat": 12.62,
    "lng": 80.19
  },
  {
    "id": "rameswaram",
    "name": "Rameswaram",
    "fullName": "Rameswaram (Rameshwaram)",
    "category": "beach",
    "emoji": "🏝️",
    "district": "Ramanathapuram",
    "description": "Sacred island city. Ramanathaswamy Temple, 22 sacred wells, Pamban Bridge. One of India's holiest places — and a stunning coastal experience.",
    "attractions": [
      "Ramanathaswamy Temple 🛕",
      "Pamban Bridge 🌉",
      "Dhanushkodi (ghost town) 👻",
      "Agnitheertham Beach 🌊",
      "Kothandaramar Temple 🛕",
      "Adams Bridge (Ram Setu) 🌐",
      "Gandhamadhana Parvatham 🏔️",
      "5 Faced Hanuman Temple 🐒",
      "Ariyaman Beach 🏖️",
      "Dr. APJ Abdul Kalam Memorial 🌟"
    ],
    "nearestStation": "Rameswaram",
    "hasRailAccess": true,
    "lat": 9.29,
    "lng": 79.31
  },
  {
    "id": "kanyakumari",
    "name": "Kanyakumari",
    "fullName": "Kanyakumari (Cape Comorin)",
    "category": "beach",
    "emoji": "🌅",
    "district": "Kanyakumari",
    "description": "The tip of India. Three seas meet here. Sunrise + sunset same day. Vivekananda Rock. Thiruvalluvar Statue. Unmissable.",
    "attractions": [
      "Sunrise/Sunset Point 🌅",
      "Vivekananda Rock Memorial 🗿",
      "Thiruvalluvar Statue (133ft) 🧘",
      "Kanyakumari Temple 🛕",
      "Wax Museum 🎭",
      "Padmanabhapuram Palace 🏯",
      "Triveni Sangam 🌊",
      "Tsunami Monument 🕊️",
      "Gandhi Memorial 🏛️",
      "National Maritime Museum ⚓"
    ],
    "nearestStation": "Kanyakumari",
    "hasRailAccess": true,
    "lat": 8.08,
    "lng": 77.55
  },
  {
    "id": "pondicherry",
    "name": "Pondicherry",
    "fullName": "Pondicherry (Puducherry)",
    "category": "beach",
    "emoji": "🇫🇷",
    "district": "Puducherry UT",
    "description": "Former French colony. White Town, cafes, Promenade beach, Auroville. Best 2-day trip from Chennai. 3 hours away.",
    "attractions": [
      "Promenade Beach 🌊",
      "French Quarter (White Town) 🏛️",
      "Auroville (Matrimandir) 🌐",
      "Aurobindo Ashram 🧘",
      "Rock Beach 🌅",
      "Chunnambar Backwaters 🚣",
      "Botanical Garden 🌸",
      "Basilica of Sacred Heart ⛪",
      "Paradise Beach (Boat) 🏖️",
      "Scuba Diving (Temple Adventures) 🤿"
    ],
    "nearestStation": "Puducherry / Villupuram Junction",
    "hasRailAccess": true,
    "lat": 11.93,
    "lng": 79.83
  },
  {
    "id": "dhanushkodi",
    "name": "Dhanushkodi",
    "fullName": "Dhanushkodi (Ghost Town)",
    "category": "beach",
    "emoji": "👻",
    "district": "Ramanathapuram",
    "description": "India's last village. Destroyed by 1964 cyclone. Two seas visible simultaneously. Ghost town ruins, pristine beaches. Hauntingly beautiful.",
    "attractions": [
      "Ghost Town Ruins 👻",
      "Two-Sea Beach 🌊",
      "Arichal Munai (Land's End) 🏝️",
      "Adam's Bridge View 🌐",
      "Old Church Ruins ⛪",
      "War Memorial 🕊️",
      "Sunset Point 🌅",
      "Sand Dunes 🏜️"
    ],
    "nearestStation": "Rameswaram",
    "hasRailAccess": false,
    "lat": 9.15,
    "lng": 79.42
  },
  {
    "id": "madurai",
    "name": "Madurai",
    "fullName": "Madurai (Temple City)",
    "category": "temple",
    "emoji": "🛕",
    "district": "Madurai",
    "description": "Madurai is famous for Meenakshi Amman Temple, temple streets, jasmine, Famous Jigarthanda, and classic local food spots.",
    "attractions": [
      "Meenakshi Amman Temple 🛕",
      "Thirumalai Nayakkar Palace 🏯",
      "Gandhi Museum 🕊️",
      "Koodal Azhagar Temple 🛕",
      "Alagar Kovil 🛕",
      "Mariamman Teppakulam 💧",
      "Samanar Hills (Jain Caves) 🗿",
      "Pazhamudhircholai Hills 🌿",
      "Vaigai Dam 💧",
      "Thirupparankundram Cave Temple 🛕"
    ],
    "nearestStation": "Madurai Junction",
    "hasRailAccess": true,
    "lat": 9.92,
    "lng": 78.12
  },
  {
    "id": "thanjavur",
    "name": "Thanjavur",
    "fullName": "Thanjavur (Big Temple City)",
    "category": "temple",
    "emoji": "🏛️",
    "district": "Thanjavur",
    "description": "Brihadeeswarar Temple — 1000 years old, UNESCO Heritage. Art, music, Tanjore paintings. The cultural heart of Tamil Nadu.",
    "attractions": [
      "Brihadeeswarar Temple (UNESCO) 🏛️",
      "Thanjavur Palace 🏯",
      "Tanjore Painting Museum 🎨",
      "Saraswathi Mahal Library 📚",
      "Shivaganga Tank 💧",
      "Gangaikonda Cholapuram 🏛️",
      "Airavateshvara Temple 🛕",
      "Kumbakonam (25km) 🛕",
      "Poompuhar Boat Ride 🚣"
    ],
    "nearestStation": "Thanjavur Junction",
    "hasRailAccess": true,
    "lat": 10.79,
    "lng": 79.14
  },
  {
    "id": "kanchipuram",
    "name": "Kanchipuram",
    "fullName": "Kanchipuram (Temple City of 1000 Temples)",
    "category": "temple",
    "emoji": "🧵",
    "district": "Kanchipuram",
    "description": "City of 1000 temples and world-famous Kanchipuram silk sarees. One of India's 7 Sapta Moksha Puri cities.",
    "attractions": [
      "Ekambareswarar Temple 🛕",
      "Kailasanathar Temple 🛕",
      "Kamakshi Amman Temple 🛕",
      "Varadharaja Perumal Temple 🛕",
      "Vaikunta Perumal Temple 🛕",
      "Silk Weaving Centres 🧵",
      "Sri Shankaracharya Mutt 🕌",
      "Ulagalandha Perumal Temple 🛕"
    ],
    "nearestStation": "Chengalpattu Junction",
    "hasRailAccess": true,
    "lat": 12.84,
    "lng": 79.7
  },
  {
    "id": "chidambaram",
    "name": "Chidambaram",
    "fullName": "Chidambaram (Cosmic Dance Temple)",
    "category": "temple",
    "emoji": "💃",
    "district": "Cuddalore",
    "description": "Nataraja Temple — the cosmic dance of Shiva. One of Tamil Nadu's most architecturally stunning temples. Pichavaram Mangroves is 15km away.",
    "attractions": [
      "Nataraja Temple 💃",
      "Thillai Kali Amman Temple 🛕",
      "Pichavaram Mangroves 🌿",
      "Annamalai University campus 🎓",
      "Cuddalore (40km) 🏖️",
      "Sethupathy Museum 🏛️"
    ],
    "nearestStation": "Chidambaram",
    "hasRailAccess": true,
    "lat": 11.4,
    "lng": 79.69
  },
  {
    "id": "kumbakonam",
    "name": "Kumbakonam",
    "fullName": "Kumbakonam (Temple Town)",
    "category": "temple",
    "emoji": "⛲",
    "district": "Thanjavur",
    "description": "32 temples, famous Mahamaham tank, degree coffee origin. Cultural hub between Thanjavur and Chidambaram.",
    "attractions": [
      "Mahamaham Tank 🏊",
      "Sarangapani Temple 🛕",
      "Nageswaran Temple 🛕",
      "Kumbeswaran Temple 🛕",
      "Adi Kumbeswarar Temple 🛕",
      "Darasuram Airavatesvara Temple 🛕",
      "Gangaikonda Cholapuram (25km) 🏛️",
      "Papanasam (Waterfalls) 💦",
      "Swamimalai Murugan Temple 🛕"
    ],
    "nearestStation": "Kumbakonam",
    "hasRailAccess": true,
    "lat": 10.96,
    "lng": 79.39
  },
  {
    "id": "trichy",
    "name": "Trichy",
    "fullName": "Trichy (Tiruchirappalli · Rock Fort City)",
    "category": "temple",
    "emoji": "🪨",
    "district": "Tiruchirappalli",
    "description": "Rock Fort Temple, Srirangam Island (largest temple complex in world), Jambukeswarar Temple. The grand city of Tamil temple culture.",
    "attractions": [
      "Rock Fort Temple (83m) 🪨",
      "Sri Ranganathaswamy (Srirangam) 🛕",
      "Jambukeswarar Temple 🛕",
      "Samayapuram Mariamman 🛕",
      "Mukkombu Barrage 💧",
      "Thayumanaswami Temple 🛕",
      "Chatram Bus Stand area 🏙️"
    ],
    "nearestStation": "Tiruchchirappalli Junction",
    "hasRailAccess": true,
    "lat": 10.79,
    "lng": 78.7
  },
  {
    "id": "vellore",
    "name": "Vellore",
    "fullName": "Vellore (Golden Temple · Fort City)",
    "category": "temple",
    "emoji": "✨",
    "district": "Vellore",
    "description": "Sripuram Golden Temple (100% gold exterior) + Vellore Fort. 2.5 hours from Chennai — best day trip for the golden temple.",
    "attractions": [
      "Sripuram Golden Temple ✨",
      "Vellore Fort 🏯",
      "Jalakandeswarar Temple 🛕",
      "Government Museum 🏛️",
      "Amirthi Zoological Park 🦁",
      "Jain Temple 🕌",
      "Yelagiri Hills (40km) 🌿"
    ],
    "nearestStation": "Katpadi Junction",
    "hasRailAccess": true,
    "lat": 12.92,
    "lng": 79.13
  },
{
  "id": "cuddalore",
  "name": "Cuddalore",
  "fullName": "Cuddalore",
  "category": "beach",
  "emoji": "🏖️",
  "district": "Cuddalore",
  "description": "Coastal town with beaches and temples.",
  "attractions": [
    "Silver Beach",
    "Fort St. David",
    "Padaleeswarar Temple",
    "Cuddalore Harbour"
  ],
  "nearestStation": "Thirupathiripuliyur",
    "hasRailAccess": true,
  "lat": 11.7447,
  "lng": 79.7680
},

{
  "id": "nagapattinam",
  "name": "Nagapattinam",
  "fullName": "Nagapattinam Coastal Town",
  "category": "beach",
  "emoji": "🌊",
  "district": "Nagapattinam",
  "description": "Historic coastal town known for beaches and temples.",
  "attractions": [
    "Nagore Dargah",
    "Velankanni Basilica",
    "Nagapattinam Beach",
    "Dutch Fort",
    "Sikkal Singaravelar Temple"
  ],
  "nearestStation": "Nagapattinam Junction",
    "hasRailAccess": true,
  "lat": 10.7672,
  "lng": 79.8449
},

  {
    "id": "tiruvanamalai",
    "name": "Tiruvanamalai",
    "fullName": "Tiruvannamalai (Sacred Fire Mountain)",
    "category": "temple",
    "emoji": "🔥",
    "district": "Tiruvannamalai",
    "description": "Annamalaiyar Temple + Arunachala Hill. Deepam festival (Nov/Dec) draws millions. Spiritual vortex of South India.",
    "attractions": [
      "Annamalaiyar Temple 🛕",
      "Arunachala Hill (14km trek) 🏔️",
      "Ramana Maharshi Ashram 🧘",
      "Sri Ramanasramam 🕉️",
      "Skandashram Cave 🪨",
      "Virupaksha Cave 🧘",
      "Giri Valam (Hill Circumambulation) 🚶"
    ],
    "nearestStation": "Tiruvannamalai",
    "hasRailAccess": true,
    "lat": 12.23,
    "lng": 79.07
  },
  {
    "id": "mudumalai",
    "name": "Mudumalai",
    "fullName": "Mudumalai Wildlife Sanctuary",
    "category": "wildlife",
    "emoji": "🐘",
    "district": "Nilgiris",
    "description": "Part of Nilgiri Biosphere Reserve. Elephants on the road, tigers, gaur, spotted deer. Best wildlife sanctuary in Tamil Nadu.",
    "attractions": [
      "Elephant Camp 🐘",
      "Safari (Miniature Train/Jeep) 🚐",
      "Theppakadu Elephant Camp 🐘",
      "Moyar River 💧",
      "Mudumalai Forest 🌿",
      "Masinagudi (Village) 🏕️",
      "Sigur Plateau 🌄",
      "Bird Watching 🦚",
      "Himavad Gopalaswamy Temple 🛕"
    ],
    "nearestStation": "Mettupalayam",
    "hasRailAccess": false,
    "lat": 11.59,
    "lng": 76.55
  },
  {
    "id": "topslip",
    "name": "Topslip",
    "fullName": "Topslip (Anamalai Tiger Reserve)",
    "category": "wildlife",
    "emoji": "🐯",
    "district": "Coimbatore",
    "description": "Anamalai Tiger Reserve. One of India's oldest forest reserves. Elephants, gaur, lion-tailed macaques, tigers.",
    "attractions": [
      "Elephant Safari 🐘",
      "Jeep Safari 🚐",
      "Lion-tailed Macaque Trail 🐒",
      "Amaravathi Reservoir 💧",
      "Teak Plantation Walks 🌲",
      "Bird Watching 🦜",
      "Parambikulam (Kerala side) 🌿",
      "Grass Hills 🏔️"
    ],
    "nearestStation": "Pollachi Junction",
    "hasRailAccess": false,
    "lat": 10.45,
    "lng": 76.81
  },
  {
    "id": "pichavaram",
    "name": "Pichavaram",
    "fullName": "Pichavaram Mangrove Forest",
    "category": "wildlife",
    "emoji": "🌊",
    "district": "Cuddalore",
    "description": "Second largest mangrove forest in the world. Boat through dense mangroves at sunrise. 1,100 islands.",
    "attractions": [
      "Mangrove Boat Ride 🚣",
      "Bird Watching 🦜",
      "Fish Breeding Area 🐟",
      "Chidambaram Nataraja Temple (15km) 💃",
      "Sunrise Inside Mangroves 🌅",
      "Kayaking (Seasonal) 🛶"
    ],
    "nearestStation": "Chidambaram",
    "hasRailAccess": false,
    "lat": 11.43,
    "lng": 79.78
  },
  {
    "id": "salem",
    "name": "Salem",
    "fullName": "Salem (Steel City · Mango City)",
    "category": "city",
    "emoji": "🥭",
    "district": "Salem",
    "description": "Gateway to Yercaud and Kolli Hills. Famous for mangoes, steel, and surprisingly good food. Kunjapanai (filter coffee) culture.",
    "attractions": [
      "Yercaud (32km) ⛰️",
      "Kolli Hills (70km) 🌫️",
      "Salem Steel Plant 🏭",
      "Sugavaneswarar Temple 🛕",
      "Thiruchengode (Ardhanari Temple) 🛕",
      "Mettur Dam 💧",
      "Taramani Hill 🌄",
      "Salem Town Area 🏙️"
    ],
    "nearestStation": "Salem Junction",
    "hasRailAccess": true,
    "lat": 11.66,
    "lng": 78.15
  },
  {
    "id": "tirunelveli",
    "name": "Tirunelveli",
    "fullName": "Tirunelveli (Halwa City)",
    "category": "city",
    "emoji": "🍯",
    "district": "Tirunelveli",
    "description": "Famous for Iruttu Kadai Halwa, Kalakkad-Mundanthurai Reserve, and Courtallam Falls (50km). Southern Tamil Nadu's cultural heartland.",
    "attractions": [
      "Nellaiappar Temple 🛕",
      "Krishnapuram Palace 🏯",
      "Courtallam Falls (50km) 💦",
      "Kalakkad Tiger Reserve 🐯",
      "Papanasam Dam 💧",
      "Manimuthar Falls 💦",
      "Mundanthurai 🌿",
      "Srivaikuntam Barrage 🌊",
      "Ambasamudram (nearby) 🏘️"
    ],
    "nearestStation": "Tirunelveli Junction",
    "hasRailAccess": true,
    "lat": 8.71,
    "lng": 77.76
  },
  {
    "id": "chennai",
    "name": "Chennai",
    "fullName": "Chennai (Capital · Gateway City)",
    "category": "city",
    "emoji": "🌆",
    "district": "Chennai",
    "description": "Tamil Nadu's capital — Marina Beach, Kapaleeswarar Temple, filter coffee, Madras cuisine, Kollywood. Starting point for most TN trips.",
    "attractions": [
      "Marina Beach (2nd longest) 🏖️",
      "Kapaleeswarar Temple 🛕",
      "Fort St. George 🏰",
      "Government Museum 🏛️",
      "Birla Planetarium 🌌",
      "Santhome Basilica ⛪",
      "Guindy National Park 🌿",
      "Dakshinachitra Museum 🎭",
      "T. Nagar Shopping 🛍️",
      "Mahabalipuram (55km) 🏛️"
    ],
    "nearestStation": "Chennai Central / Egmore",
    "hasRailAccess": true,
    "lat": 13.08,
    "lng": 80.27
  },
  {
    "id": "coimbatore",
    "name": "Coimbatore",
    "fullName": "Coimbatore (Manchester of South India)",
    "category": "city",
    "emoji": "🏭",
    "district": "Coimbatore",
    "description": "Industrial capital of TN. Gateway to Ooty (90km), Valparai, and Mudumalai. Great food, textile shopping, and the famous Isha Yoga Centre.",
    "attractions": [
      "Isha Yoga Centre 🧘",
      "Adiyogi Shiva Statue 🕉️",
      "Marudamalai Temple 🛕",
      "Ooty (90km) ⛰️",
      "Valparai (64km) 🍃",
      "VOC Park & Zoo 🦁",
      "Perur Pateeswarar Temple 🛕",
      "Eachanari Vinayagar Temple 🛕",
      "Velliangiri Hills 🏔️",
      "Siruvani Waterfalls 💦"
    ],
    "nearestStation": "Coimbatore Junction",
    "hasRailAccess": true,
    "lat": 11.02,
    "lng": 76.96
  },
  {
    "id": "erode",
    "name": "Erode",
    "fullName": "Erode (Turmeric City · Textile Hub)",
    "category": "city",
    "emoji": "🟡",
    "district": "Erode",
    "description": "World's largest turmeric and handloom market. Gateway to Sathyamangalam Tiger Reserve and a major textile town on the Kaveri.",
    "attractions": [
      "Erode Textile Market 🧵",
      "Bhavani Sangamam (3 rivers) 💧",
      "Sathyamangalam Tiger Reserve 🐯",
      "Thindal Murugan Temple 🛕",
      "Periyar Manimandapam 🏛️",
      "Kaveri River Ghats 🌊",
      "Bannari Amman Temple 🛕",
      "Ingur Dam 💧"
    ],
    "nearestStation": "Erode Junction",
    "hasRailAccess": true,
    "lat": 11.34,
    "lng": 77.72
  },
  {
    "id": "tiruppur",
    "name": "Tiruppur",
    "fullName": "Tiruppur (Knitwear Capital of India)",
    "category": "city",
    "emoji": "👕",
    "district": "Tiruppur",
    "description": "India's knitwear export capital — 80% of India's garment exports come from here. Bargain shopping heaven. Base for Anamalai Tiger Reserve (Topslip).",
    "attractions": [
      "Garment Export Showrooms 👕",
      "Topslip (Anamalai Tiger Reserve) 🐘",
      "Noyyal River 🌊",
      "Vellode Bird Sanctuary 🦅",
      "Kangeyam (nearby) 🐄",
      "Avinashi Murugan Temple 🛕",
      "Sivaraj Memorial 🏛️"
    ],
    "nearestStation": "Tiruppur",
    "hasRailAccess": true,
    "lat": 11.11,
    "lng": 77.34
  },
  {
    "id": "thoothukudi",
    "name": "Thoothukudi",
    "fullName": "Thoothukudi (Tuticorin · Pearl City)",
    "category": "city",
    "emoji": "🦪",
    "district": "Thoothukudi",
    "description": "Pearl fishing capital. Gateway to Kanyakumari and Rameswaram. Historic port city, Tiruchendur Murugan Temple (18km), Hare Island.",
    "attractions": [
      "Tiruchendur Murugan Temple (18km) 🛕",
      "Hare Island 🏝️",
      "Coral Park 🐠",
      "Thoothukudi Port 🚢",
      "Kalugumalai (30km) 🪨",
      "Korkai (ancient port) 🏛️",
      "Arulmigu Subramaniyaswamy Temple 🛕",
      "Salt Flats 🧂"
    ],
    "nearestStation": "Tuticorin",
    "hasRailAccess": true,
    "lat": 8.8073,
    "lng": 78.1503
  },
  {
    "id": "dindigul",
    "name": "Dindigul",
    "fullName": "Dindigul (Lock City · Biryani City)",
    "category": "city",
    "emoji": "🍚",
    "district": "Dindigul",
    "description": "Famous for Dindigul biryani and Dindigul locks. Key transit hub for Kodaikanal. Palani Murugan temple (65km). Sirumalai Hills nearby.",
    "attractions": [
      "Dindigul Fort 🏰",
      "Palani Murugan Temple (65km) 🛕",
      "Sirumalai Hills (30km) ⛰️",
      "Kodaikanal (80km) 🌸",
      "Athoor Railway Station 🚂",
      "Thadikombu (nearby) 🏘️",
      "Vedasandur 🌿"
    ],
    "nearestStation": "Dindigul Junction",
    "hasRailAccess": true,
    "lat": 10.36,
    "lng": 77.97
  },
  {
    "id": "velankanni",
    "name": "Velankanni",
    "fullName": "Velankanni (Shrine Basilica · Lourdes of the East)",
    "category": "temple",
    "emoji": "⛪",
    "district": "Nagapattinam",
    "description": "Velankanni Church — Lourdes of the East. Coastal basilica. Annual festival (Aug–Sep) draws 2 million pilgrims.",
    "attractions": [
      "Shrine Basilica ⛪",
      "Beach (Adjacent) 🌊",
      "Our Lady's Tank 💧",
      "Grotto 🕯️",
      "Museum of Miracles 🏛️",
      "Sound & Light Show 🎭",
      "New Church (1904) ⛪",
      "Sea Bathing (Beach) 🏖️"
    ],
    "nearestStation": "Nagapattinam",
    "hasRailAccess": false,
    "lat": 10.68,
    "lng": 79.85
  },
  {
    "id": "tranquebar",
    "name": "Tranquebar",
    "fullName": "Tranquebar (Tharangambadi)",
    "category": "beach",
    "emoji": "🏰",
    "district": "Nagapattinam",
    "description": "Danish colonial town. 300-year-old Dansborg Fort, colonial bungalows, empty beaches. India's most underrated coastal heritage.",
    "attractions": [
      "Dansborg Fort (Danish) 🏰",
      "New Jerusalem Church ⛪",
      "Masilamaninathar Temple 🛕",
      "Colonial Bungalows 🏛️",
      "Beach Walk 🌊",
      "Tranquebar Museum 🏺",
      "Ziegenbalg Memorial 📖"
    ],
    "nearestStation": "Nagapattinam",
    "hasRailAccess": false,
    "lat": 11.03,
    "lng": 79.85
  },
  {
  "id": "thirunallar",
  "name": "Thirunallar",
  "fullName": "Thirunallar (Saneeswarar Temple)",
  "category": "temple",
  "emoji": "🪔",
  "district": "Karaikal",
  "description": "Famous Saneeswarar temple town near Karaikal. Best for a short temple trip with Mayiladuthurai or Karaikal as the rail/bus base.",
  "attractions": [
    "Dharbaranyeswarar Saneeswarar Temple",
    "Karaikal Beach",
    "Karaikal Ammaiyar Temple",
    "Mayiladuthurai temple belt",
    "Nagore Dargah nearby"
  ],
  "nearestStation": "Thirunallar or Karaikal",
    "hasRailAccess": false,
  "lat": 10.92,
  "lng": 79.78
},
{
  "id": "pillayarpatti",
  "name": "Pillayarpatti",
  "fullName": "Pillayarpatti (Karpaga Vinayagar Temple)",
  "category": "temple",
  "emoji": "🐘",
  "district": "Sivaganga",
  "description": "Temple village famous for the ancient rock-cut Karpaga Vinayagar / Ganapathy Temple near Karaikudi.",
  "attractions": [
    "Karpaga Vinayagar Temple",
    "Karaikudi Chettinad mansions",
    "Athangudi tiles village",
    "Chettinad Palace area",
    "Kundrakudi Murugan Temple"
  ],
  "nearestStation": "Karaikudi Junction",
    "hasRailAccess": false,
  "lat": 9.84,
  "lng": 78.48
},
{
  "id": "mayiladuthurai",
  "name": "Mayiladuthurai",
  "fullName": "Mayiladuthurai (Temple Belt Hub)",
  "category": "temple",
  "emoji": "🦚",
  "district": "Mayiladuthurai",
  "description": "Important Cauvery delta temple hub, useful for Thirunallar, Chidambaram, Kumbakonam, Vaitheeswaran Koil, Tharangambadi and nearby temple routes.",
  "attractions": [
    "Mayuranathaswamy Temple",
    "Vaitheeswaran Koil",
    "Thirukadaiyur Temple",
    "Kumbakonam temple belt",
    "Thirunallar via Karaikal",
    "Chidambaram day trip"
  ],
  "nearestStation": "Mayiladuthurai Junction",
    "hasRailAccess": true,
  "lat": 11.1,
  "lng": 79.65
},
{
  "id": "tiruchendur",
  "name": "Tiruchendur",
  "fullName": "Tiruchendur (Murugan Temple)",
  "category": "temple",
  "emoji": "🌊",
  "district": "Thoothukudi",
  "description": "Sea-shore Murugan temple and one of the most visited Arupadai Veedu pilgrimage destinations.",
  "attractions": [
    "Tiruchendur Murugan Temple",
    "Temple sea shore",
    "Nazhi Kinaru",
    "Valli Cave",
    "Thoothukudi day trip",
    "Manapad beach nearby"
  ],
  "nearestStation": "Tiruchendur",
    "hasRailAccess": true,
  "lat": 8.49,
  "lng": 78.12
},
{
  "id": "tiruttani",
  "name": "Tiruttani",
  "fullName": "Tiruttani (Murugan Temple)",
  "category": "temple",
  "emoji": "🛕",
  "district": "Tiruvallur",
  "description": "Famous Murugan temple town around 50-60km from Chennai Central, easily reached by rail via Arakkonam/Tiruttani.",
  "attractions": [
    "Tiruttani Murugan Temple",
    "Hill temple steps",
    "Arakkonam rail hub",
    "Nagari nearby",
    "Chennai day trip"
  ],
  "nearestStation": "Tiruttani",
    "hasRailAccess": true,
  "lat": 13.18,
  "lng": 79.61
},
{
  "id": "palani",
  "name": "Palani",
  "fullName": "Palani (Murugan Temple)",
  "category": "temple",
  "emoji": "⛰️",
  "district": "Dindigul",
  "description": "Major Murugan temple town on the Dindigul-Palakkad railway route. The easiest approach is often bus from nearby Dindigul.",
  "attractions": [
    "Palani Murugan Temple",
    "Hill temple rope car",
    "Winch train",
    "Dindigul transit hub",
    "Kodaikanal side trip"
  ],
  "nearestStation": "Palani",
    "hasRailAccess": true,
  "lat": 10.45,
  "lng": 77.52
},
{
  "id": "swamimalai",
  "name": "Swamimalai",
  "fullName": "Swamimalai Murugan Temple",
  "category": "temple",
  "emoji": "🛕",
  "district": "Thanjavur",
  "description": "One of the six sacred abodes of Lord Murugan.",
  "attractions": [
    "Swamimalai Murugan Temple",
    "Kumbakonam Temples",
    "Cauvery River",
    "Temple Steps",
    "Bronze Idol Workshops"
  ],
  "nearestStation": "Kumbakonam Railway Station",
    "hasRailAccess": false,
  "lat": 10.9577,
  "lng": 79.3292
},
{
  "id": "tenkasi",
  "name": "Tenkasi",
  "fullName": "Tenkasi (Courtallam Falls and Kasi Viswanathar)",
  "category": "temple",
  "emoji": "💦",
  "district": "Tenkasi",
  "description": "Main base for Courtallam Falls and Kasi Viswanathar Temple. Trains going towards Sengottai usually cross Tenkasi.",
  "attractions": [
    "Courtallam Main Falls",
    "Kasi Viswanathar Temple",
    "Five Falls",
    "Old Courtallam Falls",
    "Sengottai route",
    "Papanasam side trip"
  ],
  "nearestStation": "Tenkasi Junction",
    "hasRailAccess": true,
  "lat": 8.96,
  "lng": 77.31
},
{
  "id": "thiruparankundram",
  "name": "Thiruparankundram",
  "fullName": "Thiruparankundram Murugan Temple",
  "category": "temple",
  "emoji": "🛕",
  "district": "Madurai",
  "description": "Ancient rock-cut Murugan temple near Madurai.",
  "attractions": [
    "Thiruparankundram Temple",
    "Rock Cut Cave Temple",
    "Temple Hill",
    "Madurai City",
    "Local Markets"
  ],
  "nearestStation": "Madurai Junction",
    "hasRailAccess": false,
  "lat": 9.8818,
  "lng": 78.0717
},
{
  "id": "pazhamudircholai",
  "name": "Pazhamudircholai",
  "fullName": "Pazhamudircholai Murugan Temple",
  "category": "temple",
  "emoji": "🛕",
  "district": "Madurai",
  "description": "Hill temple dedicated to Lord Murugan near Madurai.",
  "attractions": [
    "Pazhamudircholai Temple",
    "Azhagar Kovil",
    "Hill Forest",
    "Noopura Ganga",
    "Nature Trails"
  ],
  "nearestStation": "Madurai Junction",
    "hasRailAccess": false,
  "lat": 10.0246,
  "lng": 78.2138
},
{
  "id": "kapaleeshwarar",
  "name": "Kapaleeshwarar Temple",
  "fullName": "Kapaleeshwarar Temple Mylapore",
  "category": "temple",
  "emoji": "🛕",
  "district": "Chennai",
  "description": "Historic Shiva temple in Mylapore known for Dravidian architecture and spiritual significance.",
  "attractions": [
    "Kapaleeshwarar Temple",
    "Janal Kadai",
    "Temple Festivals",
    "Santhome Basilica",
  ],
  "nearestStation": "Mylapore MRTS Station",
    "hasRailAccess": false,
  "lat": 13.0339,
  "lng": 80.2697
},
{
  "id": "kamakshi-amman",
  "name": "Kamakshi Amman Temple",
  "fullName": "Kamakshi Amman Temple Kanchipuram",
  "category": "temple",
  "emoji": "🛕",
  "district": "Kanchipuram",
  "description": "One of the most important Shakti Peethas dedicated to Goddess Kamakshi.",
  "attractions": [
    "Kamakshi Amman Temple",
    "Ekambareswarar Temple",
    "Silk Saree Markets",
    "Temple Streets",
    "Ancient Architecture"
  ],
  "nearestStation": "Arakkonam Junction",
    "hasRailAccess": false,
  "lat": 12.8476,
  "lng": 79.6994
},
{
  "id": "kailasanathar",
  "name": "Kailasanathar Temple",
  "fullName": "Kailasanathar Temple Kanchipuram",
  "category": "temple",
  "emoji": "🛕",
  "district": "Kanchipuram",
  "description": "Oldest sandstone temple in Kanchipuram dedicated to Lord Shiva.",
  "attractions": [
    "Kailasanathar Temple",
    "Ancient Sculptures",
    "Temple Architecture",
    "Kanchipuram Silk Shops",
    "Historic Monuments"
  ],
  "nearestStation": "Arakkonam Junction",
    "hasRailAccess": false,
  "lat": 12.8476,
  "lng": 79.6994
},
{
  "id": "suchindram",
  "name": "Suchindram",
  "fullName": "Suchindram Thanumalayan Temple",
  "category": "temple",
  "emoji": "🛕",
  "district": "Kanyakumari",
  "description": "Famous temple dedicated to the Trinity of Shiva, Vishnu and Brahma.",
  "attractions": [
    "Thanumalayan Temple",
    "Musical Pillars",
    "Hanuman Statue",
    "Temple Carvings",
    "Nearby Kanyakumari"
  ],
  "nearestStation": "Nagercoil Junction",
    "hasRailAccess": false,
  "lat": 8.1549,
  "lng": 77.4670
},
{
  "id": "bhagavathy-amman",
  "name": "Bhagavathy Amman Temple",
  "fullName": "Kanyakumari Bhagavathy Amman Temple",
  "category": "temple",
  "emoji": "🛕",
  "district": "Kanyakumari",
  "description": "Sacred seaside temple dedicated to Goddess Devi at the southern tip of India.",
  "attractions": [
    "Bhagavathy Amman Temple",
    "Vivekananda Rock Memorial",
    "Thiruvalluvar Statue",
    "Sunrise Point",
    "Kanyakumari Beach"
  ],
  "nearestStation": "Kanyakumari Railway Station",
    "hasRailAccess": false,
  "lat": 8.0780,
  "lng": 77.5550
},
{
  "id": "parthasarathy",
  "name": "Parthasarathy Temple",
  "fullName": "Parthasarathy Perumal Temple",
  "category": "temple",
  "emoji": "🛕",
  "district": "Chennai",
  "description": "Ancient Vishnu temple located in Triplicane dedicated to Lord Krishna.",
  "attractions": [
    "Parthasarathy Temple",
    "Triplicane Streets",
    "Marina Beach",
    "Historic Architecture"
  ],
  "nearestStation": "Chepauk MRTS Station",
    "hasRailAccess": false,
  "lat": 13.0530,
  "lng": 80.2756
},
{
  "id": "sankarankoil",
  "name": "Sankarankoil",
  "fullName": "Sankarankoil (Sankaranarayanar Temple)",
  "category": "temple",
  "emoji": "🔱",
  "district": "Tenkasi",
  "description": "Temple town in the Tenkasi belt, famous for Sankaranarayanar Temple. Easy to combine with Tenkasi and Srivilliputhur.",
  "attractions": [
    "Sankaranarayanar Temple",
    "Tenkasi day trip",
    "Srivilliputhur Andal Temple",
    "Courtallam Falls",
    "Rajapalayam belt"
  ],
  "nearestStation": "Sankarankovil",
    "hasRailAccess": false,
  "lat": 9.17,
  "lng": 77.55
},
  {
    "id": "coonoor",
    "name": "Coonoor",
    "fullName": "Coonoor (Nilgiri Tea Town)",
    "category": "hill",
    "emoji": "🏔️",
    "district": "Nilgiris",
    "description": "Train to Mettupalayam/Coimbatore, then Nilgiri Mountain Railway or bus to Coonoor.",
    "attractions": [
      "Sim's Park",
      "Dolphin's Nose",
      "Lamb's Rock",
      "Tea estates",
      "Nilgiri Mountain Railway"
    ],
    "nearestStation": "Coonoor",
    "hasRailAccess": true,
    "lat": 11.35,
    "lng": 76.79
  },
  {
    "id": "kotagiri",
    "name": "Kotagiri",
    "fullName": "Kotagiri (Quiet Nilgiris)",
    "category": "hill",
    "emoji": "🏔️",
    "district": "Nilgiris",
    "description": "Reach Coonoor/Ooty by rail-bus combo, then frequent hill buses to Kotagiri.",
    "attractions": [
      "Kodanad View Point",
      "Catherine Falls",
      "Longwood Shola",
      "Tea estates",
      "Kotagiri walks"
    ],
    "nearestStation": "Coonoor",
    "hasRailAccess": false,
    "lat": 11.42,
    "lng": 76.86
  },
  {
    "id": "meghamalai",
    "name": "Meghamalai",
    "fullName": "Meghamalai (High Wavy Mountains)",
    "category": "hill",
    "emoji": "🏔️",
    "district": "Theni",
    "description": "Train to Madurai/Dindigul, bus to Theni, then limited hill buses or shared jeep.",
    "attractions": [
      "Tea estates",
      "Cloud viewpoints",
      "Manalar Dam",
      "Highwavys",
      "Forest drives"
    ],
    "nearestStation": "Theni",
    "hasRailAccess": false,
    "lat": 9.74,
    "lng": 77.41
  },
{
  "id": "thekkady",
  "name": "Thekkady",
  "fullName": "Thekkady (Kumily / Periyar Tiger Reserve)",
  "category": "wildlife",
  "emoji": "🐘",
  "district": "Idukki",
  "description": "Train to Kottayam or Madurai, then buses to Kumily and Thekkady.",
  "attractions": [
    "Periyar Tiger Reserve",
    "Boat safari",
    "Spice plantations",
    "Forest trekking",
    "Elephant camp"
  ],
  "nearestStation": "Kottayam",
    "hasRailAccess": false,
  "lat": 9.5949,
  "lng": 77.1741
},
  {
    "id": "sirumalai",
    "name": "Sirumalai",
    "fullName": "Sirumalai (Dindigul Hills)",
    "category": "hill",
    "emoji": "🏔️",
    "district": "Dindigul",
    "description": "Reach Dindigul Junction, then local bus or cab up the hill.",
    "attractions": [
      "Sirumalai viewpoints",
      "Agasthiarpuram",
      "Hill roads",
      "Dindigul food trail"
    ],
    "nearestStation": "Dindigul Junction",
    "hasRailAccess": false,
    "lat": 10.27,
    "lng": 77.96
  },
  {
    "id": "pachamalai",
    "name": "Pachamalai",
    "fullName": "Pachamalai Hills",
    "category": "hill",
    "emoji": "🏔️",
    "district": "Tiruchirappalli",
    "description": "Best reached by bus from Trichy/Thuraiyur; start early due to limited frequency.",
    "attractions": [
      "Pachamalai viewpoints",
      "Tribal villages",
      "Waterfalls",
      "Nature drives"
    ],
    "nearestStation": "Tiruchirappalli Junction",
    "hasRailAccess": false,
    "lat": 11.32,
    "lng": 78.5
  },
  {
    "id": "hogenakkal",
    "name": "Hogenakkal",
    "fullName": "Hogenakkal Falls",
    "category": "wildlife",
    "emoji": "🌿",
    "district": "Dharmapuri",
    "description": "Train to Salem Junction, then bus to Hogenakkal.",
    "attractions": [
      "Hogenakkal Falls",
      "Coracle ride",
      "Cauvery viewpoints",
      "Oil massage area"
    ],
    "nearestStation": "Salem Junction",
    "hasRailAccess": false,
    "lat": 12.11,
    "lng": 77.77
  },
  {
    "id": "courtallam",
    "name": "Courtallam",
    "fullName": "Courtallam Falls",
    "category": "wildlife",
    "emoji": "🌿",
    "district": "Tenkasi",
    "description": "All Sengottai-side trains cross Tenkasi; buses/autos connect to the falls.",
    "attractions": [
      "Main Falls",
      "Five Falls",
      "Old Courtallam",
      "Tiger Falls",
      "Tenkasi temple"
    ],
    "nearestStation": "Tenkasi Junction",
    "hasRailAccess": false,
    "lat": 8.93,
    "lng": 77.27
  },
  {
    "id": "papanasam",
    "name": "Papanasam",
    "fullName": "Papanasam (Falls and Temple)",
    "category": "wildlife",
    "emoji": "🌿",
    "district": "Tirunelveli",
    "description": "Train to Tirunelveli/Ambasamudram, then bus towards Papanasam.",
    "attractions": [
      "Papanasam Falls",
      "Agasthiyar Falls",
      "Papanasanathar Temple",
      "Manimuthar side trip"
    ],
    "nearestStation": "Ambasamudram",
    "hasRailAccess": false,
    "lat": 8.71,
    "lng": 77.36
  },
  {
    "id": "manimuthar",
    "name": "Manimuthar",
    "fullName": "Manimuthar Falls and Dam",
    "category": "wildlife",
    "emoji": "🌿",
    "district": "Tirunelveli",
    "description": "Use Tirunelveli or Ambasamudram as rail base, then local bus/cab.",
    "attractions": [
      "Manimuthar Falls",
      "Manimuthar Dam",
      "Western Ghats views",
      "Papanasam circuit"
    ],
    "nearestStation": "Ambasamudram",
    "hasRailAccess": false,
    "lat": 8.66,
    "lng": 77.39
  },
  {
    "id": "thirparappu",
    "name": "Thirparappu",
    "fullName": "Thirparappu Falls",
    "category": "wildlife",
    "emoji": "🌿",
    "district": "Kanniyakumari",
    "description": "Train to Nagercoil/Kanyakumari, then buses towards Kulasekaram/Thirparappu.",
    "attractions": [
      "Thirparappu Falls",
      "Mahadevar Temple",
      "Padmanabhapuram Palace",
      "Kanyakumari side trip"
    ],
    "nearestStation": "Nagercoil Junction",
    "hasRailAccess": false,
    "lat": 8.32,
    "lng": 77.32
  },
  {
    "id": "srirangam",
    "name": "Srirangam",
    "fullName": "Srirangam (Ranganathaswamy Temple)",
    "category": "temple",
    "emoji": "🛕",
    "district": "Tiruchirappalli",
    "description": "Srirangam has its own station; Trichy Junction has more trains and city buses.",
    "attractions": [
      "Ranganathaswamy Temple",
      "Rockfort nearby",
      "Amma Mandapam",
      "Kallanai side trip"
    ],
    "nearestStation": "Srirangam",
    "hasRailAccess": true,
    "lat": 10.86,
    "lng": 78.69
  },
  {
    "id": "gangaikonda-cholapuram",
    "name": "Gangaikonda Cholapuram",
    "fullName": "Gangaikonda Cholapuram",
    "category": "temple",
    "emoji": "🛕",
    "district": "Ariyalur",
    "description": "Train to Ariyalur/Kumbakonam, then bus via Jayankondam.",
    "attractions": [
      "Brihadisvara Temple",
      "Chola heritage",
      "Jayankondam belt"
    ],
    "nearestStation": "Ariyalur",
    "hasRailAccess": false,
    "lat": 11.2,
    "lng": 79.44
  },
  {
    "id": "darasuram",
    "name": "Darasuram",
    "fullName": "Darasuram Airavatesvara Temple",
    "category": "temple",
    "emoji": "🛕",
    "district": "Thanjavur",
    "description": "Reach Kumbakonam by train, then local bus/auto to Darasuram.",
    "attractions": [
      "Airavatesvara Temple",
      "Kumbakonam temples",
      "Swamimalai",
      "Mahamaham tank"
    ],
    "nearestStation": "Kumbakonam",
    "hasRailAccess": false,
    "lat": 10.95,
    "lng": 79.36
  },
  {
    "id": "nagore",
    "name": "Nagore",
    "fullName": "Nagore Dargah",
    "category": "temple",
    "emoji": "🛕",
    "district": "Nagapattinam",
    "description": "Nagore has rail access; Nagapattinam/Karaikal buses are frequent.",
    "attractions": [
      "Nagore Dargah",
      "Nagapattinam beach",
      "Velankanni side trip",
      "Karaikal side trip"
    ],
    "nearestStation": "Nagore",
    "hasRailAccess": true,
    "lat": 10.81,
    "lng": 79.84
  },
  {
    "id": "karaikal",
    "name": "Karaikal",
    "fullName": "Karaikal Coastal Town",
    "category": "beach",
    "emoji": "🏖️",
    "district": "Karaikal",
    "description": "Reach by train to Karaikal or Mayiladuthurai, then buses around the coast.",
    "attractions": [
      "Karaikal Beach",
      "Thirunallar side trip",
      "Karaikal Ammaiyar Temple",
      "French heritage streets"
    ],
    "nearestStation": "Karaikal",
    "hasRailAccess": true,
    "lat": 10.92,
    "lng": 79.83
  },
  {
    "id": "karaikudi",
    "name": "Karaikudi",
    "fullName": "Karaikudi (Chettinad Base)",
    "category": "temple",
    "emoji": "🛕",
    "district": "Sivaganga",
    "description": "Karaikudi Junction is the best base for Chettinad and Pillayarpatti.",
    "attractions": [
      "Chettinad mansions",
      "Athangudi tiles",
      "Karaikudi food",
      "Pillayarpatti side trip"
    ],
    "nearestStation": "Karaikudi Junction",
    "hasRailAccess": true,
    "lat": 10.07,
    "lng": 78.78
  },
  {
    "id": "chettinad",
    "name": "Chettinad",
    "fullName": "Chettinad Heritage Villages",
    "category": "temple",
    "emoji": "🛕",
    "district": "Sivaganga",
    "description": "Reach Karaikudi Junction and use buses/autos for Kanadukathan/Athangudi.",
    "attractions": [
      "Kanadukathan Palace",
      "Athangudi tiles",
      "Heritage mansions",
      "Chettinad cuisine"
    ],
    "nearestStation": "Karaikudi Junction",
    "hasRailAccess": false,
    "lat": 10.16,
    "lng": 78.78
  },
  {
    "id": "sivaganga",
    "name": "Sivaganga",
    "fullName": "Sivaganga Palace and Temples",
    "category": "temple",
    "emoji": "🛕",
    "district": "Sivaganga",
    "description": "Sivaganga has rail access; combine with Karaikudi for a budget circuit.",
    "attractions": [
      "Sivaganga Palace",
      "Kaleeswarar Temple",
      "Karaikudi side trip",
      "Chettinad belt"
    ],
    "nearestStation": "Sivaganga",
    "hasRailAccess": true,
    "lat": 9.84,
    "lng": 78.48
  },
  {
    "id": "namakkal",
    "name": "Namakkal",
    "fullName": "Namakkal Anjaneyar and Fort",
    "category": "temple",
    "emoji": "🛕",
    "district": "Namakkal",
    "description": "Reach Salem/Erode by train, then frequent buses to Namakkal.",
    "attractions": [
      "Anjaneyar Temple",
      "Namakkal Fort",
      "Narasimhaswamy Temple",
      "Tiruchengode side trip"
    ],
    "nearestStation": "Salem Junction",
    "hasRailAccess": false,
    "lat": 11.22,
    "lng": 78.17
  },
  {
    "id": "krishnagiri",
    "name": "Krishnagiri",
    "fullName": "Krishnagiri Dam and Hills",
    "category": "wildlife",
    "emoji": "🌿",
    "district": "Krishnagiri",
    "description": "Train to Jolarpettai/Dharmapuri, then buses to Krishnagiri.",
    "attractions": [
      "Krishnagiri Dam",
      "Mango markets",
      "Kelavarapalli Dam",
      "Hill viewpoints"
    ],
    "nearestStation": "Katpadi Junction",
    "hasRailAccess": false,
    "lat": 12.52,
    "lng": 78.21
  },
  {
    "id": "dharmapuri",
    "name": "Dharmapuri",
    "fullName": "Dharmapuri (Hogenakkal Base)",
    "category": "city",
    "emoji": "🏙️",
    "district": "Dharmapuri",
    "description": "Dharmapuri is the rail base for Hogenakkal and nearby budget nature trips.",
    "attractions": [
      "Hogenakkal access",
      "Adhiyamankottai",
      "Local markets",
      "Cauvery belt"
    ],
    "nearestStation": "Dharmapuri",
    "hasRailAccess": true,
    "lat": 12.13,
    "lng": 78.16
  },
  {
    "id": "kalakkad",
    "name": "Kalakkad",
    "fullName": "Kalakkad Mundanthurai Tiger Reserve",
    "category": "wildlife",
    "emoji": "🌿",
    "district": "Tirunelveli",
    "description": "Reach Tirunelveli, then bus/cab toward Kalakkad; check forest entry rules.",
    "attractions": [
      "KMTR forest",
      "Kalakkad temple",
      "Birding areas",
      "Western Ghats edge"
    ],
    "nearestStation": "Tirunelveli Junction",
    "hasRailAccess": false,
    "lat": 8.55,
    "lng": 77.55
  },
  {
    "id": "koonthankulam",
    "name": "Koonthankulam",
    "fullName": "Koonthankulam Bird Sanctuary",
    "category": "wildlife",
    "emoji": "🌿",
    "district": "Tirunelveli",
    "description": "Train to Tirunelveli, then bus/auto toward Koonthankulam.",
    "attractions": [
      "Bird sanctuary",
      "Village tanks",
      "Tirunelveli halwa",
      "Nanguneri side trip"
    ],
    "nearestStation": "Tirunelveli Junction",
    "hasRailAccess": false,
    "lat": 8.45,
    "lng": 77.75
  },
  {
    "id": "vedanthangal",
    "name": "Vedanthangal",
    "fullName": "Vedanthangal Bird Sanctuary",
    "category": "wildlife",
    "emoji": "🌿",
    "district": "Chengalpattu",
    "description": "Train to Chengalpattu, then local bus/cab to Vedanthangal.",
    "attractions": [
      "Bird sanctuary",
      "Karikili sanctuary",
      "Chengalpattu food stops",
      "Day trip from Chennai"
    ],
    "nearestStation": "Chengalpattu Junction",
    "hasRailAccess": false,
    "lat": 12.55,
    "lng": 79.85
  },
  {
    "id": "marakkanam",
    "name": "Marakkanam",
    "fullName": "Marakkanam Salt Pans and Coast",
    "category": "beach",
    "emoji": "🏖️",
    "district": "Villupuram",
    "description": "Best by ECR bus from Chennai/Puducherry or via Tindivanam by rail.",
    "attractions": [
      "Salt pans",
      "ECR coast",
      "Alambara Fort nearby",
      "Pondicherry side trip"
    ],
    "nearestStation": "Tindivanam",
    "hasRailAccess": false,
    "lat": 12.2,
    "lng": 79.95
  },
  {
    "id": "poompuhar",
    "name": "Poompuhar",
    "fullName": "Poompuhar Ancient Port",
    "category": "beach",
    "emoji": "🏖️",
    "district": "Mayiladuthurai",
    "description": "Train to Mayiladuthurai, then bus to Poompuhar.",
    "attractions": [
      "Poompuhar Beach",
      "Silappathikaram art gallery",
      "Cauvery mouth",
      "Mayiladuthurai temples"
    ],
    "nearestStation": "Mayiladuthurai Junction",
    "hasRailAccess": false,
    "lat": 11.14,
    "lng": 79.85
  },
  {
    "id": "kodiakarai",
    "name": "Kodiakarai",
    "fullName": "Kodiakarai / Point Calimere Base",
    "category": "wildlife",
    "emoji": "🌿",
    "district": "Nagapattinam",
    "description": "Reach Nagapattinam/Thiruvarur by train, then buses to Vedaranyam/Kodiakarai.",
    "attractions": [
      "Point Calimere",
      "Wildlife sanctuary",
      "Salt pans",
      "Birding season"
    ],
    "nearestStation": "Thiruvarur Junction / Nagapattinam Junction",
    "hasRailAccess": false,
    "lat": 10.3,
    "lng": 79.85
  },
  {
    "id": "point-calimere",
    "name": "Point Calimere",
    "fullName": "Point Calimere Wildlife Sanctuary",
    "category": "wildlife",
    "emoji": "🌿",
    "district": "Nagapattinam",
    "description": "Use Vedaranyam/Kodiakarai as the road base; verify sanctuary access before travel.",
    "attractions": [
      "Point Calimere Sanctuary",
      "Blackbuck sightings",
      "Migratory birds",
      "Kodikkarai coast"
    ],
    "nearestStation": "Thiruvarur Junction / Nagapattinam Junction",
    "hasRailAccess": false,
    "lat": 10.3,
    "lng": 79.85
  },
  {
    "id": "pulicat",
    "name": "Pulicat",
    "fullName": "Pulicat Lake",
    "category": "beach",
    "emoji": "🏖️",
    "district": "Thiruvallur",
    "description": "Train to Ponneri from Chennai, then bus/auto to Pulicat.",
    "attractions": [
      "Pulicat Lake",
      "Birding season",
      "Dutch cemetery",
      "Sriharikota viewpoint"
    ],
    "nearestStation": "Ponneri",
    "hasRailAccess": false,
    "lat": 13.42,
    "lng": 80.32
  },
  {
    "id": "pollachi",
    "name": "Pollachi",
    "fullName": "Pollachi (Topslip and Valparai Base)",
    "category": "city",
    "emoji": "🏙️",
    "district": "Coimbatore",
    "description": "Pollachi Junction is a useful rail/bus base for Topslip and Valparai.",
    "attractions": [
      "Pollachi markets",
      "Aliyar Dam",
      "Topslip access",
      "Valparai route"
    ],
    "nearestStation": "Pollachi Junction",
    "hasRailAccess": true,
    "lat": 10.66,
    "lng": 77.01
  },
  {
    "id": "avinashi",
    "name": "Avinashi",
    "fullName": "Avinashi",
    "category": "temple",
    "emoji": "🛕",
    "district": "Tiruppur",
    "description": "Reach Tiruppur by train, then frequent buses to Avinashi.",
    "attractions": [
      "Avinashi Lingeswarar Temple",
      "Tiruppur food stops",
      "Coimbatore side trip"
    ],
    "nearestStation": "Tiruppur",
    "hasRailAccess": false,
    "lat": 11.19,
    "lng": 77.27
  },
  {
    "id": "perur",
    "name": "Perur",
    "fullName": "Perur Pateeswarar Temple",
    "category": "temple",
    "emoji": "🛕",
    "district": "Coimbatore",
    "description": "Reach Coimbatore Junction, then city bus/auto to Perur.",
    "attractions": [
      "Perur Temple",
      "Noyyal river belt",
      "Marudamalai side trip",
      "Coimbatore food"
    ],
    "nearestStation": "Coimbatore Junction",
    "hasRailAccess": false,
    "lat": 10.99,
    "lng": 76.91
  },
  {
    "id": "thirukadaiyur",
    "name": "Thirukadaiyur",
    "fullName": "Thirukadaiyur Abirami Temple",
    "category": "temple",
    "emoji": "🛕",
    "district": "Mayiladuthurai",
    "description": "Train to Mayiladuthurai, then frequent buses to Thirukadaiyur.",
    "attractions": [
      "Abirami Amman Temple",
      "60th wedding rituals",
      "Poompuhar side trip",
      "Mayiladuthurai temples"
    ],
    "nearestStation": "Mayiladuthurai Junction",
    "hasRailAccess": false,
    "lat": 11.12,
    "lng": 79.83
  }
  
];

export const categoryLabels: Record<DestinationCategory, string> = {
  hill: '🏔️ Hill Station', beach: '🏖️ Beach', temple: '🛕 Temple',
  city: '🏙️ City', heritage: '🏛️ Heritage', wildlife: '🌿 Wildlife',
};

export const getDestinationById = (id: string) => {
  return tnDestinations.find((d) => d.id === id);
};

export const getDistance = (
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
) => {
  const R = 6371;

  const dLat = ((toLat - fromLat) * Math.PI) / 180;
  const dLng = ((toLng - fromLng) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((fromLat * Math.PI) / 180) *
      Math.cos((toLat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
};
