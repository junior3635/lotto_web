// src/app/[country]/page.js
// Dashboard Principal 100% Modular y Reutilizable con componentes aislados

import Link from 'next/link';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import MobileNav from '../../components/layout/MobileNav';
import JackpotHero from '../../components/lottery/JackpotHero';
import LotteryCard from '../../components/lottery/LotteryCard';
import StateGrid from '../../components/lottery/StateGrid';

const MOCK_COUNTRY_DATA = {
  us: {
    name: 'Estados Unidos',
    code: 'US',
    flag: '🇺🇸',
    currency: 'USD',
    totalCombinedJackpot: '$640 MILLONES',
    featuredLotteries: [
      {
        id: 'powerball',
        name: 'Powerball',
        slug: 'powerball',
        stateOrRegion: 'Nacional (45 Estados)',
        primaryColor: '#DC2626',
        specialBallBg: 'bg-gradient-to-br from-red-500 via-red-600 to-red-800 text-white shadow-red-500/30',
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
        id: 'mega-millions',
        name: 'Mega Millions',
        slug: 'mega-millions',
        stateOrRegion: 'Nacional (45 Estados)',
        primaryColor: '#D97706',
        specialBallBg: 'bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-black shadow-amber-500/30',
        jackpotFormatted: '$280 MILLONES',
        nextDrawDateFormatted: 'Viernes, 31 Jul - 11:00 PM EST',
        lastDraw: {
          drawNumber: '2541',
          drawDateFormatted: 'Viernes, 24 Jul 2026',
          winningCombination: {
            numbers: [8, 17, 29, 41, 63],
            specialBall: 15,
            specialBallName: 'Mega Ball',
            multiplier: '4x',
            multiplierName: 'Megaplier'
          }
        }
      }
    ],
    states: [
      {
        name: 'Florida',
        slug: 'florida',
        icon: '🌴',
        lotteries: [
          {
            id: 'florida-lotto',
            name: 'Florida Lotto',
            slug: 'florida-lotto',
            stateOrRegion: 'Florida',
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
            stateOrRegion: 'Florida',
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
      {
        name: 'Texas',
        slug: 'texas',
        icon: '🤠',
        lotteries: [
          {
            id: 'texas-lotto',
            name: 'Lotto Texas',
            slug: 'texas-lotto',
            stateOrRegion: 'Texas',
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
    ]
  }
};

export default async function CountryHomePage({ params }) {
  const { country: countrySlug } = await params;
  const country = MOCK_COUNTRY_DATA[countrySlug] || MOCK_COUNTRY_DATA.us;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased flex flex-col justify-between pb-16 md:pb-0">
      {/* Header Global */}
      <Header currentCountry={countrySlug} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 space-y-12 w-full">
        {/* Componente Modular 1: JackpotHero */}
        <JackpotHero
          title="Resultados Oficiales de"
          highlightText={country.name}
          description="Revisa los números ganadores en tiempo real, botes acumulados gigantes y desglose de premios del Powerball, Mega Millions y loterías por estado."
          jackpotAmount={country.totalCombinedJackpot}
          jackpotLabel="BOTE COMBINADO ACTUAL"
          badgeText="🇺🇸 LOTTERY USA LIVE RESULTS"
        />

        {/* Componente Modular 2: Loterías Principales */}
        <section className="space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                🔥 Loterías Principales (Multiestatales)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Los botes más acumulados de Estados Unidos</p>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 font-bold">
              Botes Gigantes
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {country.featuredLotteries.map((lottery) => (
              <LotteryCard key={lottery.id} lottery={lottery} countrySlug={countrySlug} />
            ))}
          </div>
        </section>

        {/* Componente Modular 3: StateGrid */}
        <StateGrid states={country.states} countrySlug={countrySlug} />

        {/* Componente Modular 4: SEO Block */}
        <section className="rounded-2xl bg-slate-900/40 border border-slate-800/60 p-6 sm:p-8 space-y-4 text-xs sm:text-sm text-slate-400 leading-relaxed">
          <h3 className="text-base font-bold text-slate-200">
            ¿Cómo verificar los resultados oficiales de la lotería de Estados Unidos?
          </h3>
          <p>
            En <strong>LottoHQ</strong> ofrecemos la consulta en tiempo real de todos los números ganadores del <strong>Powerball</strong>, <strong>Mega Millions</strong> y juegos estatales de Florida, Texas y California. Todas las combinaciones son sincronizadas directamente con los canales oficiales.
          </p>
        </section>
      </main>

      {/* Navegación Flotante Móvil (MobileNav) */}
      <MobileNav currentCountry={countrySlug} />

      {/* Footer Global */}
      <Footer currentCountry={countrySlug} />
    </div>
  );
}
