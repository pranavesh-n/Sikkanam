export interface SubLocation {
  name: string;
  lat: number;
  lng: number;
}

export const subLocationsByDestination: Record<string, SubLocation[]> = {
  rameswaram: [
    { name: "Ramanathaswamy Temple Zone", lat: 9.288, lng: 79.317 },
    { name: "Dhanushkodi Point", lat: 9.176, lng: 79.417 },
    { name: "Pamban Bridge Area", lat: 9.281, lng: 79.208 },
    { name: "Dr. APJ Kalam Memorial Zone", lat: 9.283, lng: 79.283 },
    { name: "Agni Theertham Beach", lat: 9.287, lng: 79.32 },
    { name: "Ariyamangalam Coastal Belt", lat: 9.275, lng: 79.25 },
  ],
  chennai: [
    { name: "Anna Nagar", lat: 13.085, lng: 80.21 },
    { name: "T. Nagar", lat: 13.0418, lng: 80.2341 },
    { name: "Tambaram", lat: 12.9249, lng: 80.1 },
    { name: "Velachery", lat: 12.9759, lng: 80.2212 },
    { name: "Ambattur", lat: 13.1143, lng: 80.1548 },
    { name: "Porur", lat: 13.0382, lng: 80.1565 },
    { name: "Vandalur", lat: 12.89, lng: 80.08 },
  ],
  ooty: [
    { name: "Ooty Town Center", lat: 11.41, lng: 76.69 },
    { name: "Coonoor", lat: 11.353, lng: 76.7959 },
    { name: "Doddabetta Peak", lat: 11.401, lng: 76.736 },
    { name: "Avalanche Valley", lat: 11.3, lng: 76.58 },
    { name: "Kotagiri", lat: 11.42, lng: 76.88 },
  ],
  kodaikanal: [
    { name: "Kodai Lake Area", lat: 10.2381, lng: 77.4892 },
    { name: "Pillar Rocks Zone", lat: 10.21, lng: 77.46 },
    { name: "Mannavanur Village", lat: 10.25, lng: 77.35 },
    { name: "Poombarai Valley", lat: 10.26, lng: 77.4 },
  ],
  madurai: [
    { name: "Meenakshi Temple Zone", lat: 9.9195, lng: 78.1193 },
    { name: "Mattuthavani", lat: 9.95, lng: 78.15 },
    { name: "Thiruparankundram", lat: 9.88, lng: 78.07 },
    { name: "Goripalayam", lat: 9.93, lng: 78.13 },
  ],
  coimbatore: [
    { name: "Gandhipuram", lat: 11.0168, lng: 76.9558 },
    { name: "RS Puram", lat: 11.008, lng: 76.946 },
    { name: "Peelamedu", lat: 11.028, lng: 77.0 },
    { name: "Singanallur", lat: 10.99, lng: 77.02 },
  ],
  valparai: [
    { name: "Valparai Town", lat: 10.32, lng: 76.95 },
    { name: "Aliyar Dam Area", lat: 10.48, lng: 76.97 },
    { name: "Sholayar Dam Zone", lat: 10.32, lng: 76.84 },
  ],
  yercaud: [
    { name: "Yercaud Lake Center", lat: 11.77, lng: 78.21 },
    { name: "Pagoda Point Zone", lat: 11.78, lng: 78.22 },
    { name: "Shevaroy Temple Area", lat: 11.82, lng: 78.23 },
  ],
  kanyakumari: [
    { name: "Kanyakumari Beach Front", lat: 8.078, lng: 77.541 },
    { name: "Nagercoil City", lat: 8.183, lng: 77.411 },
    { name: "Vattakottai Fort Zone", lat: 8.12, lng: 77.56 },
  ],
  thanjavur: [
    { name: "Brihadeeswarar Temple Zone", lat: 10.7828, lng: 79.1318 },
    { name: "Royal Palace Zone", lat: 10.786, lng: 79.137 },
    { name: "Kumbakonam Town", lat: 10.96, lng: 79.38 },
  ],
  puducherry: [
    { name: "White Town / French Quarter", lat: 11.934, lng: 79.834 },
    { name: "Auroville", lat: 12.007, lng: 79.81 },
    { name: "Promenade Beach", lat: 11.932, lng: 79.835 },
    { name: "Heritage Town", lat: 11.938, lng: 79.828 },
  ],
  mahabalipuram: [
    { name: "Shore Temple Zone", lat: 12.616, lng: 80.198 },
    { name: "Pancha Rathas Area", lat: 12.61, lng: 80.192 },
    { name: "Covelong Beach", lat: 12.791, lng: 80.25 },
  ],
  trichy: [
    { name: "Rockfort Temple Area", lat: 10.828, lng: 78.697 },
    { name: "Srirangam Island", lat: 10.862, lng: 78.69 },
    { name: "Thiruverumbur", lat: 10.785, lng: 78.775 },
  ],
  tirunelveli: [
    { name: "Nellaiappar Temple Zone", lat: 8.728, lng: 77.689 },
    { name: "Courtallam Falls Zone", lat: 8.932, lng: 77.269 },
    { name: "Palayamkottai", lat: 8.715, lng: 77.732 },
  ],
  tiruvannamalai: [
    { name: "Annamalaiyar Temple Zone", lat: 12.231, lng: 79.067 },
    { name: "Girivalam Path North", lat: 12.245, lng: 79.055 },
    { name: "Sri Ramana Ashram Zone", lat: 12.22, lng: 79.05 },
  ],
  yelagiri: [
    { name: "Athanavoor Town", lat: 12.578, lng: 78.638 },
    { name: "Nilavoor Lake Area", lat: 12.6, lng: 78.65 },
    { name: "Swamimalai Hills", lat: 12.585, lng: 78.645 },
  ],
  kanchipuram: [
    { name: "Temple Town Center", lat: 12.834, lng: 79.703 },
    { name: "Kamakshi Amman Zone", lat: 12.839, lng: 79.704 },
    { name: "Silk Weaver Colony", lat: 12.845, lng: 79.712 },
  ],
  hogenakkal: [
    { name: "Hogenakkal Main Falls", lat: 12.118, lng: 77.776 },
    { name: "Pennagaram Zone", lat: 12.135, lng: 77.885 },
  ],
  salem: [
    { name: "Salem Town Center", lat: 11.664, lng: 78.146 },
    { name: "Mettur Dam Area", lat: 11.796, lng: 77.801 },
    { name: "Kurumbapatti Zone", lat: 11.71, lng: 78.18 },
  ],
};

/**
 * Returns sub-locations for ANY destination. If specific curated ones don't exist,
 * automatically generates smart sub-locations based on base coordinates & offset points!
 */
export function getSubLocations(
  destinationId: string,
  destinationName?: string,
  baseLat?: number,
  baseLng?: number
): SubLocation[] {
  const normalizedId = destinationId.toLowerCase();

  // 1. Direct curated match
  if (subLocationsByDestination[normalizedId]) {
    return subLocationsByDestination[normalizedId];
  }

  // 2. Dynamic generator if coordinates are provided
  if (baseLat && baseLng && destinationName) {
    return [
      {
        name: `${destinationName} North`,
        lat: Math.round((baseLat + 0.025) * 10000) / 10000,
        lng: Math.round((baseLng + 0.015) * 10000) / 10000,
      },
      {
        name: `${destinationName} South`,
        lat: Math.round((baseLat - 0.025) * 10000) / 10000,
        lng: Math.round((baseLng - 0.015) * 10000) / 10000,
      },
      {
        name: `${destinationName} East Coastal / Heights`,
        lat: Math.round((baseLat + 0.012) * 10000) / 10000,
        lng: Math.round((baseLng + 0.035) * 10000) / 10000,
      },
      {
        name: `${destinationName} West Ridge`,
        lat: Math.round((baseLat - 0.012) * 10000) / 10000,
        lng: Math.round((baseLng - 0.035) * 10000) / 10000,
      },
    ];
  }

  return [];
}
