import { getDistance, getDestinationById, type Hotel } from "@/data/tnDestinations";
import { HOTEL_FALLBACKS } from "@/data/hotelFallbacks";

function getPriceCategory(hotel: any) {
  const name = (
    hotel.tags?.name ||
    hotel.tags?.["name:en"] ||
    hotel.tags?.brand ||
    hotel.tags?.operator ||
    ""
  ).toLowerCase();

  const tourism = (hotel.tags?.tourism || "").toLowerCase();

  // 1. Premium keywords
  if (
    name.includes("resort") ||
    name.includes("spa") ||
    name.includes("palace") ||
    name.includes("luxury")
  ) {
    return "premium";
  }

  // 2. Comfort keywords
  if (
    name.includes("inn") ||
    name.includes("suites") ||
    name.includes("residency") ||
    name.includes("plaza")
  ) {
    return "comfort";
  }

  // 3. Budget keywords
  if (
    tourism === "hostel" ||
    tourism === "guest_house" ||
    name.includes("hostel") ||
    name.includes("lodge") ||
    name.includes("guest house") ||
    name.includes("guesthouse")
  ) {
    return "budget";
  }

  // 4. Fallback
  return "standard";
}

const QUALITY_SCORE: Record<string, number> = {
  premium: 4,
  comfort: 3,
  standard: 2,
  budget: 1,
};

export async function getNearbyHotels(destId: string, lat: number, lng: number): Promise<Hotel[]> {
  // Query nwr (nodes, ways, relations) and use "out center" to automatically get centers for polygons
  const query = `
    [out:json];
    (
      nwr["tourism"="hotel"](around:15000,${lat},${lng});
      nwr["tourism"="guest_house"](around:15000,${lat},${lng});
      nwr["tourism"="hostel"](around:15000,${lat},${lng});
    );
    out center;
  `;

  try {
    const res = await fetch(
      "https://overpass-api.de/api/interpreter",
      {
        method: "POST",
        body: query,
      }
    );

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();

    const mapped = (data.elements || []).map((hotel: any) => {
      const category = getPriceCategory(hotel);
      const hotelLat = hotel.lat || hotel.center?.lat;
      const hotelLon = hotel.lon || hotel.center?.lon;

      if (!hotelLat || !hotelLon) return null;

      const distance = getDistance(lat, lng, hotelLat, hotelLon);

      // Generate a stable realistic rating between 3.8 and 4.7 based on the element ID
      const baseId = hotel.id || 100;
      const stableOffset = (baseId % 10) / 10; // 0.0 to 0.9
      const rating = parseFloat((3.8 + stableOffset).toFixed(1));

      return {
        name:
          hotel.tags?.name ||
          hotel.tags?.["name:en"] ||
          hotel.tags?.brand ||
          hotel.tags?.operator ||
          null,

        type:
          hotel.tags?.tourism === "hotel"
            ? "comfort"
            : hotel.tags?.tourism === "hostel"
            ? "budget"
            : "standard",

        priceCategory: category as any,
        tier: category.charAt(0).toUpperCase() + category.slice(1),
        distanceKm: parseFloat(distance.toFixed(1)),

        rating: rating,

        amenities: [
          "WiFi",
          "Hot Water",
        ],

        lat: hotelLat,
        lng: hotelLon,
      } as Hotel;
    })
    .filter((h: any) => h && h.name && typeof h.lat === "number" && typeof h.lng === "number");

    // Deduplicate by name+coords, prefer closer/higher-rated
    const uniqueMap = new Map<string, Hotel>();
    for (const h of mapped) {
      const key = `${(h.name || "").toLowerCase()}|${h.lat}|${h.lng}`;
      const existing = uniqueMap.get(key);
      if (!existing) {
        uniqueMap.set(key, h);
      } else {
        // prefer higher rating or closer distance
        if (h.rating > existing.rating || h.distanceKm < existing.distanceKm) {
          uniqueMap.set(key, h);
        }
      }
    }

    const unique = Array.from(uniqueMap.values());

    unique.sort((a, b) => {
      if (a.distanceKm !== b.distanceKm) return a.distanceKm - b.distanceKm;
      return (QUALITY_SCORE[b.priceCategory as string] || 0) - (QUALITY_SCORE[a.priceCategory as string] || 0);
    });

    if (unique.length > 0) return unique.slice(0, 6);

    // Fallback: curated list
    const curated = HOTEL_FALLBACKS[destId] || [];
    if (curated.length > 0) {
      const fallbackHotels: Hotel[] = curated.map((entry, idx) => {
        const offset = 0.01 * (idx + 1);
        const hotelLat = lat + offset;
        const hotelLng = lng + (offset * ((idx % 2 === 0) ? 1 : -1));
        const distance = getDistance(lat, lng, hotelLat, hotelLng);
        const priceCategory = entry.priceCategory || "standard";
        return {
          name: entry.name,
          type: entry.type || "standard",
          priceCategory: priceCategory as any,
          tier: (priceCategory.charAt(0).toUpperCase() + priceCategory.slice(1)),
          distanceKm: parseFloat(distance.toFixed(1)),
          rating: entry.rating || 4.0,
          amenities: entry.amenities || ["WiFi"],
          lat: hotelLat,
          lng: hotelLng,
        };
      });

      fallbackHotels.sort((a, b) => a.distanceKm - b.distanceKm);
      return fallbackHotels.slice(0, 3);
    }

    // Final fallback: booking provider suggestion (synthetic)
    const dest = getDestinationById(destId);
    const suggestion: Hotel = {
      name: `Search hotels for ${dest?.name || destId} on booking platforms`,
      priceCategory: "standard",
      tier: "Standard",
      distanceKm: 1.0,
      rating: 4.0,
      amenities: ["Search"],
      lat: lat + 0.01,
      lng: lng + 0.01,
    };

    return [suggestion];
  } catch (err) {
    console.error("Hotel fetch failed:", err);

    // On fetch failure, attempt curated fallback
    const curated = HOTEL_FALLBACKS[destId] || [];
    if (curated.length > 0) {
      const fallbackHotels: Hotel[] = curated.map((entry, idx) => {
        const offset = 0.01 * (idx + 1);
        const hotelLat = lat + offset;
        const hotelLng = lng + (offset * ((idx % 2 === 0) ? 1 : -1));
        const distance = getDistance(lat, lng, hotelLat, hotelLng);
        const priceCategory = entry.priceCategory || "standard";
        return {
          name: entry.name,
          type: entry.type || "standard",
          priceCategory: priceCategory as any,
          tier: (priceCategory.charAt(0).toUpperCase() + priceCategory.slice(1)),
          distanceKm: parseFloat(distance.toFixed(1)),
          rating: entry.rating || 4.0,
          amenities: entry.amenities || ["WiFi"],
          lat: hotelLat,
          lng: hotelLng,
        };
      });

      fallbackHotels.sort((a, b) => a.distanceKm - b.distanceKm);
      return fallbackHotels.slice(0, 3);
    }

    // Final fallback suggestion
    const suggestion: Hotel = {
      name: `Search hotels near this destination`,
      priceCategory: "standard",
      tier: "Standard",
      distanceKm: 1.0,
      rating: 4.0,
      amenities: ["Search"],
      lat: lat + 0.01,
      lng: lng + 0.01,
    };

    return [suggestion];
  }
}
