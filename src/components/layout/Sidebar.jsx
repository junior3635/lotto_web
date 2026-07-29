// src/components/layout/Sidebar.jsx
// Sidebar de navegación lateral responsivo estilo  con colapsado y menú de accesos rápidos

'use client';

import React from 'react';
import Link from 'next/link';

const POPULAR_STATES = [
  { name: 'Florida', code: 'FL', slug: 'florida', icon: '🌴' },
  { name: 'Texas', code: 'TX', slug: 'texas', icon: '🤠' },
  { name: 'California', code: 'CA', slug: 'california', icon: '☀️' },
  { name: 'New York', code: 'NY', slug: 'new-york', icon: '🗽' },
  { name: 'Georgia', code: 'GA', slug: 'georgia', icon: '🍑' },
];

export default function Sidebar({ isOpen = false, onClose = () => { }, currentCountry = 'us' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop oscuro */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <aside className="relative w-80 max-w-[80vw] bg-slate-900 border-r border-slate-800 h-full p-6 overflow-y-auto space-y-8 z-10 shadow-2xl flex flex-col justify-between">
        <div className="space-y-6">
          {/* Top Bar Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🎰</span>
              <span className="font-black text-xl text-white tracking-tight">LottoHQ</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              aria-label="Cerrar menú"
            >
              ✕
            </button>
          </div>

          {/* Menú Principal */}
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider px-2">Navegación</p>
            <nav className="space-y-1 text-sm font-bold">
              <Link
                href={`/${currentCountry}`}
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 text-slate-200 hover:text-white transition-colors"
              >
                <span>🏠</span>
                <span>Inicio / Resultados</span>
              </Link>
              <Link
                href={`/${currentCountry}/powerball`}
                onClick={onClose}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-800 text-slate-200 hover:text-white transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600 shadow-red-500/50 shadow-sm" />
                  <span>Powerball</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded bg-red-500/10 text-red-400 font-semibold border border-red-500/20">$360M</span>
              </Link>
              <Link
                href={`/${currentCountry}/mega-millions`}
                onClick={onClose}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-800 text-slate-200 hover:text-white transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-amber-400/50 shadow-sm" />
                  <span>Mega Millions</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20">$280M</span>
              </Link>
            </nav>
          </div>

          {/* Sección Loterías por Estado */}
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider px-2">Loterías por Estado</p>
            <div className="space-y-1">
              {POPULAR_STATES.map((st) => (
                <Link
                  key={st.code}
                  href={`/${currentCountry}/estado/${st.slug}`}
                  onClick={onClose}
                  className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span>{st.icon}</span>
                    <span>{st.name}</span>
                  </span>
                  <span className="font-mono text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800">{st.code}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Sidebar */}
        <div className="pt-4 border-t border-slate-800 text-xs text-slate-500 text-center">
          <p>LottoHQ © {new Date().getFullYear()}</p>
        </div>
      </aside>
    </div>
  );
}
