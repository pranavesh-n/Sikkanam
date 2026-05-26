import { Bus, Train, Hotel, ExternalLink } from "lucide-react";

const Booking = () => {
  return (
    <div className="max-w-md md:max-w-5xl mx-auto px-4 md:px-6 pt-3 md:pt-8 pb-6 space-y-4 md:space-y-6">
      <p className="text-xs text-muted-foreground">
        Sikkanam links you to trusted services. We never charge a booking fee.
      </p>

      {/* Bus */}
      <Section icon={Bus} title="Bus tickets" subtitle="TNSTC government buses across Tamil Nadu">
        <Card
          title="TNSTC online"
          desc="Government rates · WhatsApp & web booking"
          href="https://www.tnstc.in/"
          cta="Book bus"
        />
        <Card
          title="WhatsApp booking"
          desc="Send 'Hi' to TNSTC bot for instant assistance"
          href="https://wa.me/+919444018898 "
          cta="Open WhatsApp"
        />
        <Card
          title="RedBus (private)"
          desc="Compare private operators across TN"
          href="https://www.redbus.in/"
          cta="Compare buses"
        />
      </Section>

      {/* Train */}
      <Section icon={Train} title="Train tickets" subtitle="IRCTC official portal">
        <Card
          title="IRCTC official"
          desc="Sleeper from ₹100 · Book up to 120 days ahead"
          href="https://www.irctc.co.in/"
          cta="Book train"
        />
        <Card
          title="Live train status"
          desc="Track Tamil Nadu trains in real-time"
          href="https://enquiry.indianrail.gov.in/mntes/"
          cta="Track now"
        />
      </Section>

      {/* Hotels */}
      <Section icon={Hotel} title="Hotel stays" subtitle="From TTDC lodges to mid-range">
        <Card
          title="Booking.com"
          desc="Cancellable hotels across TN"
          href="https://www.booking.com/searchresults.html?ss=Tamil+Nadu"
          cta="Browse hotels"
        />
        <Card
          title="Goibibo"
          desc="Domestic deals · UPI checkout"
          href="https://www.goibibo.com/hotels/hotels-in-tamil-nadu-state/"
          cta="Find deals"
        />
        <Card
          title="Agoda"
          desc="Pay later · Best for Ooty/Kodai"
          href="https://www.agoda.com/country/india.html"
          cta="Check rates"
        />
        <Card
          title="TTDC official"
          desc="Government-run hotels (₹450–₹1500/night)"
          href="https://www.ttdconline.com/"
          cta="Book TTDC"
        />
      </Section>

      <div className="bg-card border border-border rounded-2xl p-4 text-xs text-muted-foreground">
        💡 <strong className="text-foreground">Tip:</strong> Book trains 2–3 weeks ahead for sleeper berths. TNSTC buses rarely sell out — pay on board.
      </div>
    </div>
  );
};

const Section = ({ icon: Icon, title, subtitle, children }: any) => (
  <section>
    <div className="flex items-center gap-2 mb-2 px-1">
      <span className="w-8 h-8 grid place-items-center rounded-full bg-primary/10 text-primary">
        <Icon className="w-4 h-4" />
      </span>
      <div>
        <h2 className="font-display font-bold text-sm">{title}</h2>
        <p className="text-[11px] text-muted-foreground">{subtitle}</p>
      </div>
    </div>
    <div className="space-y-2">{children}</div>
  </section>
);

const Card = ({ title, desc, href, cta }: { title: string; desc: string; href: string; cta: string }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="block bg-card border border-border rounded-2xl p-4 active:scale-[0.98] transition-transform shadow-card"
  >
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <p className="font-display font-bold text-sm">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
      </div>
      <span className="shrink-0 text-[11px] font-semibold text-primary flex items-center gap-1">
        {cta} <ExternalLink className="w-3 h-3" />
      </span>
    </div>
  </a>
);

export default Booking;
