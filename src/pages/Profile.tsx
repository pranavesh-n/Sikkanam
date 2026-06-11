import { Link } from "react-router-dom";
import { Heart, Bookmark, Info, Mail, MessageCircle } from "lucide-react";

const Profile = () => {
  return (
    <div className="max-w-md md:max-w-3xl mx-auto px-4 md:px-6 pt-3 md:pt-8 pb-6 space-y-4">
      <div className="bg-card border border-border rounded-2xl p-5 text-center">
        <div className="w-16 h-16 mx-auto rounded-full gradient-saffron grid place-items-center text-primary-foreground font-display font-extrabold text-2xl shadow-card">
          S
        </div>

        <h2 className="font-display font-bold mt-3">
          Welcome, Traveller
        </h2>

        <p className="text-xs text-muted-foreground mt-1">
          Sign-in coming soon — bookmarks and trips will sync across devices.
        </p>
      </div>

      <Section title="Coming soon">
        <Row
          icon={Bookmark}
          label="Saved trips"
          desc="Save AI itineraries for later"
          disabled
        />

        <Row
          icon={Heart}
          label="Favourites"
          desc="Your favourite destinations"
          disabled
        />
      </Section>

      <Section title="About">
        <Link to="/" className="block">
          <Row
            icon={Info}
            label="About Sikkanam"
            desc="A budget travel companion for Tamil Nadu"
          />
        </Link>

        <a
          href="mailto:sikkanam.customerfeedback@gmail.com"
          className="block"
        >
          <Row
            icon={Mail}
            label="Contact"
            desc="sikkanam.customerfeedback@gmail.com"
          />
        </a>

        <a
          href="https://wa.me/6374161918?text=Hi%20Sikkanam%20Team"
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <Row
            icon={MessageCircle}
            label="WhatsApp"
            desc="+91 6374161918"
          />
        </a>
      </Section>

      <p className="text-center text-[11px] text-muted-foreground pt-2">
        சிக்கனம் · Sikkanam v2.0
      </p>
    </div>
  );
};

const Section = ({ title, children }: any) => (
  <section>
    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">
      {title}
    </p>

    <div className="bg-card border border-border rounded-2xl divide-y divide-border overflow-hidden">
      {children}
    </div>
  </section>
);

const Row = ({ icon: Icon, label, desc, disabled }: any) => (
  <div
    className={`flex items-center gap-3 px-4 py-3 ${
      disabled ? "opacity-60" : "active:bg-muted"
    }`}
  >
    <span className="w-8 h-8 grid place-items-center rounded-full bg-primary/10 text-primary">
      <Icon className="w-4 h-4" />
    </span>

    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold">{label}</p>

      <p className="text-[11px] text-muted-foreground truncate">
        {desc}
      </p>
    </div>

    {disabled && (
      <span className="text-[10px] uppercase font-bold text-muted-foreground">
        Soon
      </span>
    )}
  </div>
);

export default Profile;
