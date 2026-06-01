import { useEffect, useState } from "react";

export default function UpdateChecker() {
  const [showUpdate, setShowUpdate] = useState(false);

  useEffect(() => {
    const currentVersion = localStorage.getItem("app_version");

    const checkVersion = async () => {
      try {
        const response = await fetch("/version.json?t=" + Date.now());
        const data = await response.json();

        if (!currentVersion) {
          localStorage.setItem("app_version", data.version);
          return;
        }

        if (currentVersion !== data.version) {
          setShowUpdate(true);
          localStorage.setItem("app_version", data.version);
        }
      } catch (error) {
        console.log("Version check failed");
      }
    };

    checkVersion();
  }, []);

  if (!showUpdate) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 bg-orange-500 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3">
      <span>🚀 New update available</span>

      <button
        onClick={() => window.location.reload()}
        className="bg-white text-black px-3 py-1 rounded-lg font-medium"
      >
        Refresh
      </button>
    </div>
  );
}
