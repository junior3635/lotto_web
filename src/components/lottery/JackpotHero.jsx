// src/components/lottery/JackpotHero.jsx
// Hero Banner modular reutilizable para mostrar botes acumulados gigantes y titulares de país/estado

import React from 'react';

export default function JackpotHero({
  title = 'Resultados de Loterías',
  highlightText = 'EE. UU.',
  description = 'Revisa los números ganadores en tiempo real, botes acumulados gigantes y desglose de premios.',
  jackpotAmount = '$640 MILLONES',
  jackpotLabel = 'BOTE COMBINADO ACTUAL',
  badgeText = 'SORTEOS EN VIVO'
}) {
  return (
    <section className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-red-950/40 p-6 sm:p-8 border border-slate-800 shadow-2xl overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-black uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span>{badgeText}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            {title} <span className="text-red-500">{highlightText}</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            {description}
          </p>
        </div>

        {/* Jackpot Container Pill */}
        <div className="bg-slate-950/80 backdrop-blur-md rounded-2xl p-5 border border-slate-800 text-center shrink-0 shadow-inner">
          <span className="text-[11px] text-slate-400 uppercase font-black tracking-widest block">
            {jackpotLabel}
          </span>
          <span className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight">
            {jackpotAmount}
          </span>
        </div>
      </div>
    </section>
  );
}
