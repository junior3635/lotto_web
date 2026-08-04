// src/components/lottery/LotteryCardPri.jsx
// Tarjeta de lotería 100% Responsive Mobile-First con áreas táctiles de 44px y diseño adaptable

import React from 'react';
import Link from 'next/link';
import WinningCombination from './WinningCombination';

export default function LotteryCardPri({ lottery, countrySlug = 'us', stateSlug = null }) {
  const {
    name,
    slug,
    stateOrRegion = 'Nacional',
    jackpotFormatted = '$0',
    nextDrawDateFormatted = 'Por confirmar',
    specialBallBg = 'bg-gradient-to-br from-red-500 to-red-700 text-white shadow-red-500/30',
    lastDraw = null
  } = lottery;

  const lotteryHref = stateSlug
    ? `/${countrySlug}/estado/${stateSlug}/${slug}`
    : `/${countrySlug}/${slug}`;

  return (
    <article className="group relative rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 transition-all duration-300 p-4 sm:p-6 shadow-xl flex flex-col justify-between overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-amber-500 to-blue-600 opacity-80 group-hover:opacity-100 transition-opacity" />

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pt-1">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-amber-400 transition-colors tracking-tight">
                {name}
              </h3>
              {stateOrRegion && (
                <span className="text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 rounded-md bg-slate-800 border border-slate-700/80 text-slate-300 font-bold tracking-wide">
                  {stateOrRegion}
                </span>
              )}
            </div>
            {lastDraw?.drawDateFormatted && (
              <p className="text-xs text-slate-400 mt-1 font-medium">
                Último Sorteo N° {lastDraw?.drawNumber || 'N/A'} • {lastDraw.drawDateFormatted}
              </p>
            )}
          </div>

          <div className="text-left sm:text-right shrink-0 bg-slate-950/80 px-3 py-2 sm:px-3.5 sm:py-2 rounded-xl border border-slate-800">
            <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-black tracking-widest block">
              Est. jackpot 
            </span>
            <span className="text-lg sm:text-2xl font-black text-amber-400 tracking-tight">
              {jackpotFormatted}
            </span>
          </div>
        </div>

        {lastDraw?.winningCombination ? (
          <div className="bg-slate-950/80 rounded-xl p-3 sm:p-4 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 font-bold uppercase tracking-wider">
              <span>Números Ganadores</span>
              <span className="text-emerald-400 font-medium lowercase font-mono">oficial</span>
            </div>
            <WinningCombination
              combination={lastDraw.winningCombination}
              specialBallBg={specialBallBg}
              size="md"
            />
          </div>
        ) : (
          <div className="bg-slate-950/40 rounded-xl p-4 border border-slate-800/40 text-center text-slate-500 text-xs italic">
            Esperando confirmación de resultados de este sorteo...
          </div>
        )}
      </div>

      <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="font-semibold text-slate-400">Próximo:</span>
          <span className="text-white font-bold">{nextDrawDateFormatted}</span>
        </div>

        <div className="w-full sm:w-auto">
          <Link
            href={lotteryHref}
            className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black transition-colors shadow-md text-xs tracking-wide touch-manipulation"
          >
            <span>Premios & Payouts →</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
