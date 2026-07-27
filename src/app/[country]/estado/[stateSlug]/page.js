// src/app/[country]/estado/[stateSlug]/page.js
// Vista dedicada por Estado/Región (ej: /us/estado/florida, /us/estado/texas) para SEO Local masivo

import Link from 'next/link';
import Header from '../../../../components/layout/Header';
import Footer from '../../../../components/layout/Footer';
import MobileNav from '../../../../components/layout/MobileNav';
import LotteryCard from '../../../../components/lottery/LotteryCard';

const MOCK_STATES_DATA = {
  florida: {
    name: 'Florida',
    code: 'FL',
    icon: '🌴',
    description: 'Resultados oficiales y botes acumulados de las loterías que se juegan en el estado de Florida.',
    lotteries: [
      {
        id: 'powerball',
        name: 'Powerball',
        slug: 'powerball',
        stateOrRegion: 'Disponible en Florida',
        primaryColor: '#DC2626',
        specialBallBg: 'bg-red-600',
        jackpotFormatted: '$360 MILLONES',
        nextDrawDateFormatted: 'Miércoles, 29 Jul - 10:59 PM EST',
        lastDraw: {
          drawNumber: '3912',
          drawDateFormatted: 'Lunes, 27 Jul 2026',
          winningCombination: {
            numbers: [12, 24, 35, 46, 59],
            specialBall: 9,
            specialBallName: 'Powerball',
            multiplier: '3x',
            multiplierName: 'Power Play'
          }
        }
      },
      {
        id: 'florida-lotto',
        name: 'Florida Lotto',
        slug: 'florida-lotto',
        stateOrRegion: 'Exclusiva de Florida',
        primaryColor: '#059669',
        specialBallBg: 'bg-emerald-600',
        jackpotFormatted: '$14.25 MILLONES',
        nextDrawDateFormatted: 'Miércoles, 29 Jul - 11:15 PM EST',
        lastDraw: {
          drawNumber: '2810',
          drawDateFormatted: 'Sábado, 25 Jul 2026',
          winningCombination: {
            numbers: [3, 14, 22, 38, 45, 52],
            multiplier: '2x',
            multiplierName: 'Double Play'
          }
        }
      },
      {
        id: 'fantasy-5-fl',
        name: 'Fantasy 5 (Florida)',
        slug: 'fantasy-5-fl',
        stateOrRegion: 'Exclusiva de Florida',
        primaryColor: '#0D9488',
        specialBallBg: 'bg-teal-600',
        jackpotFormatted: '$125,000',
        nextDrawDateFormatted: 'Hoy - 11:05 PM EST',
        lastDraw: {
          drawNumber: '9412',
          drawDateFormatted: 'Ayer, 26 Jul 2026',
          winningCombination: {
            numbers: [7, 18, 24, 31, 35]
          }
        }
      }
    ]
  },
  texas: {
    name: 'Texas',
    code: 'TX',
    icon: '🤠',
    description: 'Resultados oficiales y combinaciones ganadoras de las loterías de Texas.',
    lotteries: [
      {
        id: 'texas-lotto',
        name: 'Lotto Texas',
        slug: 'texas-lotto',
        stateOrRegion: 'Exclusiva de Texas',
        primaryColor: '#2563EB',
        specialBallBg: 'bg-blue-600',
        jackpotFormatted: '$8.75 MILLONES',
        nextDrawDateFormatted: 'Miércoles, 29 Jul - 10:12 PM CT',
        lastDraw: {
          drawNumber: '3104',
          drawDateFormatted: 'Lunes, 27 Jul 2026',
          winningCombination: {
            numbers: [7, 19, 28, 33, 44, 51],
            multiplier: '3x',
            multiplierName: 'Extra!'
          }
        }
      }
    ]
  }
};

export async function generateMetadata({ params }) {
  const { stateSlug } = await params;
  const state = MOCK_STATES_DATA[stateSlug] || { name: stateSlug };
  return {
    title: `Resultados de Loterías de ${state.name} | Números Ganadores`,
    description: `Consulta los resultados en vivo y botes acumulados de las loterías en ${state.name}.`,
  };
}

export default async function StateLotteriesPage({ params }) {
  const { country: countrySlug, stateSlug } = await params;
  const state = MOCK_STATES_DATA[stateSlug] || MOCK_STATES_DATA.florida;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased flex flex-col justify-between pb-16 md:pb-0">
      <Header currentCountry={countrySlug} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16 space-y-8 w-full">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <Link href={`/${countrySlug}`} className="hover:text-white flex items-center gap-1 font-bold">
            <span>← Volver a Loterías de EE. UU.</span>
          </Link>
          <span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 font-mono text-amber-400">
            {state.icon} {state.name} ({state.code})
          </span>
        </div>

        {/* State Banner */}
        <section className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-2 shadow-2xl">
          <div className="flex items-center gap-3">
            <span className="text-3xl sm:text-4xl">{state.icon}</span>
            <h1 className="text-3xl sm:text-4xl font-black text-white">Loterías de {state.name}</h1>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm">{state.description}</p>
        </section>

        {/* State Lotteries Grid */}
        <section className="space-y-4">
          <h2 className="text-xl font-black text-white tracking-tight">
            🎰 Juegos Disponibles en {state.name}
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {state.lotteries.map((lottery) => (
              <LotteryCard key={lottery.id} lottery={lottery} countrySlug={countrySlug} />
            ))}
          </div>
        </section>
      </main>

      <MobileNav currentCountry={countrySlug} />
      <Footer currentCountry={countrySlug} />
    </div>
  );
}
