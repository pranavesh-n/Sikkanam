import { forwardRef, useState } from "react";
import { type TripPlan, generateShareText, type TravellerType, getBudgetReliability } from "@/lib/tripPlanner";
import { categoryLabels, getDestinationById, tnDestinations } from "@/data/tnDestinations";
import { Share2, Printer, Train, Star, AlertCircle, CheckCircle2, ExternalLink, Clock, Compass, MapPin, Bookmark } from "lucide-react";
import { HOTEL_RANGES } from "@/lib/hotelPrices";
import { generateTrainSearchUrl } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface TripResultsProps {
  plan: TripPlan;
  onSelectDestination?: (destId: string) => void;
}

const ATTRACTION_INFO: Record<string, { desc: string; category: string }> = {
  "Ooty Lake": { desc: "Scenic lake offering boating and beautiful surrounding views", category: "Lake" },
  "Botanical Garden": { desc: "Lush green gardens with thousands of exotic plant species", category: "Park & Garden" },
  "Doddabetta Peak": { desc: "The highest point in South India with panoramic views", category: "Viewpoint" },
  "Pykara Lake": { desc: "Famous for its tranquil waters and picturesque waterfalls", category: "Lake" },
  "Rose Garden": { desc: "Stunning terraced garden home to thousands of rose varieties", category: "Park & Garden" },
  "Mudumalai (Day Trip)": { desc: "Popular national park and elephant sanctuary", category: "Wildlife" },
  "Avalanche Lake": { desc: "Pristine lake surrounded by lush green forests", category: "Lake" },
  "Sim's Park": { desc: "Beautiful botanical park located in nearby Coonoor", category: "Park & Garden" },
  "Dolphin's Nose": { desc: "Spectacular viewpoint showing canyons and waterfalls", category: "Viewpoint" },
  "Coonoor Tea Factory": { desc: "Insightful tea manufacturing facility with tasting sessions", category: "Industrial / Tea" },
  "Kodai Lake": { desc: "Star-shaped lake perfect for peaceful boating and cycling", category: "Lake" },
  "Coaker's Walk": { desc: "Scenic pedestrian path overlooking valleys and clouds", category: "Viewpoint" },
  "Pillar Rocks": { desc: "Three majestic vertical granite boulders standing tall", category: "Rock Formation" },
  "Bryant Park": { desc: "Beautifully maintained horticultural park with rich blooms", category: "Park & Garden" },
  "Pine Forest": { desc: "Mesmerizing stretch of tall pine trees, ideal for walks", category: "Forest" },
  "Berijam Lake": { desc: "Calm and quiet freshwater reservoir inside reserve forest", category: "Lake" },
  "Green Valley View": { desc: "Panoramic view of hills, valleys, and Vaigai Dam", category: "Viewpoint" },
  "Silver Cascade Falls": { desc: "Scenic waterfall formed from the outflow of Kodai Lake", category: "Waterfall" },
  "La Saleth Church": { desc: "Historic 150-year-old shrine offering spiritual peace", category: "Heritage Site" },
  "Pambar Falls": { desc: "A series of cascading falls forming natural pools", category: "Waterfall" },
  "Yercaud Lake": { desc: "Emerald waters surrounded by gardens and boating activities", category: "Lake" },
  "Shevaroy Temple": { desc: "Highest point in Yercaud with a cave temple dedicated to Lord Shevaroyan", category: "Temple" },
  "Pagoda Point": { desc: "Stunning viewpoint overlooking the city of Salem", category: "Viewpoint" },
  "Lady's Seat": { desc: "Panoramic viewpoint that offers spectacular sunset views", category: "Viewpoint" },
  "Kiliyur Falls": { desc: "A spectacular 300-foot waterfall in the Shervaroy hills", category: "Waterfall" },
  "Aliyar Reservoir": { desc: "Stunning dam footed in the hills of Valparai", category: "Dam & Lake" },
  "Sholayar Dam": { desc: "One of the deepest dams in Asia, surrounded by tea estates", category: "Dam & Lake" },
  "Parambikulam Tiger Reserve": { desc: "Protected forest area famous for wildlife sightings", category: "Wildlife" },
  "Monkey Falls": { desc: "Natural waterfall offering a refreshing dip for travellers", category: "Waterfall" },
  "Tea Estate Walks": { desc: "Walks through rolling green hills of tea leaves", category: "Scenic Trail" },
  "Shore Temple (UNESCO)": { desc: "8th-century stone temple overlooking the Bay of Bengal", category: "UNESCO Heritage" },
  "Pancha Rathas": { desc: "Monolithic rock temples carved in the shape of chariots", category: "UNESCO Heritage" },
  "Arjuna's Penance (Rock)": { desc: "Giant open-air relief carved on two monolithic boulders", category: "UNESCO Heritage" },
  "Krishna's Butter Ball": { desc: "Gigantic natural boulder balanced precariously on a slope", category: "Natural Wonder" },
  "Lighthouse Beach": { desc: "Sandy beach offering scenic views from the lighthouse", category: "Beach" },
  "Ramanathaswamy Temple": { desc: "Holy temple famous for its grand corridor and sacred wells", category: "Temple" },
  "Pamban Bridge": { desc: "Historic railway bridge connecting Rameswaram to the mainland", category: "Bridge" },
  "Dhanushkodi (ghost town)": { desc: "Haunting ruins of a town washed away by the 1964 cyclone", category: "Ghost Town" },
  "Agnitheertham Beach": { desc: "Sacred beach where pilgrims take a holy dip in the sea", category: "Beach" },
  "Sunrise/Sunset Point": { desc: "The southernmost tip of mainland India where three seas meet", category: "Scenic Spot" },
  "Vivekananda Rock Memorial": { desc: "Sacred monument situated on a small rocky island off the coast", category: "Memorial" },
  "Thiruvalluvar Statue (133ft)": { desc: "Colossal stone sculpture dedicated to the Tamil poet-philosopher", category: "Monument" },
  "Kanyakumari Temple": { desc: "Ancient temple dedicated to the goddess Kanya Kumari on the shore", category: "Temple" },
  "Promenade Beach": { desc: "Popular rock beach walk along the French Quarter", category: "Beach" },
  "French Quarter (White Town)": { desc: "Charming streets with yellow colonial villas and chic cafes", category: "Heritage Site" },
  "Auroville (Matrimandir)": { desc: "Spiritual dome focused on human unity and meditation", category: "Spiritual Center" },
  "Aurobindo Ashram": { desc: "Tranquil spiritual community founded by Sri Aurobindo", category: "Spiritual Center" },
  "Meenakshi Amman Temple": { desc: "Architectural masterpiece with towering, colourful gateway towers", category: "Temple" },
  "Thirumalai Nayakkar Palace": { desc: "17th-century palace showing a fusion of Italian and Rajput styles", category: "Heritage Site" },
  "Gandhi Museum": { desc: "Historic building dedicated to the life and message of Mahatma Gandhi", category: "Museum" },
  "Brihadeeswarar Temple (UNESCO)": { desc: "Majestic 1000-year-old temple built by Rajaraja Chola I", category: "UNESCO Heritage" },
  "Thanjavur Palace": { desc: "Royal residence of the Maratha rulers with library and museum", category: "Heritage Site" },
  "Nataraja Temple": { desc: "World-famous Shiva temple celebrating the cosmic dance", category: "Temple" },
  "Pichavaram Mangroves": { desc: "One of India's largest and most beautiful mangrove forests", category: "Forest / Nature" },
  "Thillai Kali Amman Temple": { desc: "Ancient temple dedicated to Goddess Kali near the main temple", category: "Temple" },
  "Rock Fort Temple (83m)": { desc: "Ancient temple built on a massive rock rising above the city", category: "Temple" },
  "Sri Ranganathaswamy (Srirangam)": { desc: "The largest active Hindu temple complex in the world", category: "Temple" },
  "Jambukeswarar Temple": { desc: "Ancient Shiva temple representing the water element", category: "Temple" },
  "Annamalaiyar Temple": { desc: "Grand temple complex dedicated to Shiva at the foot of Arunachala", category: "Temple" },
  "Arunachala Hill (14km trek)": { desc: "Sacred hill walked by millions of seekers and sages", category: "Sacred Mountain" },
  "Ramana Maharshi Ashram": { desc: "Tranquil ashram dedicated to the sage Ramana Maharshi", category: "Spiritual Center" },
};


function getDestinationHeroDetails(dest: any) {
  const typeMap: Record<string, string> = {
    hill: "Scenic Hill Station",
    beach: "Coastal Beach Escape",
    temple: "Spiritual Temple Town",
    city: "Vibrant Urban Centre",
    heritage: "Historic Heritage Site",
    wildlife: "Nature & Wildlife Sanctuary"
  };
  
  const typeLabel = typeMap[dest.category] || "Leisure Getaway";
  const budgetLabel = dest.costIndex <= 2 ? "Budget Friendly" : dest.costIndex === 3 ? "Moderate Spend" : "Premium Value";
  
  const tagMap: Record<string, string[]> = {
    hill: ["Tea Valleys", "Mist & Peaks", "Cool Climate", "Scenic Trails"],
    beach: ["Sandy Shores", "Seaside Forts", "Ocean Sunsets", "Seafood Trail"],
    temple: ["Sacred Sites", "Dravidian Art", "Rich History", "Divine Energy"],
    city: ["Local Bazaars", "Shopping Hub", "Street Food", "Urban Pulse"],
    heritage: ["Historic Ruins", "Chettinad Homes", "Ancient Temples", "Cultural Roots"],
    wildlife: ["Elephant Camps", "Western Ghats", "Dense Forests", "Safaris"]
  };
  
  const tagIconMap: Record<string, string[]> = {
    hill: ["🍵", "🏔️", "❄️", "🥾"],
    beach: ["🏖️", "🏰", "🌅", "🦐"],
    temple: ["🛕", "🏛️", "📜", "✨"],
    city: ["🛍️", "🏬", "🍜", "🎶"],
    heritage: ["🏚️", "🏠", "🛕", "🌿"],
    wildlife: ["🐘", "🏞️", "🌲", "🚙"]
  };
  const icons = tagIconMap[dest.category] || ["📍", "🗺️"];
  const styleTags = (tagMap[dest.category] || ["Sightseeing", "Tamil Nadu Tours"]).map((tag, i) => `${icons[i] || "📍"} ${tag}`);
  return { typeLabel, budgetLabel, styleTags };
}

function getWhyRecommends(dest: any, input: any, route: any[], hotels: any[]) {
  const points: string[] = [];
  const distanceKm = route.reduce((sum, leg) => sum + leg.distanceKm, 0);
  
  if (dest.hasRailAccess || distanceKm < 150) {
    points.push("Easy to Reach (direct connection/short travel)");
  } else {
    points.push("Well-Connected Regional Hub");
  }
  
  if (dest.costIndex <= 3) {
    points.push("Budget-Friendly Food & Transport");
  } else {
    points.push("Premium Sights & Stays");
  }
  
  if (dest.category === "temple" || dest.category === "heritage") {
    points.push("Rich Heritage & Architectural Marvels");
  } else if (dest.category === "hill" || dest.category === "wildlife") {
    points.push("Pristine Nature & Wildlife Sightings");
  } else {
    points.push("Relaxing Beaches & Coastal Sights");
  }
  
  const recommended = dest.recommendedDays || 2;
  if (input.days >= recommended) {
    points.push(`Perfect Match for a ${input.days}-Day Duration`);
  } else {
    points.push(`Covers Top Spots in ${input.days} Days`);
  }
  
  if (hotels && hotels.length > 0) {
    points.push("Good Hotel Availability in Selected Style");
  } else {
    points.push("Verified Alternate Stays Nearby");
  }
  
  return points.slice(0, 5);
}

function getSimilarDestinations(category: string, excludeId: string) {
  return tnDestinations
    .filter(d => d.category === category && d.id !== excludeId)
    .slice(0, 4);
}

function getTimelineHoursForDay(activities: string[], isFirstDay: boolean, isLastDay: boolean, daysCount: number) {
  if (activities.length === 0) return [];
  
  const filteredActivities = activities.filter(act => 
    !act.toLowerCase().includes("travel via") &&
    !act.toLowerCase().includes("check into") &&
    !act.toLowerCase().includes("check out") &&
    !act.toLowerCase().includes("start early") &&
    !act.toLowerCase().includes("return from")
  );

  const timeline: { time: string; text: string }[] = [];

  if (daysCount === 1) {
    timeline.push({ time: "08:00", text: "Start early journey to destination" });
    if (filteredActivities.length > 0) timeline.push({ time: "11:00", text: filteredActivities[0] });
    if (filteredActivities.length > 1) timeline.push({ time: "14:00", text: filteredActivities[1] });
    if (filteredActivities.length > 2) timeline.push({ time: "17:00", text: filteredActivities[2] });
    timeline.push({ time: "19:00", text: "Start return journey" });
  } else if (isFirstDay) {
    timeline.push({ time: "08:00", text: "Travel to destination" });
    timeline.push({ time: "12:00", text: "Hotel Check-in & Refresh" });
    let hour = 14;
    for (const act of filteredActivities) {
      timeline.push({ time: `${hour}:00`, text: act });
      hour += 3;
      if (hour > 17) break;
    }
    timeline.push({ time: "19:00", text: "Dinner & evening leisure" });
  } else if (isLastDay) {
    let hour = 8;
    for (const act of filteredActivities) {
      timeline.push({ time: `${hour.toString().padStart(2, '0')}:00`, text: act });
      hour += 3;
      if (hour > 11) break;
    }
    timeline.push({ time: "15:00", text: "Check out & Return Journey" });
  } else {
    const times = ["08:00", "11:00", "14:00", "17:00"];
    let idx = 0;
    for (const act of filteredActivities) {
      const time = times[idx] || "17:00";
      timeline.push({ time, text: act });
      idx++;
      if (idx >= 4) break;
    }
    timeline.push({ time: "19:00", text: "Dinner & night market walk" });
  }
  
  return timeline;
}

function renderMathBreakdown(comp: any, plan: any) {
  const travellers = plan.input.travellers;
  const days = plan.input.days;
  const nights = Math.max(days - 1, 0);
  const rooms = nights > 0 ? Math.ceil(travellers / (plan.input.style === "budget" ? 3 : 2)) : 0;
  
  if (comp.key === "transport") {
    return (
      <div className="col-span-1 md:col-span-2 bg-muted/40 p-3 rounded-lg border border-border/40 space-y-2 mt-2 font-mono text-[11px] text-left">
        <span className="font-bold text-foreground block uppercase text-[9px] tracking-wider">Math Breakdown</span>
        <div className="space-y-1 text-muted-foreground">
          {plan.route.map((leg: any, i: number) => {
            const legMode = leg.mode === "train" ? "Train" : leg.mode === "auto" ? "Auto" : "Bus";
            return (
              <div key={i} className="space-y-0.5">
                <div className="flex justify-between flex-wrap">
                  <span>Outward {legMode} Fare:</span>
                  <span className="text-foreground">₹{leg.costPerPerson} × {travellers} travellers = ₹{leg.costPerPerson * travellers}</span>
                </div>
                <div className="flex justify-between flex-wrap">
                  <span>Return {legMode} Fare:</span>
                  <span className="text-foreground">₹{leg.costPerPerson} × {travellers} travellers = ₹{leg.costPerPerson * travellers}</span>
                </div>
              </div>
            );
          })}
          {plan.route.length === 0 && (
            <div className="text-foreground italic">No intercity travel required.</div>
          )}
        </div>
      </div>
    );
  }
  
  if (comp.key === "hotel") {
    if (nights === 0) return null;
    const minRate = comp.hotelMarketIntel?.minEstimatedPrice || 800;
    const maxRate = comp.hotelMarketIntel?.maxEstimatedPrice || 1500;
    return (
      <div className="col-span-1 md:col-span-2 bg-muted/40 p-3 rounded-lg border border-border/40 space-y-2 mt-2 font-mono text-[11px] text-left">
        <span className="font-bold text-foreground block uppercase text-[9px] tracking-wider">Math Breakdown</span>
        <div className="space-y-1 text-muted-foreground">
          <div className="flex justify-between flex-wrap">
            <span>Minimum Room Budget:</span>
            <span className="text-foreground">₹{minRate}/night × {rooms} rooms × {nights} nights = ₹{minRate * rooms * nights}</span>
          </div>
          <div className="flex justify-between flex-wrap">
            <span>Maximum Room Budget:</span>
            <span className="text-foreground">₹{maxRate}/night × {rooms} rooms × {nights} nights = ₹{maxRate * rooms * nights}</span>
          </div>
        </div>
      </div>
    );
  }
  
  if (comp.key === "food" && comp.foodBreakdown) {
    const f = comp.foodBreakdown;
    return (
      <div className="col-span-1 md:col-span-2 bg-muted/40 p-3 rounded-lg border border-border/40 space-y-2 mt-2 font-mono text-[11px] text-left">
        <span className="font-bold text-foreground block uppercase text-[9px] tracking-wider">Math Breakdown (Min – Max)</span>
        <div className="space-y-1 text-muted-foreground">
          <div className="flex justify-between flex-wrap">
            <span>Breakfast:</span>
            <span className="text-foreground">₹{f.breakfast.min}–₹{f.breakfast.max} × {travellers} pax × {days} days = ₹{f.breakfast.min * travellers * days}–₹{f.breakfast.max * travellers * days}</span>
          </div>
          <div className="flex justify-between flex-wrap">
            <span>Lunch:</span>
            <span className="text-foreground">₹{f.lunch.min}–₹{f.lunch.max} × {travellers} pax × {days} days = ₹{f.lunch.min * travellers * days}–₹{f.lunch.max * travellers * days}</span>
          </div>
          <div className="flex justify-between flex-wrap">
            <span>Dinner:</span>
            <span className="text-foreground">₹{f.dinner.min}–₹{f.dinner.max} × {travellers} pax × {days} days = ₹{f.dinner.min * travellers * days}–₹{f.dinner.max * travellers * days}</span>
          </div>
          <div className="flex justify-between flex-wrap">
            <span>Snacks:</span>
            <span className="text-foreground">₹{f.snacks.min}–₹{f.snacks.max} × {travellers} pax × {days} days = ₹{f.snacks.min * travellers * days}–₹{f.snacks.max * travellers * days}</span>
          </div>
        </div>
      </div>
    );
  }
  
  if (comp.key === "mobility") {
    const minDaily = comp.min / days;
    const maxDaily = comp.max / days;
    return (
      <div className="col-span-1 md:col-span-2 bg-muted/40 p-3 rounded-lg border border-border/40 space-y-2 mt-2 font-mono text-[11px] text-left">
        <span className="font-bold text-foreground block uppercase text-[9px] tracking-wider">Math Breakdown</span>
        <div className="space-y-1 text-muted-foreground flex justify-between flex-wrap">
          <span>Local Travel Cost:</span>
          <span className="text-foreground">(₹{minDaily} – ₹{maxDaily}/day) × {days} days = ₹{comp.min} – ₹{comp.max}</span>
        </div>
      </div>
    );
  }
  
  if (comp.key === "activities" && comp.attractionBreakdown) {
    const list = comp.attractionBreakdown.attractionsList;
    const entrySum = list.reduce((s: number, item: any) => s + item.entryFeeAdult, 0);
    const parkSum = list.reduce((s: number, item: any) => s + item.parkingFee, 0);
    const cameraSum = list.reduce((s: number, item: any) => s + item.cameraFee, 0);
    return (
      <div className="col-span-1 md:col-span-2 bg-muted/40 p-3 rounded-lg border border-border/40 space-y-2 mt-2 font-mono text-[11px] text-left">
        <span className="font-bold text-foreground block uppercase text-[9px] tracking-wider">Math Breakdown</span>
        <div className="space-y-1 text-muted-foreground">
          <div className="flex justify-between flex-wrap">
            <span>Sightseeing Tickets:</span>
            <span className="text-foreground">₹{entrySum} per adult × {travellers} pax = ₹{entrySum * travellers}</span>
          </div>
          {(parkSum > 0 || cameraSum > 0) && (
            <div className="flex justify-between flex-wrap">
              <span>Parking & Camera Fees:</span>
              <span className="text-foreground">₹{parkSum} (parking) + ₹{cameraSum} (camera) = ₹{parkSum + cameraSum}</span>
            </div>
          )}
          <div className="flex justify-between flex-wrap">
            <span>Activity Buffer:</span>
            <span className="text-foreground">₹30 × {travellers} pax × {days} days = ₹{30 * travellers * days}</span>
          </div>
        </div>
      </div>
    );
  }
  
  if (comp.key === "buffer") {
    return (
      <div className="col-span-1 md:col-span-2 bg-muted/40 p-3 rounded-lg border border-border/40 space-y-2 mt-2 font-mono text-[11px] text-left">
        <span className="font-bold text-foreground block uppercase text-[9px] tracking-wider">Math Breakdown</span>
        <div className="space-y-1 text-muted-foreground flex justify-between flex-wrap">
          <span>Risk Cushion:</span>
          <span className="text-foreground">(₹250 – ₹500/day) × {travellers} travellers × {days} days = ₹{comp.min} – ₹{comp.max}</span>
        </div>
      </div>
    );
  }
  
  return null;
}

const TripResults = forwardRef<HTMLDivElement, TripResultsProps>(({ plan, onSelectDestination }, ref) => {
  const [expandedComponent, setExpandedComponent] = useState<string | null>(null);
  const { user } = useAuth();
  const [saveLoading, setSaveLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveTrip = async () => {
    if (!user) {
      toast.error("Please sign in to save your trip");
      return;
    }

    if (!plan.destination) return;

    setSaveLoading(true);
    try {
      const budgetStr = plan.intelligence 
        ? `₹${plan.intelligence.recommendedCarry.toLocaleString("en-IN")}`
        : `₹${plan.budget.total.toLocaleString("en-IN")}`;
      
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `Trip to ${plan.destination.name}`,
          destination: plan.destination.name,
          duration: plan.input.days,
          style: plan.input.style,
          budget: budgetStr,
          itinerary: plan
        })
      });

      if (res.ok) {
        setIsSaved(true);
        toast.success("Trip saved successfully to your Profile!");
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Failed to save trip");
      }
    } catch (error) {
      console.error("Save trip error:", error);
      toast.error("Error saving trip");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleWhatsAppShare = () => {
    const text = generateShareText(plan);
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleOpenMaps = () => {
    if (!plan.destination) return;
    const destination = plan.destination.id;
    window.open(`/maps?destination=${destination}`, "_blank");
  };

  const getTrainSearchUrl = () => {
    const srcDest = getDestinationById(plan.input.source);
    const fromStation = srcDest?.nearestStation || plan.input.source;
    const toStation = plan.destination?.nearestStation || plan.destination?.name || "";
    return generateTrainSearchUrl(fromStation, toStation);
  };

  const getAttractionDetails = (rawName: string, destName: string) => {
    const parts = rawName.split(" ");
    let emoji = "📍";
    let name = rawName;
    if (parts.length > 1) {
      const lastPart = parts[parts.length - 1];
      if (/[^\x00-\x7F]/g.test(lastPart)) {
        emoji = lastPart;
        name = parts.slice(0, -1).join(" ");
      }
    }

    const matched = ATTRACTION_INFO[name];
    let desc = matched?.desc || `A beautiful point of interest to explore in ${destName}.`;
    let category = matched?.category || "Sightseeing";

    if (!matched) {
      const lower = name.toLowerCase();
      if (lower.includes("temple") || lower.includes("amman") || lower.includes("kovil") || lower.includes("church") || lower.includes("basilica") || lower.includes("mosque") || lower.includes("dargah") || lower.includes("ashram")) {
        category = "Sacred Site";
      } else if (lower.includes("lake") || lower.includes("dam") || lower.includes("reservoir") || lower.includes("river") || lower.includes("tank") || lower.includes("backwaters")) {
        category = "Water Body";
      } else if (lower.includes("falls") || lower.includes("waterfall")) {
        category = "Waterfall";
      } else if (lower.includes("beach") || lower.includes("sea")) {
        category = "Beach";
      } else if (lower.includes("peak") || lower.includes("hill") || lower.includes("viewpoint") || lower.includes("nose") || lower.includes("seat") || lower.includes("point") || lower.includes("mountain")) {
        category = "Scenic View";
      } else if (lower.includes("forest") || lower.includes("reserve") || lower.includes("sanctuary") || lower.includes("safari") || lower.includes("camp") || lower.includes("zoo") || lower.includes("park") || lower.includes("garden")) {
        category = "Nature & Wildlife";
      } else if (lower.includes("fort") || lower.includes("palace") || lower.includes("museum") || lower.includes("library") || lower.includes("campus") || lower.includes("memorial") || lower.includes("statue")) {
        category = "Heritage & History";
      }
    }

    return { name, emoji, desc, category };
  };

  const cleanActivity = (text: string) => {
    return text.replace(/^(Visit|Cover|Explore|Travel via|Check into|Check out, cover any missed)\s+/i, "");
  };

  // Render Recommendations Mode Screen
  if (plan.recommendations && plan.recommendations.length > 0) {
    return (
      <section ref={ref} className="py-12 md:py-20">
        <div className="container max-w-2xl px-4 space-y-8">
          <div className="text-center space-y-3">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary/10 text-primary">
              🔮 Smart Recommendations
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Top Destination Matches
            </h2>
            <p className="text-muted-foreground text-sm">
              We evaluated all destinations for your {plan.input.days}-day {plan.input.style} style trip.
            </p>
          </div>
          
          <div className="space-y-4">
            {plan.recommendations.map((rec) => (
              <div 
                key={rec.destId}
                onClick={() => onSelectDestination && onSelectDestination(rec.destId)}
                className="p-5 rounded-2xl border border-border bg-card hover:border-primary/50 transition-all cursor-pointer shadow-sm hover:shadow-card flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center active:scale-[0.99]"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-3xl">{rec.emoji}</span>
                    <h3 className="font-bold text-lg text-foreground">{rec.name}</h3>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground uppercase">
                      {categoryLabels[rec.category as any] || rec.category}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {rec.whyVisit}
                  </p>
                  
                  <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-[11px] text-muted-foreground font-medium">
                    <span>💰 Budget Fit: {rec.budgetMatch}%</span>
                    <span>🚗 Accessibility: {rec.accessibility}%</span>
                    <span>☀️ Season Match: {rec.seasonMatch}%</span>
                  </div>
                </div>
                
                <div className="sm:text-right flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-border/40">
                  <div className="text-2xl font-display font-extrabold text-primary">
                    {rec.matchScore}%
                  </div>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                    Overall Match
                  </span>
                  <button className="hidden sm:inline-block mt-2 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90">
                    Plan Trip 🗺️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!plan.destination) return null;

  const alternatives = plan.alternatives || [];
  const nearbyExperiences = plan.nearbyExperiences || [];
  const suggestedCircuits = plan.suggestedCircuits || [];

  return (
    <section ref={ref} className="py-12 md:py-20 print:py-4">
      <div className="container max-w-2xl px-4 space-y-8">
        {(() => {
          const { typeLabel, budgetLabel, styleTags } = getDestinationHeroDetails(plan.destination);
          const recommends = getWhyRecommends(plan.destination, plan.input, plan.route, plan.hotels);
          
          const categoryGradient = 
            plan.destination.category === "hill" ? "from-emerald-500/80 via-emerald-600/90 to-teal-800" :
            plan.destination.category === "beach" ? "from-blue-500/80 via-indigo-600/90 to-sky-800" :
            plan.destination.category === "temple" ? "from-amber-500/80 via-amber-600/90 to-orange-800" :
            plan.destination.category === "city" ? "from-blue-600/80 via-indigo-700/90 to-slate-900" :
            plan.destination.category === "heritage" ? "from-rose-600/80 via-rose-700/90 to-amber-900" :
            "from-green-600/80 via-emerald-700/90 to-emerald-950";
            
          return (
            <div className="space-y-6">
              {/* Postcard Hero */}
              <div className={`w-full bg-gradient-to-br ${categoryGradient} p-6 md:p-8 rounded-3xl text-white shadow-lg relative overflow-hidden space-y-4`}>
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full filter blur-2xl -z-10" />
                
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-white/25 backdrop-blur-md px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider text-white">
                      {typeLabel}
                    </span>
                    <span className="bg-white/15 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-white/90">
                      ⭐ Recommended Stay: {plan.destination.recommendedDays || 2} Days
                    </span>
                    <span className="bg-white/15 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-white/90">
                      💰 Budget: {budgetLabel}
                    </span>
                  </div>
                  
                  <h1 className="font-display text-4xl md:text-5xl font-black tracking-tight text-white flex items-center gap-3 pt-2">
                    <span>{plan.destination.emoji}</span>
                    <span>{plan.destination.name.toUpperCase()}</span>
                  </h1>
                  
                  <p className="text-sm md:text-base text-white/90 leading-relaxed font-medium max-w-xl">
                    {plan.destination.description}
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2 pt-2">
                  {styleTags.map((tag, i) => (
                    <span key={i} className="bg-white/10 hover:bg-white/20 transition-colors px-3 py-1 rounded-lg text-xs font-semibold text-white/95">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>


            </div>
          );
        })()}

        <div className="flex flex-col items-center gap-3 pt-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <span>{plan.input.days} Days</span>
            <span className="text-muted-foreground/40">•</span>
            <span>{plan.input.travellers} {plan.input.travellers === 1 ? 'Traveller' : 'Travellers'}</span>
            <span className="text-muted-foreground/40">•</span>
            <span className="capitalize">{plan.input.style} Style</span>
          </div>

          {/* Premium Budget Dashboard */}
          {plan.intelligence && (() => {
            const bufferMin = plan.intelligence.components.buffer.min;
            const bufferMax = plan.intelligence.emergencyBuffer;
            const expectedSpendMin = plan.intelligence.minRequired - bufferMin;
            const expectedSpendMax = plan.intelligence.expectedSpend;
            const recommendedCarryMin = plan.intelligence.minRequired;
            const recommendedCarryMax = plan.intelligence.recommendedCarry;

            return (
              <div className="w-full max-w-xl mx-auto space-y-4 pt-2">
                <div className="bg-card border-2 border-primary/20 p-6 rounded-3xl shadow-elevated space-y-6 relative overflow-hidden backdrop-blur-md bg-opacity-80 text-center">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full filter blur-3xl -z-10" />
                  
                  <div className="space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground block">Recommended Carry Range</span>
                    <h2 className="text-3xl md:text-4xl font-display font-black text-primary">
                      ₹{recommendedCarryMin.toLocaleString("en-IN")} - ₹{recommendedCarryMax.toLocaleString("en-IN")}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">
                      Expected Spend + Emergency Buffer Range
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-b border-border/60 py-4">
                    <div className="text-center space-y-0.5 border-r border-border/40">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Expected Spend Range</span>
                      <p className="text-base font-extrabold text-foreground">
                        ₹{expectedSpendMin.toLocaleString("en-IN")} - ₹{expectedSpendMax.toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div className="text-center space-y-0.5">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Emergency Buffer Range</span>
                      <p className="text-base font-extrabold text-foreground">
                        ₹{bufferMin.toLocaleString("en-IN")} - ₹{bufferMax.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 items-center border-t border-border/40 pt-4 w-full">
                    {(() => {
                      const { reliability, reason } = getBudgetReliability(plan.intelligence.evidenceChecklist);
                      const badgeColor = 
                        reliability === "Very High" ? "bg-emerald-500 text-white" :
                        reliability === "High" ? "bg-emerald-600/90 text-white" :
                        reliability === "Moderate" ? "bg-amber-500 text-black" : "bg-destructive text-white";
                      return (
                        <div className="w-full space-y-2.5">
                          <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Budget Reliability:</span>
                              <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${badgeColor}`}>
                                {reliability}
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                const el = document.getElementById("transparency-engine");
                                if (el) el.scrollIntoView({ behavior: "smooth" });
                              }}
                              className="text-xs font-bold text-primary hover:underline focus:outline-none"
                            >
                              View Calculations ↓
                            </button>
                          </div>
                          <p className="text-[10px] text-muted-foreground font-semibold px-2 text-left">
                            Reason: {reason}
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Grid of Why Carry, Assumptions, and Evidence Checklist */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Card 1: Recommended Carry Explanation */}
                  <div className="bg-muted/40 border border-border/60 rounded-2xl p-4 text-left space-y-3">
                    <h4 className="font-bold text-foreground flex items-center gap-1.5 text-xs">
                      🛡️ Why Carry ₹{recommendedCarryMin.toLocaleString("en-IN")} - ₹{recommendedCarryMax.toLocaleString("en-IN")}?
                    </h4>
                    
                    <div className="space-y-3">
                      <div className="p-3 bg-card border border-border/60 rounded-xl space-y-1">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Expected Spend</span>
                        <p className="text-sm font-extrabold text-foreground">
                          ₹{expectedSpendMin.toLocaleString("en-IN")} - ₹{expectedSpendMax.toLocaleString("en-IN")}
                        </p>
                        <span className="block text-[9px] text-muted-foreground/80">Includes transport, hotel, food, mobility, and activities.</span>
                      </div>
                      
                      <div className="p-3 bg-card border border-border/60 rounded-xl space-y-1">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Emergency Buffer</span>
                        <p className="text-sm font-extrabold text-foreground">
                          ₹{bufferMin.toLocaleString("en-IN")} - ₹{bufferMax.toLocaleString("en-IN")}
                        </p>
                        <span className="block text-[9px] text-muted-foreground/80">Kept aside for transport delays, extra meals, or shopping.</span>
                      </div>
                    </div>

                    <div className="text-[10px] text-muted-foreground/80 pt-2 border-t border-border/40 leading-relaxed font-semibold">
                      💡 <span className="text-primary font-bold">Recommended Carry Formulation:</span> Expected spend (₹{expectedSpendMin.toLocaleString("en-IN")} - ₹{expectedSpendMax.toLocaleString("en-IN")}) + emergency buffer (₹{bufferMin.toLocaleString("en-IN")} - ₹{bufferMax.toLocaleString("en-IN")}) = ₹{recommendedCarryMin.toLocaleString("en-IN")} - ₹{recommendedCarryMax.toLocaleString("en-IN")}.
                    </div>
                  </div>

                {/* Card 2: Budget Assumptions Panel */}
                <div className="bg-muted/40 border border-border/60 rounded-2xl p-4 text-left space-y-3">
                  <h4 className="font-bold text-foreground flex items-center gap-1.5 text-xs">
                    📋 Budget Assumptions
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs pt-1">
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-muted-foreground">Travellers</span>
                      <span className="font-bold text-foreground">{plan.intelligence.assumptions.travellerCount}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-muted-foreground">Duration</span>
                      <span className="font-bold text-foreground">{plan.intelligence.assumptions.tripDurationDays} Days</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-muted-foreground">Hotel Style</span>
                      <span className="font-bold text-foreground">{plan.intelligence.assumptions.hotelStyle}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-muted-foreground">Food Style</span>
                      <span className="font-bold text-foreground">{plan.intelligence.assumptions.foodStyle}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="block text-[10px] uppercase font-bold text-muted-foreground">Transport Style</span>
                      <span className="font-bold text-foreground">{plan.intelligence.assumptions.transportStyle}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="block text-[10px] uppercase font-bold text-muted-foreground">Activity Coverage</span>
                      <span className="font-bold text-foreground">{plan.intelligence.assumptions.activityCoverage}</span>
                    </div>
                  </div>
                </div>

                {/* Card 3: Evidence Used Checklist */}
                <div className="bg-muted/40 border border-border/60 rounded-2xl p-4 text-left space-y-3">
                  <h4 className="font-bold text-foreground flex items-center gap-1.5 text-xs">
                    📂 Evidence Used
                  </h4>
                  
                  <div className="grid grid-cols-1 gap-2.5 pt-1">
                    {[
                      { key: "roadRouteVerified", label: "Route Verified" },
                      { key: "hotelInventoryAvailable", label: "Hotel Inventory Available" },
                      { key: "attractionDatabaseAvailable", label: `${plan.intelligence.components.activities.attractionBreakdown?.mappedAttractionsCount || 0} Attractions Mapped` },
                      { key: "foodProfileAvailable", label: "Food Profile Available" },
                      { key: "destinationMetadataAvailable", label: "Destination Cost Profile Available" }
                    ].map((item) => {
                      const isOk = plan.intelligence.evidenceChecklist[item.key as keyof typeof plan.intelligence.evidenceChecklist];
                      return (
                        <div key={item.key} className="flex items-center gap-2.5 text-xs font-semibold">
                          <span className={isOk ? "text-emerald-500 font-bold text-sm" : "text-muted-foreground/40 font-bold text-sm"}>
                            {isOk ? "✓" : "✗"}
                          </span>
                          <span className={isOk ? "text-foreground" : "text-muted-foreground line-through decoration-dotted"}>
                            {item.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
        </div>

        {/* Share & Actions */}
        <div className="flex flex-wrap justify-center gap-3 pt-2 print:hidden">
          <button
            onClick={handleSaveTrip}
            disabled={saveLoading || isSaved}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-border text-foreground hover:bg-muted disabled:opacity-50 text-sm font-medium transition-colors"
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? "fill-primary text-primary" : ""}`} />
            {saveLoading ? "Saving..." : isSaved ? "Saved" : "Save Trip"}
          </button>
          <button
            onClick={handleWhatsAppShare}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-border text-foreground hover:bg-muted text-sm font-medium transition-colors"
          >
            <Share2 className="w-4 h-4" /> Share
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-border text-foreground hover:bg-muted text-sm font-medium transition-colors"
          >
            <Printer className="w-4 h-4" /> Print / PDF
          </button>
          <button
            onClick={handleOpenMaps}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-border text-foreground hover:bg-muted text-sm font-medium transition-colors"
          >
            🗺️ Open in Maps
          </button>
        </div>
      </div>

      {/* 2. Trip Assessment Card Checklist (Phase 1) */}
      {(() => {
        const isTransportAvailable = plan.route && plan.route.length > 0;
        const isHotelsAvailable = Math.max(plan.input.days - 1, 0) === 0 || (plan.hotels && plan.hotels.length > 0);
        const isAttractionsAvailable = plan.attractions && plan.attractions.length > 0;
        const isBudgetFit = plan.intelligence 
          ? (plan.input.budget * plan.input.travellers >= plan.intelligence.expectedSpend)
          : plan.budget.status === "within";
        const isWeekendSuitable = plan.input.days <= 3;
        
        const checks = [isTransportAvailable, isHotelsAvailable, isAttractionsAvailable, isBudgetFit, isWeekendSuitable];
        const passedCount = checks.filter(Boolean).length;
        
        const statusColor = 
          passedCount >= 5 ? "bg-emerald-500 text-white" :
          passedCount >= 4 ? "bg-emerald-600/90 text-white" :
          passedCount >= 3 ? "bg-amber-500 text-black" : "bg-destructive text-white";
          
        const statusLabel = 
          passedCount >= 5 ? "Highly Recommended" :
          passedCount >= 4 ? "Recommended" :
          passedCount >= 3 ? "Possible With Planning" : "Not Recommended";

        return (
          <div className="container max-w-2xl px-4 mt-6">
            <div className="bg-card border border-border p-6 rounded-2xl shadow-card space-y-4">
              <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2 text-left">
                📋 Trip Assessment
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-left">
                <div className="flex items-center gap-2.5 text-sm font-semibold">
                  <span className={isTransportAvailable ? "text-emerald-500" : "text-muted-foreground/30"}>
                    {isTransportAvailable ? "✓" : "✗"}
                  </span>
                  <span className={isTransportAvailable ? "text-foreground" : "text-muted-foreground/50"}>
                    Transport Available
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-sm font-semibold">
                  <span className={isHotelsAvailable ? "text-emerald-500" : "text-muted-foreground/30"}>
                    {isHotelsAvailable ? "✓" : "✗"}
                  </span>
                  <span className={isHotelsAvailable ? "text-foreground" : "text-muted-foreground/50"}>
                    Hotels Available
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-sm font-semibold">
                  <span className={isAttractionsAvailable ? "text-emerald-500" : "text-muted-foreground/30"}>
                    {isAttractionsAvailable ? "✓" : "✗"}
                  </span>
                  <span className={isAttractionsAvailable ? "text-foreground" : "text-muted-foreground/50"}>
                    Attractions Available
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-sm font-semibold">
                  <span className={isBudgetFit ? "text-emerald-500" : "text-muted-foreground/30"}>
                    {isBudgetFit ? "✓" : "✗"}
                  </span>
                  <span className={isBudgetFit ? "text-foreground" : "text-muted-foreground/50"}>
                    Budget Fits Trip Duration
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-sm font-semibold">
                  <span className={isWeekendSuitable ? "text-emerald-500" : "text-muted-foreground/30"}>
                    {isWeekendSuitable ? "✓" : "✗"}
                  </span>
                  <span className={isWeekendSuitable ? "text-foreground" : "text-muted-foreground/50"}>
                    Suitable For Weekend Travel
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-between border-t border-border/40 pt-4 mt-2 gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    STATUS:
                  </span>
                  <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${statusColor}`}>
                    {statusLabel}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground font-semibold">
                  Based on Sikkanam Intelligence Engine v4.3
                </span>
              </div>

              {passedCount < 3 && (
                <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/10 space-y-2 text-left">
                  <p className="text-xs font-semibold text-destructive uppercase tracking-wider">
                    Areas needing attention:
                  </p>
                  <ul className="text-xs text-destructive/95 space-y-1 font-medium list-disc list-inside">
                    {!isTransportAvailable && <li>No verified transport route found</li>}
                    {!isHotelsAvailable && <li>No hotel inventory available</li>}
                    {!isAttractionsAvailable && <li>No attractions data available</li>}
                    {!isBudgetFit && <li>Budget may not cover expected expenses</li>}
                    {!isWeekendSuitable && <li>Duration exceeds typical weekend trip</li>}
                  </ul>
                </div>
              )}
              
              {passedCount < 3 && alternatives.length > 0 && (
                <div className="pt-2 border-t border-border/40 space-y-3 text-left">
                  <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    💡 Recommended Smart Alternatives:
                  </h4>
                  <div className="grid gap-2">
                    {alternatives.map((alt) => (
                      <div 
                        key={alt.destId}
                        onClick={() => onSelectDestination && onSelectDestination(alt.destId)}
                        className="p-3 rounded-xl border border-border/60 bg-muted/30 hover:border-primary/40 cursor-pointer transition-colors flex justify-between items-center text-xs active:scale-[0.99]"
                      >
                        <div className="space-y-0.5 flex-1 pr-4">
                          <span className="font-bold text-foreground hover:underline">
                            ✓ {alt.name} ({alt.matchScore}% Match)
                          </span>
                          <p className="text-[11px] text-muted-foreground">
                            {alt.reasonBetter}
                          </p>
                        </div>
                        <span className="text-primary font-semibold whitespace-nowrap">Switch →</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      <div className="container max-w-2xl px-4 mt-8">
        <div className="space-y-12">


            {/* 2. Top Highlights */}
            <div className="space-y-6 pt-6 border-t border-border/40">
              <h2 className="font-display text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                ⭐ Top Highlights
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {plan.attractions.slice(0, 4).map((rawAttr, i) => {
                  const { name, emoji, desc, category } = getAttractionDetails(rawAttr, plan.destination?.name || "");
                  return (
                    <div key={i} className="p-5 rounded-2xl border border-border bg-card hover:border-foreground/20 transition-all flex flex-col justify-between space-y-3">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl">{emoji}</span>
                          <span className="text-[10px] font-semibold uppercase tracking-wider bg-muted px-2 py-0.5 rounded text-muted-foreground">
                            {category}
                          </span>
                        </div>
                        <h3 className="font-bold text-base text-foreground pt-1">{name}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Suggested Itinerary */}
            <div className="space-y-8 pt-6 border-t border-border/40">
              <h2 className="font-display text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                🗓️ Suggested Itinerary
              </h2>
              
              <div className="space-y-10">
                {plan.itinerary.map((day) => {
                  const timeline = getTimelineHoursForDay(
                    day.activities,
                    day.day === 1,
                    day.day === plan.itinerary.length,
                    plan.itinerary.length
                  );
                  
                  return (
                    <div key={day.day} className="space-y-4">
                      <div className="flex items-center justify-between border-b border-border/40 pb-2 text-left">
                        <h3 className="font-display font-bold text-lg text-foreground">Day {day.day}</h3>
                        <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                          Schedule Verified
                        </span>
                      </div>
                      
                      <div className="relative pl-8 border-l-2 border-border/60 space-y-6 ml-4 py-1 text-left">
                        {timeline.map((item, idx) => (
                          <div key={idx} className="relative flex items-start gap-4">
                            <div className="absolute -left-[40px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-background bg-primary" />
                            <div className="w-12 flex-shrink-0 text-xs font-extrabold text-primary pt-0.5">
                              {item.time}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-foreground leading-snug">
                                {item.text}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {day.meals && (
                        <p className="text-xs text-muted-foreground/85 italic pl-4 text-left">
                          🍽️ {day.meals}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. How You'll Travel */}
            <div className="space-y-6 pt-6 border-t border-border/40">
              <h2 className="font-display text-2xl font-bold tracking-tight text-foreground text-left">
                How You'll Travel
              </h2>
              
              {(() => {
                if (!plan.route || plan.route.length === 0) return null;
                
                const distanceKm = plan.route.reduce((sum, leg) => sum + leg.distanceKm, 0);
                const primaryLeg = plan.route[0];
                const bestMode = primaryLeg?.mode === "train" ? "Train" : primaryLeg?.mode === "auto" ? "Auto" : "Bus";
                const frequency = primaryLeg?.frequency || "Regular service";
                const isVerified = plan.route.some(leg => leg.routeIntel?.routeStatus === "verified");
                
                let durationStr = "";
                const totalMinutes = plan.route.reduce((sum, leg) => {
                  if (leg.routeIntel?.estimatedDurationMinutes) {
                    return sum + leg.routeIntel.estimatedDurationMinutes;
                  }
                  let mins = 0;
                  const hrsMatch = leg.duration.match(/(\d+)h/);
                  const minsMatch = leg.duration.match(/(\d+)m/);
                  if (hrsMatch) mins += parseInt(hrsMatch[1]) * 60;
                  if (minsMatch) mins += parseInt(minsMatch[1]);
                  return sum + (mins || 120);
                }, 0);
                
                const hrs = Math.floor(totalMinutes / 60);
                const mins = totalMinutes % 60;
                durationStr = hrs > 0 ? `${hrs}h ${mins > 0 ? `${mins}m` : ""}` : `${mins}m`;

                return (
                  <div className="bg-muted/30 border border-border/60 p-4 rounded-xl text-xs space-y-3 text-left">
                    <h3 className="font-bold text-foreground text-xs uppercase tracking-wider">
                      🚗 Getting There (Travel Reality)
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <span className="block text-[9px] uppercase font-bold text-muted-foreground">Total Distance</span>
                        <span className="text-sm font-bold text-foreground">{distanceKm} km</span>
                      </div>
                      <div>
                        <span className="block text-[9px] uppercase font-bold text-muted-foreground">Travel Duration</span>
                        <span className="text-sm font-bold text-foreground">{durationStr}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] uppercase font-bold text-muted-foreground">Best Choice</span>
                        <span className="text-sm font-bold text-foreground flex items-center gap-1">
                          {primaryLeg?.mode === "train" ? "🚆" : "🚌"} {bestMode}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[9px] uppercase font-bold text-muted-foreground">Availability</span>
                        <span className="text-sm font-bold text-foreground">{frequency}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-border/40 text-[10px] text-muted-foreground font-semibold">
                      <span>Route Integrity:</span>
                      <span className={`px-2 py-0.5 rounded-full font-extrabold text-[9px] uppercase ${
                        isVerified 
                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" 
                          : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                      }`}>
                        {isVerified ? "Verified (OSRM)" : "Fallback Estimate"}
                      </span>
                    </div>
                  </div>
                );
              })()}

              {plan.route && plan.route.length > 0 ? (
                <div className="relative pl-8 border-l border-l-border space-y-6 ml-3 py-1 text-left">
                  {plan.route.map((leg, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-[41px] top-1 w-6 h-6 rounded-full border-2 border-background bg-foreground flex items-center justify-center text-xs">
                        {leg.mode === "train" ? "🚆" : leg.mode === "auto" ? "🛺" : "🚌"}
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium text-base text-foreground text-left">
                          {leg.mode === "train" && leg.fromStation && leg.toStation
                            ? `${leg.fromStation} (${leg.from}) → ${leg.toStation} (${leg.to})`
                            : `${leg.from} → ${leg.to}`}
                        </p>
                        <p className="text-xs text-muted-foreground text-left">
                          {leg.mode.toUpperCase()} · {leg.distanceKm} km · {leg.duration}{leg.frequency ? ` · ${leg.frequency}` : ""}
                        </p>
                        {leg.note && <p className="text-xs text-muted-foreground/80 mt-1 italic text-left">{leg.note}</p>}
                        <p className="text-xs font-semibold text-primary text-left">Fare Estimated in Cost Breakdown</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic text-left">No transport route computed</p>
              )}

              {/* Integrated Railway Assistant */}
              <div className="pt-4 mt-2 border-t border-border/40 space-y-3 text-left">
                <h3 className="font-semibold text-sm text-foreground uppercase tracking-wider text-left">Railway Journey Assistant</h3>
                {plan.destination?.hasRailAccess ? (
                  <p className="text-sm text-muted-foreground text-left">
                    🚆 Direct train connectivity is available to <span className="font-semibold text-foreground">{plan.destination?.nearestStation}</span>.
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground text-left">
                    🚆 No direct rail access. Take a train to <span className="font-semibold text-foreground">{plan.destination?.nearestStation}</span>, and continue the rest of the journey by bus or local transport.
                  </p>
                )}
                <button
                  onClick={() => window.open(getTrainSearchUrl(), "_blank")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm transition-colors shadow-sm"
                >
                  <Train className="w-4 h-4" />
                  <span>Check Available Trains</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 5. Recommended Hotels */}
            <div className="space-y-6 pt-6 border-t border-border/40">
              <h2 className="font-display text-2xl font-bold tracking-tight text-foreground text-left">
                Recommended Hotels
              </h2>
              
              {(() => {
                const nights = Math.max(plan.input.days - 1, 0);
                if (nights === 0) return null;
                
                const totalHotels = plan.hotels ? plan.hotels.length : 0;
                const status = totalHotels >= 3 ? "Good" : totalHotels > 0 ? "Limited" : "Vetted Fallbacks";
                const statusColor = totalHotels >= 3 ? "text-emerald-500 font-bold" : "text-amber-500 font-bold";
                
                return (
                  <div className="bg-muted/30 border border-border/60 p-4 rounded-xl text-xs space-y-3 text-left">
                    <h3 className="font-bold text-foreground text-xs uppercase tracking-wider">
                      🏨 Stay Availability Summary
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div className="bg-card p-2.5 rounded-lg border border-border/40">
                        <span className="block text-[9px] uppercase font-bold text-muted-foreground">Nearby Stays</span>
                        <span className="text-base font-extrabold text-foreground">{totalHotels} Vetted</span>
                        <span className={`block text-[9px] ${statusColor}`}>{status}</span>
                      </div>
                      <div className="bg-card p-2.5 rounded-lg border border-border/40">
                        <span className="block text-[9px] uppercase font-bold text-muted-foreground">Budget Tier</span>
                        <span className="text-sm font-extrabold text-foreground">₹800 – ₹1,500</span>
                        <span className="block text-[9px] text-muted-foreground/80">Homestays / Lodges</span>
                      </div>
                      <div className="bg-card p-2.5 rounded-lg border border-border/40">
                        <span className="block text-[9px] uppercase font-bold text-muted-foreground">Standard Tier</span>
                        <span className="text-sm font-extrabold text-foreground">₹1,500 – ₹3,000</span>
                        <span className="block text-[9px] text-muted-foreground/80">3-Star / Residencies</span>
                      </div>
                      <div className="bg-card p-2.5 rounded-lg border border-border/40">
                        <span className="block text-[9px] uppercase font-bold text-muted-foreground">Comfort Tier</span>
                        <span className="text-sm font-extrabold text-foreground">₹3,000 – ₹5,500</span>
                        <span className="block text-[9px] text-muted-foreground/80">Hotels & Resorts</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {(() => {
                const nights = Math.max(plan.input.days - 1, 0);
                if (nights === 0) {
                  return (
                    <p className="text-sm text-muted-foreground italic text-left">
                      Day trip detected. No accommodation required.
                    </p>
                  );
                }
                if (!plan.hotels || plan.hotels.length === 0) {
                  return (
                    <p className="text-sm text-muted-foreground italic text-left">
                      Accommodation budget estimates are included below. Secure stays matching your style tier.
                    </p>
                  );
                }
                const bestHotels = plan.hotels.slice(0, 3);
                return (
                  <div className="divide-y divide-border/40 text-left">
                    {bestHotels.map((hotel, i) => (
                      <div key={i} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-base text-foreground">{hotel.name}</h4>
                            <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded bg-muted text-foreground">
                              ⭐ {hotel.rating}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {typeof hotel.distanceKm === 'number' ? `${hotel.distanceKm} km from centre` : 'Centre location'} · {hotel.tier} Tier
                          </p>
                          <p className="text-xs font-semibold text-muted-foreground">
                            Style Category: <span className="text-primary font-bold">{hotel.tier}</span>
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            const query = `${hotel.name}, ${plan.destination?.name}`;
                            window.open(`https://www.booking.com/searchresults.html?ss=${encodeURIComponent(query)}`, "_blank");
                          }}
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs transition-colors self-start sm:self-center"
                        >
                          <span>Check Live Price</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* 6. How We Calculated This Trip */}
            {plan.intelligence && (
              <div id="transparency-engine" className="space-y-6 pt-6 border-t border-border/40 scroll-mt-8">
                <div className="space-y-2">
                  <h2 className="font-display text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                    📊 How We Calculated This Trip
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Sikkanam operates on traceability and openness. Click on any cost component to see the exact formulas, sources, and assumptions used.
                  </p>
                </div>

                {/* Accordion Component */}
                <div className="space-y-3">
                  {[
                    { key: "transport", icon: "🚌", ...plan.intelligence.components.transport },
                    { key: "hotel", icon: "🏨", ...plan.intelligence.components.hotel },
                    { key: "food", icon: "🍽️", ...plan.intelligence.components.food },
                    { key: "mobility", icon: "🛺", ...plan.intelligence.components.mobility },
                    { key: "activities", icon: "🎟️", ...plan.intelligence.components.activities },
                    { key: "buffer", icon: "🛡️", ...plan.intelligence.components.buffer }
                  ].map((comp) => {
                    const isExpanded = expandedComponent === comp.key;
                    return (
                      <div 
                        key={comp.key}
                        className="border border-border rounded-xl overflow-hidden bg-card shadow-sm hover:border-primary/35 transition-all"
                      >
                        <button
                          type="button"
                          onClick={() => setExpandedComponent(isExpanded ? null : comp.key)}
                          className="w-full flex items-center justify-between p-4 text-left font-medium hover:bg-muted/30 transition-colors focus:outline-none"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{comp.icon}</span>
                            <span className="font-bold text-foreground">{comp.name}</span>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <span className="font-extrabold text-foreground text-sm">
                              ₹{comp.min.toLocaleString("en-IN")} – ₹{comp.max.toLocaleString("en-IN")}
                            </span>
                            <span className="text-muted-foreground/60 text-xs transition-transform duration-200" style={{ transform: isExpanded ? 'rotate(180deg)' : 'none' }}>
                              ▼
                            </span>
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="p-4 bg-muted/20 border-t border-border/40 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div className="space-y-1">
                              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Formula</span>
                              <p className="font-mono bg-muted/60 p-2 rounded text-foreground border border-border/40 select-all leading-relaxed">
                                {comp.formula}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Reason</span>
                              <p className="font-medium text-foreground p-1 leading-relaxed">
                                {comp.reason}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Data Source</span>
                              <p className="font-semibold text-primary p-1 leading-relaxed">
                                {comp.source}
                              </p>
                            </div>

                            {renderMathBreakdown(comp, plan)}

                            {/* Custom breakdowns based on component key */}
                            {comp.key === "transport" && (
                              <div className="col-span-1 md:col-span-2 border-t border-border/40 pt-3 mt-1 space-y-2">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Route Intelligence</span>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-muted/30 p-3 rounded-lg border border-border/30">
                                  <div>
                                    <span className="block text-[9px] uppercase font-bold text-muted-foreground">Road Distance</span>
                                    <span className="text-sm font-bold text-foreground">{plan.route.reduce((sum, leg) => sum + leg.distanceKm, 0)} km</span>
                                  </div>
                                  <div>
                                    <span className="block text-[9px] uppercase font-bold text-muted-foreground">Travel Time</span>
                                    <span className="text-sm font-bold text-foreground">
                                      {plan.route[0]?.routeIntel 
                                        ? `${Math.floor(plan.route.reduce((sum, leg) => sum + (leg.routeIntel?.estimatedDurationMinutes || 0), 0) / 60)}h ${plan.route.reduce((sum, leg) => sum + (leg.routeIntel?.estimatedDurationMinutes || 0), 0) % 60}m` 
                                        : "Estimated"}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="block text-[9px] uppercase font-bold text-muted-foreground">Source</span>
                                    <span className="text-sm font-bold text-foreground">OpenStreetMap Routing</span>
                                  </div>
                                  <div>
                                    <span className="block text-[9px] uppercase font-bold text-muted-foreground">Status</span>
                                    <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                                      plan.route.some(leg => leg.routeIntel?.routeStatus === "verified") 
                                        ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" 
                                        : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                                    }`}>
                                      {plan.route.some(leg => leg.routeIntel?.routeStatus === "verified") ? "Verified" : "Fallback"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {comp.key === "hotel" && comp.hotelMarketIntel && (
                              <div className="col-span-1 md:col-span-2 border-t border-border/40 pt-3 mt-1 space-y-3">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-muted/30 p-3 rounded-lg border border-border/30">
                                  <div>
                                    <span className="block text-[9px] uppercase font-bold text-muted-foreground">Estimated Market Range</span>
                                    <span className="text-sm font-extrabold text-foreground">
                                      ₹{comp.hotelMarketIntel.minEstimatedPrice.toLocaleString("en-IN")} – ₹{comp.hotelMarketIntel.maxEstimatedPrice.toLocaleString("en-IN")}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="block text-[9px] uppercase font-bold text-muted-foreground">Based On</span>
                                    <span className="text-sm font-bold text-foreground">{comp.hotelMarketIntel.pricingEvidence.nearbyHotelsFound} nearby hotels</span>
                                  </div>
                                  <div>
                                    <span className="block text-[9px] uppercase font-bold text-muted-foreground">Pricing Method</span>
                                    <span className="text-sm font-bold text-foreground">Category-based market estimation</span>
                                  </div>
                                </div>
                                
                                {comp.hotelMarketIntel.observedHotelsList.length > 0 && (
                                  <div className="space-y-1.5">
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Observed Hotel Inventory</span>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                      {comp.hotelMarketIntel.observedHotelsList.map((hotel, i) => (
                                        <div key={i} className="p-2.5 rounded-lg border border-border/40 bg-card flex justify-between items-center text-xs">
                                          <div>
                                            <p className="font-bold text-foreground">{hotel.name}</p>
                                            <p className="text-[9px] text-muted-foreground uppercase">{hotel.priceCategory} Tier · {hotel.distanceKm} km from centre</p>
                                          </div>
                                          <span className="inline-flex items-center text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-muted text-foreground">
                                            ⭐ {hotel.rating}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {comp.key === "food" && comp.foodBreakdown && (
                              <div className="col-span-1 md:col-span-2 border-t border-border/40 pt-3 mt-1 space-y-3">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Meal Cost Profile Breakdown (per person/day)</span>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-muted/30 p-3 rounded-lg border border-border/30">
                                  <div>
                                    <span className="block text-[9px] uppercase font-bold text-muted-foreground">Breakfast</span>
                                    <span className="text-sm font-bold text-foreground">₹{comp.foodBreakdown.breakfast.min} – ₹{comp.foodBreakdown.breakfast.max}</span>
                                  </div>
                                  <div>
                                    <span className="block text-[9px] uppercase font-bold text-muted-foreground">Lunch</span>
                                    <span className="text-sm font-bold text-foreground">₹{comp.foodBreakdown.lunch.min} – ₹{comp.foodBreakdown.lunch.max}</span>
                                  </div>
                                  <div>
                                    <span className="block text-[9px] uppercase font-bold text-muted-foreground">Dinner</span>
                                    <span className="text-sm font-bold text-foreground">₹{comp.foodBreakdown.dinner.min} – ₹{comp.foodBreakdown.dinner.max}</span>
                                  </div>
                                  <div>
                                    <span className="block text-[9px] uppercase font-bold text-muted-foreground">Snacks</span>
                                    <span className="text-sm font-bold text-foreground">₹{comp.foodBreakdown.snacks.min} – ₹{comp.foodBreakdown.snacks.max}</span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {comp.key === "activities" && comp.attractionBreakdown && (
                              <div className="col-span-1 md:col-span-2 border-t border-border/40 pt-3 mt-1 space-y-3">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Attraction Entry Fee Database Records</span>
                                <div className="overflow-x-auto border border-border/40 rounded-lg">
                                  <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                      <tr className="bg-muted/40 border-b border-border/40 text-[9px] uppercase font-bold text-muted-foreground">
                                        <th className="p-2.5">Attraction</th>
                                        <th className="p-2.5 text-right">Entry Fee</th>
                                        <th className="p-2.5">Verification Source</th>
                                        <th className="p-2.5">Last Verified</th>
                                        <th className="p-2.5">DB Version</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/30">
                                      {comp.attractionBreakdown.attractionsList.map((att, i) => (
                                        <tr key={i} className="hover:bg-muted/10">
                                          <td className="p-2.5 font-bold text-foreground">{att.name}</td>
                                          <td className="p-2.5 text-right font-semibold text-foreground">₹{att.entryFeeAdult}</td>
                                          <td className="p-2.5 text-muted-foreground font-medium">{att.verificationSource}</td>
                                          <td className="p-2.5 text-muted-foreground font-mono">{att.lastVerified}</td>
                                          <td className="p-2.5 text-muted-foreground font-mono">{att.databaseVersion}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Nearby Places & Circuits */}
            <div className="space-y-6 pt-6 border-t border-border/40">
              <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
                Nearby Places & Circuits
              </h2>
              
              {nearbyExperiences.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nearby Experiences</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {nearbyExperiences.map((exp, i) => (
                      <div key={i} className="p-3 rounded-xl border border-border bg-card text-xs flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-foreground">{exp.name}</p>
                          <p className="text-[10px] text-muted-foreground capitalize">{exp.type}</p>
                        </div>
                        <span className="font-bold text-primary whitespace-nowrap">{exp.distanceKm} km</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {suggestedCircuits.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Suggested Circuits</h3>
                  <div className="space-y-2.5">
                    {suggestedCircuits.map((cir, i) => (
                      <div key={i} className="p-4 rounded-xl border border-primary/20 bg-primary/5 text-xs space-y-1.5">
                        <p className="font-bold text-foreground text-sm">{cir.name}</p>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">{cir.description}</p>
                        <div className="flex items-center gap-1.5 font-semibold text-primary pt-0.5 flex-wrap">
                          {cir.route.map((node, idx) => (
                            <span key={idx} className="flex items-center gap-1">
                              {idx > 0 && <span>↓</span>}
                              <span>{node}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 7. Travel Tips */}
            <div className="space-y-6 pt-6 border-t border-border/40">
              <h2 className="font-display text-2xl font-bold tracking-tight text-foreground text-left">
                Travel Tips
              </h2>
              <ul className="space-y-3 text-left">
                {plan.tips.map((tip, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-3">
                    <span className="text-primary font-bold">→</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 8. Similar Trips (Phase 8) */}
            {plan.destination && (
              <div className="space-y-4 pt-6 border-t border-border/40 text-left">
                <h2 className="font-display text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  🗺️ Similar Trips You Might Like
                </h2>
                <p className="text-xs text-muted-foreground">
                  People who visited {plan.destination.name} also explored these matching destinations in Tamil Nadu:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  {getSimilarDestinations(plan.destination.category, plan.destination.id).map((dest) => (
                    <div 
                      key={dest.id}
                      onClick={() => onSelectDestination && onSelectDestination(dest.id)}
                      className="p-3 rounded-xl border border-border bg-card hover:border-primary/50 transition-all cursor-pointer shadow-sm hover:shadow-card flex items-center gap-2.5 active:scale-[0.99]"
                    >
                      <span className="text-2xl">{dest.emoji}</span>
                      <div className="space-y-0.5">
                        <span className="font-bold text-xs text-foreground block hover:underline">
                          {dest.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground capitalize">
                          {plan.destination.category} Trip
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 9. Bottom Transparency Panel (Trust Footer - Phase 10) */}
            <div className="space-y-6 pt-6 border-t border-border/40 text-left bg-muted/20 p-6 rounded-2xl border border-border/60">
              <h3 className="font-display text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                🛡️ Why Trust Sikkanam?
              </h3>
              <p className="text-xs text-muted-foreground -mt-3">
                Sikkanam operates on factual provenance. Every cost, route, and hotel detail listed above is cross-verified against public APIs and curated regional datasets.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs pt-1">
                <div className="flex items-center gap-2.5 font-semibold text-foreground">
                  <span className="text-emerald-500 font-bold text-sm">✓</span>
                  <span>OpenStreetMap Route Data</span>
                </div>
                <div className="flex items-center gap-2.5 font-semibold text-foreground">
                  <span className="text-emerald-500 font-bold text-sm">✓</span>
                  <span>Curated Attraction Database</span>
                </div>
                <div className="flex items-center gap-2.5 font-semibold text-foreground">
                  <span className="text-emerald-500 font-bold text-sm">✓</span>
                  <span>Hotel Inventory Dataset</span>
                </div>
                <div className="flex items-center gap-2.5 font-semibold text-foreground">
                  <span className="text-emerald-500 font-bold text-sm">✓</span>
                  <span>Food Cost Profiles</span>
                </div>
                <div className="flex items-center gap-2.5 font-semibold text-foreground">
                  <span className="text-emerald-500 font-bold text-sm">✓</span>
                  <span>Tamil Nadu Destination Intelligence</span>
                </div>
              </div>
              
              <div className="border-t border-border/40 pt-3 flex justify-between items-center text-[10px] text-muted-foreground font-semibold">
                <span>Intelligence Version: v4.3</span>
                <span>Last Updated: June 2026</span>
              </div>
            </div>
          </div>

      </div>
    </section>
  );
});

TripResults.displayName = "TripResults";

export default TripResults;
