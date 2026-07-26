# 🗺️ Sikkanam — Transparent Travel Budgeting Platform

**Sikkanam** (சிக்கனம் — meaning *economy* or *frugality* in Tamil) is a transparent, evidence-driven travel budgeting advisor and itinerary planner designed for middle-class travelers exploring Tamil Nadu.

Unlike typical travel planners that show unexplained, static cost estimates, Sikkanam believes in **trust through transparency**. It shows you exactly how every rupee in your travel budget is calculated, where the numbers come from, and why you should trust them.

---

## 🌟 Key Features

### 1. No Guesswork, Only Evidence
Sikkanam does not display arbitrary "confidence scores" or fake percentages. Instead, it shows you a clear checklist of the verified data sources used to calculate your budget.

### 2. Real-World Road Distances
Travel times and distance calculations are powered by real-world road network routing, ensuring your intercity travel times match actual road conditions in Tamil Nadu.

### 3. Food Cost Breakdown
Your daily food allowance isn't a random guess. Sikkanam breaks down your daily dining budget into:

- 🍳 Breakfast
- 🍛 Lunch
- 🍲 Dinner
- ☕ Snacks & Tea

These rates automatically adjust depending on whether your destination is a small town (like Chidambaram) or a premium tourist spot (like Ooty or Kodaikanal).

### 4. Realistic Hotel Stays
Sikkanam estimates hotel price ranges based on the actual number of nearby lodging options available in the town's inventory, ensuring you don't book underpriced or overpriced rooms.

### 5. Real-Time Sync & Multi-Database Backend
Sikkanam is a fully connected full-stack application. Your travel profile, saved itineraries, and wishlists are securely stored and synced across all your devices using a highly optimized, modern cloud architecture.

### 6. 87 Curated Destinations 🗺️
Covers the full breadth of Tamil Nadu — from the Nilgiri hills to Kanyakumari, from temple towns to remote waterfalls. Every destination has curated metadata: best travel months, difficulty level, recommended days, and local food spots.

---

## ⚙️ Full-Stack System Architecture

To deliver secure authentication and seamless data persistence without compromises, Sikkanam utilizes a specialized **3-Database cloud architecture**:

| Layer | Tech | Purpose |
|---|---|---|
| 🔐 Authentication | Firebase Auth (Google OAuth) | Passwordless client-side sign-in; JWT cookie sessions backend-side |
| 🗄️ Itinerary Storage | Supabase (PostgreSQL) | Custom itineraries and planned trips, mapped to user profiles |
| 🍃 Wishlist Persistence | MongoDB Atlas | Favorited destinations (hearting system) via NoSQL cluster |
| ⚡ API Layer | Vercel Serverless | OAuth verification, trip CRUD, and wishlist handlers |

---

## 🚘 How to Use Sikkanam

1. **Sign In** — Click *Sign In with Google* in the Profile section to sync saved itineraries and wishlists across devices.
2. **Choose Your Route** — Select your starting location and where you want to go in Tamil Nadu.
3. **Specify Trip Details** — Enter the number of travelers and the duration of your stay.
4. **Select Your Style:**
   - **Budget** — Travel like a local using TNSTC buses, budget lodges, and local messes/eateries.
   - **Standard** — The balanced approach with comfortable rooms, standard restaurants, and standard transit classes.
   - **Comfort** — Private cabs/express buses, premium hotels, and fine-dining restaurants.
5. **Get Your Budget Breakdown** — Instantly view the Recommended Carry Amount, Minimum Required, and Comfort Budgets.
6. **Save & Edit** — Save the itinerary to your profile. You can rename, view, or delete it at any time.

---

## 📊 Understanding Your Budget

| Budget Type | What it Covers |
|---|---|
| **Minimum Required** | The absolute baseline cost needed for transport, basic rooms, food, and entrance tickets. |
| **Comfort Budget** | A realistic budget that allows for comfortable dining, standard accommodations, and leisure transport. |
| **Recommended Carry** | The maximum expected spend plus a calculated Emergency Buffer to cover delays, shopping, or medical emergencies. |

---

## 🛡️ Data Sources

Every estimate provided in Sikkanam is traceable to one of our verified databases:

- 🗺️ **OpenStreetMap Routing** — Real driving miles and travel times.
- 🎟️ **Attraction Fee Database** — Official district administration records for sightseeing entry fares.
- 🍽️ **Food Cost Profiles** — Regional food cost index mappings (very cheap → cheap → average → tourist → premium).
- 🏨 **Hotel Inventory Dataset** — Market price categories mapped by regional lodging availability.
- 🧭 **Destination Intelligence Dataset** — Curated local expertise on best months to visit, difficulty levels, transit hubs, and local food spots.

---

## 🆕 Changelog

### v2.4 — July 2026
- 🌐 **"Already a Sikkanam User?" Web Onboarding** — Smart Google Auth gateway modal for browser/guest visits. Complete with single-click Google Sign-In or "Continue as Guest" session options to bypass future popups.
- 🎨 **Profile UI/UX Redesign** — Interactive stat counters, grouped setting cards, and native OS install state detection.
- 🔥 **Cloud Firestore Settings Sync** — Real-time Firestore settings listener syncing passcode status and PIN hashes instantly across all device instances.
- 🔒 **Deterministic Passcode Lock** — Secure 4-digit PIN lock operating across PWA and Web Browsers for Google-linked accounts. Implemented instant (0ms) background lock detection using local synchronous storage.
- 📲 **Robust PWA Installation States** — Dedicated PWA adoption logic featuring real-time uninstallation detection via `getInstalledRelatedApps` (reverting to "INSTALL" status immediately) and strict dismissal state retention.
- ⌨️ **Universal Keypad Support** — Full support for physical keyboards (`0-9`, `Backspace`, `Delete`) and mobile touch interfaces.






### v2.3 — July 2026

- 🪷 **New destination: Srivilliputhur** — Andal Kovil (Vadapatrasayi Temple), the rajagopuram of which is the **official emblem of the Tamil Nadu government**. Also covers: Palkova sweet shops and Kartick Mess (famous local meals near the temple).
- 💦 **Courtallam enriched** — All 7 named falls (Peraruvi, Aintharuvi, Puli Aruvi, Then Aruvi, Shenbaga Devi, Chittar, Old Courtallam) now individually listed. Added the legendary **Courtallam Border Rahmath Kadai** — famous across TN for sutta parotta and mutton biryani.
- 🔱 **Sankarankoil updated** — Description now reflects the full **Tenkasi belt circuit** (Sankarankoil → Srivilliputhur → Tenkasi → Courtallam).

### v2.2 — Earlier 2026
- Google Authentication integrated and synchronized across databases.
- Exact Route & Distance Calculator powered by real-world road network routing.
- Budget Transit Estimator: compare TNSTC buses, express trains, and cabs side-by-side.
- Calculate Exact Route & Fare directly from any destination detail card.

---

## 🏕️ Tenkasi Belt — Circuit Guide

The Tenkasi belt is one of Tamil Nadu's most compact multi-destination circuits. All these places can be covered in **2 days** from Chennai or Madurai:

| Destination | Highlight | Nearest Station |
|---|---|---|
| 🔱 Sankarankoil | Sankaranarayanar Temple | Sankarankovil |
| 🪷 Srivilliputhur | Andal Kovil (TN State Emblem) + Palkova | Sankarankovil |
| 🛕 Tenkasi | Kasi Viswanathar Temple + base for Courtallam | Tenkasi Junction |
| 💦 Courtallam | 7 medicinal falls + Rahmath Kadai non-veg | Tenkasi Junction |

---

*Built with ❤️ for Tamil Nadu travelers. Always free. No booking fee. No commission.*
