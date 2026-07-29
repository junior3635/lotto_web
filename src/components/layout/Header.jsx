// src/components/layout/Header.jsx
// Header global de la aplicación con integración de Sidebar toggle y selector de estados estilo 

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Sidebar from './Sidebar';

const US_STATES_LIST = [
  { name: 'Alabama', code: 'AL', slug: 'alabama' },
  { name: 'California', code: 'CA', slug: 'california' },
  { name: 'Florida', code: 'FL', slug: 'florida' },
  { name: 'Georgia', code: 'GA', slug: 'georgia' },
  { name: 'Illinois', code: 'IL', slug: 'illinois' },
  { name: 'New York', code: 'NY', slug: 'new-york' },
  { name: 'Texas', code: 'TX', slug: 'texas' },
];

export default function Header({ currentCountry = 'us' }) {
  const [isStatesOpen, setIsStatesOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 backdrop-blur-lg bg-slate-950/90 border-b border-slate-800/90">
        {/* Top Mini Announcement Bar ( Style) */}
        <div className="bg-slate-900 border-b border-slate-800 text-[11px] py-1.5 px-4 text-slate-300">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-slate-200">Sorteos en Vivo:</span>
              <span className="text-slate-400">Powerball y Mega Millions actualizados al instante</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-slate-400 hidden sm:inline">Idioma / Región:</span>
              <div className="flex gap-1.5 font-bold">
                <Link href="/us" className={`px-2 py-0.5 rounded ${currentCountry === 'us' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}`}>🇺🇸 US</Link>
                <Link href="/es" className={`px-2 py-0.5 rounded ${currentCountry === 'es' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>🇪🇸 ES</Link>
                <Link href="/mx" className={`px-2 py-0.5 rounded ${currentCountry === 'mx' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}>🇲🇽 MX</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main Global Navigation Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Sidebar Toggle Button */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
              aria-label="Abrir menú lateral"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Brand Logo */}
            <Link href={`/${currentCountry}`} className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 via-amber-500 to-blue-600 p-[2px] shadow-lg group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-black text-xl text-white">
                  🎰
                </div>
              </div>
              <div>
                <span className="font-black text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  LottoHQ
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-red-500 block -mt-1">
                  LOTTERY USA
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Items (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-bold text-slate-300">
            <Link href={`/${currentCountry}`} className="hover:text-white transition-colors">
              Inicio
            </Link>
            <Link href={`/${currentCountry}/powerball`} className="hover:text-red-400 transition-colors flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              Powerball
            </Link>
            <Link href={`/${currentCountry}/mega-millions`} className="hover:text-amber-400 transition-colors flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Mega Millions
            </Link>

            {/* States Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsStatesOpen(!isStatesOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 font-bold transition-all text-xs"
              >
                <span>🏛️ Estados (A-Z)</span>
                <span className="text-slate-500 text-[10px]">▼</span>
              </button>

              {isStatesOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-3 z-50 space-y-1">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider px-2 py-1 border-b border-slate-800">
                    Loterías Estatales
                  </p>
                  {US_STATES_LIST.map((st) => (
                    <Link
                      key={st.code}
                      href={`/${currentCountry}/estado/${st.slug}`}
                      onClick={() => setIsStatesOpen(false)}
                      className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-800 text-xs font-semibold text-slate-200 hover:text-white transition-colors"
                    >
                      <span>{st.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">{st.code}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* Sidebar Component */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentCountry={currentCountry}
      />
    </>
  );
}
