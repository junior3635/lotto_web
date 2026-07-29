// src/components/lottery/PrizeTable.jsx
// Tabla de Desglose de Premios 100% Responsive Mobile-First con scroll horizontal nativo y áreas táctiles optimizadas

import React from 'react';

export default function PrizeTable({ prizes = [], hasMultiplier = false, multiplierName = 'Multiplicador' }) {
  if (!prizes || prizes.length === 0) {
    return (
      <div className="p-6 text-center text-slate-500 bg-slate-900/50 rounded-xl border border-slate-800 text-xs sm:text-sm">
        No hay desglose de premios disponible para este sorteo.
      </div>
    );
  }

  return (
    <div className="relative -mx-4 sm:mx-0">
      {/* Contenedor con Scroll Horizontal Nativo en Móviles para Evitar Desbordamiento */}
      <div className="overflow-x-auto px-4 sm:px-0">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl">
            <table className="min-w-full text-left text-xs sm:text-sm text-slate-300 divide-y divide-slate-800">
              <thead className="bg-slate-950/90 text-slate-400 uppercase tracking-wider text-[10px] sm:text-xs font-bold">
                <tr>
                  <th scope="col" className="px-3 sm:px-6 py-3.5 sm:py-4 font-black">Categoría de Aciertos</th>
                  <th scope="col" className="px-3 sm:px-6 py-3.5 sm:py-4 text-center font-black">Ganadores</th>
                  <th scope="col" className="px-3 sm:px-6 py-3.5 sm:py-4 text-right font-black">Premio Base</th>
                  {hasMultiplier && (
                    <th scope="col" className="px-3 sm:px-6 py-3.5 sm:py-4 text-right text-amber-400 font-black">
                      Con {multiplierName}
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 bg-slate-900/50">
                {prizes.map((prize, idx) => (
                  <tr 
                    key={idx} 
                    className="hover:bg-slate-800/50 transition-colors min-h-[44px]"
                  >
                    <td className="px-3 sm:px-6 py-3.5 sm:py-4 font-bold text-white whitespace-nowrap sm:whitespace-normal">
                      {prize.categoryName}
                    </td>
                    <td className="px-3 sm:px-6 py-3.5 sm:py-4 text-center font-mono font-medium text-slate-300 whitespace-nowrap">
                      {prize.winnersCount?.toLocaleString() || 0}
                    </td>
                    <td className="px-3 sm:px-6 py-3.5 sm:py-4 text-right font-bold text-emerald-400 font-mono whitespace-nowrap">
                      {prize.prizeAmountFormatted || `$${prize.prizeAmount}`}
                    </td>
                    {hasMultiplier && (
                      <td className="px-3 sm:px-6 py-3.5 sm:py-4 text-right font-bold text-amber-400 font-mono whitespace-nowrap">
                        {prize.multiplierPrizeAmountFormatted || (prize.multiplierPrizeAmount ? `$${prize.multiplierPrizeAmount}` : '-')}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
