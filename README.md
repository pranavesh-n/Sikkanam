🗺️ Sikkanam — Transparent Travel Budgeting Platform
Sikkanam (meaning economy or frugality in Tamil) is a transparent, evidence-driven travel budgeting advisor and itinerary planner designed for middle-class travelers exploring Tamil Nadu.

Unlike typical travel planners that show unexplained, static cost estimates, Sikkanam believes in trust through transparency. It shows you exactly how every rupee in your travel budget is calculated, where the numbers come from, and why you should trust them.

🌟 Key Features
1. No Guesswork, Only Evidence
Sikkanam does not display arbitrary "confidence scores" or fake percentages. Instead, it shows you a clear checklist of the verified data sources used to calculate your budget.

2. Real-World Road Distances
Travel times and distance calculations are powered by real-world road network routing, ensuring your intercity travel times match actual road conditions in Tamil Nadu.

3. Food Cost Breakdown
Your daily food allowance isn't a random guess. Sikkanam breaks down your daily dining budget into:

🍳 Breakfast
🍛 Lunch
🍲 Dinner
☕ Snacks & Tea These rates automatically adjust depending on whether your destination is a small town (like Chidambaram) or a premium tourist spot (like Ooty or Kodaikanal).
4. Realistic Hotel Stays
Sikkanam estimates hotel price ranges based on the actual number of nearby lodging options available in the town's inventory, ensuring you don't book underpriced or overpriced rooms.
5. Real Time Sync & Multi-Database Backend 🆕
Sikkanam is now a fully connected full-stack application. Your travel profile, saved itineraries, and wishlists are securely stored and synced across all your devices using a highly optimized, modern cloud architecture.

⚙️ Full-Stack System Architecture
To deliver secure authentication and seamless data persistence without compromises, Sikkanam utilizes a specialized 3-Database cloud architecture:

🔐 Google Authentication (Firebase Auth): Provides secure, passwordless client-side sign-in. Session state is managed backend-side using stateless, secure JWT cookies.
🗄️ Relational Itinerary Storage (Supabase): All custom generated itineraries and planned trips are saved, renamed, and managed in a PostgreSQL database mapped to your user profile.
🍃 Wishlist Persistence (MongoDB Atlas): Your favorited destinations (hearting system) are dynamically synchronized and stored in a NoSQL MongoDB cluster, making it instantly responsive.
⚡ Serverless API Layer (Vercel): The backend functions run as modular, serverless APIs (Google OAuth verification, trip CRUD, and wishlist handlers) with clean URL routing rewrites.

🚘 How to Use Sikkanam
Sign In: Click Sign In with Google in the Profile section to sync your saved itineraries and wishlists across your devices.
Choose Your Route: Select your starting location and where you want to go in Tamil Nadu.
Specify Trip Details: Enter the number of travelers and the duration of your stay.
Select Your Style:
Budget: Travel like a local using public government buses, staying in budget lodges, and dining at local messes/eateries.
Standard: The balanced approach with comfortable rooms, standard restaurants, and standard transit classes.
Comfort: The relaxed style utilizing private cabs/express buses, premium hotels, and fine-dining restaurants.
Get Your Budget Breakdown: Instantly view the Recommended Carry Amount, Minimum Required, and Comfort Budgets.
Save & Edit: Save the itinerary to your profile. You can rename, view, or delete it at any time.
📊 Understanding Your Budget
When Sikkanam plans your trip, it presents three key numbers:

Budget Type	What it Covers
Minimum Required	The absolute baseline cost needed for transport, basic rooms, food, and entrance tickets.
Comfort Budget	A realistic budget that allows for comfortable dining, standard accommodations, and leisure transport.
Recommended Carry	The maximum expected spend plus a calculated Emergency Buffer to cover delays, shopping, or medical emergencies.
🛡️ Our Data Sources
Every estimate provided in Sikkanam is traceable to one of our verified databases:

🗺️ OpenStreetMap Routing: Real driving miles and travel times.
🎟️ Attraction Fee Database: Official district administration records for sightseeing entry fares.
🍽️ Food Cost Profiles: Regional food cost index mappings (very cheap, cheap, average, tourist, premium).
🏨 Hotel Inventory Dataset: Market price categories mapped by regional lodging availability.
🧭 Destination Intelligence Dataset: Curated local expertise on best months to visit, difficulty levels, and transit hubs.
