// src/app/[country]/[lottery]/sorteo/[drawId]/page.js
// Ruta dinámica modular para la página individual de un Sorteo Histórico (SEO de larga cola)

import Link from 'next/link';
import Header from '../../../../../components/layout/Header';
import Footer from '../../../../../components/layout/Footer';
import MobileNav from '../../../../../components/layout/MobileNav';
import WinningCombination from '../../../../../components/lottery/WinningCombination';
import PrizeTable from '../../../../../components/lottery/PrizeTable';
import { generateLotteryJsonLd } from '../../../../../lib/seo';

// Mock de base de datos de sorteos individuales
const MOCK_DRAWS_DATABASE = {
  '3912': {
    id: '3912',
    drawNumber: '3912',
    lotterySlug: 'powerball',
    lotteryName: 'Powerball',
    countrySlug: 'us',
    countryName: 'Estados Unidos',
    drawDateFormatted: 'Lunes, 27 de Julio de 2026',
    specialBallBg: 'bg-gradient-to-br from-red-500 via-red-600 to-red-800 text-white shadow-red-500/30',
    hasWinner: false,
    jackpotFormatted: '$340 MILLONES',
    nextJackpotFormatted: '$360 MILLONES',
    nextDrawDateFormatted: 'Miércoles, 29 de Julio de 2026',
    winningCombination: {
      numbers: [12, 24, 35, 46, 59],
      specialBall: 9,
      specialBallName: 'Powerball',
      multiplier: '3x',
      multiplierName: 'Power Play'
    },
    prizes: [
      { categoryName: '5 Aciertos + Powerball (Jackpot)', winnersCount: 0, prizeAmountFormatted: '$340,000,000', multiplierPrizeAmountFormatted: 'N/A' },
      { categoryName: '5 Aciertos', winnersCount: 2, prizeAmountFormatted: '$1,000,000', multiplierPrizeAmountFormatted: '$2,000,000' },
      { categoryName: '4 Aciertos + Powerball', winnersCount: 18, prizeAmountFormatted: '$50,000', multiplierPrizeAmountFormatted: '$150,000' },
      { categoryName: '4 Aciertos', winnersCount: 420, prizeAmountFormatted: '$100', multiplierPrizeAmountFormatted: '$300' },
      { categoryName: '3 Aciertos + Powerball', winnersCount: 1150, prizeAmountFormatted: '$100', multiplierPrizeAmountFormatted: '$300' },
      { categoryName: '3 Aciertos', winnersCount: 24500, prizeAmountFormatted: '$7', multiplierPrizeAmountFormatted: '$21' },
      { categoryName: '2 Aciertos + Powerball', winnersCount: 21000, prizeAmountFormatted: '$7', multiplierPrizeAmountFormatted: '$21' },
      { categoryName: '1 Acierto + Powerball', winnersCount: 145000, prizeAmountFormatted: '$4', multiplierPrizeAmountFormatted: '$12' },
      { categoryName: 'Solo Powerball', winnersCount: 320000, prizeAmountFormatted: '$4', multiplierPrizeAmountFormatted: '$12' }
    ]
  },
  '2541': {
    id: '2541',
    drawNumber: '2541',
    lotterySlug: 'mega-millions',
    lotteryName: 'Mega Millions',
    countrySlug: 'us',
    countryName: 'Estados Unidos',
    drawDateFormatted: 'Viernes, 24 de Julio de 2026',
    specialBallBg: 'bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-black shadow-amber-500/30',
    hasWinner: false,
    jackpotFormatted: '$260 MILLONES',
    nextJackpotFormatted: '$280 MILLONES',
    nextDrawDateFormatted: 'Viernes, 31 de Julio de 2026',
    winningCombination: {
      numbers: [8, 17, 29, 41, 63],
      specialBall: 15,
      specialBallName: 'Mega Ball',
      multiplier: '4x',
      multiplierName: 'Megaplier'
    },
    prizes: [
      { categoryName: '5 Aciertos + Mega Ball (Jackpot)', winnersCount: 0, prizeAmountFormatted: '$260,000,000', multiplierPrizeAmountFormatted: 'N/A' },
      { categoryName: '5 Aciertos', winnersCount: 1, prizeAmountFormatted: '$1,000,000', multiplierPrizeAmountFormatted: '$4,000,000' },
      { categoryName: '4 Aciertos + Mega Ball', winnersCount: 12, prizeAmountFormatted: '$10,000', multiplierPrizeAmountFormatted: '$40,000' }
    ]
  }
};

export async function generateMetadata({ params }) {
  const { lottery: lotterySlug, drawId } = await params;
  const draw = MOCK_DRAWS_DATABASE[drawId] || { lotteryName: lotterySlug, drawNumber: drawId };

  return {
    title: `Resultados ${draw.lotteryName} del ${draw.drawDateFormatted || drawId} | Sorteo N° ${draw.drawNumber}`,
    description: `Verifica los números ganadores del sorteo N° ${draw.drawNumber} de ${draw.lotteryName}. Desglose de premios y ganadores.`,
  };
}

export default async function DrawDetailPage({ params }) {
  const { country: countrySlug, lottery: lotterySlug, drawId } = await params;
  const draw = MOCK_DRAWS_DATABASE[drawId] || MOCK_DRAWS_DATABASE['3912'];

  const jsonLdData = generateLotteryJsonLd({
    name: draw.lotteryName,
    countrySlug: countrySlug,
    slug: lotterySlug,
    latestDraw: {
      drawNumber: draw.drawNumber,
      drawDateFormatted: draw.drawDateFormatted
    },
    jackpotFormatted: draw.jackpotFormatted,
    nextDrawDateFormatted: draw.nextDrawDateFormatted
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased flex flex-col justify-between pb-16 md:pb-0">
      {/* Schema Structured Data para SEO */}
      {jsonLdData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
        />
      )}

      <Header currentCountry={countrySlug} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 space-y-8 w-full">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <Link href={`/${countrySlug}/${lotterySlug}`} className="hover:text-white flex items-center gap-1 font-bold">
            <span>← Volver a todos los resultados de {draw.lotteryName}</span>
          </Link>
          <span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 font-mono text-amber-400">
            Sorteo #{draw.drawNumber}
          </span>
        </div>

        {/* Draw Header Hero */}
        <section className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>SORTEO OFICIAL CONFIRMADO</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {draw.lotteryName} — Sorteo N° {draw.drawNumber}
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm font-medium">
                {draw.drawDateFormatted}
              </p>
            </div>

            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-left sm:text-right shrink-0">
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">
                BOTE EN JUEGO
              </span>
              <span className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight">
                {draw.jackpotFormatted}
              </span>
            </div>
          </div>

          {/* Combination Component */}
          <div className="space-y-3">
            <h2 className="text-xs font-black uppercase text-slate-400 tracking-wider">
              Combinación Ganadora Oficial
            </h2>
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 shadow-inner">
              <WinningCombination
                combination={draw.winningCombination}
                specialBallBg={draw.specialBallBg}
                size="lg"
              />
            </div>
          </div>

          {/* Rollover / Winner Status Banner */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-base">🔥</span>
              <div>
                <p className="font-bold text-white">
                  {draw.hasWinner ? '¡Hubo Ganador del Jackpot!' : 'El Bote se Acumuló (Rollover)'}
                </p>
                <p className="text-slate-400 text-[11px]">
                  {draw.hasWinner ? 'El premio mayor fue reclamado.' : `Próximo acumulado estimado: ${draw.nextJackpotFormatted}`}
                </p>
              </div>
            </div>

            <div className="text-slate-400 text-[11px]">
              Próximo Sorteo: <span className="text-emerald-400 font-bold">{draw.nextDrawDateFormatted}</span>
            </div>
          </div>
        </section>

        {/* Prize Breakdown Table Component */}
        <section className="space-y-4">
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            📊 Tabla de Ganadores y Premios
          </h2>
          <PrizeTable
            prizes={draw.prizes}
            hasMultiplier={true}
            multiplierName={draw.winningCombination?.multiplierName || 'Multiplicador'}
          />
        </section>
      </main>

      <MobileNav currentCountry={countrySlug} />
      <Footer currentCountry={countrySlug} />
    </div>
  );
}
