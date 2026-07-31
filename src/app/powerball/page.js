import { notFound } from 'next/navigation';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import MobileNav from '../../components/layout/MobileNav';
import JackpotHero from '../../components/lottery/JackpotHero';
import LotteryCard from '../../components/lottery/LotteryCard';
import StateGrid from '../../components/lottery/StateGrid';
import { getLotteryDashboardData } from '../../services/lotteryService';
import { buildWinningCombination } from '../../services/lotteryService';
import { formatJackpot, formatDateSpanish } from '../../lib/formatters';

export const revalidate = 300;

export async function generateMetadata() {
  return {
    title: `Powerball — Resultados y Bote Acumulado en Vivo | LottoHQ`,
    description: `Consulta los números ganadores del Powerball en tiempo real. Botes acumulados, desglose de premios y sorteos históricos de la lotería multistatal Powerball.`,
  };
}

export default async function PowerballPage() {
  const data = await getLotteryDashboardData('Powerball');

  if (!data || data.lotteries.length === 0) {
    notFound();
  }

  const { lotteries } = data;

  const topTwo = lotteries.slice(0, 2);
  const totalJackpotLabel = topTwo.length > 0
    ? topTwo.map((l) => l.jackpotFormatted).join(' + ')
    : 'Por confirmar';

  const statesWithIcons = lotteries.map((lottery) => ({
    name: lottery.stateOrRegion || lottery.countryName,
    slug: lottery.stateOrRegion ? lottery.stateOrRegion.toLowerCase().replace(/\s+/g, '-') : lottery.countryCode.toLowerCase(),
    icon: '🏛️',
    lotteries: [lottery],
  }));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased flex flex-col justify-between pb-16 md:pb-0">
      <Header currentCountry="us" />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 space-y-12 w-full">
        <JackpotHero
          title="Powerball"
          highlightText="Lotería Multistatal"
          description="Resultados oficiales del Powerball. Consulta los números ganadores, botes acumulados y desglose de premios de la lotería más grande de Estados Unidos."
          jackpotAmount={totalJackpotLabel}
          jackpotLabel="BOTE ACUMULADO"
          badgeText="POWERBALL LIVE RESULTS"
        />

        {data._fromCache && (
          <p className="text-[10px] text-slate-600 text-right -mt-8">
            ⚡ Datos desde caché · Actualización cada 5 min
          </p>
        )}

        <section className="space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                🔥 Powerball por Estado
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Resultados oficiales actualizados en tiempo real
              </p>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 font-bold">
              {lotteries.length} Sorteos Activos
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {lotteries.map((lottery) => (
              <LotteryCard key={lottery.id} lottery={lottery} countrySlug={lottery.countryCode.toLowerCase()} />
            ))}
          </div>
        </section>

        {statesWithIcons.length > 0 && (
          <StateGrid
            states={statesWithIcons}
            countrySlug="us"
          />
        )}

        <section className="rounded-2xl bg-slate-900/40 border border-slate-800 p-6 sm:p-8 space-y-4 text-xs sm:text-sm text-slate-400 leading-relaxed">
          <h3 className="text-base font-bold text-slate-200">
            ¿Cómo verificar los resultados oficiales del Powerball?
          </h3>
          <p>
            En <strong>LottoHQ</strong> ofrecemos la consulta en tiempo real de todos los números
            ganadores del Powerball. Todas las combinaciones ganadoras son
            sincronizadas directamente con los canales oficiales y actualizadas automáticamente
            tras cada sorteo.
          </p>
        </section>
      </main>

      <MobileNav currentCountry="us" />
      <Footer currentCountry="us" />
    </div>
  );
}