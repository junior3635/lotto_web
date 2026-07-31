import { notFound } from 'next/navigation';
import Link from 'next/link';
import Header from '../../../../components/layout/Header';
import Footer from '../../../../components/layout/Footer';
import MobileNav from '../../../../components/layout/MobileNav';
import LotteryCard from '../../../../components/lottery/LotteryCard';
import { getStateLotteries } from '../../../../services/lotteryService';

export const revalidate = 300;

export async function generateMetadata({ params }) {
  const { country: countrySlug, stateSlug } = await params;
  const data = await getStateLotteries(countrySlug, stateSlug);

  if (!data) {
    return { title: 'Estado no encontrado | LottoHQ' };
  }

  return {
    title: `Resultados de Loterías de ${data.state.name} | Números Ganadores | LottoHQ`,
    description: data.state.description,
  };
}

export default async function StateLotteriesPage({ params }) {
  const { country: countrySlug, stateSlug } = await params;
  const data = await getStateLotteries(countrySlug, stateSlug);

  if (!data) {
    notFound();
  }

  const { state, lotteries } = data;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased flex flex-col justify-between pb-16 md:pb-0">
      <Header currentCountry={countrySlug} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16 space-y-8 w-full">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <Link href={`/${countrySlug}`} className="hover:text-white flex items-center gap-1 font-bold">
            <span>← Volver a Loterías de {state.country.name}</span>
          </Link>
          <span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 font-mono text-amber-400">
            {state.name} ({state.code})
          </span>
        </div>

        <section className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-2 shadow-2xl">
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            Loterías de {state.name}
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">{state.description}</p>
        </section>

        {data._fromCache && (
          <p className="text-[10px] text-slate-600 text-right -mt-6">
            ⚡ Datos desde caché · Actualización cada 5 min
          </p>
        )}

        <section className="space-y-4">
          <h2 className="text-xl font-black text-white tracking-tight">
            🎰 Juegos Disponibles en {state.name}
          </h2>
          {lotteries.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {lotteries.map((lottery) => (
                <LotteryCard key={lottery.id} lottery={lottery} countrySlug={countrySlug} stateSlug={stateSlug} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-slate-900/40 border border-slate-800 p-12 text-center">
              <p className="text-slate-400 text-sm">
                No hay loterías activas disponibles en {state.name} en este momento.
              </p>
            </div>
          )}
        </section>
      </main>

      <MobileNav currentCountry={countrySlug} />
      <Footer currentCountry={countrySlug} />
    </div>
  );
}
