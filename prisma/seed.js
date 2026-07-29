import { PrismaClient, BallCategory, DayOfWeek, DrawStatus } from '@prisma/client';

const prisma = new PrismaClient();

// ════════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════════

function pick(count, min, max) {
  const nums = new Set();
  while (nums.size < count) {
    nums.add(Math.floor(Math.random() * (max - min + 1)) + min);
  }
  return Array.from(nums).sort((a, b) => a - b);
}

function fmt(n, currency = '$') {
  if (n >= 1_000_000) return `${currency}${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)} Millones`;
  if (n >= 1_000) return `${currency}${(n / 1_000).toFixed(0)},${String(n % 1000).padStart(3, '0')}`;
  return `${currency}${n.toLocaleString()}`;
}

function pct(base, pctVal) {
  return Math.round(base * pctVal);
}

// ════════════════════════════════════════════════════════════════
// PRIZE TEMPLATES  (matchPattern → fraction of jackpot)
// ════════════════════════════════════════════════════════════════

const PRIZE_TEMPLATES = {
  powerball: [
    { pattern: '5+1', pct: 1 },        // jackpot
    { pattern: '5+0', pct: 0.0029 },   // ~$1M
    { pattern: '4+1', pct: 0.00015 },  // ~$50k
    { pattern: '4+0', pct: 3e-7 },     // $100
    { pattern: '3+1', pct: 3e-7 },     // $100
    { pattern: '3+0', pct: 2e-8 },     // $7
    { pattern: '2+1', pct: 2e-8 },     // $7
    { pattern: '1+1', pct: 1.2e-8 },   // $4
    { pattern: '0+1', pct: 1.2e-8 },   // $4
  ],
  mega_millions: [
    { pattern: '5+1', pct: 1 },
    { pattern: '5+0', pct: 0.0038 },
    { pattern: '4+1', pct: 3.8e-5 },
    { pattern: '4+0', pct: 1.9e-6 },
    { pattern: '3+1', pct: 7.6e-7 },
    { pattern: '3+0', pct: 3.8e-8 },
    { pattern: '2+1', pct: 3.8e-8 },
    { pattern: '1+1', pct: 1.5e-8 },
    { pattern: '0+1', pct: 7.6e-9 },
  ],
  florida_lotto: [
    { pattern: '6/6', pct: 1 },
    { pattern: '5/6', pct: 0.00035 },
    { pattern: '4/6', pct: 7e-6 },
    { pattern: '3/6', pct: 3.5e-7 },
  ],
  lotto_texas: [
    { pattern: '6/6', pct: 1 },
    { pattern: '5/6', pct: 0.00034 },
    { pattern: '4/6', pct: 5.7e-6 },
    { pattern: '3/6', pct: 3.4e-7 },
  ],
  superlotto: [
    { pattern: '5+1', pct: 1 },
    { pattern: '5+0', pct: 0.0014 },
    { pattern: '4+1', pct: 4.5e-5 },
    { pattern: '4+0', pct: 4.5e-6 },
    { pattern: '3+1', pct: 2.3e-6 },
    { pattern: '3+0', pct: 4.5e-7 },
  ],
  euromillones: [
    { pattern: '5+2', pct: 1 },
    { pattern: '5+1', pct: 0.0033 },
    { pattern: '5+0', pct: 0.00023 },
    { pattern: '4+2', pct: 2e-5 },
    { pattern: '4+1', pct: 2e-6 },
    { pattern: '3+2', pct: 8e-7 },
    { pattern: '2+2', pct: 2e-7 },
  ],
  primitiva: [
    { pattern: '6+R', pct: 1 },
    { pattern: '6', pct: 0.064 },
    { pattern: '5+C', pct: 0.0048 },
    { pattern: '5', pct: 0.00012 },
    { pattern: '4', pct: 1.2e-5 },
    { pattern: '3', pct: 6.4e-7 },
  ],
  bonoloto: [
    { pattern: '6', pct: 1 },
    { pattern: '5+C', pct: 0.021 },
    { pattern: '5', pct: 0.00033 },
    { pattern: '4', pct: 1e-5 },
    { pattern: '3', pct: 4.2e-7 },
  ],
  melate: [
    { pattern: '6', pct: 1 },
    { pattern: '5+A', pct: 0.004 },
    { pattern: '5', pct: 0.00021 },
    { pattern: '4', pct: 1.3e-5 },
    { pattern: '3', pct: 7.9e-7 },
  ],
  chispazo: [
    { pattern: '5/5', pct: 1 },
    { pattern: '4/5', pct: 0.0037 },
    { pattern: '3/5', pct: 0.00015 },
    { pattern: '2/5', pct: 1.5e-5 },
  ],
};

// ════════════════════════════════════════════════════════════════
// DRAW GENERATOR
// ════════════════════════════════════════════════════════════════

function generateDraws({
  lotteryId,
  baseDrawNumber,
  count = 20,
  drawTime,
  mainCount, mainMin, mainMax,
  additionalBalls = [],
  multiplierName = null,
  multiplierValues = null,
  prizeTemplate,
  currencySymbol = '$',
  baseJackpot = 10_000_000,
  jackpotGrowth = 0.08,
}) {
  const now = new Date();
  const draws = [];

  for (let i = 0; i < count; i++) {
    const drawNum = baseDrawNumber + i;
    const drawDate = new Date(now);
    drawDate.setDate(drawDate.getDate() - i * 2);

    const mainNumbers = pick(mainCount, mainMin, mainMax);
    const jackpotAmt = Math.round(baseJackpot * Math.pow(1 + jackpotGrowth, i));
    const nextJackpotAmt = Math.round(baseJackpot * Math.pow(1 + jackpotGrowth, i + 1));

    const numbers = mainNumbers.map((n, idx) => ({
      value: String(n).padStart(2, '0'),
      category: BallCategory.MAIN,
      position: idx + 1,
    }));

    for (const ab of additionalBalls) {
      const vals = pick(ab.count || 1, ab.min, ab.max);
      for (const v of vals) {
        numbers.push({
          value: String(v).padStart(ab.pad ? 2 : 0, '0'),
          ballTypeName: ab.name,
          category: BallCategory.ADDITIONAL,
          position: numbers.filter((n) => n.category === 'ADDITIONAL').length + 1,
        });
      }
    }

    if (multiplierName && multiplierValues) {
      const mv = multiplierValues[Math.floor(Math.random() * multiplierValues.length)];
      numbers.push({
        value: `${mv}x`,
        ballTypeName: multiplierName,
        category: BallCategory.MULTIPLIER,
        position: 1,
      });
    }

    const prizes = prizeTemplate.map((pt) => ({
      matchPattern: pt.pattern,
      prizeAmountRaw: pt.pct === 1 ? fmt(jackpotAmt, currencySymbol) : fmt(Math.max(Math.round(jackpotAmt * pt.pct), 1), currencySymbol),
      prizeAmount: pt.pct === 1 ? jackpotAmt : Math.max(Math.round(jackpotAmt * pt.pct), 1),
      winnersCount: pt.pct === 1 ? 0 : Math.max(Math.round(Math.random() * (pt.pct < 1e-7 ? 500000 : pt.pct < 1e-6 ? 50000 : pt.pct < 1e-5 ? 5000 : pt.pct < 1e-4 ? 500 : pt.pct < 0.001 ? 50 : 10)), 0),
    }));

    draws.push({
      drawNumber: String(drawNum),
      drawDate,
      drawTime,
      status: DrawStatus.COMPLETED,
      hasWinner: false,
      numbers,
      jackpot: {
        jackpotRaw: fmt(jackpotAmt, currencySymbol),
        jackpotAmount: jackpotAmt,
        nextJackpotRaw: fmt(nextJackpotAmt, currencySymbol),
        nextJackpotAmount: nextJackpotAmt,
        nextDrawDate: new Date(drawDate.getTime() + 2 * 86400000),
      },
      prizes,
    });
  }

  return draws;
}

// ════════════════════════════════════════════════════════════════
// UPSERT HELPERS
// ════════════════════════════════════════════════════════════════

async function upsertCountry(code, name, slug, flagEmoji, currency) {
  return prisma.country.upsert({
    where: { code },
    update: {},
    create: { code, name, slug, flagEmoji, currency },
  });
}

async function upsertState(countryId, name, code, slug, taxRate = 0) {
  return prisma.state.upsert({
    where: { countryId_code: { countryId, code } },
    update: {},
    create: { countryId, name, code, slug, taxRate, minimumLegalAge: 18 },
  });
}

async function upsertLottery(stateId, externalId, name, slug) {
  await prisma.lottery.upsert({
    where: { stateId_slug: { stateId, slug } },
    update: {},
    create: { stateId, externalId, name, slug, mainDrawName: 'Main draw' },
  });
  return prisma.lottery.findFirstOrThrow({ where: { stateId, slug } });
}

async function upsertConfiguration(lotteryId, config) {
  await prisma.lotteryConfiguration.upsert({
    where: { lotteryId },
    update: {},
    create: { lotteryId, ...config },
  });
}

async function upsertBallType(lotteryId, name, abbreviation, category, opts = {}) {
  return prisma.lotteryBallType.upsert({
    where: { lotteryId_name: { lotteryId, name } },
    update: {},
    create: { lotteryId, name, abbreviation, category, sortOrder: 0, ...opts },
  });
}

async function upsertSchedule(lotteryId, dayOfWeek) {
  await prisma.lotteryDrawSchedule.upsert({
    where: { lotteryId_dayOfWeek: { lotteryId, dayOfWeek } },
    update: {},
    create: { lotteryId, dayOfWeek },
  });
}

async function createDraws(lotteryId, draws) {
  for (const d of draws) {
    const numbersCreate = d.numbers.map((n) => ({
      value: n.value,
      category: n.category,
      position: n.position,
      ballType: n.ballTypeName
        ? { connect: { lotteryId_name: { lotteryId, name: n.ballTypeName } } }
        : undefined,
    }));
    await prisma.draw.create({
      data: {
        lotteryId,
        externalDrawId: parseInt(d.drawNumber),
        drawNumber: d.drawNumber,
        drawDate: d.drawDate,
        drawTime: d.drawTime,
        status: d.status,
        hasWinner: d.hasWinner,
        numbers: { create: numbersCreate },
        prizes: { create: d.prizes },
        jackpotHistory: d.jackpot ? { create: d.jackpot } : undefined,
      },
    });
  }
}

// ════════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════════

async function main() {
  console.log('🌱 Iniciando seed completo...');

  // ─── 1. PAÍSES ───────────────────────────────────
  const us = await upsertCountry('US', 'Estados Unidos', 'us', '🇺🇸', 'USD');
  const es = await upsertCountry('ES', 'España', 'es', '🇪🇸', 'EUR');
  const mx = await upsertCountry('MX', 'México', 'mx', '🇲🇽', 'MXN');

  // ─── 2. ESTADOS ──────────────────────────────────
  const natUS = await upsertState(us.id, 'Nacional', 'NAT', 'nacional');
  const fl = await upsertState(us.id, 'Florida', 'FL', 'florida');
  const tx = await upsertState(us.id, 'Texas', 'TX', 'texas');
  const ca = await upsertState(us.id, 'California', 'CA', 'california');
  const natES = await upsertState(es.id, 'Nacional', 'NAT', 'nacional');
  const natMX = await upsertState(mx.id, 'Nacional', 'NAT', 'nacional');

  console.log('✅ Países y estados listos');

  // ─── CONFIGURACIÓN DE LOTERÍAS ────────────────────
  const powerball = await upsertLottery(natUS.id, 1, 'Powerball', 'powerball');
  await upsertConfiguration(powerball.id, { drawTimezone: 'US/Eastern', drawTime: '22:59', stopSaleTime: '21:59', claimDeadline: 180, minBall: 1, maxBall: 69, drawnNumbers: 5, selectableBalls: 5, minimumSelectableBalls: 5 });
  await upsertBallType(powerball.id, 'powerball', 'PB', BallCategory.ADDITIONAL, { minBall: 1, maxBall: 26, playerPicked: true, sortOrder: 1 });
  await upsertBallType(powerball.id, 'powerplay', 'PP', BallCategory.MULTIPLIER, { isMultiplier: true, allowedValues: [2, 3, 4, 5, 10], sortOrder: 2 });
  for (const day of [DayOfWeek.MONDAY, DayOfWeek.WEDNESDAY, DayOfWeek.SATURDAY]) await upsertSchedule(powerball.id, day);

  const mega = await upsertLottery(natUS.id, 2, 'Mega Millions', 'mega-millions');
  await upsertConfiguration(mega.id, { drawTimezone: 'US/Eastern', drawTime: '23:00', stopSaleTime: '22:00', claimDeadline: 180, minBall: 1, maxBall: 70, drawnNumbers: 5, selectableBalls: 5, minimumSelectableBalls: 5 });
  await upsertBallType(mega.id, 'mega_ball', 'MB', BallCategory.ADDITIONAL, { minBall: 1, maxBall: 25, playerPicked: true, sortOrder: 1 });
  await upsertBallType(mega.id, 'megaplier', 'MP', BallCategory.MULTIPLIER, { isMultiplier: true, allowedValues: [2, 3, 4, 5], sortOrder: 2 });
  for (const day of [DayOfWeek.TUESDAY, DayOfWeek.FRIDAY]) await upsertSchedule(mega.id, day);

  const flLotto = await upsertLottery(fl.id, 3, 'Florida Lotto', 'florida-lotto');
  await upsertConfiguration(flLotto.id, { drawTimezone: 'US/Eastern', drawTime: '23:15', stopSaleTime: '22:00', claimDeadline: 180, minBall: 1, maxBall: 53, drawnNumbers: 6, selectableBalls: 6, minimumSelectableBalls: 6 });
  for (const day of [DayOfWeek.MONDAY, DayOfWeek.WEDNESDAY, DayOfWeek.SATURDAY]) await upsertSchedule(flLotto.id, day);

  const txLotto = await upsertLottery(tx.id, 4, 'Lotto Texas', 'lotto-texas');
  await upsertConfiguration(txLotto.id, { drawTimezone: 'US/Central', drawTime: '22:12', stopSaleTime: '21:00', claimDeadline: 180, minBall: 1, maxBall: 54, drawnNumbers: 6, selectableBalls: 6, minimumSelectableBalls: 6 });
  for (const day of [DayOfWeek.MONDAY, DayOfWeek.WEDNESDAY, DayOfWeek.SATURDAY]) await upsertSchedule(txLotto.id, day);

  const caLotto = await upsertLottery(ca.id, 5, 'SuperLotto Plus', 'superlotto-plus');
  await upsertConfiguration(caLotto.id, { drawTimezone: 'US/Pacific', drawTime: '20:00', stopSaleTime: '19:00', claimDeadline: 180, minBall: 1, maxBall: 47, drawnNumbers: 5, selectableBalls: 5, minimumSelectableBalls: 5 });
  await upsertBallType(caLotto.id, 'mega_number', 'MN', BallCategory.ADDITIONAL, { minBall: 1, maxBall: 27, playerPicked: true, sortOrder: 1 });
  for (const day of [DayOfWeek.WEDNESDAY, DayOfWeek.SATURDAY]) await upsertSchedule(caLotto.id, day);

  const euromillones = await upsertLottery(natES.id, 10, 'EuroMillones', 'euromillones');
  await upsertConfiguration(euromillones.id, { drawTimezone: 'Europe/Madrid', drawTime: '21:00', stopSaleTime: '20:00', claimDeadline: 90, minBall: 1, maxBall: 50, drawnNumbers: 5, selectableBalls: 5, minimumSelectableBalls: 5 });
  await upsertBallType(euromillones.id, 'estrella', 'ES', BallCategory.ADDITIONAL, { minBall: 1, maxBall: 12, playerPicked: true, sortOrder: 1 });
  await upsertBallType(euromillones.id, 'el_millón', 'EM', BallCategory.ADDITIONAL, { playerPicked: false, sortOrder: 2 });
  for (const day of [DayOfWeek.TUESDAY, DayOfWeek.FRIDAY]) await upsertSchedule(euromillones.id, day);

  const primitiva = await upsertLottery(natES.id, 11, 'La Primitiva', 'la-primitiva');
  await upsertConfiguration(primitiva.id, { drawTimezone: 'Europe/Madrid', drawTime: '21:30', stopSaleTime: '20:30', claimDeadline: 90, minBall: 1, maxBall: 49, drawnNumbers: 6, selectableBalls: 6, minimumSelectableBalls: 6 });
  await upsertBallType(primitiva.id, 'complementario', 'C', BallCategory.ADDITIONAL, { minBall: 1, maxBall: 49, playerPicked: false, sortOrder: 1 });
  await upsertBallType(primitiva.id, 'reintegro', 'R', BallCategory.ADDITIONAL, { minBall: 0, maxBall: 9, playerPicked: false, sortOrder: 2 });
  for (const day of [DayOfWeek.THURSDAY, DayOfWeek.SATURDAY]) await upsertSchedule(primitiva.id, day);

  const bonoloto = await upsertLottery(natES.id, 12, 'Bonoloto', 'bonoloto');
  await upsertConfiguration(bonoloto.id, { drawTimezone: 'Europe/Madrid', drawTime: '21:30', stopSaleTime: '20:30', claimDeadline: 90, minBall: 1, maxBall: 49, drawnNumbers: 6, selectableBalls: 6, minimumSelectableBalls: 6 });
  await upsertBallType(bonoloto.id, 'complementario', 'C', BallCategory.ADDITIONAL, { minBall: 1, maxBall: 49, playerPicked: false, sortOrder: 1 });
  await upsertBallType(bonoloto.id, 'reintegro', 'R', BallCategory.ADDITIONAL, { minBall: 0, maxBall: 9, playerPicked: false, sortOrder: 2 });
  for (const day of [DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY, DayOfWeek.SUNDAY]) await upsertSchedule(bonoloto.id, day);

  const melate = await upsertLottery(natMX.id, 20, 'Melate', 'melate');
  await upsertConfiguration(melate.id, { drawTimezone: 'America/Mexico_City', drawTime: '21:00', stopSaleTime: '20:00', claimDeadline: 60, minBall: 1, maxBall: 56, drawnNumbers: 6, selectableBalls: 6, minimumSelectableBalls: 6 });
  await upsertBallType(melate.id, 'adicional', 'AD', BallCategory.ADDITIONAL, { minBall: 1, maxBall: 56, playerPicked: false, sortOrder: 1 });
  for (const day of [DayOfWeek.WEDNESDAY, DayOfWeek.FRIDAY, DayOfWeek.SUNDAY]) await upsertSchedule(melate.id, day);

  const chispazo = await upsertLottery(natMX.id, 21, 'Chispazo', 'chispazo');
  await upsertConfiguration(chispazo.id, { drawTimezone: 'America/Mexico_City', drawTime: '21:00', stopSaleTime: '20:30', claimDeadline: 60, minBall: 1, maxBall: 28, drawnNumbers: 5, selectableBalls: 5, minimumSelectableBalls: 5 });
  for (const day of [DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY, DayOfWeek.SATURDAY, DayOfWeek.SUNDAY]) await upsertSchedule(chispazo.id, day);

  console.log('✅ 10 loterías configuradas');

  // ─── LIMPIAR SORTEOS ANTERIORES ──────────────────
  const allIds = [powerball.id, mega.id, flLotto.id, txLotto.id, caLotto.id, euromillones.id, primitiva.id, bonoloto.id, melate.id, chispazo.id];
  for (const id of allIds) {
    await prisma.jackpotHistory.deleteMany({ where: { draw: { lotteryId: id } } });
    await prisma.drawNumber.deleteMany({ where: { draw: { lotteryId: id } } });
    await prisma.prizeBreakdown.deleteMany({ where: { draw: { lotteryId: id } } });
    await prisma.draw.deleteMany({ where: { lotteryId: id } });
  }
  console.log('🧹 Sorteos anteriores eliminados');

  // ════════════════════════════════════════════════════════
  // GENERAR 20 SORTEOS POR LOTERÍA
  // ════════════════════════════════════════════════════════

  const DRAW_COUNT = 20;

  await createDraws(powerball.id, generateDraws({
    baseDrawNumber: 3900, count: DRAW_COUNT, drawTime: '22:59',
    mainCount: 5, mainMin: 1, mainMax: 69,
    additionalBalls: [{ name: 'powerball', count: 1, min: 1, max: 26, pad: true }],
    multiplierName: 'powerplay', multiplierValues: [2, 3, 4, 5, 10],
    prizeTemplate: PRIZE_TEMPLATES.powerball,
    baseJackpot: 20_000_000, jackpotGrowth: 0.07,
  }));
  console.log(`✅ ${DRAW_COUNT} sorteos Powerball`);

  await createDraws(mega.id, generateDraws({
    baseDrawNumber: 2530, count: DRAW_COUNT, drawTime: '23:00',
    mainCount: 5, mainMin: 1, mainMax: 70,
    additionalBalls: [{ name: 'mega_ball', count: 1, min: 1, max: 25, pad: true }],
    multiplierName: 'megaplier', multiplierValues: [2, 3, 4, 5],
    prizeTemplate: PRIZE_TEMPLATES.mega_millions,
    baseJackpot: 15_000_000, jackpotGrowth: 0.08,
  }));
  console.log(`✅ ${DRAW_COUNT} sorteos Mega Millions`);

  await createDraws(flLotto.id, generateDraws({
    baseDrawNumber: 2800, count: DRAW_COUNT, drawTime: '23:15',
    mainCount: 6, mainMin: 1, mainMax: 53,
    prizeTemplate: PRIZE_TEMPLATES.florida_lotto,
    baseJackpot: 2_000_000, jackpotGrowth: 0.05,
  }));
  console.log(`✅ ${DRAW_COUNT} sorteos Florida Lotto`);

  await createDraws(txLotto.id, generateDraws({
    baseDrawNumber: 3090, count: DRAW_COUNT, drawTime: '22:12',
    mainCount: 6, mainMin: 1, mainMax: 54,
    prizeTemplate: PRIZE_TEMPLATES.lotto_texas,
    baseJackpot: 1_500_000, jackpotGrowth: 0.05,
  }));
  console.log(`✅ ${DRAW_COUNT} sorteos Lotto Texas`);

  await createDraws(caLotto.id, generateDraws({
    baseDrawNumber: 4510, count: DRAW_COUNT, drawTime: '20:00',
    mainCount: 5, mainMin: 1, mainMax: 47,
    additionalBalls: [{ name: 'mega_number', count: 1, min: 1, max: 27, pad: true }],
    prizeTemplate: PRIZE_TEMPLATES.superlotto,
    baseJackpot: 7_000_000, jackpotGrowth: 0.06,
  }));
  console.log(`✅ ${DRAW_COUNT} sorteos SuperLotto Plus`);

  await createDraws(euromillones.id, generateDraws({
    baseDrawNumber: 115, count: DRAW_COUNT, drawTime: '21:00',
    mainCount: 5, mainMin: 1, mainMax: 50,
    additionalBalls: [{ name: 'estrella', count: 2, min: 1, max: 12, pad: true }],
    prizeTemplate: PRIZE_TEMPLATES.euromillones,
    currencySymbol: '€',
    baseJackpot: 15_000_000, jackpotGrowth: 0.09,
  }));
  console.log(`✅ ${DRAW_COUNT} sorteos EuroMillones`);

  await createDraws(primitiva.id, generateDraws({
    baseDrawNumber: 4110, count: DRAW_COUNT, drawTime: '21:30',
    mainCount: 6, mainMin: 1, mainMax: 49,
    additionalBalls: [
      { name: 'complementario', count: 1, min: 1, max: 49, pad: true },
      { name: 'reintegro', count: 1, min: 0, max: 9, pad: false },
    ],
    prizeTemplate: PRIZE_TEMPLATES.primitiva,
    currencySymbol: '€',
    baseJackpot: 2_500_000, jackpotGrowth: 0.06,
  }));
  console.log(`✅ ${DRAW_COUNT} sorteos La Primitiva`);

  await createDraws(bonoloto.id, generateDraws({
    baseDrawNumber: 8900, count: DRAW_COUNT, drawTime: '21:30',
    mainCount: 6, mainMin: 1, mainMax: 49,
    additionalBalls: [
      { name: 'complementario', count: 1, min: 1, max: 49, pad: true },
      { name: 'reintegro', count: 1, min: 0, max: 9, pad: false },
    ],
    prizeTemplate: PRIZE_TEMPLATES.bonoloto,
    currencySymbol: '€',
    baseJackpot: 400_000, jackpotGrowth: 0.04,
  }));
  console.log(`✅ ${DRAW_COUNT} sorteos Bonoloto`);

  await createDraws(melate.id, generateDraws({
    baseDrawNumber: 7110, count: DRAW_COUNT, drawTime: '21:00',
    mainCount: 6, mainMin: 1, mainMax: 56,
    additionalBalls: [{ name: 'adicional', count: 1, min: 1, max: 56, pad: true }],
    prizeTemplate: PRIZE_TEMPLATES.melate,
    baseJackpot: 5_000_000, jackpotGrowth: 0.05,
  }));
  console.log(`✅ ${DRAW_COUNT} sorteos Melate`);

  await createDraws(chispazo.id, generateDraws({
    baseDrawNumber: 22440, count: DRAW_COUNT, drawTime: '21:00',
    mainCount: 5, mainMin: 1, mainMax: 28,
    prizeTemplate: PRIZE_TEMPLATES.chispazo,
    baseJackpot: 100_000, jackpotGrowth: 0.03,
  }));
  console.log(`✅ ${DRAW_COUNT} sorteos Chispazo`);

  console.log(`
🎉 Seed completo:
   • 3 países (US, ES, MX)
   • 6 estados (NAT-US, FL, TX, CA, NAT-ES, NAT-MX)
   • 10 loterías
   • ${await prisma.draw.count()} sorteos totales
   • ${await prisma.drawNumber.count()} números sorteados
   • ${await prisma.prizeBreakdown.count()} premios registrados
  `);
}

main()
  .catch((e) => {
    console.error('❌ Error ejecutando seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
