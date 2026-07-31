import React from 'react';
import Link from 'next/link';
import LotteryCard from './LotteryCard';

export default function StateGrid({ states = [], countrySlug = 'us' }) {
  if (!states || states.length === 0) return null;

  return (
    <section className="space-y-6 pt-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            🏛️ Estados
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Explora las loterías disponibles por estado</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {states.map((st) => (
          <Link
            key={st.slug}
            href={`/${countrySlug}/estado/${st.slug}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-amber-500/50 hover:bg-slate-800 text-sm font-bold transition-all shadow-sm"
          >
            <span>{st.icon}</span>
            <span>{st.name}</span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
        {states.map((state) => (
          <div key={state.slug} id={`estado-${state.slug}`} className="space-y-4 scroll-mt-24">
            <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-slate-200 flex items-center gap-2">
                  <span>{state.icon}</span>
                  <span>{state.name}</span>
                </h3>
                <Link
                  href={`/${countrySlug}/estado/${state.slug}`}
                  className="text-[10px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
                >
                  Ver loterías <span>→</span>
                </Link>
              </div>

              {state.lotteries && state.lotteries.length > 0 ? (
                <div className="space-y-2">
                  {state.lotteries.map((lottery) => (
                    <Link
                      key={lottery.id}
                      href={`/${countrySlug}/estado/${state.slug}/${lottery.slug}`}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 hover:border-slate-700 transition-colors group"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors truncate">
                          {lottery.name}
                        </p>
                        {lottery.lastDraw?.drawDateFormatted && (
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            Último: {lottery.lastDraw.drawDateFormatted}
                          </p>
                        )}
                      </div>
                      <span className="text-xs font-black text-amber-400 shrink-0 ml-2">
                        {lottery.jackpotFormatted}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">Sin loterías disponibles</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}