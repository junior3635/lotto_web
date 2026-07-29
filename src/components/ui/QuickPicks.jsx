// src/components/ui/QuickPicks.jsx
// Generador interactivo de Números de la Suerte (Quick Picks) para Powerball, Mega Millions y juegos estándar

'use client';

import React, { useState } from 'react';

export default function QuickPicks({
  lotteryName = 'Powerball',
  totalMain = 5,
  maxMain = 69,
  totalSpecial = 1,
  maxSpecial = 26,
  specialName = 'Powerball',
  specialColor = 'bg-gradient-to-br from-red-500 to-red-700 text-white'
}) {
  const [numbers, setNumbers] = useState([]);
  const [specials, setSpecials] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateRandomPicks = () => {
    setIsGenerating(true);

    setTimeout(() => {
      // Genera números principales sin duplicados
      const mainSet = new Set();
      while (mainSet.size < totalMain) {
        const rand = Math.floor(Math.random() * maxMain) + 1;
        mainSet.add(rand);
      }
      const sortedMain = Array.from(mainSet).sort((a, b) => a - b);

      // Genera bolas especiales
      const specSet = new Set();
      while (specSet.size < totalSpecial) {
        const rand = Math.floor(Math.random() * maxSpecial) + 1;
        specSet.add(rand);
      }
      const sortedSpec = Array.from(specSet).sort((a, b) => a - b);

      setNumbers(sortedMain);
      setSpecials(sortedSpec);
      setIsGenerating(false);
    }, 200);
  };

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-5 shadow-xl">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <span>🎲 Generador de Números de la Suerte (Quick Pick)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Genera números aleatorios optimizados para {lotteryName}
          </p>
        </div>

        <button
          onClick={generateRandomPicks}
          disabled={isGenerating}
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors shadow-md flex items-center gap-1.5 shrink-0"
        >
          <span>{isGenerating ? 'Generando...' : '⚡ Generar Jugada'}</span>
        </button>
      </div>

      {/* Visualización de la Jugada */}
      {numbers.length > 0 ? (
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 flex flex-wrap items-center gap-3 animate-fade-in">
          {numbers.map((num, idx) => (
            <div
              key={idx}
              className="w-11 h-11 rounded-full bg-slate-100 text-slate-950 font-black text-base flex items-center justify-center shadow-lg border border-white/60"
            >
              {num < 10 ? `0${num}` : num}
            </div>
          ))}

          {specials.length > 0 && (
            <div className="flex items-center gap-2 ml-1">
              <span className="text-slate-500 font-bold text-sm">+</span>
              {specials.map((sNum, idx) => (
                <div
                  key={idx}
                  className={`w-11 h-11 rounded-full ${specialColor} font-black text-base flex items-center justify-center shadow-lg border border-white/20`}
                  title={specialName}
                >
                  {sNum < 10 ? `0${sNum}` : sNum}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/40 text-center text-slate-500 text-xs italic">
          Haz clic en "Generar Jugada" para obtener una combinación aleatoria instantánea.
        </div>
      )}
    </div>
  );
}
