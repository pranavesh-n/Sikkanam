import { useEffect, useState } from "react";

const VERSION = "4.3.0";

export default function WhatsNewModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem("sikkanam-version");

    if (seen !== VERSION) {
      setOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem("sikkanam-version", VERSION);
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div>
      <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
  <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">

    <div className="mb-3">
      <span className="bg-orange-100 text-orange-700 text-xs px-3 py-1 rounded-full font-medium">
        NEW • Intelligence Engine v4.2
      </span>
    </div>

    <h2 className="text-2xl font-bold mb-2">
      🚀 What's New in Sikkanam
    </h2>

    <p className="text-gray-600 mb-5">
      Travel planning is now smarter, more transparent,
      and more reliable.
    </p>

    <div className="space-y-3 text-sm">
      <div>🛣️ Verified Route Intelligence</div>
      <div>🏨 Hotel Market Intelligence</div>
      <div>🍽️ Meal-Based Budget Planning</div>
      <div>🎟️ Attraction Fee Database</div>
      <div>📊 Budget Reliability</div>
      <div>🔍 Full Cost Transparency</div>
    </div>

    <button
      onClick={handleClose}
      className="mt-6 w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl font-semibold"
    >
      ✨ Explore New Features
    </button>

  </div>
</div>
    </div>
  );
}
