export type DestinationCategory = "hill" | "beach" | "temple" | "city" | "heritage" | "wildlife";

export interface Destination {
  id: string;
  name: string;
  category: DestinationCategory;
  description: string;
  lat: number;
  lng: number;
  attractions: string[];
  hotels: Hotel[];
}

export interface Hotel {
  name: string;
  pricePerNight: number;
  rating: number;
  distanceKm: number;
  tier: "budget" | "standard" | "comfort";
}

export const destinations: Destination[] = [
  {
    id: "chennai", name: "Chennai", category: "city", description: "Capital city with beaches, temples & culture",
    lat: 13.08, lng: 80.27,
    attractions: ["Marina Beach", "Kapaleeshwarar Temple", "Fort St. George", "Government Museum", "San Thome Cathedral", "Guindy National Park", "Valluvar Kottam", "Besant Nagar Beach", "DakshinaChitra", "Birla Planetarium", "Mylapore", "Express Avenue Mall"],
    hotels: [
      { name: "Broad Lands Lodge", pricePerNight: 600, rating: 3.5, distanceKm: 2, tier: "budget" },
      { name: "Hotel Pandian", pricePerNight: 1200, rating: 3.8, distanceKm: 1.5, tier: "budget" },
      { name: "Hanu Reddy Residences", pricePerNight: 2500, rating: 4.2, distanceKm: 3, tier: "standard" },
      { name: "The Raintree", pricePerNight: 4500, rating: 4.5, distanceKm: 5, tier: "comfort" },
    ],
  },
  {
    id: "madurai", name: "Madurai", category: "temple", description: "Temple city with the iconic Meenakshi Amman",
    lat: 9.92, lng: 78.12,
    attractions: ["Meenakshi Amman Temple", "Thirumalai Nayakkar Palace", "Gandhi Memorial Museum", "Alagar Kovil", "Vandiyur Mariamman Teppakulam", "Koodal Azhagar Temple", "Pudhu Mandapam", "Kazimar Big Mosque", "St. Mary's Cathedral", "Samanar Hills"],
    hotels: [
      { name: "Hotel Supreme", pricePerNight: 500, rating: 3.4, distanceKm: 1, tier: "budget" },
      { name: "Madurai Residency", pricePerNight: 1100, rating: 3.7, distanceKm: 2, tier: "budget" },
      { name: "Heritage Madurai", pricePerNight: 3500, rating: 4.3, distanceKm: 5, tier: "standard" },
      { name: "Courtyard by Marriott", pricePerNight: 5000, rating: 4.6, distanceKm: 4, tier: "comfort" },
    ],
  },
  {
    id: "ooty", name: "Ooty", category: "hill", description: "Queen of hill stations in the Nilgiris",
    lat: 11.41, lng: 76.69,
    attractions: ["Botanical Gardens", "Ooty Lake", "Doddabetta Peak", "Rose Garden", "Tea Factory", "Pykara Falls", "Nilgiri Mountain Railway", "Avalanche Lake", "Emerald Lake", "Stone House"],
    hotels: [
      { name: "Hotel Lakeview", pricePerNight: 700, rating: 3.3, distanceKm: 1, tier: "budget" },
      { name: "Willow Hill", pricePerNight: 1500, rating: 3.9, distanceKm: 2, tier: "standard" },
      { name: "Sterling Elk Hill", pricePerNight: 3000, rating: 4.2, distanceKm: 3, tier: "standard" },
      { name: "Savoy Hotel", pricePerNight: 6000, rating: 4.7, distanceKm: 1, tier: "comfort" },
    ],
  },
  {
    id: "kodaikanal", name: "Kodaikanal", category: "hill", description: "Princess of hill stations with misty views",
    lat: 10.24, lng: 77.49,
    attractions: ["Kodaikanal Lake", "Coakers Walk", "Pillar Rocks", "Bryant Park", "Silver Cascade Falls", "Dolphin's Nose", "Bear Shola Falls", "Pine Forest", "Guna Caves", "Berijam Lake"],
    hotels: [
      { name: "Hotel Astoria", pricePerNight: 600, rating: 3.2, distanceKm: 1, tier: "budget" },
      { name: "Hotel Kodai International", pricePerNight: 1400, rating: 3.8, distanceKm: 1.5, tier: "standard" },
      { name: "Sterling Kodai Valley", pricePerNight: 3200, rating: 4.3, distanceKm: 4, tier: "standard" },
      { name: "The Carlton", pricePerNight: 5500, rating: 4.6, distanceKm: 2, tier: "comfort" },
    ],
  },
  {
    id: "rameswaram", name: "Rameswaram", category: "temple", description: "Sacred island with the Ramanathaswamy Temple",
    lat: 9.29, lng: 79.31,
    attractions: ["Ramanathaswamy Temple", "Pamban Bridge", "Dhanushkodi", "Agni Theertham", "Gandhamadhana Parvatham", "Kothandaramaswamy Temple", "Adam's Bridge", "Villoondi Theertham", "Water Bird Sanctuary", "Ariyaman Beach"],
    hotels: [
      { name: "Hotel Tamil Nadu", pricePerNight: 450, rating: 3.0, distanceKm: 1, tier: "budget" },
      { name: "Daiwik Hotels", pricePerNight: 1800, rating: 4.0, distanceKm: 1.5, tier: "standard" },
      { name: "Hyatt Place", pricePerNight: 4000, rating: 4.4, distanceKm: 2, tier: "comfort" },
    ],
  },
  {
    id: "kanyakumari", name: "Kanyakumari", category: "beach", description: "Southernmost tip where three oceans meet",
    lat: 8.08, lng: 77.55,
    attractions: ["Vivekananda Rock Memorial", "Thiruvalluvar Statue", "Sunrise/Sunset Point", "Padmanabhapuram Palace", "Kanyakumari Temple", "Gandhi Mandapam", "Wax Museum", "Mathur Hanging Trough", "Thirparappu Falls", "Baywatch"],
    hotels: [
      { name: "Hotel Maadhini", pricePerNight: 500, rating: 3.3, distanceKm: 0.5, tier: "budget" },
      { name: "Hotel Sea View", pricePerNight: 1500, rating: 3.9, distanceKm: 0.3, tier: "standard" },
      { name: "Sparsa Resort", pricePerNight: 4500, rating: 4.5, distanceKm: 2, tier: "comfort" },
    ],
  },
  {
    id: "thanjavur", name: "Thanjavur", category: "heritage", description: "Home of the UNESCO Brihadeeswarar Temple",
    lat: 10.79, lng: 79.13,
    attractions: ["Brihadeeswarar Temple", "Thanjavur Royal Palace", "Saraswathi Mahal Library", "Art Gallery", "Schwartz Church", "Sangeetha Mahal", "Sivaganga Park", "Manora Fort", "Punnainallur Mariamman Temple", "Tamil University Museum"],
    hotels: [
      { name: "Hotel Gnanam", pricePerNight: 550, rating: 3.4, distanceKm: 1, tier: "budget" },
      { name: "Hotel Parisutham", pricePerNight: 1600, rating: 4.0, distanceKm: 2, tier: "standard" },
      { name: "Svatma Hotel", pricePerNight: 5000, rating: 4.7, distanceKm: 1, tier: "comfort" },
    ],
  },
  {
    id: "pondicherry", name: "Pondicherry", category: "beach", description: "French colonial charm meets Indian culture",
    lat: 11.94, lng: 79.83,
    attractions: ["Promenade Beach", "Auroville", "Sri Aurobindo Ashram", "Paradise Beach", "French Quarter", "Basilica of the Sacred Heart", "Pondicherry Museum", "Serenity Beach", "Botanical Garden", "Manakula Vinayagar Temple"],
    hotels: [
      { name: "New Guest House", pricePerNight: 500, rating: 3.2, distanceKm: 0.5, tier: "budget" },
      { name: "Hotel De L'Orient", pricePerNight: 2200, rating: 4.1, distanceKm: 0.3, tier: "standard" },
      { name: "Palais de Mahe", pricePerNight: 4800, rating: 4.6, distanceKm: 0.5, tier: "comfort" },
    ],
  },
  {
    id: "coimbatore", name: "Coimbatore", category: "city", description: "Manchester of South India with temples",
    lat: 11.02, lng: 76.96,
    attractions: ["Marudamalai Temple", "Dhyanalinga", "VOC Park", "Brookefields Mall", "Perur Pateeshwarar Temple", "Monkey Falls", "Kovai Kutralam", "Black Thunder", "Gass Forest Museum", "Siruvani Waterfalls"],
    hotels: [
      { name: "Hotel CAG Pride", pricePerNight: 600, rating: 3.5, distanceKm: 2, tier: "budget" },
      { name: "Hotel Heritage Inn", pricePerNight: 1500, rating: 3.9, distanceKm: 3, tier: "standard" },
      { name: "The Residency Towers", pricePerNight: 3500, rating: 4.3, distanceKm: 1, tier: "comfort" },
    ],
  },
  {
    id: "trichy", name: "Tiruchirappalli", category: "temple", description: "Rock Fort Temple city on the Cauvery",
    lat: 10.79, lng: 78.69,
    attractions: ["Rock Fort Temple", "Sri Ranganathaswamy Temple", "Jambukeswarar Temple", "Kallanai Dam", "Mukkombu", "ISKCON Temple", "Lourdes Church", "Government Museum", "Puliyancholai Falls", "Samayapuram Temple"],
    hotels: [
      { name: "Hotel Abbirami", pricePerNight: 450, rating: 3.2, distanceKm: 1, tier: "budget" },
      { name: "Breeze Residency", pricePerNight: 1800, rating: 4.0, distanceKm: 2, tier: "standard" },
      { name: "SRM Hotel", pricePerNight: 3000, rating: 4.2, distanceKm: 3, tier: "comfort" },
    ],
  },
  {
    id: "mahabalipuram", name: "Mahabalipuram", category: "heritage", description: "UNESCO shore temples and rock-cut caves",
    lat: 12.62, lng: 80.19,
    attractions: ["Shore Temple", "Pancha Rathas", "Arjuna's Penance", "Krishna's Butterball", "Tiger Cave", "Crocodile Bank", "Mahabalipuram Beach", "Thirukadalmallai Temple", "Sculpture Museum", "DakshinaChitra"],
    hotels: [
      { name: "Sea Breeze Guest House", pricePerNight: 500, rating: 3.3, distanceKm: 0.5, tier: "budget" },
      { name: "Chariot Beach Resort", pricePerNight: 2500, rating: 4.1, distanceKm: 1, tier: "standard" },
      { name: "Radisson Blu", pricePerNight: 5500, rating: 4.6, distanceKm: 2, tier: "comfort" },
    ],
  },
  {
    id: "coonoor", name: "Coonoor", category: "hill", description: "Serene Nilgiri hill town with tea estates",
    lat: 11.35, lng: 76.79,
    attractions: ["Sim's Park", "Dolphin's Nose", "Lamb's Rock", "Droog Fort", "Tea Estates", "Hidden Valley", "Laws Falls", "Nilgiri Toy Train", "St. George's Church", "Pasteur Institute"],
    hotels: [
      { name: "YMCA Coonoor", pricePerNight: 400, rating: 3.0, distanceKm: 1, tier: "budget" },
      { name: "Acres Wild Farmstay", pricePerNight: 2000, rating: 4.3, distanceKm: 5, tier: "standard" },
      { name: "The Tamara Kodai", pricePerNight: 5000, rating: 4.6, distanceKm: 3, tier: "comfort" },
    ],
  },
  {
    id: "yercaud", name: "Yercaud", category: "hill", description: "Jewel of the South on Shevaroy Hills",
    lat: 11.77, lng: 78.21,
    attractions: ["Yercaud Lake", "Anna Park", "Shevaroy Temple", "Lady's Seat", "Grange Viewpoint", "Bear's Cave", "Kiliyur Falls", "Pagoda Point", "Botanical Garden", "Silk Farm"],
    hotels: [
      { name: "Hotel Tamil Nadu Yercaud", pricePerNight: 500, rating: 3.1, distanceKm: 1, tier: "budget" },
      { name: "GRT Nature Trails", pricePerNight: 2800, rating: 4.2, distanceKm: 3, tier: "standard" },
      { name: "Sterling Yercaud", pricePerNight: 4000, rating: 4.4, distanceKm: 2, tier: "comfort" },
    ],
  },
  {
    id: "kumbakonam", name: "Kumbakonam", category: "temple", description: "City of temples and Mahamaham tank",
    lat: 10.96, lng: 79.39,
    attractions: ["Adi Kumbeswarar Temple", "Sarangapani Temple", "Mahamaham Tank", "Navagraha Temples", "Airavatesvara Temple", "Swamimalai Temple", "Ramaswamy Temple", "Chakrapani Temple", "Kumbakonam Degree Coffee", "Patteeswaram Temple"],
    hotels: [
      { name: "Hotel Raya's", pricePerNight: 400, rating: 3.2, distanceKm: 0.5, tier: "budget" },
      { name: "Sara Regency", pricePerNight: 1200, rating: 3.8, distanceKm: 1, tier: "standard" },
      { name: "Indeco Hotels", pricePerNight: 3500, rating: 4.4, distanceKm: 5, tier: "comfort" },
    ],
  },
  {
    id: "chidambaram", name: "Chidambaram", category: "temple", description: "Home of the Nataraja Temple",
    lat: 11.40, lng: 79.69,
    attractions: ["Nataraja Temple", "Thillai Kali Amman Temple", "Pichavaram Mangrove Forest", "Annamalai University", "Kollidam River", "Devarayanpettai Fort", "Sethuraman Museum", "Bhuvanagiri Fort"],
    hotels: [
      { name: "Hotel Saradharam", pricePerNight: 400, rating: 3.0, distanceKm: 0.5, tier: "budget" },
      { name: "Hotel Akshaya", pricePerNight: 1000, rating: 3.6, distanceKm: 1, tier: "standard" },
    ],
  },
  {
    id: "valparai", name: "Valparai", category: "hill", description: "Tea plantation paradise in Anamalai Hills",
    lat: 10.32, lng: 76.97,
    attractions: ["Sholayar Dam", "Monkey Falls", "Nallamudi Viewpoint", "Balaji Temple", "Grass Hills", "Chinnakallar Falls", "Tea Plantations", "Anamalai Tiger Reserve", "Aliyar Dam", "Loam's Viewpoint"],
    hotels: [
      { name: "Hotel Valley View", pricePerNight: 500, rating: 3.2, distanceKm: 1, tier: "budget" },
      { name: "Stanmore Bungalow", pricePerNight: 2500, rating: 4.3, distanceKm: 4, tier: "standard" },
      { name: "Rainforest Retreat", pricePerNight: 4500, rating: 4.5, distanceKm: 6, tier: "comfort" },
    ],
  },
  {
    id: "nagapattinam", name: "Nagapattinam", category: "beach", description: "Coastal town with ancient heritage",
    lat: 10.76, lng: 79.84,
    attractions: ["Nagore Dargah", "Velankanni Church", "Soundararaja Perumal Temple", "Nagapattinam Beach", "Kayarohanaswamy Temple", "Sikkil Singaravelan Temple", "Dutch Fort Ruins", "Mangrove Forest"],
    hotels: [
      { name: "Hotel Tamil Nadu", pricePerNight: 400, rating: 3.0, distanceKm: 1, tier: "budget" },
      { name: "Hotel Subham", pricePerNight: 900, rating: 3.5, distanceKm: 0.5, tier: "standard" },
    ],
  },
  {
    id: "tirunelveli", name: "Tirunelveli", category: "city", description: "Land of halwa and the Nellaiappar Temple",
    lat: 8.73, lng: 77.68,
    attractions: ["Nellaiappar Temple", "Krishnapuram Palace", "Courtallam Falls", "Manimuthar Dam", "Papanasam Falls", "Agasthiyar Falls", "Mundanthurai Tiger Reserve", "Kalakkad Sanctuary", "Ambasamudram", "Tirunelveli Halwa Shops"],
    hotels: [
      { name: "Hotel Aryaas", pricePerNight: 450, rating: 3.3, distanceKm: 1, tier: "budget" },
      { name: "Hotel Vijay Elanza", pricePerNight: 1500, rating: 3.9, distanceKm: 2, tier: "standard" },
      { name: "The Vijay Park", pricePerNight: 3000, rating: 4.2, distanceKm: 3, tier: "comfort" },
    ],
  },
  {
    id: "salem", name: "Salem", category: "city", description: "Steel city surrounded by hills",
    lat: 11.66, lng: 78.15,
    attractions: ["Yercaud Hills", "Mettur Dam", "Sugavaneswarar Temple", "Kottai Mariamman Temple", "Salem Steel Plant", "Kanjamalai Hills", "Kiliyur Falls", "Anna Park"],
    hotels: [
      { name: "Hotel Salem Castle", pricePerNight: 500, rating: 3.3, distanceKm: 1, tier: "budget" },
      { name: "Hotel Mariya International", pricePerNight: 1200, rating: 3.7, distanceKm: 1.5, tier: "standard" },
    ],
  },
  {
    id: "mudumalai", name: "Mudumalai", category: "wildlife", description: "Wildlife sanctuary in the Nilgiris",
    lat: 11.57, lng: 76.53,
    attractions: ["Mudumalai Tiger Reserve", "Elephant Camp", "Moyar River", "Needle Rock", "Pykara Dam", "Theppakadu", "Ancient Banyan Tree", "Kalhatty Waterfalls"],
    hotels: [
      { name: "Forest Department Rest House", pricePerNight: 400, rating: 3.0, distanceKm: 1, tier: "budget" },
      { name: "Jungle Retreat", pricePerNight: 2500, rating: 4.2, distanceKm: 3, tier: "standard" },
      { name: "The Monarch Safari Park", pricePerNight: 4500, rating: 4.5, distanceKm: 2, tier: "comfort" },
    ],
  },
  {
    id: "dhanushkodi", name: "Dhanushkodi", category: "beach", description: "Ghost town at the tip of Pamban Island",
    lat: 9.17, lng: 79.43,
    attractions: ["Dhanushkodi Beach", "Ghost Town Ruins", "Ram Setu Point", "Arichal Munai", "Bay of Bengal View", "Kodandaramaswamy Temple", "Water Bird Sanctuary"],
    hotels: [
      { name: "Hotel Tamil Nadu (Rameswaram)", pricePerNight: 450, rating: 3.0, distanceKm: 18, tier: "budget" },
      { name: "Daiwik Hotels (Rameswaram)", pricePerNight: 1800, rating: 4.0, distanceKm: 18, tier: "standard" },
    ],
  },
  {
    id: "hogenakkal", name: "Hogenakkal", category: "beach", description: "Niagara of India with coracle rides",
    lat: 12.12, lng: 77.78,
    attractions: ["Hogenakkal Falls", "Coracle Ride", "Hanging Bridge", "Melagiri Hills", "Cauvery Fishing", "Oil Bath Massage", "Pennagaram Forest"],
    hotels: [
      { name: "TTDC Hotel Tamil Nadu", pricePerNight: 400, rating: 3.0, distanceKm: 1, tier: "budget" },
      { name: "Cauvery Guest House", pricePerNight: 800, rating: 3.4, distanceKm: 0.5, tier: "budget" },
    ],
  },
  {
    id: "thoothukudi", name: "Thoothukudi", category: "city", description: "Pearl city with colonial history",
    lat: 8.76, lng: 78.13,
    attractions: ["Our Lady of Snows Basilica", "Kalugumalai Jain Beds", "Hare Island", "Manapad Beach", "VOC Memorial", "Tiruchendur Murugan Temple", "Korkai", "Pearl Diving Heritage"],
    hotels: [
      { name: "Hotel Velan", pricePerNight: 500, rating: 3.3, distanceKm: 1, tier: "budget" },
      { name: "GRT Regency", pricePerNight: 1800, rating: 4.0, distanceKm: 2, tier: "standard" },
    ],
  },
  {
    id: "vellore", name: "Vellore", category: "heritage", description: "Fort city with the Golden Temple",
    lat: 12.92, lng: 79.13,
    attractions: ["Vellore Fort", "Sripuram Golden Temple", "Jalakandeswarar Temple", "Government Museum", "Amirthi Zoological Park", "Yelagiri Hills", "Science Park"],
    hotels: [
      { name: "Hotel Darling Residency", pricePerNight: 500, rating: 3.3, distanceKm: 2, tier: "budget" },
      { name: "GRT Regency Vellore", pricePerNight: 1800, rating: 4.0, distanceKm: 3, tier: "standard" },
      { name: "The Accord Metropolitan", pricePerNight: 3500, rating: 4.3, distanceKm: 4, tier: "comfort" },
    ],
  },
  {
    id: "kanchipuram", name: "Kanchipuram", category: "temple", description: "City of Thousand Temples and silk sarees",
    lat: 12.83, lng: 79.70,
    attractions: ["Ekambareswarar Temple", "Kailasanathar Temple", "Kamakshi Amman Temple", "Varadharaja Perumal Temple", "Silk Weaving Centres", "Vedanthangal Bird Sanctuary", "Kanchi Kudil Heritage House", "Devarajaswami Temple"],
    hotels: [
      { name: "GRT Regency Kanchipuram", pricePerNight: 1200, rating: 3.7, distanceKm: 2, tier: "budget" },
      { name: "Hotel Baboo Soorya", pricePerNight: 800, rating: 3.4, distanceKm: 1, tier: "budget" },
    ],
  },
  {
    id: "yelagiri", name: "Yelagiri", category: "hill", description: "Quiet hill station near Vellore",
    lat: 12.59, lng: 78.63,
    attractions: ["Yelagiri Lake", "Punganoor Lake Park", "Swamimalai Hills", "Jalagamparai Waterfalls", "Velavan Temple", "Nature Park", "Nilavoor Lake", "Telescope Observatory"],
    hotels: [
      { name: "Hotel Tamil Nadu Yelagiri", pricePerNight: 450, rating: 3.0, distanceKm: 1, tier: "budget" },
      { name: "Sterling Yelagiri", pricePerNight: 2500, rating: 4.2, distanceKm: 2, tier: "standard" },
    ],
  },
  {
    id: "pollachi", name: "Pollachi", category: "wildlife", description: "Nature hub near Anamalai Tiger Reserve",
    lat: 10.66, lng: 77.01,
    attractions: ["Anamalai Tiger Reserve", "Aliyar Dam", "Monkey Falls", "Masani Amman Temple", "Parambikulam Tiger Reserve", "Sholayar Dam", "Navagraha Temple", "Topslip"],
    hotels: [
      { name: "Hotel Bharath", pricePerNight: 400, rating: 3.1, distanceKm: 1, tier: "budget" },
      { name: "Coco Lagoon", pricePerNight: 3000, rating: 4.3, distanceKm: 8, tier: "standard" },
    ],
  },
  {
    id: "dindigul", name: "Dindigul", category: "heritage", description: "Fort city famous for biryani and locks",
    lat: 10.36, lng: 77.98,
    attractions: ["Dindigul Fort", "Sirumalai Hills", "Thadikombu Rock Cut Temple", "Begampur Mosque", "Lock Manufacturing Area", "Palani Murugan Temple (nearby)", "Pillaiyarpatti Cave Temple"],
    hotels: [
      { name: "Hotel Janakiram", pricePerNight: 400, rating: 3.1, distanceKm: 1, tier: "budget" },
      { name: "SRM Hotel Dindigul", pricePerNight: 1200, rating: 3.7, distanceKm: 2, tier: "standard" },
    ],
  },
  {
    id: "cuddalore", name: "Cuddalore", category: "beach", description: "Coastal town with colonial charm",
    lat: 11.75, lng: 79.77,
    attractions: ["Silver Beach", "Pichavaram Mangrove Forest", "Fort St. David", "Devanampattinam Beach", "Pataleeswarar Temple", "Dutch Cemetery", "Gadilam River", "Manjakollai Beach"],
    hotels: [
      { name: "Hotel Atrium", pricePerNight: 500, rating: 3.2, distanceKm: 1, tier: "budget" },
      { name: "Hotel Vijaya", pricePerNight: 900, rating: 3.5, distanceKm: 0.5, tier: "standard" },
    ],
  },
  {
    id: "courtallam", name: "Courtallam", category: "hill", description: "Spa of South India with medicinal falls",
    lat: 8.93, lng: 77.28,
    attractions: ["Main Falls", "Old Courtallam Falls", "Five Falls", "Tiger Falls", "Honey Falls", "Thirukutralanathar Temple", "Peraruvi", "Shenbagadevi Falls"],
    hotels: [
      { name: "Hotel Tamil Nadu Courtallam", pricePerNight: 400, rating: 3.0, distanceKm: 0.5, tier: "budget" },
      { name: "Hotel Pothigai", pricePerNight: 1000, rating: 3.5, distanceKm: 1, tier: "standard" },
    ],
  },
  {
    id: "karaikudi", name: "Karaikudi", category: "heritage", description: "Chettinad mansions and legendary cuisine",
    lat: 10.07, lng: 78.78,
    attractions: ["Chettinad Palace", "Athangudi Palace", "Kanadukathan Village", "Pillayarpatti Temple", "Chettinad Museum", "Karaikudi Antique Market", "Traditional Cooking Classes", "Kothamangalam Church"],
    hotels: [
      { name: "The Bangala", pricePerNight: 3500, rating: 4.5, distanceKm: 1, tier: "standard" },
      { name: "Hotel Udhayam", pricePerNight: 500, rating: 3.2, distanceKm: 0.5, tier: "budget" },
      { name: "Visalam Heritage", pricePerNight: 5000, rating: 4.6, distanceKm: 2, tier: "comfort" },
    ],
  },
  {
    id: "tiruvannamalai", name: "Tiruvannamalai", category: "temple", description: "Sacred Arunachala hill and Ramana Maharshi Ashram",
    lat: 12.23, lng: 79.07,
    attractions: ["Annamalaiyar Temple", "Ramana Maharshi Ashram", "Arunachala Hill Girivalam", "Virupaksha Cave", "Skandashramam", "Sathanur Dam", "Javvadhu Hills", "Parvathamalai"],
    hotels: [
      { name: "Hotel Arunachala", pricePerNight: 400, rating: 3.1, distanceKm: 0.5, tier: "budget" },
      { name: "Sparsa Resort", pricePerNight: 2500, rating: 4.2, distanceKm: 3, tier: "standard" },
    ],
  },
  {
    id: "erode", name: "Erode", category: "city", description: "Turmeric city on the banks of Cauvery",
    lat: 11.34, lng: 77.72,
    attractions: ["Bannari Amman Temple", "Bhavanisagar Dam", "Kodiveri Dam", "Periyar Memorial House", "Vellode Bird Sanctuary", "Sangameswarar Temple", "Chennimalai Murugan Temple"],
    hotels: [
      { name: "Hotel J Maariot", pricePerNight: 500, rating: 3.3, distanceKm: 1, tier: "budget" },
      { name: "Hotel Grand Palace", pricePerNight: 1200, rating: 3.7, distanceKm: 2, tier: "standard" },
    ],
  },
  {
    id: "theni", name: "Theni", category: "hill", description: "Gateway to Megamalai and Suruli Falls",
    lat: 10.01, lng: 77.48,
    attractions: ["Megamalai", "Suruli Falls", "Vaigai Dam", "Kumbakarai Falls", "High Wavy Mountains", "Sothuparai Dam", "Megamalai Wildlife Sanctuary", "Cloud Walks"],
    hotels: [
      { name: "Hotel Meenakshi", pricePerNight: 400, rating: 3.0, distanceKm: 1, tier: "budget" },
      { name: "Megamalai Mountain Retreat", pricePerNight: 2500, rating: 4.2, distanceKm: 40, tier: "standard" },
    ],
  },
  {
    id: "sivaganga", name: "Sivaganga", category: "heritage", description: "Historic district of Velu Nachiyar",
    lat: 10.43, lng: 78.48,
    attractions: ["Sivaganga Fort", "Kalaiyarkoil Temple", "Velu Nachiyar Memorial", "Chettinad Heritage (nearby)", "Piranmalai", "Devakottai Heritage Walk"],
    hotels: [
      { name: "Hotel Lakshmi", pricePerNight: 350, rating: 2.9, distanceKm: 0.5, tier: "budget" },
      { name: "Hotel Pandian Sivaganga", pricePerNight: 800, rating: 3.3, distanceKm: 1, tier: "budget" },
    ],
  },
  {
    id: "thekkady", name: "Thekkady (Kumily)", category: "wildlife", description: "Periyar Tiger Reserve gateway",
    lat: 9.60, lng: 77.16,
    attractions: ["Periyar Tiger Reserve", "Periyar Lake Boating", "Spice Plantations", "Bamboo Rafting", "Mangala Devi Temple", "Mudra Kathakali Centre", "Chellarkovil Viewpoint", "Abraham's Spice Garden"],
    hotels: [
      { name: "Mickey's Homestay", pricePerNight: 500, rating: 3.5, distanceKm: 2, tier: "budget" },
      { name: "Spice Village", pricePerNight: 3500, rating: 4.5, distanceKm: 3, tier: "standard" },
      { name: "Cardamom County", pricePerNight: 5000, rating: 4.6, distanceKm: 4, tier: "comfort" },
    ],
  },
  {
    id: "pichavaram", name: "Pichavaram", category: "wildlife", description: "Second largest mangrove forest in the world",
    lat: 11.43, lng: 79.78,
    attractions: ["Pichavaram Mangrove Forest", "Boating through Mangroves", "Bird Watching", "Killai Backwaters", "Chidambaram Temple (nearby)", "Annamalai University"],
    hotels: [
      { name: "TTDC Hotel", pricePerNight: 400, rating: 3.0, distanceKm: 1, tier: "budget" },
      { name: "Pichavaram Guest House", pricePerNight: 700, rating: 3.3, distanceKm: 0.5, tier: "budget" },
    ],
  },
];

// Distance matrix (approximate km between major cities - simplified)
const distanceData: Record<string, Record<string, number>> = {};

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 1.3); // 1.3 factor for road distance approximation
}

export function getDistance(from: string, to: string): number {
  const src = destinations.find(d => d.id === from);
  const dst = destinations.find(d => d.id === to);
  if (!src || !dst) return 0;
  return haversineDistance(src.lat, src.lng, dst.lat, dst.lng);
}

export function getDestinationById(id: string): Destination | undefined {
  return destinations.find(d => d.id === id);
}

export const categoryLabels: Record<DestinationCategory, string> = {
  hill: "🏔️ Hill Station",
  beach: "🏖️ Beach",
  temple: "🛕 Temple",
  city: "🏙️ City",
  heritage: "🏛️ Heritage",
  wildlife: "🌿 Wildlife",
};

export const categoryEmoji: Record<DestinationCategory, string> = {
  hill: "🏔️",
  beach: "🏖️",
  temple: "🛕",
  city: "🏙️",
  heritage: "🏛️",
  wildlife: "🌿",
};
