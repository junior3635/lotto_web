// src/app/[country]/[lottery]/page.js
// Página dinámica genérica enriquecida con componentes modulares:
// Header, Footer, WinningCombination, QuickPicks, PrizeTable, FaqAccordion, MobileNav

import Link from 'next/link';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';
import MobileNav from '../../../components/layout/MobileNav';
import WinningCombination from '../../../components/lottery/WinningCombination';
import PrizeTable from '../../../components/lottery/PrizeTable';
import QuickPicks from '../../../components/ui/QuickPicks';
import FaqAccordion from '../../../components/ui/FaqAccordion';
import { generateLotteryJsonLd } from '../../../lib/seo';

const MOCK_LOTTERY_DATABASE = {
  powerball: {
    name: 'Powerball',
    countryCode: 'US',
    countryName: 'Estados Unidos',
    countrySlug: 'us',
    stateOrRegion: 'Nacional (45 Estados)',
    primaryColor: '#DC2626',
    specialBallBg: 'bg-gradient-to-br from-red-500 via-red-600 to-red-800 text-white shadow-red-500/30',
    specialBallName: 'Powerball',
    hasMultiplier: true,
    multiplierName: 'Power Play',
    rulesDescription: 'Elige 5 números del 1 al 69 y 1 número Powerball del 1 al 26.',
    jackpotFormatted: '$360 MILLONES',
    nextDrawDateFormatted: 'Miércoles, 29 Jul - 10:59 PM EST',
    totalMain: 5,
    maxMain: 69,
    totalSpecial: 1,
    maxSpecial: 26,
    lastDraw: {
      drawNumber: '3912',
      drawDateFormatted: 'Lunes, 27 Jul 2026',
      winningCombination: {
        numbers: [12, 24, 35, 46, 59],
        specialBall: 9,
        specialBallName: 'Powerball',
        multiplier: '3x',
        multiplierName: 'Power Play'
      },
      prizes: [
        { categoryName: '5 Aciertos + Powerball (Jackpot)', winnersCount: 0, prizeAmountFormatted: '$360,000,000', multiplierPrizeAmountFormatted: 'N/A' },
        { categoryName: '5 Aciertos', winnersCount: 2, prizeAmountFormatted: '$1,000,000', multiplierPrizeAmountFormatted: '$2,000,000' },
        { categoryName: '4 Aciertos + Powerball', winnersCount: 18, prizeAmountFormatted: '$50,000', multiplierPrizeAmountFormatted: '$150,000' },
        { categoryName: '4 Aciertos', winnersCount: 420, prizeAmountFormatted: '$100', multiplierPrizeAmountFormatted: '$300' },
        { categoryName: '3 Aciertos + Powerball', winnersCount: 1150, prizeAmountFormatted: '$100', multiplierPrizeAmountFormatted: '$300' }
      ]
    },
    faqs: [
      {
        question: '¿Cuándo se realizan los sorteos de Powerball?',
        answer: 'Los sorteos de Powerball se realizan tres veces por semana: lunes, miércoles y sábados a las 10:59 PM hora del Este (EST).'
      },
      {
        question: '¿Hasta qué hora se pueden comprar los boletos?',
        answer: 'El horario límite para comprar boletos depende del estado, pero generalmente es entre 1 y 2 horas antes de la hora oficial del sorteo.'
      },
      {
        question: '¿Qué es el multiplicador Power Play?',
        answer: 'Power Play es una opción adicional por $1 que multiplica los premios secundarios (no el Jackpot) por 2x, 3x, 4x, 5x o hasta 10x.'
      }
    ]
  },
  'mega-millions': {
    name: 'Mega Millions',
    countryCode: 'US',
    countryName: 'Estados Unidos',
    countrySlug: 'us',
    stateOrRegion: 'Nacional (45 Estados)',
    primaryColor: '#D97706',
    specialBallBg: 'bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-black shadow-amber-500/30',
    specialBallName: 'Mega Ball',
    hasMultiplier: true,
    multiplierName: 'Megaplier',
    rulesDescription: 'Elige 5 números del 1 al 70 y 1 número Mega Ball del 1 al 25.',
    jackpotFormatted: '$280 MILLONES',
    nextDrawDateFormatted: 'Viernes, 31 Jul - 11:00 PM EST',
    totalMain: 5,
    maxMain: 70,
    totalSpecial: 1,
    maxSpecial: 25,
    lastDraw: {
      drawNumber: '2541',
      drawDateFormatted: 'Viernes, 24 Jul 2026',
      winningCombination: {
        numbers: [8, 17, 29, 41, 63],
        specialBall: 15,
        specialBallName: 'Mega Ball',
        multiplier: '4x',
        multiplierName: 'Megaplier'
      },
      prizes: [
        { categoryName: '5 Aciertos + Mega Ball (Jackpot)', winnersCount: 0, prizeAmountFormatted: '$280,000,000', multiplierPrizeAmountFormatted: 'N/A' },
        { categoryName: '5 Aciertos', winnersCount: 1, prizeAmountFormatted: '$1,000,000', multiplierPrizeAmountFormatted: '$4,000,000' },
        { categoryName: '4 Aciertos + Mega Ball', winnersCount: 12, prizeAmountFormatted: '$10,000', multiplierPrizeAmountFormatted: '$40,000' }
      ]
    },
    faqs: [
      {
        question: '¿Cuándo se realizan los sorteos de Mega Millions?',
        answer: 'Los sorteos de Mega Millions se realizan dos veces por semana: martes y viernes a las 11:00 PM hora del Este (EST).'
      }
    ]
  }
};

export async function generateMetadata({ params }) {
  const { lottery: lotterySlug } = await params;
  const lottery = MOCK_LOTTERY_DATABASE[lotterySlug] || { name: 'Lotería' };

  return {
    title: `Resultados oficiales de ${lottery.name} | Números Ganadores y Bote`,
    description: `Consulta la combinación ganadora, desglose de premios y fecha del próximo sorteo de ${lottery.name}.`,
  };
}

export default async function GenericLotteryPage({ params }) {
  const { country: countrySlug, lottery: lotterySlug } = await params;

  const lottery = MOCK_LOTTERY_DATABASE[lotterySlug] || MOCK_LOTTERY_DATABASE.powerball;
  const { lastDraw } = lottery;

  const jsonLdData = generateLotteryJsonLd({
    name: lottery.name,
    countrySlug: countrySlug,
    slug: lotterySlug,
    latestDraw: lastDraw,
    jackpotFormatted: lottery.jackpotFormatted,
    nextDrawDateFormatted: lottery.nextDrawDateFormatted
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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16 space-y-10 w-full">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <Link href={`/${countrySlug}`} className="hover:text-white flex items-center gap-1 font-bold">
            <span>← Volver a Loterías de {lottery.countryName}</span>
          </Link>
          <span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 font-mono text-amber-400">
            {lottery.stateOrRegion}
          </span>
        </div>

        {/* Lottery Hero Banner */}
        <section className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-3xl sm:text-4xl font-black text-white">{lottery.name}</h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full border border-slate-700 bg-slate-800 text-slate-300 font-bold">
                  {lottery.countryName}
                </span>
              </div>
              <p className="text-slate-400 text-xs sm:text-sm">{lottery.rulesDescription}</p>
            </div>

            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-left sm:text-right shrink-0">
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">BOTE ESTIMADO</span>
              <span className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight">{lottery.jackpotFormatted}</span>
            </div>
          </div>

          {/* Latest Winning Combination */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
              <span>Sorteo N° {lastDraw?.drawNumber} — {lastDraw?.drawDateFormatted}</span>
              <Link 
                href={`/${countrySlug}/${lotterySlug}/sorteo/${lastDraw?.drawNumber}`}
                className="text-amber-400 hover:underline font-semibold"
              >
                Ver detalle de este sorteo →
              </Link>
            </div>

            <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800 shadow-inner">
              <WinningCombination
                combination={lastDraw?.winningCombination}
                specialBallBg={lottery.specialBallBg}
                size="lg"
              />
            </div>
          </div>
        </section>

        {/* Componente Interactivo QuickPicks */}
        <QuickPicks
          lotteryName={lottery.name}
          totalMain={lottery.totalMain}
          maxMain={lottery.maxMain}
          totalSpecial={lottery.totalSpecial}
          maxSpecial={lottery.maxSpecial}
          specialName={lottery.specialBallName}
          specialColor={lottery.specialBallBg}
        />

        {/* Prize Breakdown Table Component */}
        <section className="space-y-4">
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            📊 Desglose Oficial de Premios
          </h2>
          <PrizeTable
            prizes={lastDraw?.prizes}
            hasMultiplier={lottery.hasMultiplier}
            multiplierName={lottery.multiplierName}
          />
        </section>

        {/* FAQs Component */}
        {lottery.faqs && (
          <section className="space-y-4">
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              ❓ Preguntas Frecuentes sobre {lottery.name}
            </h2>
            <FaqAccordion items={lottery.faqs} />
          </section>
        )}
      </main>

      <MobileNav currentCountry={countrySlug} />
      <Footer currentCountry={countrySlug} />
    </div>
  );
}
