// src/services/lotteryService.js
// Capa de Servicio Genérica de Loterías con Integración de Prisma ORM + Redis Cache (Sub-50ms)

import prisma from '../lib/prisma';
import { getCache, setCache, delCache } from '../lib/redis';
import { formatJackpot, formatDateSpanish, formatCurrency } from '../lib/formatters';

const CACHE_TTL_SECONDS = 300; // 5 Minutos de caché para máximo rendimiento SEO

/**
 * Obtiene todas las loterías activas y su último resultado para un país específico
 * @param {string} countrySlug - Slug del país ("us", "es", "mx", etc.)
 * @returns {Promise<Object>}
 */
export async function getCountryDashboardData(countrySlug = 'us') {
  const cacheKey = `lottery:country:${countrySlug}:dashboard`;

  // 1. Intentar responder desde Redis (Sub-10ms)
  const cachedData = await getCache(cacheKey);
  if (cachedData) {
    return { ...cachedData, _fromCache: true };
  }

  try {
    // 2. Consulta en BD mediante Prisma (Cache Miss)
    const country = await prisma.country.findUnique({
      where: { slug: countrySlug.toLowerCase() },
      include: {
        lotteries: {
          where: { isActive: true },
          include: {
            draws: {
              where: { status: 'COMPLETED' },
              orderBy: { drawDate: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    if (!country) return null;

    // 3. Transformación y formateo de datos genéricos
    const formattedLotteries = country.lotteries.map((lottery) => {
      const lastDraw = lottery.draws[0] || null;

      return {
        id: lottery.id,
        name: lottery.name,
        slug: lottery.slug,
        primaryColor: lottery.primaryColor || '#DC2626',
        specialBallBg: lottery.specialColor || 'bg-red-600',
        specialBallName: lottery.specialBallName || 'Bola Especial',
        hasMultiplier: lottery.hasMultiplier,
        multiplierName: lottery.multiplierName,

        // Jackpot estimado y fecha
        jackpotFormatted: lastDraw?.nextJackpotFormatted || 
                          (lastDraw?.nextEstimatedJackpot ? formatJackpot(lastDraw.nextEstimatedJackpot, country.currency) : '$0'),
        nextDrawDateFormatted: lastDraw?.nextDrawDate ? formatDateSpanish(lastDraw.nextDrawDate, true) : 'Por confirmar',

        // Datos del último sorteo
        lastDraw: lastDraw ? {
          id: lastDraw.id,
          drawNumber: lastDraw.drawNumber,
          drawDateFormatted: formatDateSpanish(lastDraw.drawDate),
          winningCombination: lastDraw.winningCombination, // JSON nativo de MySQL
        } : null,
      };
    });

    const result = {
      country: {
        code: country.code,
        name: country.name,
        slug: country.slug,
        flag: country.flagEmoji,
        currency: country.currency,
      },
      lotteries: formattedLotteries,
    };

    // 4. Guardar en Redis para las próximas peticiones
    await setCache(cacheKey, result, CACHE_TTL_SECONDS);

    return { ...result, _fromCache: false };
  } catch (error) {
    console.error(`[LotteryService Error] Error consultando dashboard de ${countrySlug}:`, error);
    return null;
  }
}

/**
 * Obtiene el detalle de una lotería específica por país y slug de lotería
 * @param {string} countrySlug - "us", "es", etc.
 * @param {string} lotterySlug - "powerball", "mega-millions", "euromillones", etc.
 * @returns {Promise<Object>}
 */
export async function getLotteryDetailData(countrySlug, lotterySlug) {
  const cacheKey = `lottery:${countrySlug}:${lotterySlug}:detail`;

  const cachedData = await getCache(cacheKey);
  if (cachedData) {
    return { ...cachedData, _fromCache: true };
  }

  try {
    const lottery = await prisma.lottery.findFirst({
      where: {
        slug: lotterySlug.toLowerCase(),
        country: { slug: countrySlug.toLowerCase() },
      },
      include: {
        country: true,
        draws: {
          orderBy: { drawDate: 'desc' },
          take: 10, // Obtiene el sorteo actual + 9 históricos para la página de detalle
          include: {
            prizes: true,
          },
        },
      },
    });

    if (!lottery) return null;

    const latestDraw = lottery.draws[0] || null;
    const historicalDraws = lottery.draws.slice(1);

    const result = {
      id: lottery.id,
      name: lottery.name,
      slug: lottery.slug,
      description: lottery.description,
      primaryColor: lottery.primaryColor,
      specialBallName: lottery.specialBallName,
      hasMultiplier: lottery.hasMultiplier,
      multiplierName: lottery.multiplierName,
      country: {
        name: lottery.country.name,
        currency: lottery.country.currency,
        flag: lottery.country.flagEmoji,
      },
      jackpotFormatted: latestDraw?.nextJackpotFormatted || 
                        (latestDraw?.nextEstimatedJackpot ? formatJackpot(latestDraw.nextEstimatedJackpot, lottery.country.currency) : '$0'),
      nextDrawDateFormatted: latestDraw?.nextDrawDate ? formatDateSpanish(latestDraw.nextDrawDate, true) : 'Por confirmar',
      latestDraw: latestDraw ? {
        id: latestDraw.id,
        drawNumber: latestDraw.drawNumber,
        drawDateFormatted: formatDateSpanish(latestDraw.drawDate),
        winningCombination: latestDraw.winningCombination,
        prizes: latestDraw.prizes.map((p) => ({
          categoryName: p.categoryName,
          winnersCount: p.winnersCount,
          prizeAmountFormatted: formatCurrency(p.prizeAmount, lottery.country.currency),
          multiplierPrizeAmountFormatted: p.multiplierPrizeAmount ? formatCurrency(p.multiplierPrizeAmount, lottery.country.currency) : null,
        })),
      } : null,
      historicalDraws: historicalDraws.map((d) => ({
        id: d.id,
        drawNumber: d.drawNumber,
        drawDateFormatted: formatDateSpanish(d.drawDate),
        winningCombination: d.winningCombination,
      })),
    };

    await setCache(cacheKey, result, CACHE_TTL_SECONDS);

    return { ...result, _fromCache: false };
  } catch (error) {
    console.error(`[LotteryService Error] Error consultando detalle de ${lotterySlug}:`, error);
    return null;
  }
}

/**
 * Invalida la caché de Redis cuando un Webhook/Scraper inserta un nuevo sorteo
 * @param {string} countrySlug
 * @param {string} lotterySlug
 */
export async function invalidateLotteryCache(countrySlug, lotterySlug) {
  await delCache(`lottery:country:${countrySlug}:dashboard`);
  await delCache(`lottery:${countrySlug}:${lotterySlug}:detail`);
}
