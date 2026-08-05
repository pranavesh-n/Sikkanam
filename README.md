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

### 6. 100 Curated Destinations 🗺️
Covers the full breadth of Tamil Nadu — from the Nilgiri hills to Kanyakumari, from temple towns to remote waterfalls and 21 heritage monuments. Every destination has curated metadata: best travel months, difficulty level, recommended days, and local food spots.

### 7. Live Weather Forecast & Sikkanam AI Rain Risk System 🌤️
Powered by the Open-Meteo API using the high-precision **ECMWF forecasting model** (`models=ecmwf_ifs025`).
- **Live Travel Metrics**: Real-time current temperature ("NOW"), 3-day forecast selector, Feels Like (°C), Wind Speed (km/h), Humidity (%), UV Index Category, and formatted Sunrise & Sunset times.
- **Sikkanam Travel Intelligence**: Calculates hourly precipitation windows (*"Most likely rain window: 3 PM – 11 PM"*) and provides actionable traveler advice (*"Carry an umbrella or raincoat"*, *"Best time for outdoor sightseeing: 6 AM – 1 PM"*).
- **Google-Style "Choose an Area" Modal**: Includes 100% sub-location coverage across Tamil Nadu destinations (e.g. *Anna Nagar*, *T. Nagar*, *Velachery* in Chennai; *Dhanushkodi*, *Pamban Bridge* in Rameswaram; *Coonoor*, *Doddabetta* in Ooty) plus a **"🎯 Use precise GPS location"** button.
- **Sikkanam AI Rain Risk Alert**: Triggers smart rain risk warnings and recommends curated indoor alternatives (museums, indoor palaces, art galleries, historic churches) to replace outdoor viewpoints when heavy rain threatens sightseeing.

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

### v2.6.1 — August 2026 (100 Destinations Milestone & Interactive Circuit Navigation)
- 🏛️ **100 Destinations Milestone**: Reached the 100 destinations milestone with 13 brand new heritage additions (*Gingee Fort*, *Pudukkottai*, *Sittannavasal*, *Thirumayam*, *Panchalankurichi*, *Udayagiri Fort*, *Padmanabhapuram Palace*, *Keezhadi Museum*, *Kazhugumalai*, *Tirumalai Nayakar Mahal*, *Sadras Dutch Fort*, *Alamparai Fort*, *Kanadukathan Chettinad Palace*).
- 🗺️ **21 Heritage Destinations**: Expanded the Heritage category filter to 21 curated historical sites with verified attraction fee records, local hotel fallbacks, and transport connectivity settings.
- 📍 **Interactive Circuit Navigation**: Circuit stops (e.g. *Ooty ➔ Coonoor*) are now clickable pill buttons with active location badges (`📍 Coonoor (Current)`) and 1-tap route switching.
- 🎨 **Universal Cross-Platform Emojis**: Updated icon system across all destinations to eliminate raw country ISO flag codes on Windows OS and ensure crisp visual rendering across all browsers.

### v2.6.2 — August 2026 (Direct Trip Link Sharing & User Choice Calendar Date Picker)
- 🔗 **Direct Trip Link Sharing (`/plan?from=...&to=...`)**: Travelers can share their exact calculated trip plan via WhatsApp, Telegram, or social media. Opening the link automatically loads and displays the full interactive trip plan.
- 📅 **User Choice Calendar Date Picker (`<input type="date">`)**: Travelers can select **ANY custom travel date** across the entire year using an interactive calendar picker (`"📅 Pick Any Custom Travel Date"`).
- 🗓️ **16-Day Forecast Horizon & Extended Seasonal Modeling**: Automatically retrieves Open-Meteo ECMWF live forecasts for dates within 16 days, and applies seasonal climate modeling for user-chosen dates further out.
- ⚡ **Dynamic 3-Day Window & Travel Intelligence**: The 3-day weather cards, metrics, hourly rain windows, sightseeing windows, and Sikkanam AI Rain Risk Alerts dynamically re-calculate starting from whatever trip date the user chooses.

### v2.5 — July 2026 (Live Weather & Sikkanam AI Rain Risk System)
- 🌤️ **Live Open-Meteo ECMWF Model Feed**: Real-time 3-day weather forecast powered by the Open-Meteo ECMWF model (`models=ecmwf_ifs025`) with automatic fallback to standard parameters.
- 🎯 **Google-Style "Choose an Area" Modal**: Includes 100% sub-location coverage across all Tamil Nadu destinations (e.g. *Dhanushkodi* in Rameswaram, *Coonoor* in Ooty, *T. Nagar* in Chennai) plus a **"🎯 Use precise GPS location"** button (`navigator.geolocation`).
- ⏱️ **Hourly Travel Intelligence & Rain Windows**: Analyzes hourly precipitation probability and volume to identify exact rain windows (*"Most likely rain window: 3 PM – 11 PM"*) and optimal sightseeing hours.
- 🏛️ **Contextual Indoor Spot Recommendations**: Automatically presents curated indoor alternatives (museums, science centres, art galleries, historic churches) to replace outdoor viewpoints when rain threatens travel plans.

### v2.4 — July 2026
- 🌐 **"Already a Sikkanam User?" Web Onboarding** — Smart Google Auth gateway modal for browser/guest visits. Complete with single-click Google Sign-In or "Continue as Guest" session options to bypass future popups.
- 🎨 **Profile UI/UX Redesign** — Interactive stat counters, grouped setting cards, and native OS install state detection.
- 🔥 **Cloud Firestore Settings Sync** — Real-time Firestore settings listener syncing passcode status and PIN hashes instantly across all device instances.
- 🔒 **Deterministic Passcode Lock** — Secure 4-digit PIN lock operating across PWA and Web Browsers for Google-linked accounts. Implemented instant (0ms) background lock detection using local synchronous storage.
- 📲 **Robust PWA Installation States** — Dedicated PWA adoption logic featuring real-time uninstallation detection via `getInstalledRelatedApps` (reverting to "INSTALL" status immediately) and strict dismissal state retention.
- ⌨️ **Universal Keypad Support** — Full support for physical keyboards (`0-9`, `Backspace`, `Delete`) and mobile touch interfaces.

### v2.4.2 — July 26, 2026 (Intelligent Onboarding & PWA Lifecycle Patch)
- 🧠 **Smart Onboarding Progression**:
  - Automatically transitions from **"Already a Sikkanam User?"** (Auth Modal) to **"Install Sikkanam App"** modal as soon as Google Sign-In completes or the user clicks "Continue as Guest".
  - Strictly distinguishes browser visits from standalone installed app usage: browser visitors see appropriate onboarding prompts, while installed PWA app users bypass modals straight to PIN AppLock security.
- 📱 **Intelligent PWA Uninstallation Detection**:
  - Dynamically clears stale `sikkanam_pwa_installed` flags when `beforeinstallprompt` fires in non-standalone browser mode. If a user uninstalls/deletes Sikkanam from their device, the web app instantly detects the uninstall and prompts them to install again on their next web visit.

### v2.4.1 — July 26, 2026 (Patch)
- 🐛 **Fixed: Onboarding modals not appearing on browser visit or after PWA uninstall** — Resolved three interlocking bugs that silently suppressed the "Already a Sikkanam User?" and "Install Sikkanam" popups:
  - **Async race condition** in `AuthContext.purgeStaleSession()` — `auth.signOut()` was called before clearing storage keys, causing Firebase's `onAuthStateChanged` to fire while stale session data was still present. `OnboardingContext` would initialize at that exact moment with wrong state. Fixed by clearing all storage keys *before* `auth.signOut()`.
  - **Persistent localStorage suppression** — The welcome modal dismissal key (`sikkanam_welcome_auth_dismissed`) was only removed from `sessionStorage` on purge but was written to `localStorage` on dismiss. This meant returning users after an uninstall or logout would never see the modal again. Fixed by clearing from both storages.
  - **One-shot init lock** in `OnboardingContext` — A `hasInitializedRef` guard locked in whatever (stale) state was computed on first render, making the context unable to recover when true auth/install state arrived milliseconds later. Fixed by removing the lock and making the effect fully reactive — re-evaluating whenever `authReady`, `user`, `explicitLogin`, or `isPwaInstalled` changes.
- 🔌 **PWA install tracking moved to app root** — `usePwaInstall` hook is now mounted inside `OnboardingProvider` (app root) rather than only on the Profile page, so uninstall detection via `getInstalledRelatedApps` is active from the first page load.



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
