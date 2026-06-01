import { Link } from "react-router-dom";
import {
  Sparkles,
  Compass,
  Ticket,
  MapPin,
  ArrowRight,
  Mountain,
  Waves,
  Landmark,
  Wallet,
  Route,
  ShieldCheck,
  Languages,
} from "lucide-react";
import { tnDestinations } from "@/data/tnDestinations";
import heroBg from "@/assets/hero-bg.jpg";

const Home = () => {
  const trending = tnDestinations.slice(0, 8);
  const hills = tnDestinations.filter((d) => d.category === "hill").slice(0, 8);
  const beaches = tnDestinations.filter((d) => d.category === "beach").slice(0, 8);
  const temples = tnDestinations.filter((d) => d.category === "temple").slice(0, 8);

  return (
    <div className="max-w-md md:max-w-6xl mx-auto">
      {/* Hero */}
      <section className="relative overflow-hidden md:rounded-b-[2rem]">
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/70 via-foreground/50 to-background md:bg-gradient-to-r md:from-foreground/80 md:via-foreground/55 md:to-foreground/10" />
        </div>
        <div
          className="relative px-5 pt-12 pb-8 md:px-12 md:pt-20 md:pb-24 md:max-w-3xl"
          style={{ paddingTop: "calc(env(safe-area-inset-top) + 2.5rem)" }}
        >
          <span className="inline-block px-3 py-1 rounded-full text-[11px] md:text-xs font-semibold gradient-saffron text-primary-foreground mb-4">
            சிக்கனம் · Tamil Nadu
          </span>
          <h1 className="font-display text-4xl md:text-6xl font-extrabold text-primary-foreground leading-tight">
            Travel smart.<br />Travel cheap.
          </h1>
          <p className="text-primary-foreground/85 mt-3 text-sm md:text-lg md:max-w-xl">
            AI-powered budget trip planning across  Tamil Nadu destinations — buses, trains, stays, food, and itineraries in ₹.
          </p>

          {/* Smart search */}
          <Link
            to="/explore"
            className="mt-5 md:mt-7 flex items-center gap-3 bg-card/95 backdrop-blur rounded-full px-4 py-3 md:py-4 shadow-elevated md:max-w-lg"
          >
            <MapPin className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            <span className="text-sm md:text-base text-muted-foreground flex-1">
              Where do you want to go?
            </span>
          </Link>

          <div className="mt-3 md:flex md:gap-3 md:max-w-lg">
            <Link
              to="/ai"
              className="flex items-center gap-3 gradient-saffron text-primary-foreground rounded-2xl px-4 py-4 shadow-elevated active:scale-[0.98] transition-transform md:flex-1"
            >
              <Sparkles className="w-5 h-5" />
              <div className="flex-1">
                <p className="font-semibold text-sm">Ask Sikkanam AI</p>
                <p className="text-[11px] opacity-90">"2-day Ooty trip under ₹5000"</p>
              </div>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/plan"
              className="hidden md:inline-flex items-center justify-center gap-2 bg-card text-foreground rounded-2xl px-5 py-4 font-semibold shadow-elevated active:scale-[0.98] transition-transform"
            >
              <Route className="w-4 h-4" /> Plan a trip
            </Link>
          </div>
        </div>
      </section>

      {/* Stats strip — OG Sikkanam vibe */}
      <section className="px-5 md:px-0 mt-6 md:mt-10">
        <div className="grid grid-cols-3 gap-2 md:gap-6 bg-card border border-border rounded-2xl p-4 md:p-6 shadow-card">
          <Stat value={`${tnDestinations.length}`} label="Destinations" />
          <Stat value="₹0" label="Booking fee" />
          <Stat value="100%" label="Tamil Nadu" />
        </div>
      </section>

      {/* Quick Actions */}
      <section className="px-5 md:px-0 mt-6">
        <div className="grid grid-cols-3 md:grid-cols-3 gap-2 md:gap-4">
          <QuickAction to="/plan" icon={MapPin} label="Plan Trip" />
          <QuickAction to="/explore" icon={Compass} label="Explore" />
          <QuickAction to="/booking" icon={Ticket} label="Book" />
        </div>
      </section>

      {/* Trending */}
      <Carousel title="🔥 Trending Now" items={trending} seeMore="/explore" />

      {/* Categories pills */}
      <section className="px-5 md:px-0 mt-8">
        <h2 className="font-display font-bold mb-3 text-base md:text-2xl">Browse by vibe</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <CategoryCard
            to="/explore?cat=hill"
            icon={Mountain}
            label="Hill Stations"
            count={tnDestinations.filter((d) => d.category === "hill").length}
          />
          <CategoryCard
            to="/explore?cat=beach"
            icon={Waves}
            label="Beaches"
            count={tnDestinations.filter((d) => d.category === "beach").length}
          />
          <CategoryCard
            to="/explore?cat=temple"
            icon={Landmark}
            label="Temples"
            count={tnDestinations.filter((d) => d.category === "temple").length}
          />
          <CategoryCard
            to="/explore?cat=wildlife"
            icon={Compass}
            label="Wildlife"
            count={tnDestinations.filter((d) => d.category === "wildlife").length}
          />
        </div>
      </section>

      <Carousel title="🏔️ Hill stations" items={hills} seeMore="/explore?cat=hill" />
      <Carousel title="🏖️ Beach escapes" items={beaches} seeMore="/explore?cat=beach" />
      <Carousel title="🛕 Temple trails" items={temples} seeMore="/explore?cat=temple" />

      {/* Why Sikkanam — OG section */}
      <section className="px-5 md:px-0 mt-10">
        <div className="text-center md:text-left mb-5">
          <p className="text-[11px] md:text-xs font-semibold text-primary uppercase tracking-wider">
            Why Sikkanam
          </p>
          <h2 className="font-display font-bold text-xl md:text-3xl mt-1">
            Smarter trips, smaller bills
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-5">
          <Feature
            icon={Wallet}
            title="Budget-first"
            desc="Every plan respects your ₹ — transport, stay, food split optimised."
          />
          <Feature
            icon={Route}
            title="Realistic routes"
            desc="TNSTC buses, IRCTC trains and local autos — not theoretical timings."
          />
          <Feature
            icon={Languages}
            title="Tamil Nadu native"
            desc="Built around real Tamil Nadu travel patterns and seasons."
          />
          <Feature
            icon={ShieldCheck}
            title="No hidden fees"
            desc="Always free. We never charge a booking fee or commission."
          />
        </div>
      </section>

      {/* Insight */}
      <section className="px-5 md:px-0 mt-10 mb-12">
        <div className="bg-card border border-border rounded-2xl p-5 md:p-8 shadow-card md:flex md:items-center md:gap-8">
          <div className="md:flex-1">
            <p className="text-[11px] md:text-xs font-semibold text-primary uppercase tracking-wider">
              Travel insight
            </p>
            <h3 className="font-display font-bold mt-1 md:text-2xl">
              Best time to visit Tamil Nadu
            </h3>
            <p className="text-sm md:text-base text-muted-foreground mt-2">
              <strong>Hills</strong> Apr–Jun · <strong>Beaches</strong> Oct–Mar ·{" "}
              <strong>Temples</strong> Oct–Feb. Avoid Oct–Dec rains in the east coast.
            </p>
          </div>
          <Link
            to="/ai"
            className="hidden md:inline-flex items-center gap-2 gradient-saffron text-primary-foreground rounded-full px-5 py-3 font-semibold shadow-card"
          >
            <Sparkles className="w-4 h-4" /> Ask the AI
          </Link>
        </div>
      </section>
    </div>
  );
};

const Stat = ({ value, label }: { value: string; label: string }) => (
  <div className="text-center">
    <p className="font-display font-extrabold text-xl md:text-3xl text-primary">{value}</p>
    <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider mt-0.5">
      {label}
    </p>
  </div>
);

const QuickAction = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => (
  <Link
    to={to}
    className="bg-card border border-border rounded-2xl py-3 md:py-5 px-2 flex flex-col items-center gap-1 md:gap-2 shadow-card active:scale-95 hover:border-primary/40 transition-all"
  >
    <span className="w-9 h-9 md:w-11 md:h-11 grid place-items-center rounded-full bg-primary/10 text-primary">
      <Icon className="w-4 h-4 md:w-5 md:h-5" />
    </span>
    <span className="text-xs md:text-sm font-medium">{label}</span>
  </Link>
);

const CategoryCard = ({ to, icon: Icon, label, count }: any) => (
  <Link
    to={to}
    className="bg-card border border-border rounded-2xl p-4 md:p-5 active:scale-95 hover:border-primary/40 transition-all"
  >
    <Icon className="w-5 h-5 md:w-6 md:h-6 text-primary mb-2" />
    <p className="font-display font-semibold text-sm md:text-base">{label}</p>
    <p className="text-[11px] md:text-xs text-muted-foreground">{count} places</p>
  </Link>
);

const Feature = ({ icon: Icon, title, desc }: any) => (
  <div className="bg-card border border-border rounded-2xl p-4 md:p-5 shadow-card">
    <span className="w-9 h-9 grid place-items-center rounded-xl bg-primary/10 text-primary">
      <Icon className="w-4 h-4" />
    </span>
    <p className="font-display font-bold mt-3">{title}</p>
    <p className="text-xs md:text-sm text-muted-foreground mt-1">{desc}</p>
  </div>
);

const Carousel = ({
  title,
  items,
  seeMore,
}: {
  title: string;
  items: typeof tnDestinations;
  seeMore: string;
}) => (
  <section className="mt-8">
    <div className="flex items-center justify-between px-5 md:px-0 mb-3">
      <h2 className="font-display font-bold text-base md:text-2xl">{title}</h2>
      <Link to={seeMore} className="text-xs md:text-sm text-primary font-medium">
        See all →
      </Link>
    </div>
    {/* Mobile: snap carousel · Desktop: grid */}
    <div className="flex md:hidden gap-3 overflow-x-auto pb-2 px-5 snap-x snap-mandatory scrollbar-hide">
      {items.map((d) => (
        <DestCard key={d.id} d={d} className="snap-start shrink-0 w-40" />
      ))}
    </div>
    <div className="hidden md:grid grid-cols-4 gap-4">
      {items.map((d) => (
        <DestCard key={d.id} d={d} />
      ))}
    </div>
  </section>
);

const DestCard = ({
  d,
  className = "",
}: {
  d: (typeof tnDestinations)[number];
  className?: string;
}) => (
  <Link
    to={`/destination/${d.id}`}
    className={`bg-card rounded-2xl border border-border p-3 md:p-4 active:scale-95 hover:border-primary/40 hover:shadow-elevated transition-all shadow-card ${className}`}
  >
    <div className="text-3xl md:text-4xl">{d.emoji}</div>
    <p className="font-display font-bold text-sm md:text-base mt-2 truncate">{d.name}</p>
    <p className="text-[11px] md:text-xs text-muted-foreground truncate">{d.district}</p>
  </Link>
);

export default Home;
