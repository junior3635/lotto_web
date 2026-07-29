'use client';
// src/components/lottery/DrawHistory.jsx
// Historial visual de sorteos para la página de detalle de cada lotería
// Muestra las últimas combinaciones ganadoras en formato compacto con link a cada sorteo

import { useState } from 'react';
import Link from 'next/link';

/**
 * Bola compacta para el historial
 */
function HistoryBall({ number, isSpecial = false, specialBg }) {
  if (isSpecial) {
    return (
      <span
        className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-[11px] font-black shadow-md ${specialBg || 'bg-red-600 text-white'}`}
      >
        {number}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-[11px] font-black bg-white text-slate-900 shadow-sm border border-slate-200">
      {number}
    </span>
  );
}

/**
 * Fila de un sorteo histórico
 */
function DrawRow({ draw, countrySlug, lotterySlug, specialBallBg, index }) {
  const { numbers = [], specialBall, multiplier } = draw.winningCombination || {};

  return (
    <div
      className={`group flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-4 py-3.5 rounded-xl border transition-all duration-200
        ${index === 0
          ? 'bg-amber-500/5 border-amber-500/20 hover:bg-amber-500/10'
          : 'bg-slate-900/50 border-slate-800/60 hover:bg-slate-800/60 hover:border-slate-700/60'
        }`}
    >
      {/* Info del sorteo */}
      <div className="flex items-center gap-3 shrink-0 min-w-0 sm:w-52">
        {index === 0 && (
          <span className="text-[9px] font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
            Último
          </span>
        )}
        <div className="min-w-0">
          <p className="text-xs font-bold text-white truncate">
            {draw.drawDateFormatted}
          </p>
          {draw.drawNumber && (
            <p className="text-[10px] text-slate-500 font-mono">
              Sorteo #{draw.drawNumber}
            </p>
          )}
        </div>
      </div>

      {/* Combinación ganadora compacta */}
      <div className="flex items-center gap-1.5 flex-wrap grow">
        {numbers.map((n, i) => (
          <HistoryBall key={i} number={n} />
        ))}
        {specialBall !== undefined && (
          <>
            <span className="text-slate-600 text-xs font-bold mx-0.5">+</span>
            <HistoryBall number={specialBall} isSpecial specialBg={specialBallBg} />
          </>
        )}
        {multiplier && (
          <span className="ml-1 text-[10px] font-black text-slate-400 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-full">
            {multiplier}
          </span>
        )}
      </div>

      {/* Link al detalle del sorteo */}
      <Link
        href={`/${countrySlug}/${lotterySlug}/sorteo/${draw.id}`}
        className="shrink-0 text-[11px] font-bold text-slate-500 group-hover:text-amber-400 transition-colors flex items-center gap-1 hover:underline underline-offset-2"
      >
        Ver detalle
        <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}

/**
 * Componente principal: historial de sorteos con paginación interna
 */
export default function DrawHistory({ draws = [], countrySlug, lotterySlug, specialBallBg }) {
  const PAGE_SIZE = 5;
  const [showAll, setShowAll] = useState(false);

  if (!draws || draws.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 text-sm">
        No hay sorteos históricos disponibles aún.
      </div>
    );
  }

  const visibleDraws = showAll ? draws : draws.slice(0, PAGE_SIZE);
  const hasMore = draws.length > PAGE_SIZE;

  return (
    <div className="space-y-2.5">
      {/* Header de columnas */}
      <div className="hidden sm:flex items-center gap-4 px-4 pb-1">
        <div className="w-52 text-[10px] font-black text-slate-500 uppercase tracking-wider">
          Fecha / Sorteo
        </div>
        <div className="grow text-[10px] font-black text-slate-500 uppercase tracking-wider">
          Combinación Ganadora
        </div>
      </div>

      {/* Filas de sorteos */}
      <div className="space-y-2">
        {visibleDraws.map((draw, i) => (
          <DrawRow
            key={draw.id}
            draw={draw}
            countrySlug={countrySlug}
            lotterySlug={lotterySlug}
            specialBallBg={specialBallBg}
            index={i}
          />
        ))}
      </div>

      {/* Ver más / menos */}
      {hasMore && (
        <div className="pt-1 text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-amber-400 transition-colors py-2 px-4 rounded-lg hover:bg-slate-800/60 border border-transparent hover:border-slate-700/60"
          >
            {showAll ? (
              <>
                <span>▲</span> Mostrar menos
              </>
            ) : (
              <>
                <span>▼</span> Ver los {draws.length - PAGE_SIZE} sorteos anteriores
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
