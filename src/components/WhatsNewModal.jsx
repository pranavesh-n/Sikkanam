'use client';
import { useEffect, useState } from 'react';

const VERSION = '1.0.0'; // ✏️ bump this on every release

const FEATURES = [
   { icon: '🗺️', label: 'Improved Sikkanam Intelligence' },
  { icon: '✏️', label:'Accurate Planning'}
];

export default function WhatsNewModal() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('appVersion') !== VERSION) {
      setTimeout(() => setShow(true), 800);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm">

        <h2 className="text-lg font-bold text-gray-900 mb-1">🎉 Welcome to Sikkanam</h2>
        <p className="text-xs text-gray-400 mb-4">What's new in this update</p>

        <ul className="space-y-3 mb-6">
          {FEATURES.map(f => (
            <li key={f} className="flex items-center gap-2 text-sm text-gray-800">
              <span className="text-green-500">✓</span> {f}
            </li>
          ))}
        </ul>

        <button
          onClick={() => {
            localStorage.setItem('appVersion', VERSION);
            window.location.reload();
          }}
          className="w-full py-3.5 rounded-xl text-white text-sm font-semibold"
          style={{ background: '#D85A30' }}
        >
          🚀 Refresh &amp; Start Exploring
        </button>

        <button
          onClick={() => setShow(false)}
          className="w-full mt-3 text-xs text-gray-400"
        >
          Maybe later
        </button>

      </div>
    </div>
  );
}
