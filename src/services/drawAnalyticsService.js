import prisma from '../lib/prisma';
import { BallCategory, DrawStatus } from '@prisma/client';

const BASE_URL = 'https://www.drawanalytics.com/api/v1';

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function apiGet(path) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`DrawAnalytics API ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

async function fetchStates() {
  const data = await apiGet('/states');
  if (!data.success || !Array.isArray(data.data)) {
    throw new Error('Invalid states response from DrawAnalytics');
  }
  return data.data;
}

async function fetchGames(stateSlug) {
  const data = await apiGet(`/${stateSlug}/games`);
  if (!data.success || !Array.isArray(data.data)) {
    throw new Error(`Invalid games response for state ${stateSlug}`);
  }
  return data.data;
}

async function fetchLatestDraw(stateSlug, gameId) {
  const data = await apiGet(`/${stateSlug}/${gameId}/latest`);
  if (!data.success || !data.data) {
    return null;
  }
  return data.data;
}

async function fetchHistoricalResults(stateSlug, gameId, startDate, endDate, limit = 100) {
  const params = new URLSearchParams({
    start_date: startDate,
    end_date: endDate,
    limit: String(limit),
    offset: '0',
  });
  const data = await apiGet(`/${stateSlug}/${gameId}/results?${params.toString()}`);
  if (!data.success || !Array.isArray(data.data)) {
    return [];
  }
  return data.data;
}

function transformLotteryNumbers(drawData) {
  const numbers = [];
  const winningNumbers = drawData.numbers || [];
  const bonusBall = drawData.bonus_ball;

  for (let i = 0; i < winningNumbers.length; i++) {
    numbers.push({
      value: String(winningNumbers[i]),
      category: BallCategory.MAIN,
      position: i + 1,
    });
  }

  if (bonusBall !== null && bonusBall !== undefined) {
    numbers.push({
      value: String(bonusBall),
      category: BallCategory.ADDITIONAL,
      position: numbers.length + 1,
    });
  }

  return numbers;
}

function transformPrizes(prizeList) {
  if (!Array.isArray(prizeList)) return [];
  return prizeList.map((p) => ({
    matchPattern: p.match,
    prizeAmountRaw: p.prize,
    prizeAmount: parsePrizeAmount(p.prize),
    winnersCount: p.winner || 0,
  }));
}

function formatJackpotRaw(val) {
  if (val == null) return null;
  const str = String(val);
  const cleaned = str.replace(/[$,\s]/g, '');
  const num = parseFloat(cleaned.replace(',', '.'));
  if (isNaN(num)) return str;
  if (num > 1_000_000) {
    const millions = num / 1_000_000;
    return `$${millions % 1 === 0 ? millions : millions.toFixed(2)} Million`;
  }
  return str;
}

function parsePrizeAmount(prizeVal) {
  if (prizeVal === null || prizeVal === undefined) return null;
  if (typeof prizeVal === 'number') return prizeVal;
  const prizeStr = String(prizeVal);
  const cleaned = prizeStr.replace(/[$,\s]/g, '');
  const num = parseFloat(cleaned);
  if (prizeStr.includes('Million') || prizeStr.includes('MILLION')) return num * 1_000_000;
  if (prizeStr.includes('Thousand') || prizeStr.includes('THOUSAND')) return num * 1_000;
  return num;
}

async function ensureStateExists(daState, results) {
  const slug = daState.slug || daState.id;
  const country = await prisma.country.upsert({
    where: { code: 'US' },
    update: {},
    create: {
      code: 'US',
      name: 'United States',
      slug: 'us',
      flagEmoji: '🏳️',
      currency: 'USD',
    },
  });

  const state = await prisma.state.upsert({
    where: { countryId_slug: { countryId: country.id, slug } },
    update: {},
    create: {
      countryId: country.id,
      name: daState.name || daState.slug,
      code: daState.abbreviation || slug.slice(0, 2).toUpperCase(),
      slug,
      taxRate: 0,
      minimumLegalAge: 18,
    },
  });

  return state;
}

async function ensureLotteryExists(state, daGame, results) {
  const gameId = daGame.id;
  const nameMap = {
    powerball: 'Powerball',
    mega_millions: 'Mega Millions',
    'mega-millions': 'Mega Millions',
    daily3: 'Daily 3',
    daily4: 'Daily 4',
    fantasy5: 'Fantasy 5',
    superlotto_plus: 'SuperLotto Plus',
    cash4life: 'Cash4Life',
    lucky_for_life: 'Lucky For Life',
    lotto_america: 'Lotto America',
    cash5: 'Cash 5',
    lotto: 'Lotto',
    pick3: 'Pick 3',
    pick4: 'Pick 4',
    play3: 'Play 3',
    play4: 'Play 4',
    multi_win_lotto: 'Multi Win Lotto',
    jackpot_triple: 'Jackpot Triple',
    pick2: 'Pick 2',
  };

  const name = nameMap[gameId] || gameId.replace(/[_-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  const lottery = await prisma.lottery.upsert({
    where: { stateId_slug: { stateId: state.id, slug: gameId } },
    update: { name },
    create: {
      stateId: state.id,
      name,
      slug: gameId,
      mainDrawName: null,
      isActive: true,
    },
  });

  return lottery;
}

async function upsertDraw(lottery, drawData) {
  const drawNumber = String(drawData.draw_number);
  const drawDate = new Date(drawData.draw_date);
  const externalDrawId = drawData.draw_number;

  const existingDraw = await prisma.draw.findFirst({
    where: {
      lotteryId: lottery.id,
      OR: [
        { externalDrawId },
        { drawDate: { equals: drawDate }, drawNumber },
      ],
    },
  });

  const numbers = drawData.numbers
    ? transformLotteryNumbers(drawData)
    : [];
  const prizes = transformPrizes(drawData.prize);

  if (existingDraw) {
    await prisma.draw.update({
      where: { id: existingDraw.id },
      data: {
        drawNumber,
        externalDrawId,
        drawTime: drawData.draw_time || null,
        status: DrawStatus.COMPLETED,
        hasWinner: prizes.some((p) => p.winnersCount > 0),
        details: drawData.details || null,
        numbers: {
          deleteMany: {},
          create: numbers,
        },
        prizes: {
          deleteMany: {},
          create: prizes,
        },
      },
    });
    return { action: 'updated', drawId: existingDraw.id };
  }

  let jackpotAmount = null;
  if (drawData.jackpot) {
    jackpotAmount = parsePrizeAmount(drawData.jackpot);
  }

  const draw = await prisma.draw.create({
    data: {
      lotteryId: lottery.id,
      drawNumber,
      externalDrawId,
      drawDate,
      drawTime: drawData.draw_time || null,
      details: drawData.details || null,
      status: DrawStatus.COMPLETED,
      hasWinner: prizes.some((p) => p.winnersCount > 0),
      numbers: { create: numbers },
      prizes: { create: prizes },
      jackpotHistory: jackpotAmount
        ? {
            create: {
              jackpotRaw: drawData.jackpot != null ? formatJackpotRaw(drawData.jackpot) : null,
              jackpotAmount,
              nextJackpotRaw: drawData.next_jackpot != null ? formatJackpotRaw(drawData.next_jackpot) : drawData.jackpot != null ? formatJackpotRaw(drawData.jackpot) : null,
              nextJackpotAmount: drawData.next_jackpot ? parsePrizeAmount(drawData.next_jackpot) : drawData.jackpot != null ? String(drawData.jackpot) : null,
              nextDrawDate: drawData.next_draw_date ? new Date(drawData.next_draw_date) : null,
            },
          }
        : undefined,
    },
  });

  return { action: 'created', drawId: draw.id };
}

async function ingestDrawAnalyticsData(stateSlug, gameId) {
  const results = {
    statesFetched: 0,
    statesCreated: 0,
    statesMatched: 0,
    gamesFetched: 0,
    lotteriesCreated: 0,
    lotteriesMatched: 0,
    drawsCreated: 0,
    drawsUpdated: 0,
    errors: [],
  };

  try {
    let states;
    if (stateSlug) {
      results.statesFetched = 1;
      const daState = { slug: stateSlug, name: stateSlug, abbreviation: stateSlug.slice(0, 2).toUpperCase() };
      states = [daState];
    } else {
      states = await fetchStates();
      results.statesFetched = states.length;
    }

    for (const daState of states) {
      let state;
      try {
        state = await ensureStateExists(daState, results);
      } catch (err) {
        results.errors.push({ state: daState.slug, error: err.message });
        continue;
      }

      let games;
      try {
        games = await fetchGames(daState.slug);
      } catch (err) {
        results.errors.push({ state: daState.slug, game: null, error: err.message });
        continue;
      }

      results.gamesFetched += games.length;

      const filteredGames = gameId ? games.filter((g) => g.id === gameId) : games;
      if (gameId && filteredGames.length === 0) {
        results.errors.push({ state: daState.slug, game: gameId, error: 'Game not found' });
        continue;
      }

      for (const daGame of filteredGames) {
        let lottery;
        try {
          lottery = await ensureLotteryExists(state, daGame, results);
        } catch (err) {
          results.errors.push({ state: daState.slug, game: daGame.id, error: err.message });
          continue;
        }

        try {
          const latestDraw = await fetchLatestDraw(daState.slug, daGame.id);
          if (latestDraw) {
            const drawResult = await upsertDraw(lottery, latestDraw);
            if (drawResult.action === 'created') {
              results.drawsCreated++;
            } else {
              results.drawsUpdated++;
            }
          }
        } catch (err) {
          results.errors.push({ state: daState.slug, game: daGame.id, error: `Latest draw: ${err.message}` });
        }

        try {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          const today = new Date();

          const history = await fetchHistoricalResults(
            daState.slug,
            daGame.id,
            thirtyDaysAgo.toISOString().split('T')[0],
            today.toISOString().split('T')[0],
            100
          );

          for (const historicalDraw of history) {
            try {
              const drawResult = await upsertDraw(lottery, historicalDraw);
              if (drawResult.action === 'created') {
                results.drawsCreated++;
              } else {
                results.drawsUpdated++;
              }
            } catch (err) {
              results.errors.push({
                state: daState.slug,
                game: daGame.id,
                draw: historicalDraw.draw_number,
                error: err.message,
              });
            }
          }
        } catch (err) {
          results.errors.push({
            state: daState.slug,
            game: daGame.id,
            error: `Historical results: ${err.message}`,
          });
        }
      }
    }
  } catch (err) {
    results.errors.push({ global: true, error: err.message });
  }

  return results;
}

export {
  ingestDrawAnalyticsData,
  fetchStates,
  fetchGames,
  fetchLatestDraw,
  fetchHistoricalResults,
  ensureStateExists,
  ensureLotteryExists,
  upsertDraw,
};

export default {
  ingestDrawAnalyticsData,
  fetchStates,
  fetchGames,
  fetchLatestDraw,
  fetchHistoricalResults,
  ensureStateExists,
  ensureLotteryExists,
  upsertDraw,
};