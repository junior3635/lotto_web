import { notFound } from 'next/navigation';
import Link from 'next/link';
import prisma from '../../lib/prisma';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import MobileNav from '../../components/layout/MobileNav';
import JackpotHero from '../../components/lottery/JackpotHero';
import LotteryCard from '../../components/lottery/LotteryCard';
import StateGrid from '../../components/lottery/StateGrid';
import { getCountryDashboardData } from '../../services/lotteryService';

export const revalidate = 300;

const STATE_ICONS = {
  florida: '🌴',
  texas: '🤠',
  california: '🌊',
  'new-york': '🗽',
  georgia: '🍑',
  illinois: '🏙️',
  alabama: '🌺',
};

export async function generateMetadata({ params }) {
  const { country: countrySlug } = await params;
  const data = await getCountryDashboardData(countrySlug);

  if (!data) {
    return { title: 'País no encontrado | LottoHQ' };
  }

  const { country } = data;
  return {
    title: `Resultados de Lotería en ${country.name} ${country.flag} | LottoHQ`,
    description: `Consulta los números ganadores en tiempo real del Powerball, Mega Millions y todas las loterías de ${country.name}. Botes actualizados, desglose de premios y sorteos históricos.`,
  };
}

export default async function CountryHomePage({ params }) {
  const { country: countrySlug } = await params;

  const data = await getCountryDashboardData(countrySlug);

  if (!data) {
    notFound();
  }

  const { country, lotteries } = data;

  const topTwo = lotteries.slice(0, 2);
  const totalJackpotLabel = topTwo.length > 0
    ? topTwo.map((l) => l.jackpotFormatted).join(' + ')
    : 'Por confirmar';

  const states = await prisma.state.findMany({
    where: {
      country: { slug: countrySlug },
      isActive: true,
      code: { not: 'NAT' },
    },
    select: { name: true, slug: true },
    orderBy: { name: 'asc' },
  });

  const statesWithIcons = states.map((s) => ({
    name: s.name,
    slug: s.slug,
    icon: STATE_ICONS[s.slug] || '🏛️',
    lotteries: [],
  }));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased flex flex-col justify-between pb-16 md:pb-0">
      <Header currentCountry={countrySlug} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 space-y-12 w-full">

        <JackpotHero
          title="Resultados Oficiales de"
          highlightText={`${country.flag} ${country.name}`}
          description={`Revisa los números ganadores en tiempo real, botes acumulados y desglose de premios de todas las loterías de ${country.name}.`}
          jackpotAmount={totalJackpotLabel}
          jackpotLabel="BOTES ACUMULADOS"
          badgeText={`${country.flag} LOTTERY LIVE RESULTS`}
        />

        {data._fromCache && (
          <p className="text-[10px] text-slate-600 text-right -mt-8">
            ⚡ Datos desde caché · Actualización cada 5 min
          </p>
        )}

        {lotteries.length > 0 ? (
          <section className="space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  🔥 Loterías Disponibles
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Resultados oficiales actualizados en tiempo real
                </p>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 font-bold">
                {lotteries.length} Activas
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {lotteries.map((lottery) => (
                <LotteryCard key={lottery.id} lottery={lottery} countrySlug={countrySlug} />
              ))}
            </div>
          </section>
        ) : (
          <section className="rounded-2xl bg-slate-900/40 border border-slate-800 p-12 text-center">
            <p className="text-slate-400 text-sm">
              No hay loterías activas disponibles para {country.name} en este momento.
            </p>
          </section>
        )}

        {statesWithIcons.length > 0 && (
          <StateGrid
            states={statesWithIcons}
            countrySlug={countrySlug}
          />
        )}

        <section className="rounded-2xl bg-slate-900/40 border border-slate-800/60 p-6 sm:p-8 space-y-4 text-xs sm:text-sm text-slate-400 leading-relaxed">
          <h3 className="text-base font-bold text-slate-200">
            ¿Cómo verificar los resultados oficiales de la lotería de {country.name}?
          </h3>
          <p>
            En <strong>LottoHQ</strong> ofrecemos la consulta en tiempo real de todos los números
            ganadores de las loterías de {country.name}. Todas las combinaciones ganadoras son
            sincronizadas directamente con los canales oficiales y actualizadas automáticamente
            tras cada sorteo.
          </p>
        </section>
      </main>

      <MobileNav currentCountry={countrySlug} />
      <Footer currentCountry={countrySlug} />
    </div>
  );
}
