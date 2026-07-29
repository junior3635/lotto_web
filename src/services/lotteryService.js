import prisma from '../lib/prisma';
import { getCache, setCache, delCache } from '../lib/redis';
import { formatJackpot, formatDateSpanish, formatCurrency } from '../lib/formatters';

const CACHE_TTL_SECONDS = 300;

export function buildWinningCombination(numbers) {
  const mains = numbers
    .filter((n) => n.category === 'MAIN')
    .sort((a, b) => a.position - b.position)
    .map((n) => parseInt(n.value, 10));

  const additionals = numbers.filter((n) => n.category === 'ADDITIONAL');
  const multipliers = numbers.filter((n) => n.category === 'MULTIPLIER');

  const result = { numbers: mains };

  if (additionals.length > 0) {
    result.specialBall = parseInt(additionals[0].value, 10) || additionals[0].value;
    result.specialBallName = additionals[0].ballType?.name || 'Bola Especial';
  }

  if (multipliers.length > 0) {
    result.multiplier = multipliers[0].value;
    result.multiplierName = multipliers[0].ballType?.name || 'Multiplicador';
  }

  return result;
}

export async function getCountryDashboardData(countrySlug = 'us') {
  const cacheKey = `lottery:country:${countrySlug}:dashboard`;

  const cachedData = await getCache(cacheKey);
  if (cachedData) {
    return { ...cachedData, _fromCache: true };
  }

  try {
    const country = await prisma.country.findUnique({
      where: { slug: countrySlug.toLowerCase() },
      include: {
        states: {
          where: { isActive: true },
          include: {
            lotteries: {
              where: { isActive: true },
              include: {
                configuration: true,
                ballTypes: true,
                draws: {
                  where: { status: 'COMPLETED' },
                  orderBy: { drawDate: 'desc' },
                  take: 1,
                  include: {
                    numbers: {
                      include: { ballType: true },
                      orderBy: [{ category: 'asc' }, { position: 'asc' }],
                    },
                    jackpotHistory: {
                      orderBy: { recordedAt: 'desc' },
                      take: 1,
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!country) return null;

    const lotteries = country.states.flatMap((state) =>
      state.lotteries.map((lottery) => {
        const lastDraw = lottery.draws[0] || null;
        const latestJackpot = lastDraw?.jackpotHistory?.[0] || null;
        const multiplierType = lottery.ballTypes?.find((bt) => bt.category === 'MULTIPLIER');
        const additionalType = lottery.ballTypes?.find((bt) => bt.category === 'ADDITIONAL');

        return {
          id: lottery.id,
          name: lottery.name,
          slug: lottery.slug,
          stateOrRegion: state.name === 'Nacional' ? null : state.name,
          primaryColor: null,
          specialBallName: additionalType?.name || null,
          specialBallBg: additionalType?.name === 'powerball'
            ? 'bg-gradient-to-br from-red-500 via-red-600 to-red-800 text-white shadow-red-500/30'
            : additionalType?.name === 'mega_ball'
            ? 'bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-black shadow-amber-500/30'
            : 'bg-red-600',
          hasMultiplier: !!multiplierType,
          multiplierName: multiplierType?.name || null,
          jackpotFormatted: latestJackpot?.nextJackpotRaw ||
                            (latestJackpot?.nextJackpotAmount ? formatJackpot(latestJackpot.nextJackpotAmount, country.currency) : '$0'),
          nextDrawDateFormatted: latestJackpot?.nextDrawDate ? formatDateSpanish(latestJackpot.nextDrawDate, true) : 'Por confirmar',
          lastDraw: lastDraw
            ? {
                id: lastDraw.id,
                drawNumber: lastDraw.drawNumber,
                drawDateFormatted: formatDateSpanish(lastDraw.drawDate),
                winningCombination: lastDraw.numbers ? buildWinningCombination(lastDraw.numbers) : null,
              }
            : null,
        };
      })
    );

    const result = {
      country: {
        code: country.code,
        name: country.name,
        slug: country.slug,
        flag: country.flagEmoji,
        currency: country.currency,
      },
      lotteries,
    };

    await setCache(cacheKey, result, CACHE_TTL_SECONDS);
    return { ...result, _fromCache: false };
  } catch (error) {
    console.error(`[LotteryService Error] Error consultando dashboard de ${countrySlug}:`, error);
    return null;
  }
}

export async function getLotteryDetailData(countrySlug, lotterySlug) {
  const cacheKey = `lottery:${countrySlug}:${lotterySlug}:detail`;

  const cachedData = await getCache(cacheKey);
  if (cachedData) {
    return { ...cachedData, _fromCache: true };
  }

  try {
    const country = await prisma.country.findUnique({
      where: { slug: countrySlug.toLowerCase() },
      include: {
        states: {
          where: { isActive: true },
          include: {
            lotteries: {
              where: { slug: lotterySlug.toLowerCase(), isActive: true },
              include: {
                configuration: true,
                ballTypes: true,
                state: { include: { country: true } },
                draws: {
                  orderBy: { drawDate: 'desc' },
                  take: 10,
                  include: {
                    numbers: {
                      include: { ballType: true },
                      orderBy: [{ category: 'asc' }, { position: 'asc' }],
                    },
                    prizes: true,
                    jackpotHistory: {
                      orderBy: { recordedAt: 'desc' },
                      take: 1,
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!country) return null;

    const allLotteries = country.states.flatMap((s) => s.lotteries);
    const lottery = allLotteries[0];
    if (!lottery) return null;

    const latestDraw = lottery.draws[0] || null;
    const historicalDraws = lottery.draws.slice(1);
    const latestJackpot = latestDraw?.jackpotHistory?.[0] || null;
    const multiplierType = lottery.ballTypes?.find((bt) => bt.category === 'MULTIPLIER');
    const additionalType = lottery.ballTypes?.find((bt) => bt.category === 'ADDITIONAL');

    const result = {
      id: lottery.id,
      name: lottery.name,
      slug: lottery.slug,
      description: null,
      primaryColor: null,
      specialBallName: additionalType?.name || 'Bola Especial',
      hasMultiplier: !!multiplierType,
      multiplierName: multiplierType?.name || null,
      configuration: lottery.configuration
        ? {
            drawnNumbers: lottery.configuration.drawnNumbers,
            selectableBalls: lottery.configuration.selectableBalls,
            minBall: lottery.configuration.minBall,
            maxBall: lottery.configuration.maxBall,
            allowZero: lottery.configuration.allowZero,
          }
        : null,
      ballTypes: (lottery.ballTypes || []).map((bt) => ({
        id: bt.id,
        name: bt.name,
        abbreviation: bt.abbreviation,
        category: bt.category,
        minBall: bt.minBall,
        maxBall: bt.maxBall,
        isString: bt.isString,
        isMultiplier: bt.isMultiplier,
        playerPicked: bt.playerPicked,
        allowedValues: bt.allowedValues,
        sortOrder: bt.sortOrder,
      })),
      country: {
        name: lottery.state.country.name,
        currency: lottery.state.country.currency,
        flag: lottery.state.country.flagEmoji,
      },
      jackpotFormatted: latestJackpot?.nextJackpotRaw ||
                        (latestJackpot?.nextJackpotAmount ? formatJackpot(latestJackpot.nextJackpotAmount, lottery.state.country.currency) : '$0'),
      nextDrawDateFormatted: latestJackpot?.nextDrawDate ? formatDateSpanish(latestJackpot.nextDrawDate, true) : 'Por confirmar',
      latestDraw: latestDraw
        ? {
            id: latestDraw.id,
            drawNumber: latestDraw.drawNumber,
            drawDateFormatted: formatDateSpanish(latestDraw.drawDate),
            winningCombination: latestDraw.numbers ? buildWinningCombination(latestDraw.numbers) : null,
            prizes: latestDraw.prizes.map((p) => ({
              categoryName: p.matchPattern,
              winnersCount: p.winnersCount || 0,
              prizeAmountFormatted: p.prizeAmountRaw || (p.prizeAmount ? formatCurrency(p.prizeAmount, lottery.state.country.currency) : '-'),
              multiplierPrizeAmountFormatted: null,
            })),
            numbers: latestDraw.numbers || [],
            rawPrizes: (latestDraw.prizes || []).map((p) => ({
              ...p,
              prizeAmount: p.prizeAmount ? Number(p.prizeAmount) : null,
            })),
            lottery: {
              ballTypes: (lottery.ballTypes || []).map((bt) => ({
                id: bt.id,
                name: bt.name,
                abbreviation: bt.abbreviation,
                category: bt.category,
                minBall: bt.minBall,
                maxBall: bt.maxBall,
                isString: bt.isString,
                isMultiplier: bt.isMultiplier,
                playerPicked: bt.playerPicked,
                allowedValues: bt.allowedValues,
                sortOrder: bt.sortOrder,
              })),
              state: {
                country: {
                  currency: lottery.state.country.currency,
                },
              },
            },
          }
        : null,
      historicalDraws: historicalDraws.map((d) => ({
        id: d.id,
        drawNumber: d.drawNumber,
        drawDateFormatted: formatDateSpanish(d.drawDate),
        winningCombination: d.numbers ? buildWinningCombination(d.numbers) : null,
        numbers: d.numbers || [],
        rawPrizes: (d.prizes || []).map((p) => ({
          ...p,
          prizeAmount: p.prizeAmount ? Number(p.prizeAmount) : null,
        })),
        lottery: {
          ballTypes: (lottery.ballTypes || []).map((bt) => ({
            id: bt.id,
            name: bt.name,
            abbreviation: bt.abbreviation,
            category: bt.category,
            minBall: bt.minBall,
            maxBall: bt.maxBall,
            isString: bt.isString,
            isMultiplier: bt.isMultiplier,
            playerPicked: bt.playerPicked,
            allowedValues: bt.allowedValues,
            sortOrder: bt.sortOrder,
          })),
          state: {
            country: {
              currency: lottery.state.country.currency,
            },
          },
        },
      })),
    };

    await setCache(cacheKey, result, CACHE_TTL_SECONDS);
    return { ...result, _fromCache: false };
  } catch (error) {
    console.error(`[LotteryService Error] Error consultando detalle de ${lotterySlug}:`, error);
    return null;
  }
}

export async function invalidateLotteryCache(countrySlug, lotterySlug) {
  await delCache(`lottery:country:${countrySlug}:dashboard`);
  await delCache(`lottery:${countrySlug}:${lotterySlug}:detail`);
}

export async function getStateLotteries(countrySlug, stateSlug) {
  const cacheKey = `lottery:${countrySlug}:state:${stateSlug}`;

  const cachedData = await getCache(cacheKey);
  if (cachedData) {
    return { ...cachedData, _fromCache: true };
  }

  try {
    const state = await prisma.state.findFirst({
      where: {
        slug: stateSlug.toLowerCase(),
        country: { slug: countrySlug.toLowerCase() },
      },
      include: {
        country: true,
        lotteries: {
          where: { isActive: true },
          include: {
            draws: {
              where: { status: 'COMPLETED' },
              orderBy: { drawDate: 'desc' },
              take: 1,
              include: {
                numbers: {
                  include: { ballType: true },
                  orderBy: [{ category: 'asc' }, { position: 'asc' }],
                },
                jackpotHistory: {
                  orderBy: { recordedAt: 'desc' },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    if (!state) return null;

    const lotteries = state.lotteries.map((lottery) => {
      const lastDraw = lottery.draws[0] || null;
      const latestJackpot = lastDraw?.jackpotHistory?.[0] || null;

      return {
        id: lottery.id,
        name: lottery.name,
        slug: lottery.slug,
        stateOrRegion: state.name === 'Nacional' ? null : `Exclusiva de ${state.name}`,
        primaryColor: null,
        specialBallBg: 'bg-red-600',
        jackpotFormatted: latestJackpot?.nextJackpotRaw ||
                          (latestJackpot?.nextJackpotAmount ? formatJackpot(latestJackpot.nextJackpotAmount, state.country.currency) : '$0'),
        nextDrawDateFormatted: latestJackpot?.nextDrawDate ? formatDateSpanish(latestJackpot.nextDrawDate, true) : 'Por confirmar',
        lastDraw: lastDraw
          ? {
              id: lastDraw.id,
              drawNumber: lastDraw.drawNumber,
              drawDateFormatted: formatDateSpanish(lastDraw.drawDate),
              winningCombination: lastDraw.numbers ? buildWinningCombination(lastDraw.numbers) : null,
            }
          : null,
      };
    });

    const result = {
      state: {
        name: state.name,
        code: state.code,
        slug: state.slug,
        icon: null,
        description: `Resultados oficiales y botes acumulados de las loterías que se juegan en el estado de ${state.name}.`,
        country: {
          name: state.country.name,
          slug: state.country.slug,
          flag: state.country.flagEmoji,
        },
      },
      lotteries,
    };

    await setCache(cacheKey, result, CACHE_TTL_SECONDS);
    return { ...result, _fromCache: false };
  } catch (error) {
    console.error(`[LotteryService Error] Error consultando estado ${stateSlug}:`, error);
    return null;
  }
}

export async function getDrawDetail(countrySlug, lotterySlug, drawId) {
  const cacheKey = `lottery:draw:${drawId}`;

  const cachedData = await getCache(cacheKey);
  if (cachedData) {
    return { ...cachedData, _fromCache: true };
  }

  try {
    const draw = await prisma.draw.findUnique({
      where: { id: drawId },
      include: {
        lottery: {
          include: {
            state: { include: { country: true } },
            ballTypes: true,
          },
        },
        numbers: {
          include: { ballType: true },
          orderBy: [{ category: 'asc' }, { position: 'asc' }],
        },
        prizes: true,
        jackpotHistory: {
          orderBy: { recordedAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!draw) return null;

    const jackpot = draw.jackpotHistory?.[0] || null;
    const multiplierType = draw.lottery.ballTypes?.find((bt) => bt.category === 'MULTIPLIER');

    return {
      ...draw,
      _fromCache: false,
      lotteryName: draw.lottery.name,
      lotterySlug: draw.lottery.slug,
      countrySlug: draw.lottery.state.country.slug,
      countryName: draw.lottery.state.country.name,
      specialBallBg: 'bg-gradient-to-br from-red-500 via-red-600 to-red-800 text-white shadow-red-500/30',
      jackpotFormatted: jackpot?.jackpotRaw || (jackpot?.jackpotAmount ? formatJackpot(jackpot.jackpotAmount, draw.lottery.state.country.currency) : '$0'),
      nextJackpotFormatted: jackpot?.nextJackpotRaw || (jackpot?.nextJackpotAmount ? formatJackpot(jackpot.nextJackpotAmount, draw.lottery.state.country.currency) : '$0'),
      nextDrawDateFormatted: jackpot?.nextDrawDate ? formatDateSpanish(jackpot.nextDrawDate, true) : 'Por confirmar',
      drawDateFormatted: formatDateSpanish(draw.drawDate),
      winningCombination: draw.numbers ? buildWinningCombination(draw.numbers) : null,
      prizes: draw.prizes.map((p) => ({
        categoryName: p.matchPattern,
        winnersCount: p.winnersCount || 0,
        prizeAmountFormatted: p.prizeAmountRaw || (p.prizeAmount ? formatCurrency(p.prizeAmount, draw.lottery.state.country.currency) : '-'),
        multiplierPrizeAmountFormatted: null,
      })),
    };
  } catch (error) {
    console.error(`[LotteryService Error] Error consultando sorteo ${drawId}:`, error);
    return null;
  }
}
