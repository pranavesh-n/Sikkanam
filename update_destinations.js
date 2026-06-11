const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src', 'data', 'tnDestinations.ts');
let content = fs.readFileSync(filePath, 'utf-8');

// Mapping of destination IDs to rail access
const railAccess = {
  ooty: false, kodaikanal: false, yercaud: false, yelagiri: false,
  'kolli-hills': false, valparai: false, 'javadi-hills': false,
  mahabalipuram: false, rameswaram: true, kanyakumari: true,
  pondicherry: true, dhanushkodi: false, madurai: true,
  thanjavur: true, kanchipuram: true, chidambaram: true,
  kumbakonam: true, trichy: true, vellore: true,
  cuddalore: true, nagapattinam: true, tiruvanamalai: true,
  mudumalai: false, topslip: false, pichavaram: false,
  salem: true, tirunelveli: true, chennai: true,
  coimbatore: true, erode: true, tiruppur: true,
  thoothukudi: true, dindigul: true, velankanni: false,
  tranquebar: false, thirunallar: false, pillayarpatti: false,
  mayiladuthurai: true, tiruchendur: true, tiruttani: true,
  palani: true, swamimalai: false, tenkasi: true,
  thiruparankundram: false, pazhamudircholai: false,
  kapaleeshwarar: false, 'kamakshi-amman': false,
  kailasanathar: false, suchindram: false,
  'bhagavathy-amman': false, parthasarathy: false,
  sankarankoil: false, coonoor: true, kotagiri: false,
  meghamalai: false, thekkady: false, sirumalai: false,
  pachamalai: false, hogenakkal: false, courtallam: false,
  papanasam: false, manimuthar: false, thirparappu: false,
  srirangam: true, 'gangaikonda-cholapuram': false,
  darasuram: false, nagore: true, karaikal: true,
  karaikudi: true, chettinad: false, sivaganga: true,
  namakkal: false, krishnagiri: false, dharmapuri: true,
  kalakkad: false, koonthankulam: false, vedanthangal: false,
  marakkanam: false, poompuhar: false, kodiakarai: false,
  'point-calimere': false, pulicat: false, pollachi: true,
  avinashi: false, perur: false, thirukadaiyur: false
};

// Replace nearestStation with nearestStation + hasRailAccess
Object.entries(railAccess).forEach(([destId, hasRail]) => {
  const regex = new RegExp(\"id":\s*"\"([^}]*?)"nearestStation":\s*"([^"]+)"\\n\\s*"lat":\, 'g');
  const replacement = \"id": "\"\"nearestStation": "\",\n    "hasRailAccess": \,\n    "lat":\;
  content = content.replace(regex, replacement);
});

fs.writeFileSync(filePath, content, 'utf-8');
console.log('✓ Updated all destinations with hasRailAccess field');
