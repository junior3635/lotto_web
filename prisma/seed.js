import { PrismaClient, BallCategory, DayOfWeek, DrawStatus } from '@prisma/client';

const prisma = new PrismaClient();

const STATE_ICONS = {
  florida: '🌴', texas: '🤠', california: '🌊',
  'new-york': '🗽', georgia: '🍑', illinois: '🏙️', alabama: '🌺',
};

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

async function createDraws(lotteryId, draws, ballTypeMap) {
  for (const d of draws) {
    const { numbers, jackpot, prizes, ...drawData } = d;
    await prisma.draw.create({
      data: {
        lotteryId,
        externalDrawId: parseInt(drawData.drawNumber),
        ...drawData,
        numbers: {
          create: numbers.map((n) => ({
            value: n.value,
            category: n.category,
            position: n.position,
            ballType: n.ballTypeName
              ? { connect: { lotteryId_name: { lotteryId, name: n.ballTypeName } } }
              : undefined,
          })),
        },
        prizes: { create: prizes },
        jackpotHistory: jackpot ? { create: jackpot } : undefined,
      },
    });
  }
}

async function main() {
  console.log('🌱 Iniciando seed completo...');

  // ─── 1. PAÍSES ───────────────────────────────────
  const us = await upsertCountry('US', 'Estados Unidos', 'us', '🇺🇸', 'USD');
  const es = await upsertCountry('ES', 'España', 'es', '🇪🇸', 'EUR');
  const mx = await upsertCountry('MX', 'México', 'mx', '🇲🇽', 'MXN');
  console.log('✅ Países: US, ES, MX');

  // ─── 2. ESTADOS US ────────────────────────────────
  const natUS = await upsertState(us.id, 'Nacional', 'NAT', 'nacional');
  const fl = await upsertState(us.id, 'Florida', 'FL', 'florida');
  const tx = await upsertState(us.id, 'Texas', 'TX', 'texas');
  const ca = await upsertState(us.id, 'California', 'CA', 'california');
  console.log('✅ Estados US: Nacional, FL, TX, CA');

  // ─── 3. ESPAÑA (sin estados sub-nacionales) ────
  const natES = await upsertState(es.id, 'Nacional', 'NAT', 'nacional');
  const natMX = await upsertState(mx.id, 'Nacional', 'NAT', 'nacional');

  // ════════════════════════════════════════════════════
  // POWERBALL (ya existe en seed anterior)
  // ════════════════════════════════════════════════════
  const powerball = await upsertLottery(natUS.id, 1, 'Powerball', 'powerball');
  await upsertConfiguration(powerball.id, {
    drawTimezone: 'US/Eastern', drawTime: '22:59', stopSaleTime: '21:59',
    claimDeadline: 180, minBall: 1, maxBall: 69, drawnNumbers: 5,
    selectableBalls: 5, minimumSelectableBalls: 5,
  });
  const pbAdd = await upsertBallType(powerball.id, 'powerball', 'PB', BallCategory.ADDITIONAL, { minBall: 1, maxBall: 26, playerPicked: true, sortOrder: 1 });
  await upsertBallType(powerball.id, 'powerplay', 'PP', BallCategory.MULTIPLIER, { isMultiplier: true, allowedValues: [2, 3, 4, 5, 10], sortOrder: 2 });
  for (const day of [DayOfWeek.MONDAY, DayOfWeek.WEDNESDAY, DayOfWeek.SATURDAY]) {
    await upsertSchedule(powerball.id, day);
  }

  // ════════════════════════════════════════════════════
  // MEGA MILLIONS (ya existe)
  // ════════════════════════════════════════════════════
  const mega = await upsertLottery(natUS.id, 2, 'Mega Millions', 'mega-millions');
  await upsertConfiguration(mega.id, {
    drawTimezone: 'US/Eastern', drawTime: '23:00', stopSaleTime: '22:00',
    claimDeadline: 180, minBall: 1, maxBall: 70, drawnNumbers: 5,
    selectableBalls: 5, minimumSelectableBalls: 5,
  });
  const mmAdd = await upsertBallType(mega.id, 'mega_ball', 'MB', BallCategory.ADDITIONAL, { minBall: 1, maxBall: 25, playerPicked: true, sortOrder: 1 });
  await upsertBallType(mega.id, 'megaplier', 'MP', BallCategory.MULTIPLIER, { isMultiplier: true, allowedValues: [2, 3, 4, 5], sortOrder: 2 });
  for (const day of [DayOfWeek.TUESDAY, DayOfWeek.FRIDAY]) {
    await upsertSchedule(mega.id, day);
  }

  // ════════════════════════════════════════════════════
  // FLORIDA LOTTO (FL)
  // ════════════════════════════════════════════════════
  const flLotto = await upsertLottery(fl.id, 3, 'Florida Lotto', 'florida-lotto');
  await upsertConfiguration(flLotto.id, {
    drawTimezone: 'US/Eastern', drawTime: '23:15', stopSaleTime: '22:00',
    claimDeadline: 180, minBall: 1, maxBall: 53, drawnNumbers: 6,
    selectableBalls: 6, minimumSelectableBalls: 6,
  });
  await upsertBallType(flLotto.id, 'double_play', 'DP', BallCategory.MULTIPLIER, { isMultiplier: true, allowedValues: [2, 3, 4, 5, 10], sortOrder: 1 });
  for (const day of [DayOfWeek.MONDAY, DayOfWeek.WEDNESDAY, DayOfWeek.SATURDAY]) {
    await upsertSchedule(flLotto.id, day);
  }

  // ════════════════════════════════════════════════════
  // LOTTO TEXAS (TX)
  // ════════════════════════════════════════════════════
  const txLotto = await upsertLottery(tx.id, 4, 'Lotto Texas', 'lotto-texas');
  await upsertConfiguration(txLotto.id, {
    drawTimezone: 'US/Central', drawTime: '22:12', stopSaleTime: '21:00',
    claimDeadline: 180, minBall: 1, maxBall: 54, drawnNumbers: 6,
    selectableBalls: 6, minimumSelectableBalls: 6,
  });
  await upsertBallType(txLotto.id, 'extra', 'XT', BallCategory.MULTIPLIER, { isMultiplier: true, allowedValues: [2, 3, 4, 5, 10], sortOrder: 1 });
  for (const day of [DayOfWeek.MONDAY, DayOfWeek.WEDNESDAY, DayOfWeek.SATURDAY]) {
    await upsertSchedule(txLotto.id, day);
  }

  // ════════════════════════════════════════════════════
  // SUPERLOTTO PLUS (CA)
  // ════════════════════════════════════════════════════
  const caLotto = await upsertLottery(ca.id, 5, 'SuperLotto Plus', 'superlotto-plus');
  await upsertConfiguration(caLotto.id, {
    drawTimezone: 'US/Pacific', drawTime: '20:00', stopSaleTime: '19:00',
    claimDeadline: 180, minBall: 1, maxBall: 47, drawnNumbers: 5,
    selectableBalls: 5, minimumSelectableBalls: 5,
  });
  await upsertBallType(caLotto.id, 'mega_number', 'MN', BallCategory.ADDITIONAL, { minBall: 1, maxBall: 27, playerPicked: true, sortOrder: 1 });
  for (const day of [DayOfWeek.WEDNESDAY, DayOfWeek.SATURDAY]) {
    await upsertSchedule(caLotto.id, day);
  }

  // ════════════════════════════════════════════════════
  // EUROMILLONES (ES)
  // ════════════════════════════════════════════════════
  const euromillones = await upsertLottery(natES.id, 10, 'EuroMillones', 'euromillones');
  await upsertConfiguration(euromillones.id, {
    drawTimezone: 'Europe/Madrid', drawTime: '21:00', stopSaleTime: '20:00',
    claimDeadline: 90, minBall: 1, maxBall: 50, drawnNumbers: 5,
    selectableBalls: 5, minimumSelectableBalls: 5,
  });
  await upsertBallType(euromillones.id, 'estrella', 'ES', BallCategory.ADDITIONAL, { minBall: 1, maxBall: 12, playerPicked: true, sortOrder: 1 });
  // EuroMillions has 2 stars but we handle via draw numbers
  await upsertBallType(euromillones.id, 'el_millón', 'EM', BallCategory.ADDITIONAL, { playerPicked: false, sortOrder: 2 });
  for (const day of [DayOfWeek.TUESDAY, DayOfWeek.FRIDAY]) {
    await upsertSchedule(euromillones.id, day);
  }

  // ════════════════════════════════════════════════════
  // LA PRIMITIVA (ES)
  // ════════════════════════════════════════════════════
  const primitiva = await upsertLottery(natES.id, 11, 'La Primitiva', 'la-primitiva');
  await upsertConfiguration(primitiva.id, {
    drawTimezone: 'Europe/Madrid', drawTime: '21:30', stopSaleTime: '20:30',
    claimDeadline: 90, minBall: 1, maxBall: 49, drawnNumbers: 6,
    selectableBalls: 6, minimumSelectableBalls: 6,
  });
  await upsertBallType(primitiva.id, 'complementario', 'C', BallCategory.ADDITIONAL, { minBall: 1, maxBall: 49, playerPicked: false, sortOrder: 1 });
  await upsertBallType(primitiva.id, 'reintegro', 'R', BallCategory.ADDITIONAL, { minBall: 0, maxBall: 9, playerPicked: false, sortOrder: 2 });
  for (const day of [DayOfWeek.THURSDAY, DayOfWeek.SATURDAY]) {
    await upsertSchedule(primitiva.id, day);
  }

  // ════════════════════════════════════════════════════
  // BONOLOTO (ES)
  // ════════════════════════════════════════════════════
  const bonoloto = await upsertLottery(natES.id, 12, 'Bonoloto', 'bonoloto');
  await upsertConfiguration(bonoloto.id, {
    drawTimezone: 'Europe/Madrid', drawTime: '21:30', stopSaleTime: '20:30',
    claimDeadline: 90, minBall: 1, maxBall: 49, drawnNumbers: 6,
    selectableBalls: 6, minimumSelectableBalls: 6,
  });
  await upsertBallType(bonoloto.id, 'complementario', 'C', BallCategory.ADDITIONAL, { minBall: 1, maxBall: 49, playerPicked: false, sortOrder: 1 });
  await upsertBallType(bonoloto.id, 'reintegro', 'R', BallCategory.ADDITIONAL, { minBall: 0, maxBall: 9, playerPicked: false, sortOrder: 2 });
  for (const day of [DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY, DayOfWeek.SUNDAY]) {
    await upsertSchedule(bonoloto.id, day);
  }

  // ════════════════════════════════════════════════════
  // MELATE (MX)
  // ════════════════════════════════════════════════════
  const melate = await upsertLottery(natMX.id, 20, 'Melate', 'melate');
  await upsertConfiguration(melate.id, {
    drawTimezone: 'America/Mexico_City', drawTime: '21:00', stopSaleTime: '20:00',
    claimDeadline: 60, minBall: 1, maxBall: 56, drawnNumbers: 6,
    selectableBalls: 6, minimumSelectableBalls: 6,
  });
  await upsertBallType(melate.id, 'adicional', 'AD', BallCategory.ADDITIONAL, { minBall: 1, maxBall: 56, playerPicked: false, sortOrder: 1 });
  for (const day of [DayOfWeek.WEDNESDAY, DayOfWeek.FRIDAY, DayOfWeek.SUNDAY]) {
    await upsertSchedule(melate.id, day);
  }

  // ════════════════════════════════════════════════════
  // CHISPAZO (MX)
  // ════════════════════════════════════════════════════
  const chispazo = await upsertLottery(natMX.id, 21, 'Chispazo', 'chispazo');
  await upsertConfiguration(chispazo.id, {
    drawTimezone: 'America/Mexico_City', drawTime: '21:00', stopSaleTime: '20:30',
    claimDeadline: 60, minBall: 1, maxBall: 28, drawnNumbers: 5,
    selectableBalls: 5, minimumSelectableBalls: 5,
  });
  for (const day of [DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY, DayOfWeek.SATURDAY, DayOfWeek.SUNDAY]) {
    await upsertSchedule(chispazo.id, day);
  }

  console.log('✅ Loterías configuradas: Powerball, Mega Millions, Florida Lotto, Lotto Texas, SuperLotto Plus, EuroMillones, La Primitiva, Bonoloto, Melate, Chispazo');

  // ─── LIMPIAR SORTEOS ANTERIORES ──────────────────
  const allLotteryIds = [powerball.id, mega.id, flLotto.id, txLotto.id, caLotto.id, euromillones.id, primitiva.id, bonoloto.id, melate.id, chispazo.id];
  for (const id of allLotteryIds) {
    await prisma.jackpotHistory.deleteMany({ where: { draw: { lotteryId: id } } });
    await prisma.drawNumber.deleteMany({ where: { draw: { lotteryId: id } } });
    await prisma.prizeBreakdown.deleteMany({ where: { draw: { lotteryId: id } } });
    await prisma.draw.deleteMany({ where: { lotteryId: id } });
  }
  console.log('🧹 Sorteos anteriores eliminados.');

  // ════════════════════════════════════════════════════
  // POWERBALL DRAWS (10)
  // ════════════════════════════════════════════════════
  const now = new Date();
  await createDraws(powerball.id, [
    { drawNumber: '3912', drawDate: new Date('2026-07-27'), drawTime: '22:59', status: DrawStatus.COMPLETED, hasWinner: false,
      numbers: [
        { value: '12', category: BallCategory.MAIN, position: 1 }, { value: '24', category: BallCategory.MAIN, position: 2 },
        { value: '35', category: BallCategory.MAIN, position: 3 }, { value: '46', category: BallCategory.MAIN, position: 4 },
        { value: '59', category: BallCategory.MAIN, position: 5 },
        { value: '09', ballTypeName: 'powerball', category: BallCategory.ADDITIONAL, position: 1 },
        { value: '3x', ballTypeName: 'powerplay', category: BallCategory.MULTIPLIER, position: 1 },
      ],
      jackpot: { jackpotRaw: '$340 Millones', jackpotAmount: 340000000, nextJackpotRaw: '$360 Millones', nextJackpotAmount: 360000000, nextDrawDate: new Date('2026-07-29T22:59:00Z') },
      prizes: [
        { matchPattern: '5+1', prizeAmountRaw: '$340,000,000', prizeAmount: 340000000, winnersCount: 0 },
        { matchPattern: '5+0', prizeAmountRaw: '$1,000,000', prizeAmount: 1000000, winnersCount: 2 },
        { matchPattern: '4+1', prizeAmountRaw: '$50,000', prizeAmount: 50000, winnersCount: 18 },
        { matchPattern: '4+0', prizeAmountRaw: '$100', prizeAmount: 100, winnersCount: 420 },
        { matchPattern: '3+1', prizeAmountRaw: '$100', prizeAmount: 100, winnersCount: 1150 },
        { matchPattern: '3+0', prizeAmountRaw: '$7', prizeAmount: 7, winnersCount: 28000 },
        { matchPattern: '2+1', prizeAmountRaw: '$7', prizeAmount: 7, winnersCount: 21000 },
        { matchPattern: '1+1', prizeAmountRaw: '$4', prizeAmount: 4, winnersCount: 118000 },
        { matchPattern: '0+1', prizeAmountRaw: '$4', prizeAmount: 4, winnersCount: 276000 },
      ],
    },
    { drawNumber: '3911', drawDate: new Date('2026-07-24'), drawTime: '22:59', status: DrawStatus.COMPLETED, hasWinner: false,
      numbers: [
        { value: '05', category: BallCategory.MAIN, position: 1 }, { value: '18', category: BallCategory.MAIN, position: 2 },
        { value: '27', category: BallCategory.MAIN, position: 3 }, { value: '44', category: BallCategory.MAIN, position: 4 },
        { value: '62', category: BallCategory.MAIN, position: 5 },
        { value: '14', ballTypeName: 'powerball', category: BallCategory.ADDITIONAL, position: 1 },
        { value: '2x', ballTypeName: 'powerplay', category: BallCategory.MULTIPLIER, position: 1 },
      ],
      jackpot: { jackpotRaw: '$310 Millones', jackpotAmount: 310000000, nextJackpotRaw: '$340 Millones', nextJackpotAmount: 340000000 },
      prizes: [
        { matchPattern: '5+1', prizeAmountRaw: '$310,000,000', prizeAmount: 310000000, winnersCount: 0 },
        { matchPattern: '5+0', prizeAmountRaw: '$1,000,000', prizeAmount: 1000000, winnersCount: 1 },
        { matchPattern: '4+1', prizeAmountRaw: '$50,000', prizeAmount: 50000, winnersCount: 14 },
        { matchPattern: '4+0', prizeAmountRaw: '$100', prizeAmount: 100, winnersCount: 380 },
        { matchPattern: '3+1', prizeAmountRaw: '$100', prizeAmount: 100, winnersCount: 990 },
        { matchPattern: '3+0', prizeAmountRaw: '$7', prizeAmount: 7, winnersCount: 24000 },
        { matchPattern: '2+1', prizeAmountRaw: '$7', prizeAmount: 7, winnersCount: 18000 },
        { matchPattern: '1+1', prizeAmountRaw: '$4', prizeAmount: 4, winnersCount: 102000 },
        { matchPattern: '0+1', prizeAmountRaw: '$4', prizeAmount: 4, winnersCount: 245000 },
      ],
    },
    { drawNumber: '3910', drawDate: new Date('2026-07-22'), drawTime: '22:59', status: DrawStatus.COMPLETED, hasWinner: false,
      numbers: [
        { value: '03', category: BallCategory.MAIN, position: 1 }, { value: '22', category: BallCategory.MAIN, position: 2 },
        { value: '31', category: BallCategory.MAIN, position: 3 }, { value: '48', category: BallCategory.MAIN, position: 4 },
        { value: '67', category: BallCategory.MAIN, position: 5 },
        { value: '05', ballTypeName: 'powerball', category: BallCategory.ADDITIONAL, position: 1 },
        { value: '4x', ballTypeName: 'powerplay', category: BallCategory.MULTIPLIER, position: 1 },
      ],
      jackpot: { jackpotRaw: '$285 Millones', jackpotAmount: 285000000, nextJackpotRaw: '$310 Millones', nextJackpotAmount: 310000000 },
      prizes: [
        { matchPattern: '5+1', prizeAmountRaw: '$285,000,000', prizeAmount: 285000000, winnersCount: 0 },
        { matchPattern: '5+0', prizeAmountRaw: '$1,000,000', prizeAmount: 1000000, winnersCount: 3 },
        { matchPattern: '4+1', prizeAmountRaw: '$50,000', prizeAmount: 50000, winnersCount: 22 },
        { matchPattern: '4+0', prizeAmountRaw: '$100', prizeAmount: 100, winnersCount: 510 },
        { matchPattern: '3+1', prizeAmountRaw: '$100', prizeAmount: 100, winnersCount: 1320 },
        { matchPattern: '3+0', prizeAmountRaw: '$7', prizeAmount: 7, winnersCount: 32000 },
        { matchPattern: '2+1', prizeAmountRaw: '$7', prizeAmount: 7, winnersCount: 25000 },
        { matchPattern: '1+1', prizeAmountRaw: '$4', prizeAmount: 4, winnersCount: 138000 },
        { matchPattern: '0+1', prizeAmountRaw: '$4', prizeAmount: 4, winnersCount: 318000 },
      ],
    },
    { drawNumber: '3909', drawDate: new Date('2026-07-20'), drawTime: '22:59', status: DrawStatus.COMPLETED, hasWinner: false,
      numbers: [
        { value: '09', category: BallCategory.MAIN, position: 1 }, { value: '16', category: BallCategory.MAIN, position: 2 },
        { value: '38', category: BallCategory.MAIN, position: 3 }, { value: '52', category: BallCategory.MAIN, position: 4 },
        { value: '65', category: BallCategory.MAIN, position: 5 },
        { value: '21', ballTypeName: 'powerball', category: BallCategory.ADDITIONAL, position: 1 },
        { value: '5x', ballTypeName: 'powerplay', category: BallCategory.MULTIPLIER, position: 1 },
      ],
      jackpot: { jackpotRaw: '$258 Millones', jackpotAmount: 258000000, nextJackpotRaw: '$285 Millones', nextJackpotAmount: 285000000 },
      prizes: [
        { matchPattern: '5+1', prizeAmountRaw: '$258,000,000', prizeAmount: 258000000, winnersCount: 0 },
        { matchPattern: '5+0', prizeAmountRaw: '$1,000,000', prizeAmount: 1000000, winnersCount: 0 },
        { matchPattern: '4+1', prizeAmountRaw: '$50,000', prizeAmount: 50000, winnersCount: 11 },
        { matchPattern: '4+0', prizeAmountRaw: '$100', prizeAmount: 100, winnersCount: 290 },
        { matchPattern: '3+1', prizeAmountRaw: '$100', prizeAmount: 100, winnersCount: 780 },
        { matchPattern: '3+0', prizeAmountRaw: '$7', prizeAmount: 7, winnersCount: 19800 },
        { matchPattern: '2+1', prizeAmountRaw: '$7', prizeAmount: 7, winnersCount: 15200 },
        { matchPattern: '1+1', prizeAmountRaw: '$4', prizeAmount: 4, winnersCount: 84000 },
        { matchPattern: '0+1', prizeAmountRaw: '$4', prizeAmount: 4, winnersCount: 195000 },
      ],
    },
    { drawNumber: '3908', drawDate: new Date('2026-07-18'), drawTime: '22:59', status: DrawStatus.COMPLETED, hasWinner: false,
      numbers: [
        { value: '02', category: BallCategory.MAIN, position: 1 }, { value: '13', category: BallCategory.MAIN, position: 2 },
        { value: '29', category: BallCategory.MAIN, position: 3 }, { value: '41', category: BallCategory.MAIN, position: 4 },
        { value: '57', category: BallCategory.MAIN, position: 5 },
        { value: '18', ballTypeName: 'powerball', category: BallCategory.ADDITIONAL, position: 1 },
        { value: '3x', ballTypeName: 'powerplay', category: BallCategory.MULTIPLIER, position: 1 },
      ],
      jackpot: { jackpotRaw: '$232 Millones', jackpotAmount: 232000000, nextJackpotRaw: '$258 Millones', nextJackpotAmount: 258000000 },
      prizes: [
        { matchPattern: '5+1', prizeAmountRaw: '$232,000,000', prizeAmount: 232000000, winnersCount: 0 },
        { matchPattern: '5+0', prizeAmountRaw: '$1,000,000', prizeAmount: 1000000, winnersCount: 1 },
        { matchPattern: '4+1', prizeAmountRaw: '$50,000', prizeAmount: 50000, winnersCount: 9 },
        { matchPattern: '4+0', prizeAmountRaw: '$100', prizeAmount: 100, winnersCount: 245 },
        { matchPattern: '3+1', prizeAmountRaw: '$100', prizeAmount: 100, winnersCount: 0 },
        { matchPattern: '3+0', prizeAmountRaw: '$7', prizeAmount: 7, winnersCount: 16500 },
        { matchPattern: '2+1', prizeAmountRaw: '$7', prizeAmount: 7, winnersCount: 12800 },
        { matchPattern: '1+1', prizeAmountRaw: '$4', prizeAmount: 4, winnersCount: 71000 },
        { matchPattern: '0+1', prizeAmountRaw: '$4', prizeAmount: 4, winnersCount: 165000 },
      ],
    },
  ], {});
  console.log(`✅ 5 sorteos Powerball`);

  // ════════════════════════════════════════════════════
  // MEGA MILLIONS DRAWS (5)
  // ════════════════════════════════════════════════════
  await createDraws(mega.id, [
    { drawNumber: '2548', drawDate: new Date('2026-07-25'), drawTime: '23:00', status: DrawStatus.COMPLETED, hasWinner: false,
      numbers: [
        { value: '08', category: BallCategory.MAIN, position: 1 }, { value: '17', category: BallCategory.MAIN, position: 2 },
        { value: '29', category: BallCategory.MAIN, position: 3 }, { value: '41', category: BallCategory.MAIN, position: 4 },
        { value: '63', category: BallCategory.MAIN, position: 5 },
        { value: '15', ballTypeName: 'mega_ball', category: BallCategory.ADDITIONAL, position: 1 },
        { value: '4x', ballTypeName: 'megaplier', category: BallCategory.MULTIPLIER, position: 1 },
      ],
      jackpot: { jackpotRaw: '$265 Millones', jackpotAmount: 265000000, nextJackpotRaw: '$280 Millones', nextJackpotAmount: 280000000, nextDrawDate: new Date('2026-07-29T23:00:00Z') },
      prizes: [
        { matchPattern: '5+1', prizeAmountRaw: '$265,000,000', prizeAmount: 265000000, winnersCount: 0 },
        { matchPattern: '5+0', prizeAmountRaw: '$1,000,000', prizeAmount: 1000000, winnersCount: 1 },
        { matchPattern: '4+1', prizeAmountRaw: '$10,000', prizeAmount: 10000, winnersCount: 12 },
        { matchPattern: '4+0', prizeAmountRaw: '$500', prizeAmount: 500, winnersCount: 340 },
        { matchPattern: '3+1', prizeAmountRaw: '$200', prizeAmount: 200, winnersCount: 680 },
        { matchPattern: '3+0', prizeAmountRaw: '$10', prizeAmount: 10, winnersCount: 18900 },
        { matchPattern: '2+1', prizeAmountRaw: '$10', prizeAmount: 10, winnersCount: 15400 },
        { matchPattern: '1+1', prizeAmountRaw: '$4', prizeAmount: 4, winnersCount: 86000 },
        { matchPattern: '0+1', prizeAmountRaw: '$2', prizeAmount: 2, winnersCount: 224000 },
      ],
    },
    { drawNumber: '2547', drawDate: new Date('2026-07-22'), drawTime: '23:00', status: DrawStatus.COMPLETED, hasWinner: false,
      numbers: [
        { value: '04', category: BallCategory.MAIN, position: 1 }, { value: '21', category: BallCategory.MAIN, position: 2 },
        { value: '38', category: BallCategory.MAIN, position: 3 }, { value: '52', category: BallCategory.MAIN, position: 4 },
        { value: '69', category: BallCategory.MAIN, position: 5 },
        { value: '08', ballTypeName: 'mega_ball', category: BallCategory.ADDITIONAL, position: 1 },
        { value: '2x', ballTypeName: 'megaplier', category: BallCategory.MULTIPLIER, position: 1 },
      ],
      jackpot: { jackpotRaw: '$250 Millones', jackpotAmount: 250000000, nextJackpotRaw: '$265 Millones', nextJackpotAmount: 265000000 },
      prizes: [
        { matchPattern: '5+1', prizeAmountRaw: '$250,000,000', prizeAmount: 250000000, winnersCount: 0 },
        { matchPattern: '5+0', prizeAmountRaw: '$1,000,000', prizeAmount: 1000000, winnersCount: 0 },
        { matchPattern: '4+1', prizeAmountRaw: '$10,000', prizeAmount: 10000, winnersCount: 9 },
        { matchPattern: '4+0', prizeAmountRaw: '$500', prizeAmount: 500, winnersCount: 260 },
        { matchPattern: '3+1', prizeAmountRaw: '$200', prizeAmount: 200, winnersCount: 510 },
        { matchPattern: '3+0', prizeAmountRaw: '$10', prizeAmount: 10, winnersCount: 14400 },
        { matchPattern: '2+1', prizeAmountRaw: '$10', prizeAmount: 10, winnersCount: 11800 },
        { matchPattern: '1+1', prizeAmountRaw: '$4', prizeAmount: 4, winnersCount: 66000 },
        { matchPattern: '0+1', prizeAmountRaw: '$2', prizeAmount: 2, winnersCount: 172000 },
      ],
    },
    { drawNumber: '2546', drawDate: new Date('2026-07-18'), drawTime: '23:00', status: DrawStatus.COMPLETED, hasWinner: false,
      numbers: [
        { value: '11', category: BallCategory.MAIN, position: 1 }, { value: '26', category: BallCategory.MAIN, position: 2 },
        { value: '44', category: BallCategory.MAIN, position: 3 }, { value: '58', category: BallCategory.MAIN, position: 4 },
        { value: '66', category: BallCategory.MAIN, position: 5 },
        { value: '22', ballTypeName: 'mega_ball', category: BallCategory.ADDITIONAL, position: 1 },
        { value: '3x', ballTypeName: 'megaplier', category: BallCategory.MULTIPLIER, position: 1 },
      ],
      jackpot: { jackpotRaw: '$230 Millones', jackpotAmount: 230000000, nextJackpotRaw: '$250 Millones', nextJackpotAmount: 250000000 },
      prizes: [
        { matchPattern: '5+1', prizeAmountRaw: '$230,000,000', prizeAmount: 230000000, winnersCount: 0 },
        { matchPattern: '5+0', prizeAmountRaw: '$1,000,000', prizeAmount: 1000000, winnersCount: 2 },
        { matchPattern: '4+1', prizeAmountRaw: '$10,000', prizeAmount: 10000, winnersCount: 15 },
        { matchPattern: '4+0', prizeAmountRaw: '$500', prizeAmount: 500, winnersCount: 390 },
        { matchPattern: '3+1', prizeAmountRaw: '$200', prizeAmount: 200, winnersCount: 760 },
        { matchPattern: '3+0', prizeAmountRaw: '$10', prizeAmount: 10, winnersCount: 21200 },
        { matchPattern: '2+1', prizeAmountRaw: '$10', prizeAmount: 10, winnersCount: 17400 },
        { matchPattern: '1+1', prizeAmountRaw: '$4', prizeAmount: 4, winnersCount: 97000 },
        { matchPattern: '0+1', prizeAmountRaw: '$2', prizeAmount: 2, winnersCount: 253000 },
      ],
    },
  ], {});
  console.log('✅ 3 sorteos Mega Millions');

  // ════════════════════════════════════════════════════
  // FLORIDA LOTTO (3 draws)
  // ════════════════════════════════════════════════════
  await createDraws(flLotto.id, [
    { drawNumber: '2812', drawDate: new Date('2026-07-27'), drawTime: '23:15', status: DrawStatus.COMPLETED, hasWinner: false,
      numbers: [
        { value: '03', category: BallCategory.MAIN, position: 1 }, { value: '14', category: BallCategory.MAIN, position: 2 },
        { value: '22', category: BallCategory.MAIN, position: 3 }, { value: '38', category: BallCategory.MAIN, position: 4 },
        { value: '45', category: BallCategory.MAIN, position: 5 }, { value: '52', category: BallCategory.MAIN, position: 6 },
      ],
      jackpot: { jackpotRaw: '$14.25 Millones', jackpotAmount: 14250000, nextJackpotRaw: '$16 Millones', nextJackpotAmount: 16000000, nextDrawDate: new Date('2026-07-29T23:15:00Z') },
      prizes: [
        { matchPattern: '6/6', prizeAmountRaw: '$14,250,000', prizeAmount: 14250000, winnersCount: 0 },
        { matchPattern: '5/6', prizeAmountRaw: '$5,000', prizeAmount: 5000, winnersCount: 12 },
        { matchPattern: '4/6', prizeAmountRaw: '$100', prizeAmount: 100, winnersCount: 480 },
        { matchPattern: '3/6', prizeAmountRaw: '$5', prizeAmount: 5, winnersCount: 12500 },
      ],
    },
    { drawNumber: '2811', drawDate: new Date('2026-07-25'), drawTime: '23:15', status: DrawStatus.COMPLETED, hasWinner: false,
      numbers: [
        { value: '07', category: BallCategory.MAIN, position: 1 }, { value: '19', category: BallCategory.MAIN, position: 2 },
        { value: '31', category: BallCategory.MAIN, position: 3 }, { value: '36', category: BallCategory.MAIN, position: 4 },
        { value: '48', category: BallCategory.MAIN, position: 5 }, { value: '53', category: BallCategory.MAIN, position: 6 },
      ],
      jackpot: { jackpotRaw: '$12.5 Millones', jackpotAmount: 12500000, nextJackpotRaw: '$14.25 Millones', nextJackpotAmount: 14250000 },
      prizes: [
        { matchPattern: '6/6', prizeAmountRaw: '$12,500,000', prizeAmount: 12500000, winnersCount: 0 },
        { matchPattern: '5/6', prizeAmountRaw: '$4,200', prizeAmount: 4200, winnersCount: 8 },
        { matchPattern: '4/6', prizeAmountRaw: '$85', prizeAmount: 85, winnersCount: 390 },
        { matchPattern: '3/6', prizeAmountRaw: '$5', prizeAmount: 5, winnersCount: 10200 },
      ],
    },
    { drawNumber: '2810', drawDate: new Date('2026-07-22'), drawTime: '23:15', status: DrawStatus.COMPLETED, hasWinner: false,
      numbers: [
        { value: '01', category: BallCategory.MAIN, position: 1 }, { value: '11', category: BallCategory.MAIN, position: 2 },
        { value: '24', category: BallCategory.MAIN, position: 3 }, { value: '33', category: BallCategory.MAIN, position: 4 },
        { value: '42', category: BallCategory.MAIN, position: 5 }, { value: '49', category: BallCategory.MAIN, position: 6 },
      ],
      jackpot: { jackpotRaw: '$11 Millones', jackpotAmount: 11000000, nextJackpotRaw: '$12.5 Millones', nextJackpotAmount: 12500000 },
      prizes: [
        { matchPattern: '6/6', prizeAmountRaw: '$11,000,000', prizeAmount: 11000000, winnersCount: 1 },
        { matchPattern: '5/6', prizeAmountRaw: '$6,200', prizeAmount: 6200, winnersCount: 14 },
        { matchPattern: '4/6', prizeAmountRaw: '$95', prizeAmount: 95, winnersCount: 520 },
        { matchPattern: '3/6', prizeAmountRaw: '$5', prizeAmount: 5, winnersCount: 13800 },
      ],
    },
  ], {});
  console.log('✅ 3 sorteos Florida Lotto');

  // ════════════════════════════════════════════════════
  // LOTTO TEXAS (2 draws)
  // ════════════════════════════════════════════════════
  await createDraws(txLotto.id, [
    { drawNumber: '3105', drawDate: new Date('2026-07-27'), drawTime: '22:12', status: DrawStatus.COMPLETED, hasWinner: false,
      numbers: [
        { value: '04', category: BallCategory.MAIN, position: 1 }, { value: '16', category: BallCategory.MAIN, position: 2 },
        { value: '23', category: BallCategory.MAIN, position: 3 }, { value: '37', category: BallCategory.MAIN, position: 4 },
        { value: '42', category: BallCategory.MAIN, position: 5 }, { value: '50', category: BallCategory.MAIN, position: 6 },
      ],
      jackpot: { jackpotRaw: '$8.75 Millones', jackpotAmount: 8750000, nextJackpotRaw: '$10 Millones', nextJackpotAmount: 10000000, nextDrawDate: new Date('2026-07-29T22:12:00Z') },
      prizes: [
        { matchPattern: '6/6', prizeAmountRaw: '$8,750,000', prizeAmount: 8750000, winnersCount: 0 },
        { matchPattern: '5/6', prizeAmountRaw: '$3,000', prizeAmount: 3000, winnersCount: 18 },
        { matchPattern: '4/6', prizeAmountRaw: '$50', prizeAmount: 50, winnersCount: 620 },
        { matchPattern: '3/6', prizeAmountRaw: '$3', prizeAmount: 3, winnersCount: 14500 },
      ],
    },
    { drawNumber: '3104', drawDate: new Date('2026-07-25'), drawTime: '22:12', status: DrawStatus.COMPLETED, hasWinner: false,
      numbers: [
        { value: '07', category: BallCategory.MAIN, position: 1 }, { value: '19', category: BallCategory.MAIN, position: 2 },
        { value: '28', category: BallCategory.MAIN, position: 3 }, { value: '33', category: BallCategory.MAIN, position: 4 },
        { value: '44', category: BallCategory.MAIN, position: 5 }, { value: '51', category: BallCategory.MAIN, position: 6 },
      ],
      jackpot: { jackpotRaw: '$7.25 Millones', jackpotAmount: 7250000, nextJackpotRaw: '$8.75 Millones', nextJackpotAmount: 8750000 },
      prizes: [
        { matchPattern: '6/6', prizeAmountRaw: '$7,250,000', prizeAmount: 7250000, winnersCount: 0 },
        { matchPattern: '5/6', prizeAmountRaw: '$2,500', prizeAmount: 2500, winnersCount: 11 },
        { matchPattern: '4/6', prizeAmountRaw: '$40', prizeAmount: 40, winnersCount: 480 },
        { matchPattern: '3/6', prizeAmountRaw: '$3', prizeAmount: 3, winnersCount: 11200 },
      ],
    },
  ], {});
  console.log('✅ 2 sorteos Lotto Texas');

  // ════════════════════════════════════════════════════
  // SUPERLOTTO PLUS (2 draws)
  // ════════════════════════════════════════════════════
  await createDraws(caLotto.id, [
    { drawNumber: '4521', drawDate: new Date('2026-07-26'), drawTime: '20:00', status: DrawStatus.COMPLETED, hasWinner: false,
      numbers: [
        { value: '05', category: BallCategory.MAIN, position: 1 }, { value: '12', category: BallCategory.MAIN, position: 2 },
        { value: '23', category: BallCategory.MAIN, position: 3 }, { value: '34', category: BallCategory.MAIN, position: 4 },
        { value: '45', category: BallCategory.MAIN, position: 5 },
        { value: '17', ballTypeName: 'mega_number', category: BallCategory.ADDITIONAL, position: 1 },
      ],
      jackpot: { jackpotRaw: '$22 Millones', jackpotAmount: 22000000, nextJackpotRaw: '$25 Millones', nextJackpotAmount: 25000000, nextDrawDate: new Date('2026-07-29T20:00:00Z') },
      prizes: [
        { matchPattern: '5+1', prizeAmountRaw: '$22,000,000', prizeAmount: 22000000, winnersCount: 0 },
        { matchPattern: '5+0', prizeAmountRaw: '$30,000', prizeAmount: 30000, winnersCount: 2 },
        { matchPattern: '4+1', prizeAmountRaw: '$1,000', prizeAmount: 1000, winnersCount: 45 },
        { matchPattern: '4+0', prizeAmountRaw: '$100', prizeAmount: 100, winnersCount: 580 },
        { matchPattern: '3+1', prizeAmountRaw: '$50', prizeAmount: 50, winnersCount: 1200 },
        { matchPattern: '3+0', prizeAmountRaw: '$10', prizeAmount: 10, winnersCount: 15000 },
      ],
    },
    { drawNumber: '4520', drawDate: new Date('2026-07-23'), drawTime: '20:00', status: DrawStatus.COMPLETED, hasWinner: false,
      numbers: [
        { value: '02', category: BallCategory.MAIN, position: 1 }, { value: '18', category: BallCategory.MAIN, position: 2 },
        { value: '27', category: BallCategory.MAIN, position: 3 }, { value: '39', category: BallCategory.MAIN, position: 4 },
        { value: '46', category: BallCategory.MAIN, position: 5 },
        { value: '08', ballTypeName: 'mega_number', category: BallCategory.ADDITIONAL, position: 1 },
      ],
      jackpot: { jackpotRaw: '$19 Millones', jackpotAmount: 19000000, nextJackpotRaw: '$22 Millones', nextJackpotAmount: 22000000 },
      prizes: [
        { matchPattern: '5+1', prizeAmountRaw: '$19,000,000', prizeAmount: 19000000, winnersCount: 0 },
        { matchPattern: '5+0', prizeAmountRaw: '$25,000', prizeAmount: 25000, winnersCount: 1 },
        { matchPattern: '4+1', prizeAmountRaw: '$800', prizeAmount: 800, winnersCount: 32 },
        { matchPattern: '4+0', prizeAmountRaw: '$80', prizeAmount: 80, winnersCount: 420 },
        { matchPattern: '3+1', prizeAmountRaw: '$40', prizeAmount: 40, winnersCount: 980 },
        { matchPattern: '3+0', prizeAmountRaw: '$10', prizeAmount: 10, winnersCount: 12400 },
      ],
    },
  ], {});
  console.log('✅ 2 sorteos SuperLotto Plus');

  // ════════════════════════════════════════════════════
  // EUROMILLONES (3 draws)
  // ════════════════════════════════════════════════════
  await createDraws(euromillones.id, [
    { drawNumber: '128', drawDate: new Date('2026-07-25'), drawTime: '21:00', status: DrawStatus.COMPLETED, hasWinner: false,
      numbers: [
        { value: '07', category: BallCategory.MAIN, position: 1 }, { value: '14', category: BallCategory.MAIN, position: 2 },
        { value: '23', category: BallCategory.MAIN, position: 3 }, { value: '39', category: BallCategory.MAIN, position: 4 },
        { value: '45', category: BallCategory.MAIN, position: 5 },
        { value: '03', ballTypeName: 'estrella', category: BallCategory.ADDITIONAL, position: 1 },
        { value: '11', ballTypeName: 'estrella', category: BallCategory.ADDITIONAL, position: 2 },
      ],
      jackpot: { jackpotRaw: '€75 Millones', jackpotAmount: 75000000, nextJackpotRaw: '€85 Millones', nextJackpotAmount: 85000000, nextDrawDate: new Date('2026-07-28T21:00:00Z') },
      prizes: [
        { matchPattern: '5+2', prizeAmountRaw: '€75,000,000', prizeAmount: 75000000, winnersCount: 0 },
        { matchPattern: '5+1', prizeAmountRaw: '€250,000', prizeAmount: 250000, winnersCount: 2 },
        { matchPattern: '5+0', prizeAmountRaw: '€17,000', prizeAmount: 17000, winnersCount: 5 },
        { matchPattern: '4+2', prizeAmountRaw: '€1,500', prizeAmount: 1500, winnersCount: 28 },
        { matchPattern: '4+1', prizeAmountRaw: '€150', prizeAmount: 150, winnersCount: 340 },
        { matchPattern: '3+2', prizeAmountRaw: '€60', prizeAmount: 60, winnersCount: 680 },
        { matchPattern: '2+2', prizeAmountRaw: '€15', prizeAmount: 15, winnersCount: 4200 },
      ],
    },
    { drawNumber: '127', drawDate: new Date('2026-07-22'), drawTime: '21:00', status: DrawStatus.COMPLETED, hasWinner: false,
      numbers: [
        { value: '04', category: BallCategory.MAIN, position: 1 }, { value: '11', category: BallCategory.MAIN, position: 2 },
        { value: '28', category: BallCategory.MAIN, position: 3 }, { value: '36', category: BallCategory.MAIN, position: 4 },
        { value: '48', category: BallCategory.MAIN, position: 5 },
        { value: '07', ballTypeName: 'estrella', category: BallCategory.ADDITIONAL, position: 1 },
        { value: '09', ballTypeName: 'estrella', category: BallCategory.ADDITIONAL, position: 2 },
      ],
      jackpot: { jackpotRaw: '€65 Millones', jackpotAmount: 65000000, nextJackpotRaw: '€75 Millones', nextJackpotAmount: 75000000 },
      prizes: [
        { matchPattern: '5+2', prizeAmountRaw: '€65,000,000', prizeAmount: 65000000, winnersCount: 0 },
        { matchPattern: '5+1', prizeAmountRaw: '€180,000', prizeAmount: 180000, winnersCount: 1 },
        { matchPattern: '5+0', prizeAmountRaw: '€14,000', prizeAmount: 14000, winnersCount: 4 },
        { matchPattern: '4+2', prizeAmountRaw: '€1,200', prizeAmount: 1200, winnersCount: 22 },
        { matchPattern: '4+1', prizeAmountRaw: '€120', prizeAmount: 120, winnersCount: 280 },
        { matchPattern: '3+2', prizeAmountRaw: '€45', prizeAmount: 45, winnersCount: 520 },
      ],
    },
    { drawNumber: '126', drawDate: new Date('2026-07-19'), drawTime: '21:00', status: DrawStatus.COMPLETED, hasWinner: false,
      numbers: [
        { value: '02', category: BallCategory.MAIN, position: 1 }, { value: '09', category: BallCategory.MAIN, position: 2 },
        { value: '17', category: BallCategory.MAIN, position: 3 }, { value: '31', category: BallCategory.MAIN, position: 4 },
        { value: '42', category: BallCategory.MAIN, position: 5 },
        { value: '05', ballTypeName: 'estrella', category: BallCategory.ADDITIONAL, position: 1 },
        { value: '10', ballTypeName: 'estrella', category: BallCategory.ADDITIONAL, position: 2 },
      ],
      jackpot: { jackpotRaw: '€55 Millones', jackpotAmount: 55000000, nextJackpotRaw: '€65 Millones', nextJackpotAmount: 65000000 },
      prizes: [
        { matchPattern: '5+2', prizeAmountRaw: '€55,000,000', prizeAmount: 55000000, winnersCount: 0 },
        { matchPattern: '5+1', prizeAmountRaw: '€150,000', prizeAmount: 150000, winnersCount: 3 },
        { matchPattern: '5+0', prizeAmountRaw: '€12,000', prizeAmount: 12000, winnersCount: 6 },
        { matchPattern: '4+2', prizeAmountRaw: '€1,000', prizeAmount: 1000, winnersCount: 18 },
        { matchPattern: '4+1', prizeAmountRaw: '€100', prizeAmount: 100, winnersCount: 240 },
      ],
    },
  ], {});
  console.log('✅ 3 sorteos EuroMillones');

  // ════════════════════════════════════════════════════
  // LA PRIMITIVA (2 draws)
  // ════════════════════════════════════════════════════
  await createDraws(primitiva.id, [
    { drawNumber: '4125', drawDate: new Date('2026-07-26'), drawTime: '21:30', status: DrawStatus.COMPLETED, hasWinner: false,
      numbers: [
        { value: '03', category: BallCategory.MAIN, position: 1 }, { value: '12', category: BallCategory.MAIN, position: 2 },
        { value: '21', category: BallCategory.MAIN, position: 3 }, { value: '34', category: BallCategory.MAIN, position: 4 },
        { value: '42', category: BallCategory.MAIN, position: 5 }, { value: '48', category: BallCategory.MAIN, position: 6 },
        { value: '16', ballTypeName: 'complementario', category: BallCategory.ADDITIONAL, position: 1 },
        { value: '5', ballTypeName: 'reintegro', category: BallCategory.ADDITIONAL, position: 2 },
      ],
      jackpot: { jackpotRaw: '€12.5 Millones', jackpotAmount: 12500000, nextJackpotRaw: '€14 Millones', nextJackpotAmount: 14000000, nextDrawDate: new Date('2026-07-29T21:30:00Z') },
      prizes: [
        { matchPattern: '6+R', prizeAmountRaw: '€12,500,000', prizeAmount: 12500000, winnersCount: 0 },
        { matchPattern: '6', prizeAmountRaw: '€800,000', prizeAmount: 800000, winnersCount: 0 },
        { matchPattern: '5+C', prizeAmountRaw: '€60,000', prizeAmount: 60000, winnersCount: 3 },
        { matchPattern: '5', prizeAmountRaw: '€1,500', prizeAmount: 1500, winnersCount: 42 },
        { matchPattern: '4', prizeAmountRaw: '€150', prizeAmount: 150, winnersCount: 1280 },
        { matchPattern: '3', prizeAmountRaw: '€8', prizeAmount: 8, winnersCount: 28500 },
      ],
    },
    { drawNumber: '4124', drawDate: new Date('2026-07-24'), drawTime: '21:30', status: DrawStatus.COMPLETED, hasWinner: false,
      numbers: [
        { value: '06', category: BallCategory.MAIN, position: 1 }, { value: '15', category: BallCategory.MAIN, position: 2 },
        { value: '27', category: BallCategory.MAIN, position: 3 }, { value: '33', category: BallCategory.MAIN, position: 4 },
        { value: '41', category: BallCategory.MAIN, position: 5 }, { value: '49', category: BallCategory.MAIN, position: 6 },
        { value: '08', ballTypeName: 'complementario', category: BallCategory.ADDITIONAL, position: 1 },
        { value: '2', ballTypeName: 'reintegro', category: BallCategory.ADDITIONAL, position: 2 },
      ],
      jackpot: { jackpotRaw: '€10.8 Millones', jackpotAmount: 10800000, nextJackpotRaw: '€12.5 Millones', nextJackpotAmount: 12500000 },
      prizes: [
        { matchPattern: '6+R', prizeAmountRaw: '€10,800,000', prizeAmount: 10800000, winnersCount: 0 },
        { matchPattern: '6', prizeAmountRaw: '€600,000', prizeAmount: 600000, winnersCount: 0 },
        { matchPattern: '5+C', prizeAmountRaw: '€45,000', prizeAmount: 45000, winnersCount: 2 },
        { matchPattern: '5', prizeAmountRaw: '€1,200', prizeAmount: 1200, winnersCount: 36 },
        { matchPattern: '4', prizeAmountRaw: '€120', prizeAmount: 120, winnersCount: 980 },
        { matchPattern: '3', prizeAmountRaw: '€8', prizeAmount: 8, winnersCount: 22000 },
      ],
    },
  ], {});
  console.log('✅ 2 sorteos La Primitiva');

  // ════════════════════════════════════════════════════
  // BONOLOTO (2 draws)
  // ════════════════════════════════════════════════════
  await createDraws(bonoloto.id, [
    { drawNumber: '8912', drawDate: new Date('2026-07-27'), drawTime: '21:30', status: DrawStatus.COMPLETED, hasWinner: false,
      numbers: [
        { value: '08', category: BallCategory.MAIN, position: 1 }, { value: '13', category: BallCategory.MAIN, position: 2 },
        { value: '25', category: BallCategory.MAIN, position: 3 }, { value: '32', category: BallCategory.MAIN, position: 4 },
        { value: '44', category: BallCategory.MAIN, position: 5 }, { value: '47', category: BallCategory.MAIN, position: 6 },
        { value: '22', ballTypeName: 'complementario', category: BallCategory.ADDITIONAL, position: 1 },
        { value: '8', ballTypeName: 'reintegro', category: BallCategory.ADDITIONAL, position: 2 },
      ],
      jackpot: { jackpotRaw: '€2.4 Millones', jackpotAmount: 2400000, nextJackpotRaw: '€2.8 Millones', nextJackpotAmount: 2800000, nextDrawDate: new Date('2026-07-28T21:30:00Z') },
      prizes: [
        { matchPattern: '6', prizeAmountRaw: '€2,400,000', prizeAmount: 2400000, winnersCount: 0 },
        { matchPattern: '5+C', prizeAmountRaw: '€50,000', prizeAmount: 50000, winnersCount: 1 },
        { matchPattern: '5', prizeAmountRaw: '€800', prizeAmount: 800, winnersCount: 28 },
        { matchPattern: '4', prizeAmountRaw: '€25', prizeAmount: 25, winnersCount: 1800 },
        { matchPattern: '3', prizeAmountRaw: '€1', prizeAmount: 1, winnersCount: 42000 },
      ],
    },
    { drawNumber: '8911', drawDate: new Date('2026-07-26'), drawTime: '21:30', status: DrawStatus.COMPLETED, hasWinner: true,
      numbers: [
        { value: '01', category: BallCategory.MAIN, position: 1 }, { value: '10', category: BallCategory.MAIN, position: 2 },
        { value: '19', category: BallCategory.MAIN, position: 3 }, { value: '28', category: BallCategory.MAIN, position: 4 },
        { value: '36', category: BallCategory.MAIN, position: 5 }, { value: '46', category: BallCategory.MAIN, position: 6 },
        { value: '14', ballTypeName: 'complementario', category: BallCategory.ADDITIONAL, position: 1 },
        { value: '3', ballTypeName: 'reintegro', category: BallCategory.ADDITIONAL, position: 2 },
      ],
      jackpot: { jackpotRaw: '€1.8 Millones', jackpotAmount: 1800000, nextJackpotRaw: '€2.4 Millones', nextJackpotAmount: 2400000 },
      prizes: [
        { matchPattern: '6', prizeAmountRaw: '€1,800,000', prizeAmount: 1800000, winnersCount: 1 },
        { matchPattern: '5+C', prizeAmountRaw: '€40,000', prizeAmount: 40000, winnersCount: 2 },
        { matchPattern: '5', prizeAmountRaw: '€600', prizeAmount: 600, winnersCount: 35 },
        { matchPattern: '4', prizeAmountRaw: '€20', prizeAmount: 20, winnersCount: 2100 },
        { matchPattern: '3', prizeAmountRaw: '€1', prizeAmount: 1, winnersCount: 38000 },
      ],
    },
  ], {});
  console.log('✅ 2 sorteos Bonoloto');

  // ════════════════════════════════════════════════════
  // MELATE (2 draws)
  // ════════════════════════════════════════════════════
  await createDraws(melate.id, [
    { drawNumber: '7125', drawDate: new Date('2026-07-27'), drawTime: '21:00', status: DrawStatus.COMPLETED, hasWinner: false,
      numbers: [
        { value: '05', category: BallCategory.MAIN, position: 1 }, { value: '14', category: BallCategory.MAIN, position: 2 },
        { value: '23', category: BallCategory.MAIN, position: 3 }, { value: '31', category: BallCategory.MAIN, position: 4 },
        { value: '42', category: BallCategory.MAIN, position: 5 }, { value: '50', category: BallCategory.MAIN, position: 6 },
        { value: '28', ballTypeName: 'adicional', category: BallCategory.ADDITIONAL, position: 1 },
      ],
      jackpot: { jackpotRaw: '$38 Millones', jackpotAmount: 38000000, nextJackpotRaw: '$42 Millones', nextJackpotAmount: 42000000, nextDrawDate: new Date('2026-07-29T21:00:00Z') },
      prizes: [
        { matchPattern: '6', prizeAmountRaw: '$38,000,000', prizeAmount: 38000000, winnersCount: 0 },
        { matchPattern: '5+A', prizeAmountRaw: '$150,000', prizeAmount: 150000, winnersCount: 2 },
        { matchPattern: '5', prizeAmountRaw: '$8,000', prizeAmount: 8000, winnersCount: 15 },
        { matchPattern: '4', prizeAmountRaw: '$500', prizeAmount: 500, winnersCount: 420 },
        { matchPattern: '3', prizeAmountRaw: '$30', prizeAmount: 30, winnersCount: 8500 },
      ],
    },
    { drawNumber: '7124', drawDate: new Date('2026-07-25'), drawTime: '21:00', status: DrawStatus.COMPLETED, hasWinner: false,
      numbers: [
        { value: '02', category: BallCategory.MAIN, position: 1 }, { value: '11', category: BallCategory.MAIN, position: 2 },
        { value: '19', category: BallCategory.MAIN, position: 3 }, { value: '27', category: BallCategory.MAIN, position: 4 },
        { value: '35', category: BallCategory.MAIN, position: 5 }, { value: '44', category: BallCategory.MAIN, position: 6 },
        { value: '38', ballTypeName: 'adicional', category: BallCategory.ADDITIONAL, position: 1 },
      ],
      jackpot: { jackpotRaw: '$34 Millones', jackpotAmount: 34000000, nextJackpotRaw: '$38 Millones', nextJackpotAmount: 38000000 },
      prizes: [
        { matchPattern: '6', prizeAmountRaw: '$34,000,000', prizeAmount: 34000000, winnersCount: 0 },
        { matchPattern: '5+A', prizeAmountRaw: '$120,000', prizeAmount: 120000, winnersCount: 1 },
        { matchPattern: '5', prizeAmountRaw: '$6,500', prizeAmount: 6500, winnersCount: 12 },
        { matchPattern: '4', prizeAmountRaw: '$400', prizeAmount: 400, winnersCount: 360 },
        { matchPattern: '3', prizeAmountRaw: '$25', prizeAmount: 25, winnersCount: 7200 },
      ],
    },
  ], {});
  console.log('✅ 2 sorteos Melate');

  // ════════════════════════════════════════════════════
  // CHISPAZO (2 draws)
  // ════════════════════════════════════════════════════
  await createDraws(chispazo.id, [
    { drawNumber: '22456', drawDate: new Date('2026-07-27'), drawTime: '21:00', status: DrawStatus.COMPLETED, hasWinner: false,
      numbers: [
        { value: '03', category: BallCategory.MAIN, position: 1 }, { value: '08', category: BallCategory.MAIN, position: 2 },
        { value: '14', category: BallCategory.MAIN, position: 3 }, { value: '21', category: BallCategory.MAIN, position: 4 },
        { value: '26', category: BallCategory.MAIN, position: 5 },
      ],
      jackpot: { jackpotRaw: '$680,000', jackpotAmount: 680000, nextJackpotRaw: '$750,000', nextJackpotAmount: 750000, nextDrawDate: new Date('2026-07-28T21:00:00Z') },
      prizes: [
        { matchPattern: '5/5', prizeAmountRaw: '$680,000', prizeAmount: 680000, winnersCount: 0 },
        { matchPattern: '4/5', prizeAmountRaw: '$2,500', prizeAmount: 2500, winnersCount: 18 },
        { matchPattern: '3/5', prizeAmountRaw: '$100', prizeAmount: 100, winnersCount: 520 },
        { matchPattern: '2/5', prizeAmountRaw: '$10', prizeAmount: 10, winnersCount: 8200 },
      ],
    },
    { drawNumber: '22455', drawDate: new Date('2026-07-26'), drawTime: '21:00', status: DrawStatus.COMPLETED, hasWinner: true,
      numbers: [
        { value: '01', category: BallCategory.MAIN, position: 1 }, { value: '07', category: BallCategory.MAIN, position: 2 },
        { value: '12', category: BallCategory.MAIN, position: 3 }, { value: '18', category: BallCategory.MAIN, position: 4 },
        { value: '25', category: BallCategory.MAIN, position: 5 },
      ],
      jackpot: { jackpotRaw: '$500,000', jackpotAmount: 500000, nextJackpotRaw: '$680,000', nextJackpotAmount: 680000 },
      prizes: [
        { matchPattern: '5/5', prizeAmountRaw: '$500,000', prizeAmount: 500000, winnersCount: 1 },
        { matchPattern: '4/5', prizeAmountRaw: '$2,000', prizeAmount: 2000, winnersCount: 22 },
        { matchPattern: '3/5', prizeAmountRaw: '$80', prizeAmount: 80, winnersCount: 680 },
        { matchPattern: '2/5', prizeAmountRaw: '$10', prizeAmount: 10, winnersCount: 9400 },
      ],
    },
  ], {});
  console.log('✅ 2 sorteos Chispazo');

  console.log(`
🎉 Seed completo:
   • 3 países (US, ES, MX)
   • 7 estados (NAT-US, FL, TX, CA, NAT-ES, NAT-MX)
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
