// src/components/lottery/WinningCombination.jsx
// Componente de combinación ganadora 100% Responsive Mobile-First con ajuste fluido de esferas

import React from 'react';

/**
 * Renderiza combinaciones de lotería adaptables a cualquier tamaño de pantalla (320px a 4K).
 * - Esferas adaptativas: w-8 h-8 en pantallas muy pequeñas, w-10 h-10 en móviles, w-12 h-12 en desktop.
 * - Flexbox con flex-wrap inteligente para evitar desbordamientos laterales (no horizontal overflow).
 *
 * @param {Object} props
 * @param {Object} props.combination - Objeto JSON con los números
 * @param {string} [props.specialBallBg] - Estilo de la bola especial
 * @param {string} [props.size] - Tamaño ('sm', 'md', 'lg')
 */
export default function WinningCombination({
  combination = {},
  specialBallBg = 'bg-gradient-to-br from-red-500 via-red-600 to-red-800 text-white shadow-red-500/30',
  size = 'md'
}) {
  const { numbers = [], specialBall, specialBalls, specialBallName, multiplier, multiplierName } = combination;

  const normalizedSpecialBalls = Array.isArray(specialBalls)
    ? specialBalls
    : typeof specialBall === 'number'
    ? [specialBall]
    : [];

  // Mapeo responsive de esferas (Mobile-First)
  const sizeClasses = {
    sm: 'w-7 h-7 sm:w-8 sm:h-8 text-xs font-extrabold',
    md: 'w-9 h-9 xs:w-10 xs:h-10 sm:w-11 sm:h-11 text-xs xs:text-sm sm:text-base font-black',
    lg: 'w-10 h-10 xs:w-11 xs:h-11 sm:w-13 sm:h-13 md:w-14 md:h-14 text-sm xs:text-base sm:text-lg md:text-xl font-black'
  }[size] || 'w-9 h-9 sm:w-11 sm:h-11 text-xs sm:text-base font-black';

  return (
    <div className="flex flex-wrap items-center gap-1.5 xs:gap-2 sm:gap-2.5 max-w-full">
      {/* 1. Esferas Principales Blancas */}
      {numbers.map((num, index) => (
        <div
          key={`main-${index}`}
          className={`${sizeClasses} shrink-0 rounded-full bg-gradient-to-b from-white to-slate-100 text-slate-950 flex items-center justify-center shadow-md border border-slate-200/80 ring-1 ring-slate-900/5 select-none transform hover:scale-105 transition-all`}
        >
          {num < 10 ? `0${num}` : num}
        </div>
      ))}

      {/* 2. Esfera Especial (Powerball / Mega Ball / Estrellas) */}
      {normalizedSpecialBalls.length > 0 && (
        <div className="flex items-center gap-1.5 sm:gap-2 ml-0.5 sm:ml-1 shrink-0">
          <span className="text-slate-400 font-bold text-xs sm:text-sm select-none">+</span>
          {normalizedSpecialBalls.map((specNum, index) => (
            <div
              key={`special-${index}`}
              className={`${sizeClasses} shrink-0 rounded-full ${specialBallBg} flex flex-col items-center justify-center shadow-lg border border-white/20 select-none transform hover:scale-105 transition-all`}
              title={specialBallName || 'Bola Especial'}
            >
              <span>{specNum < 10 ? `0${specNum}` : specNum}</span>
            </div>
          ))}
        </div>
      )}

      {/* 3. Multiplicador (Power Play / Megaplier) */}
      {multiplier && (
        <div className="w-full sm:w-auto mt-1 sm:mt-0 sm:ml-auto px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black flex items-center justify-center sm:justify-start gap-1.5 shadow-sm shrink-0">
          <span className="text-amber-500">⚡</span>
          <span className="uppercase tracking-wider text-[10px] text-amber-300">{multiplierName || 'MULTIPLIER'}:</span>
          <span className="text-white text-xs">{multiplier}</span>
        </div>
      )}
    </div>
  );
}
