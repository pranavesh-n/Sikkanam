'use client'; // remove this line if using Pages Router

import { useEffect, useState } from 'react';

// ✏️ Bump this string every time you deploy new features
const VERSION = '2.0';

// ✏️ Edit this list for each new release
const FEATURES = [
  { icon: '🗺️', label: 'Improved Sikkanam Intelligence' },
  { icon: '✏️', label:'Accurate Planning'}
];

export default function WhatsNewModal({ onRefresh }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem('sikkanam_version');
    if (seen !== VERSION) {
      // Small delay so the page loads first
      const t = setTimeout(() => setShow(true), 900);
      return () => clearTimeout(t);
    }
  }, []);

  if (!show) return null;

  const handleRefresh = () => {
    localStorage.setItem('sikkanam_version', VERSION);
    setShow(false);
    if (onRefresh) {
      onRefresh(); // uses service worker skip waiting
    } else {
      window.location.reload();
    }
  };

  const handleLater = () => {
    setShow(false);
    // Don't save version — will remind on next visit
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(14, 10, 6, 0.75)' }}
    >
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0 text-xl">
            🎉
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Welcome to Sikkanam V2.0
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              What's new in this update
            </p>
          </div>
        </div>

        <hr className="border-gray-100 mb-4" />

        {/* Feature list */}
        <ul className="space-y-3 mb-5">
          {FEATURES.map(({ icon, label }) => (
            <li key={label} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-green-50 flex items-center
                              justify-center shrink-0 text-sm">
                {icon}
              </div>
              <span className="text-sm text-gray-800">{label}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <button
          onClick={handleRefresh}
          className="w-full py-3.5 rounded-xl text-white text-sm font-semibold
                     flex items-center justify-center gap-2 active:scale-95 transition-transform"
          style={{ background: '#D85A30' }}
        >
          🚀 Refresh &amp; Start Exploring
        </button>

        
