'use client';

import React, { useState, useCallback } from 'react';
import { checkUserNumbers } from '../../services/jugadaService';

function clamp(value, min, max) {
  const num = parseInt(value, 10);
  if (isNaN(num)) return '';
  if (num > max) return String(max);
  if (num < min) return String(min);
  return String(num);
}

export default function NumberChecker({ lotteryName, ballTypes, configuration, draws }) {
  const specialConfig = (ballTypes || []).find((bt) => bt.category === 'ADDITIONAL' && bt.playerPicked);
  const multiplierConfig = (ballTypes || []).find((bt) => bt.category === 'MULTIPLIER' && bt.playerPicked);

  const mainCount = configuration?.selectableBalls || configuration?.drawnNumbers || 5;
  const mainMin = configuration?.minBall ?? 1;
  const mainMax = configuration?.maxBall ?? 69;
  const specialMin = specialConfig?.minBall ?? 1;
  const specialMax = specialConfig?.maxBall ?? 26;

  const [mainInputs, setMainInputs] = useState(Array(mainCount).fill(''));
  const [specialInput, setSpecialInput] = useState('');
  const [multiplierInput, setMultiplierInput] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const handleMainChange = useCallback((index, raw) => {
    setError('');
    setResults(null);
    const digitOnly = raw.replace(/\D/g, '');
    const updated = [...mainInputs];
    const currentVal = parseInt(digitOnly, 10);

    if (digitOnly === '') {
      updated[index] = '';
    } else if (!isNaN(currentVal)) {
      if (currentVal > mainMax) {
        updated[index] = String(mainMax);
      } else if (currentVal < mainMin && currentVal !== 0) {
        updated[index] = '';
      } else {
        updated[index] = digitOnly;
      }
    }

    setMainInputs(updated);
  }, [mainInputs, mainMin, mainMax]);

  const isValidInput = (value, min, max) => {
    if (value === '' || value === undefined || value === null) return false;
    const num = parseInt(value, 10);
    return !isNaN(num) && num >= min && num <= max;
  };

  const validateInputs = () => {
    const mainNums = [];
    for (let i = 0; i < mainInputs.length; i++) {
      const val = mainInputs[i];
      if (!val || val === '') {
        setError(`Completa el número principal ${i + 1}`);
        return null;
      }
      const num = parseInt(val, 10);
      if (num < mainMin || num > mainMax) {
        setError(`Número ${num} fuera del rango (${mainMin}-${mainMax})`);
        return null;
      }
      if (mainNums.includes(num)) {
        setError(`Número ${num} repetido en los principales`);
        return null;
      }
      mainNums.push(num);
    }

    let special = null;
    if (specialConfig) {
      if (!specialInput || specialInput === '') {
        setError(`Completa el número ${specialConfig.name || 'especial'}`);
        return null;
      }
      special = parseInt(specialInput, 10);
      if (special < specialMin || special > specialMax) {
        setError(`Número especial fuera del rango (${specialMin}-${specialMax})`);
        return null;
      }
    }

    let multiplier = null;
    if (multiplierConfig) {
      if (!multiplierInput || multiplierInput === '') {
        setError(`Completa el ${multiplierConfig.name || 'multiplicador'}`);
        return null;
      }
      multiplier = multiplierInput;
    }

    return { main: mainNums, special, multiplier };
  };

  const handleCheck = () => {
    setResults(null);
    setError('');

    if (!draws || draws.length === 0) {
      setError('No hay sorteos disponibles para consultar');
      return;
    }

    const parsed = validateInputs();
    if (!parsed) return;

    const allResults = draws.map((draw) => {
      const r = checkUserNumbers(parsed, draw);
      return {
        drawId: draw.id,
        drawNumber: draw.drawNumber,
        drawDateFormatted: draw.drawDateFormatted,
        winningCombination: draw.winningCombination,
        ...r,
      };
    });

    setResults(allResults);
  };

  const handleClear = () => {
    setMainInputs(Array(mainCount).fill(''));
    setSpecialInput('');
    setMultiplierInput('');
    setResults(null);
    setError('');
  };

  const winnersCount = results ? results.filter((r) => r.isWinner).length : 0;

  const ballSizeClass = 'w-10 h-10 sm:w-11 sm:h-11 text-sm sm:text-base font-black rounded-full flex items-center justify-center shadow-md border transition-all duration-300';

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-5 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <span>🔍 Consulta tus Números</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Ingresa tus números y verifica si eres ganador en los últimos {draws?.length || 0} sorteos
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-2">
            Números Principales ({mainCount} números del {mainMin} al {mainMax})
          </label>
          <div className="flex flex-wrap gap-2">
            {mainInputs.map((val, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-slate-500 font-bold">{idx + 1}</span>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={String(mainMax).length + 1}
                  value={val}
                  onChange={(e) => handleMainChange(idx, e.target.value)}
                  onFocus={(e) => e.target.select()}
                  placeholder="?"
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-slate-950 border text-center text-white font-black text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-transparent placeholder-slate-600 ${
                    val !== '' && !isValidInput(val, mainMin, mainMax)
                      ? 'border-red-500'
                      : 'border-slate-700'
                  }`}
                />
              </div>
            ))}
          </div>
        </div>

        {specialConfig && (
          <div>
            <label className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-2">
              {specialConfig.name || 'Bola Especial'} (del {specialMin} al {specialMax})
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={String(specialMax).length + 1}
              value={specialInput}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, '');
                setError('');
                setResults(null);
                if (raw === '') {
                  setSpecialInput('');
                } else {
                  const num = parseInt(raw, 10);
                  if (num > specialMax) {
                    setSpecialInput(String(specialMax));
                  } else if (num < specialMin && raw.length >= String(specialMin).length) {
                    setSpecialInput('');
                  } else {
                    setSpecialInput(raw);
                  }
                }
              }}
              onFocus={(e) => e.target.select()}
              placeholder="?"
              className={`w-16 h-14 rounded-xl bg-slate-950 border text-center text-white font-black text-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-transparent placeholder-slate-600 ${
                specialInput !== '' && !isValidInput(specialInput, specialMin, specialMax)
                  ? 'border-red-500'
                  : 'border-slate-700'
              }`}
            />
          </div>
        )}

        {multiplierConfig && (
          <div>
            <label className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-2">
              {multiplierConfig.name || 'Multiplicador'}
              {multiplierConfig.allowedValues ? ` (${multiplierConfig.allowedValues.join(', ')})` : ''}
            </label>
            {multiplierConfig.allowedValues ? (
              <div className="flex flex-wrap gap-2">
                {multiplierConfig.allowedValues.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => { setMultiplierInput(String(val)); setResults(null); setError(''); }}
                    className={`px-4 py-2 rounded-xl font-black text-sm border transition-all ${
                      multiplierInput === String(val)
                        ? 'bg-amber-500 text-slate-950 border-amber-400'
                        : 'bg-slate-950 text-slate-300 border-slate-700 hover:border-amber-500/50'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            ) : (
              <input
                type="text"
                maxLength={4}
                value={multiplierInput}
                onChange={(e) => { setMultiplierInput(e.target.value); setResults(null); setError(''); }}
                placeholder="Ej: 2"
                className="w-20 h-14 rounded-xl bg-slate-950 border border-slate-700 text-center text-white font-black text-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-transparent placeholder-slate-600"
              />
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-800/50 rounded-xl px-4 py-3">
          <p className="text-red-400 text-sm font-bold">{error}</p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={handleCheck}
          className="flex-1 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition-colors shadow-md"
        >
          Consultar Números
        </button>
        <button
          onClick={handleClear}
          className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm transition-colors border border-slate-700"
        >
          Limpiar
        </button>
      </div>

      {results && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <p className="text-sm text-slate-400 font-bold">
              Resultados en {results.length} sorteos
            </p>
            {winnersCount > 0 && (
              <span className="text-sm px-3 py-1 rounded-full bg-green-900/40 border border-green-700/50 text-green-400 font-black">
                {winnersCount} acierto{winnersCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {results.map((result, drawIdx) => (
            <div
              key={result.drawId}
              className={`rounded-xl border p-5 space-y-3 ${
                result.isWinner
                  ? 'bg-green-900/20 border-green-700/50'
                  : 'bg-slate-950/40 border-slate-800/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-lg ${result.isWinner ? '' : 'opacity-40'}`}>
                    {result.isWinner ? '🎉' : '📅'}
                  </span>
                  <div>
                    <p className="font-black text-sm text-white">
                      {result.drawDateFormatted}
                      {result.drawNumber ? ` — Sorteo N° ${result.drawNumber}` : ''}
                    </p>
                    <p className="text-xs text-slate-500">
                      {result.matchedMain} de {result.totalMain} aciertos
                      {result.matchedSpecial !== null ? ` · Especial: ${result.matchedSpecial ? '✅' : '❌'}` : ''}
                      {result.matchedMultiplier !== null ? ` · Multiplicador: ${result.matchedMultiplier ? '✅' : '❌'}` : ''}
                    </p>
                  </div>
                </div>
                {result.isWinner && (
                  <span className="text-xs font-black text-green-400 uppercase tracking-wider">Ganador</span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {result.ballResults.map((ball, idx) => (
                  <div
                    key={idx}
                    className={`${ballSizeClass} ${
                      ball.matched
                        ? 'bg-green-500 text-white border-green-400 shadow-green-500/40'
                        : 'bg-slate-800 text-slate-500 border-slate-700'
                    }`}
                    title={ball.category === 'MAIN' ? `N° ${ball.value}` : ball.category === 'ADDITIONAL' ? `${specialConfig?.name || 'Especial'}: ${ball.value}` : `${multiplierConfig?.name || 'Multiplicador'}: ${ball.value}`}
                  >
                    {ball.value < 10 ? `0${ball.value}` : ball.value}
                  </div>
                ))}
              </div>

              {result.prize && (
                <div className="bg-slate-900 rounded-xl p-4 border border-slate-700/50">
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">
                    Premio obtenido
                  </p>
                  <p className="text-xl font-black text-amber-400">{result.prize.prizeAmountFormatted}</p>
                  {result.prize.winnersCount > 0 && (
                    <p className="text-xs text-slate-500 mt-1">
                      {result.prize.winnersCount.toLocaleString()} ganador(es) en esta categoría
                    </p>
                  )}
                </div>
              )}

              {!result.isWinner && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">
                    Combinación ganadora:
                  </span>
                  {result.winningCombination?.numbers?.map((num, idx) => (
                    <div
                      key={idx}
                      className="w-7 h-7 rounded-full bg-slate-100 text-slate-950 font-black text-[10px] flex items-center justify-center"
                    >
                      {num < 10 ? `0${num}` : num}
                    </div>
                  ))}
                  {result.winningCombination?.specialBall !== undefined && (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-500 to-red-700 text-white font-black text-[10px] flex items-center justify-center">
                      {result.winningCombination.specialBall < 10 ? `0${result.winningCombination.specialBall}` : result.winningCombination.specialBall}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
