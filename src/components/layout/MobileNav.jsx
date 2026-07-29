// src/components/layout/MobileNav.jsx
// Navegación flotante inferior optimizada para experiencia Mobile-First

import React from 'react';
import Link from 'next/link';

export default function MobileNav({ currentCountry = 'us' }) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/90 px-6 py-2.5 flex items-center justify-around z-50 text-slate-400 text-[10px] font-bold shadow-2xl">
      <Link href={`/${currentCountry}`} className="flex flex-col items-center gap-1 text-amber-400 hover:text-amber-300 transition-colors">
        <span className="text-base">🎰</span>
        <span>Resultados</span>
      </Link>
      <Link href={`/${currentCountry}/powerball`} className="flex flex-col items-center gap-1 hover:text-white transition-colors">
        <span className="w-2.5 h-2.5 rounded-full bg-red-600 shadow-red-500/50 shadow-sm" />
        <span>Powerball</span>
      </Link>
      <Link href={`/${currentCountry}/mega-millions`} className="flex flex-col items-center gap-1 hover:text-white transition-colors">
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-amber-400/50 shadow-sm" />
        <span>Mega Millions</span>
      </Link>
      <Link href={`/${currentCountry}/estado/florida`} className="flex flex-col items-center gap-1 hover:text-white transition-colors">
        <span className="text-base">🌴</span>
        <span>Estados</span>
      </Link>
    </nav>
  );
}
