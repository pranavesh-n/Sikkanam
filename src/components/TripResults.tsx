import { forwardRef } from "react";
import { type TripPlan, generateShareText } from "@/lib/tripPlanner";
import { categoryLabels, getDestinationById } from "@/data/tnDestinations";
import { Share2, Printer, Train, Star, AlertCircle, CheckCircle2, ExternalLink } from "lucide-react";
import { HOTEL_RANGES } from "@/lib/hotelPrices";
import { generateTrainSearchUrl } from "@/lib/utils";

interface TripResultsProps {
  plan: TripPlan;
}

const ATTRACTION_INFO: Record<string, { desc: string; category: string }> = {
  // Ooty
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
  
  // Kodaikanal
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
  
  // Yercaud
  "Yercaud Lake": { desc: "Emerald waters surrounded by gardens and boating activities", category: "Lake" },
  "Shevaroy Temple": { desc: "Highest point in Yercaud with a cave temple dedicated to Lord Shevaroyan", category: "Temple" },
  "Pagoda Point": { desc: "Stunning viewpoint overlooking the city of Salem", category: "Viewpoint" },
  "Lady's Seat": { desc: "Panoramic viewpoint that offers spectacular sunset views", category: "Viewpoint" },
  "Kiliyur Falls": { desc: "A spectacular 300-foot waterfall in the Shervaroy hills", category: "Waterfall" },

  // Valparai
  "Aliyar Reservoir": { desc: "Stunning dam footed in the hills of Valparai", category: "Dam & Lake" },
  "Sholayar Dam": { desc: "One of the deepest dams in Asia, surrounded by tea estates", category: "Dam & Lake" },
  "Parambikulam Tiger Reserve": { desc: "Protected forest area famous for wildlife sightings", category: "Wildlife" },
  "Monkey Falls": { desc: "Natural waterfall offering a refreshing dip for travellers", category: "Waterfall" },
  "Tea Estate Walks": { desc: "Walks through rolling green hills of tea leaves", category: "Scenic Trail" },

  // Mahabalipuram
  "Shore Temple (UNESCO)": { desc: "8th-century stone temple overlooking the Bay of Bengal", category: "UNESCO Heritage" },
  "Pancha Rathas": { desc: "Monolithic rock temples carved in the shape of chariots", category: "UNESCO Heritage" },
  "Arjuna's Penance (Rock)": { desc: "Giant open-air relief carved on two monolithic boulders", category: "UNESCO Heritage" },
  "Krishna's Butter Ball": { desc: "Gigantic natural boulder balanced precariously on a slope", category: "Natural Wonder" },
  "Lighthouse Beach": { desc: "Sandy beach offering scenic views from the lighthouse", category: "Beach" },

  // Rameswaram
  "Ramanathaswamy Temple": { desc: "Holy temple famous for its grand corridor and sacred wells", category: "Temple" },
  "Pamban Bridge": { desc: "Historic railway bridge connecting Rameswaram to the mainland", category: "Bridge" },
  "Dhanushkodi (ghost town)": { desc: "Haunting ruins of a town washed away by the 1964 cyclone", category: "Ghost Town" },
  "Agnitheertham Beach": { desc: "Sacred beach where pilgrims take a holy dip in the sea", category: "Beach" },

  // Kanyakumari
  "Sunrise/Sunset Point": { desc: "The southernmost tip of mainland India where three seas meet", category: "Scenic Spot" },
  "Vivekananda Rock Memorial": { desc: "Sacred monument situated on a small rocky island off the coast", category: "Memorial" },
  "Thiruvalluvar Statue (133ft)": { desc: "Colossal stone sculpture dedicated to the Tamil poet-philosopher", category: "Monument" },
  "Kanyakumari Temple": { desc: "Ancient temple dedicated to the goddess Kanya Kumari on the shore", category: "Temple" },

  // Pondicherry
  "Promenade Beach": { desc: "Popular rock beach walk along the French Quarter", category: "Beach" },
  "French Quarter (White Town)": { desc: "Charming streets with yellow colonial villas and chic cafes", category: "Heritage Site" },
  "Auroville (Matrimandir)": { desc: "Spiritual dome focused on human unity and meditation", category: "Spiritual Center" },
  "Aurobindo Ashram": { desc: "Tranquil spiritual community founded by Sri Aurobindo", category: "Spiritual Center" },

  // Madurai
  "Meenakshi Amman Temple": { desc: "Architectural masterpiece with towering, colourful gateway towers", category: "Temple" },
  "Thirumalai Nayakkar Palace": { desc: "17th-century palace showing a fusion of Italian and Rajput styles", category: "Heritage Site" },
  "Gandhi Museum": { desc: "Historic building dedicated to the life and message of Mahatma Gandhi", category: "Museum" },

  // Thanjavur
  "Brihadeeswarar Temple (UNESCO)": { desc: "Majestic 1000-year-old temple built by Rajaraja Chola I", category: "UNESCO Heritage" },
  "Thanjavur Palace": { desc: "Royal residence of the Maratha rulers with library and museum", category: "Heritage Site" },

  // Chidambaram
  "Nataraja Temple": { desc: "World-famous Shiva temple celebrating the cosmic dance", category: "Temple" },
  "Pichavaram Mangroves": { desc: "One of India's largest and most beautiful mangrove forests", category: "Forest / Nature" },
  "Thillai Kali Amman Temple": { desc: "Ancient temple dedicated to Goddess Kali near the main temple", category: "Temple" },

  // Trichy
  "Rock Fort Temple (83m)": { desc: "Ancient temple built on a massive rock rising above the city", category: "Temple" },
  "Sri Ranganathaswamy (Srirangam)": { desc: "The largest active Hindu temple complex in the world", category: "Temple" },
  "Jambukeswarar Temple": { desc: "Ancient Shiva temple representing the water element", category: "Temple" },

  // Tiruvannamalai
  "Annamalaiyar Temple": { desc: "Grand temple complex dedicated to Shiva at the foot of Arunachala", category: "Temple" },
  "Arunachala Hill (14km trek)": { desc: "Sacred hill walked by millions of seekers and sages", category: "Sacred Mountain" },
  "Ramana Maharshi Ashram": { desc: "Tranquil ashram dedicated to the sage Ramana Maharshi", category: "Spiritual Center" },
};

const TripResults = forwardRef<HTMLDivElement, TripResultsProps>(({ plan }, ref) => {
  const handleWhatsAppShare = () => {
    const text = generateShareText(plan);
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleOpenMaps = () => {
    const destination = plan.destination.id;
    window.open(`/maps?destination=${destination}`, "_blank");
  };

  const getTrainSearchUrl = () => {
    const srcDest = getDestinationById(plan.input.source);
    const fromStation = srcDest?.nearestStation || plan.input.source;
    const toStation = plan.destination.nearestStation || plan.destination.name;
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

  return (
    <section ref={ref} className="py-12 md:py-20 print:py-4">
      <div className="container max-w-2xl px-4 space-y-16">
        
        {/* 1. Destination Hero */}
        <div className="text-center space-y-6">
          <div className="space-y-3">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-muted text-muted-foreground">
              {categoryLabels[plan.destination.category]}
            </span>
            <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-foreground flex items-center justify-center gap-3">
              <span>{plan.destination.emoji}</span>
              <span>{plan.destination.name}</span>
            </h1>
            
            <div className="max-w-lg mx-auto bg-muted/40 p-5 rounded-2xl border border-border/50 text-left space-y-2 mt-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Why Visit?</h4>
              <p className="text-sm text-foreground leading-relaxed">
                {plan.destination.description}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 pt-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <span>{plan.input.days} Days</span>
              <span className="text-muted-foreground/40">•</span>
              <span>{plan.input.travellers} {plan.input.travellers === 1 ? 'Traveller' : 'Travellers'}</span>
              <span className="text-muted-foreground/40">•</span>
              <span className="capitalize">{plan.input.style} Style</span>
            </div>

            <div className="text-3xl md:text-4xl font-display font-bold text-primary">
              ₹{Math.round(plan.budget.estimatedTotal / plan.input.travellers).toLocaleString("en-IN")}{" "}
              <span className="text-lg md:text-xl text-muted-foreground font-normal">/ person</span>
            </div>

            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
              plan.budget.status === "within" 
                ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400" 
                : "bg-destructive/10 text-destructive"
            }`}>
              {plan.budget.status === "within" ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Fits Your Budget</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4" />
                  <span>Over Your Budget</span>
                </>
              )}
            </span>
          </div>

          {/* Share & Actions */}
          <div className="flex flex-wrap justify-center gap-3 pt-2 print:hidden">
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

        {/* 2. Top Highlights */}
        <div className="space-y-6 pt-6 border-t border-border/40">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            ⭐ Top Highlights
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {plan.attractions.slice(0, 4).map((rawAttr, i) => {
              const { name, emoji, desc, category } = getAttractionDetails(rawAttr, plan.destination.name);
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
              const rawActivities = day.activities.map(act => cleanActivity(act)).filter(Boolean);
              
              // Dynamic slots rule: only show Morning/Afternoon/Evening if activities count is >= 3
              const useSlots = rawActivities.length >= 3;
              
              return (
                <div key={day.day} className="space-y-4">
                  <div className="flex items-center justify-between border-b border-border/40 pb-2">
                    <h3 className="font-display font-bold text-lg text-foreground">Day {day.day}</h3>
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                      ~₹{day.estimatedCost} / person
                    </span>
                  </div>
                  
                  <div className="relative pl-6 border-l border-border/80 space-y-6 ml-3 py-1">
                    {rawActivities.map((activity, idx) => {
                      let slotLabel = "";
                      if (useSlots) {
                        if (idx === 0) slotLabel = "Morning";
                        else if (idx === 1) slotLabel = "Afternoon";
                        else if (idx === 2) slotLabel = "Evening";
                        else if (idx === 3) slotLabel = "Night";
                      }
                      
                      return (
                        <div key={idx} className="relative">
                          <div className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-foreground border border-background" />
                          <div>
                            {slotLabel && (
                              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                {slotLabel}
                              </h4>
                            )}
                            <p className={`text-sm font-medium text-foreground ${slotLabel ? 'mt-0.5' : ''}`}>
                              {activity}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {day.meals && (
                    <p className="text-xs text-muted-foreground/80 italic pl-3">
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
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
            How You'll Travel
          </h2>
          <div className="relative pl-8 border-l border-border/80 space-y-6 ml-3 py-1">
            {plan.route.map((leg, i) => (
              <div key={i} className="relative">
                {/* Timeline Dot */}
                <div className="absolute -left-[41px] top-1 w-6 h-6 rounded-full border-2 border-background bg-foreground flex items-center justify-center text-xs">
                  {leg.mode === "train" ? "🚆" : leg.mode === "auto" ? "🛺" : "🚌"}
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-base text-foreground">
                    {leg.mode === "train" && leg.fromStation && leg.toStation
                      ? `${leg.fromStation} (${leg.from}) → ${leg.toStation} (${leg.to})`
                      : `${leg.from} → ${leg.to}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {leg.mode.toUpperCase()} · {leg.distanceKm} km · {leg.duration}{leg.frequency ? ` · ${leg.frequency}` : ""}
                  </p>
                  {leg.note && <p className="text-xs text-muted-foreground/80 mt-1 italic">{leg.note}</p>}
                  <p className="text-xs font-semibold text-primary">₹{leg.costPerPerson} / person</p>
                </div>
              </div>
            ))}
          </div>

          {/* Integrated Railway Assistant */}
          <div className="pt-4 mt-2 border-t border-border/40 space-y-3">
            <h3 className="font-semibold text-sm text-foreground uppercase tracking-wider">Railway Journey Assistant</h3>
            {plan.destination.hasRailAccess ? (
              <p className="text-sm text-muted-foreground">
                🚆 Direct train connectivity is available to <span className="font-semibold text-foreground">{plan.destination.nearestStation}</span>.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                🚆 No direct rail access. Take a train to <span className="font-semibold text-foreground">{plan.destination.nearestStation}</span>, and continue the rest of the journey by bus or local transport.
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
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Recommended Hotels
          </h2>
          {(() => {
            const nights = Math.max(plan.input.days - 1, 0);
            if (nights === 0) {
              return (
                <p className="text-sm text-muted-foreground italic">
                  Day trip detected. No accommodation required.
                </p>
              );
            }
            if (plan.hotels.length === 0) {
              return (
                <p className="text-sm text-muted-foreground italic">
                  No hotels found for this destination. Accommodation budget estimates are still included.
                </p>
              );
            }
            const bestHotels = plan.hotels.slice(0, 3);
            return (
              <div className="divide-y divide-border/40">
                {bestHotels.map((hotel, i) => (
                  <div key={i} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-base text-foreground">{hotel.name}</h4>
                        <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded bg-muted text-foreground">
                          ⭐ {hotel.rating}
                        </span>
                        {HOTEL_RANGES[hotel.priceCategory].min <= plan.budget.hotelPerNight * 1.15 ? (
                          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Fits Budget</span>
                        ) : (
                          <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Stretch Budget</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {typeof hotel.distanceKm === 'number' ? (hotel.distanceKm === 0 ? 'At centre' : `${hotel.distanceKm} km from centre`) : 'Distance unknown'} · {hotel.tier.charAt(0).toUpperCase() + hotel.tier.slice(1)} Tier
                      </p>
                      <p className="text-sm font-semibold text-primary">
                        ₹{HOTEL_RANGES[hotel.priceCategory].min}–₹{HOTEL_RANGES[hotel.priceCategory].max} <span className="text-xs text-muted-foreground font-normal">/ night</span>
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const query = hotel.name.includes("Search hotels")
                          ? plan.destination.name
                          : `${hotel.name}, ${plan.destination.name}`;
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

        {/* 6. Trip Cost Breakdown */}
        <div className="space-y-6 pt-6 border-t border-border/40">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Cost Breakdown
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between py-2.5 border-b border-border/40 text-sm">
              <span className="text-muted-foreground">Transport ({plan.input.travellers} {plan.input.travellers === 1 ? 'person' : 'people'})</span>
              <span className="font-medium text-foreground">₹{plan.budget.transport.toLocaleString("en-IN")}</span>
            </div>
            {Math.max(plan.input.days - 1, 0) > 0 && (
              <div className="flex justify-between py-2.5 border-b border-border/40 text-sm">
                <span className="text-muted-foreground">Hotel Stay ({Math.max(plan.input.days - 1, 0)} {Math.max(plan.input.days - 1, 0) === 1 ? 'night' : 'nights'}, {plan.budget.rooms || 0} {plan.budget.rooms === 1 ? 'room' : 'rooms'})</span>
                <span className="font-medium text-foreground">₹{plan.budget.hotel.toLocaleString("en-IN")}</span>
              </div>
            )}
            <div className="flex justify-between py-2.5 border-b border-border/40 text-sm">
              <span className="text-muted-foreground">Food ({plan.input.days} {plan.input.days === 1 ? 'day' : 'days'})</span>
              <span className="font-medium text-foreground">₹{plan.budget.food.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between py-2.5 border-b border-border/40 text-sm">
              <span className="text-muted-foreground">Local Transport & Sightseeing</span>
              <span className="font-medium text-foreground">₹{plan.budget.local.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between items-center pt-4">
              <div>
                <span className="text-lg font-bold text-foreground">Total Estimated Cost</span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Budget: ₹{plan.budget.total.toLocaleString("en-IN")} ({plan.budget.status === "within" ? `₹${plan.budget.remaining.toLocaleString("en-IN")} left` : `₹${Math.abs(plan.budget.remaining).toLocaleString("en-IN")} over`})
                </p>
              </div>
              <span className="text-3xl font-bold text-primary">₹{plan.budget.estimatedTotal.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        {/* 7. Travel Tips */}
        <div className="space-y-6 pt-6 border-t border-border/40">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Travel Tips
          </h2>
          <ul className="space-y-3">
            {plan.tips.map((tip, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-3">
                <span className="text-primary font-bold">→</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </section>
  );
});

TripResults.displayName = "TripResults";

export default TripResults;
