import { notFound } from 'next/navigation';
import Link from 'next/link';
import Header from '../../../../../components/layout/Header';
import Footer from '../../../../../components/layout/Footer';
import MobileNav from '../../../../../components/layout/MobileNav';
import WinningCombination from '../../../../../components/lottery/WinningCombination';
import PrizeTable from '../../../../../components/lottery/PrizeTable';
import { generateLotteryJsonLd } from '../../../../../lib/seo';
import { getDrawDetail } from '../../../../../services/lotteryService';

export const revalidate = 300;

export async function generateMetadata({ params }) {
  const { lottery: lotterySlug, drawId } = await params;
  const draw = await getDrawDetail(params.country, lotterySlug, drawId);

  if (!draw) {
    return { title: 'Sorteo no encontrado | LottoHQ' };
  }

  return {
    title: `Resultados ${draw.lotteryName} del ${draw.drawDateFormatted} | Sorteo N° ${draw.drawNumber}`,
    description: `Verifica los números ganadores del sorteo N° ${draw.drawNumber} de ${draw.lotteryName}. Desglose de premios y ganadores.`,
  };
}

export default async function DrawDetailPage({ params }) {
  const { country: countrySlug, lottery: lotterySlug, drawId } = await params;
  const draw = await getDrawDetail(countrySlug, lotterySlug, drawId);

  if (!draw) {
    notFound();
  }

  const jsonLdData = generateLotteryJsonLd({
    name: draw.lotteryName,
    countrySlug,
    slug: lotterySlug,
    latestDraw: draw,
    jackpotFormatted: draw.jackpotFormatted,
    nextDrawDateFormatted: draw.nextDrawDateFormatted,
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased flex flex-col justify-between pb-16 md:pb-0">
      {jsonLdData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
        />
      )}

      <Header currentCountry={countrySlug} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 space-y-8 w-full">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <Link href={`/${countrySlug}/${lotterySlug}`} className="hover:text-white flex items-center gap-1 font-bold">
            <span>← Volver a todos los resultados de {draw.lotteryName}</span>
          </Link>
          <span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 font-mono text-amber-400">
            Sorteo #{draw.drawNumber}
          </span>
        </div>

        {draw._fromCache && (
          <p className="text-[10px] text-slate-600 text-right -mt-6">
            ⚡ Datos desde caché · Actualización cada 5 min
          </p>
        )}

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

        <section className="space-y-4">
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            📊 Tabla de Ganadores y Premios
          </h2>
          <PrizeTable
            prizes={draw.prizes}
            hasMultiplier={draw.winningCombination?.multiplier != null}
            multiplierName={draw.winningCombination?.multiplierName || 'Multiplicador'}
          />
        </section>
      </main>

      <MobileNav currentCountry={countrySlug} />
      <Footer currentCountry={countrySlug} />
    </div>
  );
}
