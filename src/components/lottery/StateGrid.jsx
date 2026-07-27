// src/components/lottery/StateGrid.jsx
// Módulo modular reutilizable para la cuadrícula de loterías organizadas por estados

import React from 'react';
import Link from 'next/link';
import LotteryCard from './LotteryCard';

export default function StateGrid({ states = [], countrySlug = 'us' }) {
  if (!states || states.length === 0) return null;

  return (
    <section className="space-y-6 pt-4">
      {/* Header & Quick State Chips */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            🏛️ Loterías Organizadas por Estado
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Explora los juegos locales disponibles en cada estado</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {states.map((st) => (
            <a
              key={st.slug}
              href={`#estado-${st.slug}`}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 text-xs font-bold transition-all shadow-sm"
            >
              {st.icon} {st.name}
            </a>
          ))}
        </div>
      </div>

      {/* Bloques por Estado */}
      <div className="space-y-8">
        {states.map((state) => (
          <div key={state.slug} id={`estado-${state.slug}`} className="space-y-4 scroll-mt-24">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-slate-200 flex items-center gap-2">
                <span>{state.icon}</span>
                <span>Loterías de {state.name}</span>
              </h3>
              <Link
                href={`/${countrySlug}/estado/${state.slug}`}
                className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
              >
                <span>Ver todas las de {state.name}</span>
                <span>→</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {state.lotteries.map((lottery) => (
                <LotteryCard key={lottery.id} lottery={lottery} countrySlug={countrySlug} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
