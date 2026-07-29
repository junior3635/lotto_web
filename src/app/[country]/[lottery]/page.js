// src/app/[country]/[lottery]/page.js
// Página de detalle de lotería — conectada a MySQL via lotteryService + Prisma ORM
// Incluye historial visual de los últimos 10 sorteos (componente DrawHistory)

import { notFound } from 'next/navigation';
import Link from 'next/link';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';
import MobileNav from '../../../components/layout/MobileNav';
import WinningCombination from '../../../components/lottery/WinningCombination';
import PrizeTable from '../../../components/lottery/PrizeTable';
import DrawHistory from '../../../components/lottery/DrawHistory';
import QuickPicks from '../../../components/ui/QuickPicks';
import FaqAccordion from '../../../components/ui/FaqAccordion';
import NumberChecker from '../../../components/jugada/NumberChecker';
import { generateLotteryJsonLd } from '../../../lib/seo';
import { getLotteryDetailData } from '../../../services/lotteryService';

// Revalidar la página cada 5 minutos (ISR)
export const revalidate = 300;

// ─── FAQs genéricas por slugs conocidos ────────────────────────
const LOTTERY_FAQS = {
  powerball: [
    {
      question: '¿Cuándo se realizan los sorteos de Powerball?',
      answer: 'Los sorteos de Powerball se realizan tres veces por semana: lunes, miércoles y sábados a las 10:59 PM hora del Este (EST).',
    },
    {
      question: '¿Hasta qué hora se pueden comprar los boletos de Powerball?',
      answer: 'El horario límite para comprar boletos depende del estado, pero generalmente es entre 1 y 2 horas antes de la hora oficial del sorteo.',
    },
    {
      question: '¿Qué es el multiplicador Power Play?',
      answer: 'Power Play es una opción adicional por $1 que multiplica los premios secundarios (no el Jackpot) por 2x, 3x, 4x, 5x o hasta 10x cuando el jackpot es menor a $150 millones.',
    },
    {
      question: '¿Cómo se cobra el premio del Jackpot de Powerball?',
      answer: 'El ganador puede elegir entre una anualidad (pagada en 30 pagos anuales incrementales) o un pago único en efectivo (lump sum), que suele ser aproximadamente el 60% del valor anunciado antes de impuestos.',
    },
  ],
  'mega-millions': [
    {
      question: '¿Cuándo se realizan los sorteos de Mega Millions?',
      answer: 'Los sorteos de Mega Millions se realizan dos veces por semana: martes y viernes a las 11:00 PM hora del Este (EST).',
    },
    {
      question: '¿Qué es el Megaplier?',
      answer: 'El Megaplier es una opción adicional por $1 que multiplica los premios secundarios (no el Jackpot) de 2x a 5x. El multiplicador se selecciona aleatoriamente antes de cada sorteo.',
    },
    {
      question: '¿Cuántos números hay que acertar para ganar el Jackpot de Mega Millions?',
      answer: 'Para ganar el Jackpot debes acertar los 5 números principales (del 1 al 70) más el Mega Ball (del 1 al 25). La probabilidad de ganar el Jackpot es de aproximadamente 1 en 302 millones.',
    },
  ],
};

// ─── Colores especiales por slug ────────────────────────────────
const SPECIAL_BALL_STYLES = {
  powerball: 'bg-gradient-to-br from-red-500 via-red-600 to-red-800 text-white shadow-red-500/30',
  'mega-millions': 'bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-black shadow-amber-500/30',
};

export async function generateMetadata({ params }) {
  const { country: countrySlug, lottery: lotterySlug } = await params;
  const data = await getLotteryDetailData(countrySlug, lotterySlug);

  if (!data) {
    return { title: 'Lotería no encontrada | LottoHQ' };
  }

  return {
    title: `Resultados ${data.name} — Números Ganadores y Bote Acumulado | LottoHQ`,
    description: `Consulta la combinación ganadora del último sorteo de ${data.name}, el desglose oficial de premios, historial de sorteos y la fecha del próximo jackpot.`,
  };
}

export default async function GenericLotteryPage({ params }) {
  const { country: countrySlug, lottery: lotterySlug } = await params;

  // ── Obtener datos reales desde MySQL via lotteryService ──
  const lottery = await getLotteryDetailData(countrySlug, lotterySlug);

  // Si la lotería no existe en la BD, mostrar 404
  if (!lottery) {
    notFound();
  }

  const { latestDraw, historicalDraws } = lottery;
  const specialBallBg = SPECIAL_BALL_STYLES[lotterySlug] || 'bg-red-600 text-white';
  const faqs = LOTTERY_FAQS[lotterySlug] || [];

  const jsonLdData = generateLotteryJsonLd({
    name: lottery.name,
    countrySlug,
    slug: lotterySlug,
    latestDraw,
    jackpotFormatted: lottery.jackpotFormatted,
    nextDrawDateFormatted: lottery.nextDrawDateFormatted,
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
            <span>← Volver a Loterías de {lottery.country.name}</span>
          </Link>
          <span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 font-mono text-amber-400">
            {lottery.country.flag} {lottery.country.name}
          </span>
        </div>

        {/* Indicador de fuente de datos */}
        {lottery._fromCache && (
          <p className="text-[10px] text-slate-600 text-right -mt-6">
            ⚡ Datos desde caché · Actualización cada 5 min
          </p>
        )}

        {/* Lottery Hero Banner */}
        <section className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-3xl sm:text-4xl font-black text-white">{lottery.name}</h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full border border-slate-700 bg-slate-800 text-slate-300 font-bold">
                  {lottery.country.name}
                </span>
              </div>
              {lottery.description && (
                <p className="text-slate-400 text-xs sm:text-sm max-w-xl">{lottery.description}</p>
              )}
            </div>

            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-left sm:text-right shrink-0">
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">
                BOTE ESTIMADO
              </span>
              <span className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight">
                {lottery.jackpotFormatted}
              </span>
              {lottery.nextDrawDateFormatted && (
                <p className="text-[10px] text-slate-500 mt-1">{lottery.nextDrawDateFormatted}</p>
              )}
            </div>
          </div>

          {/* Último Sorteo — Combinación Ganadora */}
          {latestDraw ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
                <span>
                  Sorteo N° {latestDraw.drawNumber} — {latestDraw.drawDateFormatted}
                </span>
                <Link
                  href={`/${countrySlug}/${lotterySlug}/sorteo/${latestDraw.id}`}
                  className="text-amber-400 hover:underline font-semibold"
                >
                  Ver detalle completo →
                </Link>
              </div>

              <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800 shadow-inner">
                <WinningCombination
                  combination={latestDraw.winningCombination}
                  specialBallBg={specialBallBg}
                  size="lg"
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-slate-500 text-sm">
              No hay resultados disponibles aún para este sorteo.
            </div>
          )}
        </section>

        {/* QuickPicks Interactivo */}
        <QuickPicks
          lotteryName={lottery.name}
          totalMain={5}
          maxMain={lottery.slug === 'mega-millions' ? 70 : 69}
          totalSpecial={1}
          maxSpecial={lottery.slug === 'mega-millions' ? 25 : 26}
          specialName={lottery.specialBallName || 'Bola Especial'}
          specialColor={specialBallBg}
        />

        {/* Consulta tus Números */}
        <section className="space-y-4">
          <h2 className="text-xl font-black text-white tracking-tight">🔍 Consulta tus Números</h2>
          <NumberChecker
            lotteryName={lottery.name}
            ballTypes={lottery.ballTypes}
            configuration={lottery.configuration}
            draws={[latestDraw, ...historicalDraws].filter(Boolean)}
          />
        </section>

        {/* Desglose de Premios */}
        {latestDraw?.prizes?.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              📊 Desglose Oficial de Premios
            </h2>
            <PrizeTable
              prizes={latestDraw.prizes}
              hasMultiplier={lottery.hasMultiplier}
              multiplierName={lottery.multiplierName}
            />
          </section>
        )}

        {/* ── HISTORIAL DE SORTEOS (Sección Nueva) ── */}
        {historicalDraws && historicalDraws.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div>
                <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                  📅 Historial de Sorteos
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Últimos {historicalDraws.length} sorteos registrados de {lottery.name}
                </p>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400 font-bold">
                {historicalDraws.length} sorteos
              </span>
            </div>

            <DrawHistory
              draws={historicalDraws}
              countrySlug={countrySlug}
              lotterySlug={lotterySlug}
              specialBallBg={specialBallBg}
            />
          </section>
        )}

        {/* FAQs */}
        {faqs.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              ❓ Preguntas Frecuentes sobre {lottery.name}
            </h2>
            <FaqAccordion items={faqs} />
          </section>
        )}
      </main>

      <MobileNav currentCountry={countrySlug} />
      <Footer currentCountry={countrySlug} />
    </div>
  );
}
