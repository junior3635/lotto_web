// prisma/seed.js
// Script de carga de datos iniciales (Seed) para MySQL con Prisma ORM
// Inserta países, loterías y sorteos históricos con combinaciones ganadoras en JSON

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando la carga de datos de demostración (Seed)...');

  // ─────────────────────────────────────────────
  // 1. PAÍSES
  // ─────────────────────────────────────────────
  const usCountry = await prisma.country.upsert({
    where: { id: 'us' },
    update: {},
    create: {
      id: 'us',
      code: 'US',
      name: 'Estados Unidos',
      slug: 'us',
      flagEmoji: '🇺🇸',
      currency: 'USD',
    },
  });

  console.log('✅ País creado/verificado: EE. UU. (US)');

  // ─────────────────────────────────────────────
  // 2. LOTERÍAS
  // ─────────────────────────────────────────────
  const powerball = await prisma.lottery.upsert({
    where: { countryId_slug: { countryId: 'us', slug: 'powerball' } },
    update: {},
    create: {
      countryId: usCountry.id,
      name: 'Powerball',
      slug: 'powerball',
      description:
        'La lotería multimillonaria de Estados Unidos. Selecciona 5 números del 1 al 69 y 1 número Powerball del 1 al 26. Sorteos: lunes, miércoles y sábados.',
      primaryColor: '#DC2626',
      drawDays: ['MON', 'WED', 'SAT'],
      drawTime: '22:59 EST',
      totalNumbers: 5,
      numberRangeMax: 69,
      totalSpecialBalls: 1,
      specialBallRangeMax: 26,
      specialBallName: 'Powerball',
      hasMultiplier: true,
      multiplierName: 'Power Play',
    },
  });

  const megaMillions = await prisma.lottery.upsert({
    where: { countryId_slug: { countryId: 'us', slug: 'mega-millions' } },
    update: {},
    create: {
      countryId: usCountry.id,
      name: 'Mega Millions',
      slug: 'mega-millions',
      description:
        'Una de las loterías más grandes de EE. UU. Elige 5 números del 1 al 70 y 1 número Mega Ball del 1 al 25. Sorteos: martes y viernes.',
      primaryColor: '#D97706',
      drawDays: ['TUE', 'FRI'],
      drawTime: '23:00 EST',
      totalNumbers: 5,
      numberRangeMax: 70,
      totalSpecialBalls: 1,
      specialBallRangeMax: 25,
      specialBallName: 'Mega Ball',
      hasMultiplier: true,
      multiplierName: 'Megaplier',
    },
  });

  console.log('✅ Loterías creadas/verificadas: Powerball y Mega Millions');

  // ─────────────────────────────────────────────
  // 3. LIMPIAR SORTEOS ANTERIORES (para re-seed limpio)
  // ─────────────────────────────────────────────
  await prisma.prizeBreakdown.deleteMany({
    where: { draw: { lotteryId: { in: [powerball.id, megaMillions.id] } } },
  });
  await prisma.draw.deleteMany({
    where: { lotteryId: { in: [powerball.id, megaMillions.id] } },
  });
  console.log('🧹 Sorteos anteriores eliminados para seed limpio.');

  // ─────────────────────────────────────────────
  // 4. SORTEOS HISTÓRICOS — POWERBALL (10 sorteos)
  // ─────────────────────────────────────────────
  const powerballDraws = [
    {
      drawNumber: '3912',
      drawDate: new Date('2026-07-26T22:59:00Z'),
      winningCombination: { numbers: [12, 24, 35, 46, 59], specialBall: 9, specialBallName: 'Powerball', multiplier: '3x', multiplierName: 'Power Play' },
      estimatedJackpot: 340000000.0,
      jackpotFormatted: '$340 Millones',
      nextDrawDate: new Date('2026-07-29T22:59:00Z'),
      nextEstimatedJackpot: 360000000.0,
      nextJackpotFormatted: '$360 Millones',
      hasWinner: false,
      prizes: [
        { categoryName: '5 Aciertos + Powerball', winnersCount: 0, prizeAmount: 340000000.0 },
        { categoryName: '5 Aciertos', winnersCount: 2, prizeAmount: 1000000.0, multiplierPrizeAmount: 2000000.0 },
        { categoryName: '4 Aciertos + Powerball', winnersCount: 18, prizeAmount: 50000.0, multiplierPrizeAmount: 150000.0 },
        { categoryName: '4 Aciertos', winnersCount: 420, prizeAmount: 100.0, multiplierPrizeAmount: 300.0 },
        { categoryName: '3 Aciertos + Powerball', winnersCount: 1150, prizeAmount: 100.0, multiplierPrizeAmount: 300.0 },
        { categoryName: '3 Aciertos', winnersCount: 28000, prizeAmount: 7.0 },
        { categoryName: '2 Aciertos + Powerball', winnersCount: 21000, prizeAmount: 7.0 },
        { categoryName: '1 Acierto + Powerball', winnersCount: 118000, prizeAmount: 4.0 },
        { categoryName: 'Solo Powerball', winnersCount: 276000, prizeAmount: 4.0 },
      ],
    },
    {
      drawNumber: '3911',
      drawDate: new Date('2026-07-23T22:59:00Z'),
      winningCombination: { numbers: [5, 18, 27, 44, 62], specialBall: 14, specialBallName: 'Powerball', multiplier: '2x', multiplierName: 'Power Play' },
      estimatedJackpot: 310000000.0,
      jackpotFormatted: '$310 Millones',
      nextEstimatedJackpot: 340000000.0,
      nextJackpotFormatted: '$340 Millones',
      hasWinner: false,
      prizes: [
        { categoryName: '5 Aciertos + Powerball', winnersCount: 0, prizeAmount: 310000000.0 },
        { categoryName: '5 Aciertos', winnersCount: 1, prizeAmount: 1000000.0, multiplierPrizeAmount: 2000000.0 },
        { categoryName: '4 Aciertos + Powerball', winnersCount: 14, prizeAmount: 50000.0, multiplierPrizeAmount: 100000.0 },
        { categoryName: '4 Aciertos', winnersCount: 380, prizeAmount: 100.0, multiplierPrizeAmount: 200.0 },
        { categoryName: '3 Aciertos + Powerball', winnersCount: 990, prizeAmount: 100.0, multiplierPrizeAmount: 200.0 },
        { categoryName: '3 Aciertos', winnersCount: 24000, prizeAmount: 7.0 },
        { categoryName: '2 Aciertos + Powerball', winnersCount: 18000, prizeAmount: 7.0 },
        { categoryName: '1 Acierto + Powerball', winnersCount: 102000, prizeAmount: 4.0 },
        { categoryName: 'Solo Powerball', winnersCount: 245000, prizeAmount: 4.0 },
      ],
    },
    {
      drawNumber: '3910',
      drawDate: new Date('2026-07-21T22:59:00Z'),
      winningCombination: { numbers: [3, 22, 31, 48, 67], specialBall: 5, specialBallName: 'Powerball', multiplier: '4x', multiplierName: 'Power Play' },
      estimatedJackpot: 285000000.0,
      jackpotFormatted: '$285 Millones',
      nextEstimatedJackpot: 310000000.0,
      nextJackpotFormatted: '$310 Millones',
      hasWinner: false,
      prizes: [
        { categoryName: '5 Aciertos + Powerball', winnersCount: 0, prizeAmount: 285000000.0 },
        { categoryName: '5 Aciertos', winnersCount: 3, prizeAmount: 1000000.0, multiplierPrizeAmount: 4000000.0 },
        { categoryName: '4 Aciertos + Powerball', winnersCount: 22, prizeAmount: 50000.0, multiplierPrizeAmount: 200000.0 },
        { categoryName: '4 Aciertos', winnersCount: 510, prizeAmount: 100.0, multiplierPrizeAmount: 400.0 },
        { categoryName: '3 Aciertos + Powerball', winnersCount: 1320, prizeAmount: 100.0, multiplierPrizeAmount: 400.0 },
        { categoryName: '3 Aciertos', winnersCount: 32000, prizeAmount: 7.0 },
        { categoryName: '2 Aciertos + Powerball', winnersCount: 25000, prizeAmount: 7.0 },
        { categoryName: '1 Acierto + Powerball', winnersCount: 138000, prizeAmount: 4.0 },
        { categoryName: 'Solo Powerball', winnersCount: 318000, prizeAmount: 4.0 },
      ],
    },
    {
      drawNumber: '3909',
      drawDate: new Date('2026-07-19T22:59:00Z'),
      winningCombination: { numbers: [9, 16, 38, 52, 65], specialBall: 21, specialBallName: 'Powerball', multiplier: '5x', multiplierName: 'Power Play' },
      estimatedJackpot: 258000000.0,
      jackpotFormatted: '$258 Millones',
      nextEstimatedJackpot: 285000000.0,
      nextJackpotFormatted: '$285 Millones',
      hasWinner: false,
      prizes: [
        { categoryName: '5 Aciertos + Powerball', winnersCount: 0, prizeAmount: 258000000.0 },
        { categoryName: '5 Aciertos', winnersCount: 0, prizeAmount: 1000000.0, multiplierPrizeAmount: 5000000.0 },
        { categoryName: '4 Aciertos + Powerball', winnersCount: 11, prizeAmount: 50000.0, multiplierPrizeAmount: 250000.0 },
        { categoryName: '4 Aciertos', winnersCount: 290, prizeAmount: 100.0, multiplierPrizeAmount: 500.0 },
        { categoryName: '3 Aciertos + Powerball', winnersCount: 780, prizeAmount: 100.0, multiplierPrizeAmount: 500.0 },
        { categoryName: '3 Aciertos', winnersCount: 19800, prizeAmount: 7.0 },
        { categoryName: '2 Aciertos + Powerball', winnersCount: 15200, prizeAmount: 7.0 },
        { categoryName: '1 Acierto + Powerball', winnersCount: 84000, prizeAmount: 4.0 },
        { categoryName: 'Solo Powerball', winnersCount: 195000, prizeAmount: 4.0 },
      ],
    },
    {
      drawNumber: '3908',
      drawDate: new Date('2026-07-16T22:59:00Z'),
      winningCombination: { numbers: [2, 13, 29, 41, 57], specialBall: 18, specialBallName: 'Powerball', multiplier: '3x', multiplierName: 'Power Play' },
      estimatedJackpot: 232000000.0,
      jackpotFormatted: '$232 Millones',
      nextEstimatedJackpot: 258000000.0,
      nextJackpotFormatted: '$258 Millones',
      hasWinner: false,
      prizes: [
        { categoryName: '5 Aciertos + Powerball', winnersCount: 0, prizeAmount: 232000000.0 },
        { categoryName: '5 Aciertos', winnersCount: 1, prizeAmount: 1000000.0, multiplierPrizeAmount: 3000000.0 },
        { categoryName: '4 Aciertos + Powerball', winnersCount: 9, prizeAmount: 50000.0, multiplierPrizeAmount: 150000.0 },
        { categoryName: '4 Aciertos', winnersCount: 245, prizeAmount: 100.0, multiplierPrizeAmount: 300.0 },
        { categoryName: '3 Aciertos', winnersCount: 16500, prizeAmount: 7.0 },
        { categoryName: '2 Aciertos + Powerball', winnersCount: 12800, prizeAmount: 7.0 },
        { categoryName: '1 Acierto + Powerball', winnersCount: 71000, prizeAmount: 4.0 },
        { categoryName: 'Solo Powerball', winnersCount: 165000, prizeAmount: 4.0 },
      ],
    },
    {
      drawNumber: '3907',
      drawDate: new Date('2026-07-14T22:59:00Z'),
      winningCombination: { numbers: [7, 25, 33, 49, 63], specialBall: 3, specialBallName: 'Powerball', multiplier: '2x', multiplierName: 'Power Play' },
      estimatedJackpot: 208000000.0,
      jackpotFormatted: '$208 Millones',
      nextEstimatedJackpot: 232000000.0,
      nextJackpotFormatted: '$232 Millones',
      hasWinner: false,
      prizes: [
        { categoryName: '5 Aciertos + Powerball', winnersCount: 0, prizeAmount: 208000000.0 },
        { categoryName: '5 Aciertos', winnersCount: 2, prizeAmount: 1000000.0, multiplierPrizeAmount: 2000000.0 },
        { categoryName: '4 Aciertos + Powerball', winnersCount: 16, prizeAmount: 50000.0, multiplierPrizeAmount: 100000.0 },
        { categoryName: '4 Aciertos', winnersCount: 370, prizeAmount: 100.0, multiplierPrizeAmount: 200.0 },
        { categoryName: '3 Aciertos', winnersCount: 21000, prizeAmount: 7.0 },
        { categoryName: '2 Aciertos + Powerball', winnersCount: 16200, prizeAmount: 7.0 },
        { categoryName: '1 Acierto + Powerball', winnersCount: 89000, prizeAmount: 4.0 },
        { categoryName: 'Solo Powerball', winnersCount: 207000, prizeAmount: 4.0 },
      ],
    },
    {
      drawNumber: '3906',
      drawDate: new Date('2026-07-12T22:59:00Z'),
      winningCombination: { numbers: [11, 20, 36, 55, 68], specialBall: 7, specialBallName: 'Powerball', multiplier: '3x', multiplierName: 'Power Play' },
      estimatedJackpot: 185000000.0,
      jackpotFormatted: '$185 Millones',
      nextEstimatedJackpot: 208000000.0,
      nextJackpotFormatted: '$208 Millones',
      hasWinner: false,
      prizes: [
        { categoryName: '5 Aciertos + Powerball', winnersCount: 0, prizeAmount: 185000000.0 },
        { categoryName: '5 Aciertos', winnersCount: 0, prizeAmount: 1000000.0 },
        { categoryName: '4 Aciertos + Powerball', winnersCount: 7, prizeAmount: 50000.0, multiplierPrizeAmount: 150000.0 },
        { categoryName: '4 Aciertos', winnersCount: 198, prizeAmount: 100.0, multiplierPrizeAmount: 300.0 },
        { categoryName: '3 Aciertos', winnersCount: 12400, prizeAmount: 7.0 },
        { categoryName: '2 Aciertos + Powerball', winnersCount: 9800, prizeAmount: 7.0 },
        { categoryName: '1 Acierto + Powerball', winnersCount: 54000, prizeAmount: 4.0 },
        { categoryName: 'Solo Powerball', winnersCount: 125000, prizeAmount: 4.0 },
      ],
    },
    {
      drawNumber: '3905',
      drawDate: new Date('2026-07-09T22:59:00Z'),
      winningCombination: { numbers: [14, 28, 40, 53, 61], specialBall: 26, specialBallName: 'Powerball', multiplier: '4x', multiplierName: 'Power Play' },
      estimatedJackpot: 162000000.0,
      jackpotFormatted: '$162 Millones',
      nextEstimatedJackpot: 185000000.0,
      nextJackpotFormatted: '$185 Millones',
      hasWinner: false,
      prizes: [
        { categoryName: '5 Aciertos + Powerball', winnersCount: 0, prizeAmount: 162000000.0 },
        { categoryName: '5 Aciertos', winnersCount: 1, prizeAmount: 1000000.0, multiplierPrizeAmount: 4000000.0 },
        { categoryName: '4 Aciertos + Powerball', winnersCount: 12, prizeAmount: 50000.0, multiplierPrizeAmount: 200000.0 },
        { categoryName: '4 Aciertos', winnersCount: 320, prizeAmount: 100.0, multiplierPrizeAmount: 400.0 },
        { categoryName: '3 Aciertos', winnersCount: 17800, prizeAmount: 7.0 },
        { categoryName: '2 Aciertos + Powerball', winnersCount: 13400, prizeAmount: 7.0 },
        { categoryName: '1 Acierto + Powerball', winnersCount: 74000, prizeAmount: 4.0 },
        { categoryName: 'Solo Powerball', winnersCount: 172000, prizeAmount: 4.0 },
      ],
    },
    {
      drawNumber: '3904',
      drawDate: new Date('2026-07-07T22:59:00Z'),
      winningCombination: { numbers: [6, 19, 32, 47, 58], specialBall: 11, specialBallName: 'Powerball', multiplier: '2x', multiplierName: 'Power Play' },
      estimatedJackpot: 140000000.0,
      jackpotFormatted: '$140 Millones',
      nextEstimatedJackpot: 162000000.0,
      nextJackpotFormatted: '$162 Millones',
      hasWinner: false,
      prizes: [
        { categoryName: '5 Aciertos + Powerball', winnersCount: 0, prizeAmount: 140000000.0 },
        { categoryName: '5 Aciertos', winnersCount: 0, prizeAmount: 1000000.0 },
        { categoryName: '4 Aciertos + Powerball', winnersCount: 8, prizeAmount: 50000.0, multiplierPrizeAmount: 100000.0 },
        { categoryName: '4 Aciertos', winnersCount: 210, prizeAmount: 100.0, multiplierPrizeAmount: 200.0 },
        { categoryName: '3 Aciertos', winnersCount: 13600, prizeAmount: 7.0 },
        { categoryName: '2 Aciertos + Powerball', winnersCount: 10400, prizeAmount: 7.0 },
        { categoryName: '1 Acierto + Powerball', winnersCount: 58000, prizeAmount: 4.0 },
        { categoryName: 'Solo Powerball', winnersCount: 134000, prizeAmount: 4.0 },
      ],
    },
    {
      drawNumber: '3903',
      drawDate: new Date('2026-07-05T22:59:00Z'),
      winningCombination: { numbers: [1, 17, 34, 50, 64], specialBall: 16, specialBallName: 'Powerball', multiplier: '3x', multiplierName: 'Power Play' },
      estimatedJackpot: 120000000.0,
      jackpotFormatted: '$120 Millones',
      nextEstimatedJackpot: 140000000.0,
      nextJackpotFormatted: '$140 Millones',
      hasWinner: false,
      prizes: [
        { categoryName: '5 Aciertos + Powerball', winnersCount: 0, prizeAmount: 120000000.0 },
        { categoryName: '5 Aciertos', winnersCount: 1, prizeAmount: 1000000.0, multiplierPrizeAmount: 3000000.0 },
        { categoryName: '4 Aciertos + Powerball', winnersCount: 5, prizeAmount: 50000.0, multiplierPrizeAmount: 150000.0 },
        { categoryName: '4 Aciertos', winnersCount: 160, prizeAmount: 100.0, multiplierPrizeAmount: 300.0 },
        { categoryName: '3 Aciertos', winnersCount: 10200, prizeAmount: 7.0 },
        { categoryName: '2 Aciertos + Powerball', winnersCount: 8000, prizeAmount: 7.0 },
        { categoryName: '1 Acierto + Powerball', winnersCount: 44000, prizeAmount: 4.0 },
        { categoryName: 'Solo Powerball', winnersCount: 102000, prizeAmount: 4.0 },
      ],
    },
  ];

  for (const d of powerballDraws) {
    const { prizes, ...drawData } = d;
    await prisma.draw.create({
      data: {
        lotteryId: powerball.id,
        ...drawData,
        prizes: { create: prizes },
      },
    });
  }
  console.log(`✅ ${powerballDraws.length} sorteos históricos de Powerball creados.`);

  // ─────────────────────────────────────────────
  // 5. SORTEOS HISTÓRICOS — MEGA MILLIONS (10 sorteos)
  // ─────────────────────────────────────────────
  const megaMillionsDraws = [
    {
      drawNumber: '2548',
      drawDate: new Date('2026-07-25T23:00:00Z'),
      winningCombination: { numbers: [8, 17, 29, 41, 63], specialBall: 15, specialBallName: 'Mega Ball', multiplier: '4x', multiplierName: 'Megaplier' },
      estimatedJackpot: 265000000.0,
      jackpotFormatted: '$265 Millones',
      nextDrawDate: new Date('2026-07-29T23:00:00Z'),
      nextEstimatedJackpot: 280000000.0,
      nextJackpotFormatted: '$280 Millones',
      hasWinner: false,
      prizes: [
        { categoryName: '5 Aciertos + Mega Ball', winnersCount: 0, prizeAmount: 265000000.0 },
        { categoryName: '5 Aciertos', winnersCount: 1, prizeAmount: 1000000.0, multiplierPrizeAmount: 4000000.0 },
        { categoryName: '4 Aciertos + Mega Ball', winnersCount: 12, prizeAmount: 10000.0, multiplierPrizeAmount: 40000.0 },
        { categoryName: '4 Aciertos', winnersCount: 340, prizeAmount: 500.0, multiplierPrizeAmount: 2000.0 },
        { categoryName: '3 Aciertos + Mega Ball', winnersCount: 680, prizeAmount: 200.0, multiplierPrizeAmount: 800.0 },
        { categoryName: '3 Aciertos', winnersCount: 18900, prizeAmount: 10.0 },
        { categoryName: '2 Aciertos + Mega Ball', winnersCount: 15400, prizeAmount: 10.0 },
        { categoryName: '1 Acierto + Mega Ball', winnersCount: 86000, prizeAmount: 4.0 },
        { categoryName: 'Solo Mega Ball', winnersCount: 224000, prizeAmount: 2.0 },
      ],
    },
    {
      drawNumber: '2547',
      drawDate: new Date('2026-07-22T23:00:00Z'),
      winningCombination: { numbers: [4, 21, 38, 52, 69], specialBall: 8, specialBallName: 'Mega Ball', multiplier: '2x', multiplierName: 'Megaplier' },
      estimatedJackpot: 250000000.0,
      jackpotFormatted: '$250 Millones',
      nextEstimatedJackpot: 265000000.0,
      nextJackpotFormatted: '$265 Millones',
      hasWinner: false,
      prizes: [
        { categoryName: '5 Aciertos + Mega Ball', winnersCount: 0, prizeAmount: 250000000.0 },
        { categoryName: '5 Aciertos', winnersCount: 0, prizeAmount: 1000000.0 },
        { categoryName: '4 Aciertos + Mega Ball', winnersCount: 9, prizeAmount: 10000.0, multiplierPrizeAmount: 20000.0 },
        { categoryName: '4 Aciertos', winnersCount: 260, prizeAmount: 500.0, multiplierPrizeAmount: 1000.0 },
        { categoryName: '3 Aciertos + Mega Ball', winnersCount: 510, prizeAmount: 200.0, multiplierPrizeAmount: 400.0 },
        { categoryName: '3 Aciertos', winnersCount: 14400, prizeAmount: 10.0 },
        { categoryName: '2 Aciertos + Mega Ball', winnersCount: 11800, prizeAmount: 10.0 },
        { categoryName: '1 Acierto + Mega Ball', winnersCount: 66000, prizeAmount: 4.0 },
        { categoryName: 'Solo Mega Ball', winnersCount: 172000, prizeAmount: 2.0 },
      ],
    },
    {
      drawNumber: '2546',
      drawDate: new Date('2026-07-18T23:00:00Z'),
      winningCombination: { numbers: [11, 26, 44, 58, 66], specialBall: 22, specialBallName: 'Mega Ball', multiplier: '3x', multiplierName: 'Megaplier' },
      estimatedJackpot: 230000000.0,
      jackpotFormatted: '$230 Millones',
      nextEstimatedJackpot: 250000000.0,
      nextJackpotFormatted: '$250 Millones',
      hasWinner: false,
      prizes: [
        { categoryName: '5 Aciertos + Mega Ball', winnersCount: 0, prizeAmount: 230000000.0 },
        { categoryName: '5 Aciertos', winnersCount: 2, prizeAmount: 1000000.0, multiplierPrizeAmount: 3000000.0 },
        { categoryName: '4 Aciertos + Mega Ball', winnersCount: 15, prizeAmount: 10000.0, multiplierPrizeAmount: 30000.0 },
        { categoryName: '4 Aciertos', winnersCount: 390, prizeAmount: 500.0, multiplierPrizeAmount: 1500.0 },
        { categoryName: '3 Aciertos + Mega Ball', winnersCount: 760, prizeAmount: 200.0, multiplierPrizeAmount: 600.0 },
        { categoryName: '3 Aciertos', winnersCount: 21200, prizeAmount: 10.0 },
        { categoryName: '2 Aciertos + Mega Ball', winnersCount: 17400, prizeAmount: 10.0 },
        { categoryName: '1 Acierto + Mega Ball', winnersCount: 97000, prizeAmount: 4.0 },
        { categoryName: 'Solo Mega Ball', winnersCount: 253000, prizeAmount: 2.0 },
      ],
    },
    {
      drawNumber: '2545',
      drawDate: new Date('2026-07-15T23:00:00Z'),
      winningCombination: { numbers: [2, 14, 31, 49, 61], specialBall: 5, specialBallName: 'Mega Ball', multiplier: '5x', multiplierName: 'Megaplier' },
      estimatedJackpot: 212000000.0,
      jackpotFormatted: '$212 Millones',
      nextEstimatedJackpot: 230000000.0,
      nextJackpotFormatted: '$230 Millones',
      hasWinner: false,
      prizes: [
        { categoryName: '5 Aciertos + Mega Ball', winnersCount: 0, prizeAmount: 212000000.0 },
        { categoryName: '5 Aciertos', winnersCount: 1, prizeAmount: 1000000.0, multiplierPrizeAmount: 5000000.0 },
        { categoryName: '4 Aciertos + Mega Ball', winnersCount: 8, prizeAmount: 10000.0, multiplierPrizeAmount: 50000.0 },
        { categoryName: '4 Aciertos', winnersCount: 215, prizeAmount: 500.0, multiplierPrizeAmount: 2500.0 },
        { categoryName: '3 Aciertos + Mega Ball', winnersCount: 430, prizeAmount: 200.0, multiplierPrizeAmount: 1000.0 },
        { categoryName: '3 Aciertos', winnersCount: 12100, prizeAmount: 10.0 },
        { categoryName: '2 Aciertos + Mega Ball', winnersCount: 9900, prizeAmount: 10.0 },
        { categoryName: '1 Acierto + Mega Ball', winnersCount: 55000, prizeAmount: 4.0 },
        { categoryName: 'Solo Mega Ball', winnersCount: 143000, prizeAmount: 2.0 },
      ],
    },
    {
      drawNumber: '2544',
      drawDate: new Date('2026-07-11T23:00:00Z'),
      winningCombination: { numbers: [6, 19, 37, 54, 70], specialBall: 19, specialBallName: 'Mega Ball', multiplier: '2x', multiplierName: 'Megaplier' },
      estimatedJackpot: 195000000.0,
      jackpotFormatted: '$195 Millones',
      nextEstimatedJackpot: 212000000.0,
      nextJackpotFormatted: '$212 Millones',
      hasWinner: false,
      prizes: [
        { categoryName: '5 Aciertos + Mega Ball', winnersCount: 0, prizeAmount: 195000000.0 },
        { categoryName: '5 Aciertos', winnersCount: 0, prizeAmount: 1000000.0 },
        { categoryName: '4 Aciertos + Mega Ball', winnersCount: 6, prizeAmount: 10000.0, multiplierPrizeAmount: 20000.0 },
        { categoryName: '4 Aciertos', winnersCount: 175, prizeAmount: 500.0, multiplierPrizeAmount: 1000.0 },
        { categoryName: '3 Aciertos + Mega Ball', winnersCount: 350, prizeAmount: 200.0, multiplierPrizeAmount: 400.0 },
        { categoryName: '3 Aciertos', winnersCount: 9800, prizeAmount: 10.0 },
        { categoryName: '2 Aciertos + Mega Ball', winnersCount: 8100, prizeAmount: 10.0 },
        { categoryName: '1 Acierto + Mega Ball', winnersCount: 45000, prizeAmount: 4.0 },
        { categoryName: 'Solo Mega Ball', winnersCount: 117000, prizeAmount: 2.0 },
      ],
    },
    {
      drawNumber: '2543',
      drawDate: new Date('2026-07-08T23:00:00Z'),
      winningCombination: { numbers: [13, 24, 42, 56, 67], specialBall: 12, specialBallName: 'Mega Ball', multiplier: '3x', multiplierName: 'Megaplier' },
      estimatedJackpot: 178000000.0,
      jackpotFormatted: '$178 Millones',
      nextEstimatedJackpot: 195000000.0,
      nextJackpotFormatted: '$195 Millones',
      hasWinner: false,
      prizes: [
        { categoryName: '5 Aciertos + Mega Ball', winnersCount: 0, prizeAmount: 178000000.0 },
        { categoryName: '5 Aciertos', winnersCount: 1, prizeAmount: 1000000.0, multiplierPrizeAmount: 3000000.0 },
        { categoryName: '4 Aciertos + Mega Ball', winnersCount: 11, prizeAmount: 10000.0, multiplierPrizeAmount: 30000.0 },
        { categoryName: '4 Aciertos', winnersCount: 300, prizeAmount: 500.0, multiplierPrizeAmount: 1500.0 },
        { categoryName: '3 Aciertos + Mega Ball', winnersCount: 590, prizeAmount: 200.0, multiplierPrizeAmount: 600.0 },
        { categoryName: '3 Aciertos', winnersCount: 16500, prizeAmount: 10.0 },
        { categoryName: '2 Aciertos + Mega Ball', winnersCount: 13600, prizeAmount: 10.0 },
        { categoryName: '1 Acierto + Mega Ball', winnersCount: 76000, prizeAmount: 4.0 },
        { categoryName: 'Solo Mega Ball', winnersCount: 198000, prizeAmount: 2.0 },
      ],
    },
    {
      drawNumber: '2542',
      drawDate: new Date('2026-07-04T23:00:00Z'),
      winningCombination: { numbers: [3, 22, 35, 47, 60], specialBall: 2, specialBallName: 'Mega Ball', multiplier: '4x', multiplierName: 'Megaplier' },
      estimatedJackpot: 161000000.0,
      jackpotFormatted: '$161 Millones',
      nextEstimatedJackpot: 178000000.0,
      nextJackpotFormatted: '$178 Millones',
      hasWinner: false,
      prizes: [
        { categoryName: '5 Aciertos + Mega Ball', winnersCount: 0, prizeAmount: 161000000.0 },
        { categoryName: '5 Aciertos', winnersCount: 0, prizeAmount: 1000000.0 },
        { categoryName: '4 Aciertos + Mega Ball', winnersCount: 7, prizeAmount: 10000.0, multiplierPrizeAmount: 40000.0 },
        { categoryName: '4 Aciertos', winnersCount: 205, prizeAmount: 500.0, multiplierPrizeAmount: 2000.0 },
        { categoryName: '3 Aciertos + Mega Ball', winnersCount: 410, prizeAmount: 200.0, multiplierPrizeAmount: 800.0 },
        { categoryName: '3 Aciertos', winnersCount: 11500, prizeAmount: 10.0 },
        { categoryName: '2 Aciertos + Mega Ball', winnersCount: 9400, prizeAmount: 10.0 },
        { categoryName: '1 Acierto + Mega Ball', winnersCount: 52000, prizeAmount: 4.0 },
        { categoryName: 'Solo Mega Ball', winnersCount: 136000, prizeAmount: 2.0 },
      ],
    },
    {
      drawNumber: '2541',
      drawDate: new Date('2026-07-01T23:00:00Z'),
      winningCombination: { numbers: [9, 28, 40, 53, 65], specialBall: 17, specialBallName: 'Mega Ball', multiplier: '2x', multiplierName: 'Megaplier' },
      estimatedJackpot: 145000000.0,
      jackpotFormatted: '$145 Millones',
      nextEstimatedJackpot: 161000000.0,
      nextJackpotFormatted: '$161 Millones',
      hasWinner: false,
      prizes: [
        { categoryName: '5 Aciertos + Mega Ball', winnersCount: 0, prizeAmount: 145000000.0 },
        { categoryName: '5 Aciertos', winnersCount: 1, prizeAmount: 1000000.0, multiplierPrizeAmount: 2000000.0 },
        { categoryName: '4 Aciertos + Mega Ball', winnersCount: 10, prizeAmount: 10000.0, multiplierPrizeAmount: 20000.0 },
        { categoryName: '4 Aciertos', winnersCount: 280, prizeAmount: 500.0, multiplierPrizeAmount: 1000.0 },
        { categoryName: '3 Aciertos + Mega Ball', winnersCount: 555, prizeAmount: 200.0, multiplierPrizeAmount: 400.0 },
        { categoryName: '3 Aciertos', winnersCount: 15500, prizeAmount: 10.0 },
        { categoryName: '2 Aciertos + Mega Ball', winnersCount: 12700, prizeAmount: 10.0 },
        { categoryName: '1 Acierto + Mega Ball', winnersCount: 71000, prizeAmount: 4.0 },
        { categoryName: 'Solo Mega Ball', winnersCount: 184000, prizeAmount: 2.0 },
      ],
    },
    {
      drawNumber: '2540',
      drawDate: new Date('2026-06-27T23:00:00Z'),
      winningCombination: { numbers: [5, 16, 33, 51, 68], specialBall: 24, specialBallName: 'Mega Ball', multiplier: '3x', multiplierName: 'Megaplier' },
      estimatedJackpot: 128000000.0,
      jackpotFormatted: '$128 Millones',
      nextEstimatedJackpot: 145000000.0,
      nextJackpotFormatted: '$145 Millones',
      hasWinner: false,
      prizes: [
        { categoryName: '5 Aciertos + Mega Ball', winnersCount: 0, prizeAmount: 128000000.0 },
        { categoryName: '5 Aciertos', winnersCount: 0, prizeAmount: 1000000.0 },
        { categoryName: '4 Aciertos + Mega Ball', winnersCount: 5, prizeAmount: 10000.0, multiplierPrizeAmount: 30000.0 },
        { categoryName: '4 Aciertos', winnersCount: 145, prizeAmount: 500.0, multiplierPrizeAmount: 1500.0 },
        { categoryName: '3 Aciertos + Mega Ball', winnersCount: 290, prizeAmount: 200.0, multiplierPrizeAmount: 600.0 },
        { categoryName: '3 Aciertos', winnersCount: 8200, prizeAmount: 10.0 },
        { categoryName: '2 Aciertos + Mega Ball', winnersCount: 6700, prizeAmount: 10.0 },
        { categoryName: '1 Acierto + Mega Ball', winnersCount: 37000, prizeAmount: 4.0 },
        { categoryName: 'Solo Mega Ball', winnersCount: 97000, prizeAmount: 2.0 },
      ],
    },
    {
      drawNumber: '2539',
      drawDate: new Date('2026-06-24T23:00:00Z'),
      winningCombination: { numbers: [7, 18, 36, 48, 62], specialBall: 10, specialBallName: 'Mega Ball', multiplier: '2x', multiplierName: 'Megaplier' },
      estimatedJackpot: 112000000.0,
      jackpotFormatted: '$112 Millones',
      nextEstimatedJackpot: 128000000.0,
      nextJackpotFormatted: '$128 Millones',
      hasWinner: false,
      prizes: [
        { categoryName: '5 Aciertos + Mega Ball', winnersCount: 0, prizeAmount: 112000000.0 },
        { categoryName: '5 Aciertos', winnersCount: 1, prizeAmount: 1000000.0, multiplierPrizeAmount: 2000000.0 },
        { categoryName: '4 Aciertos + Mega Ball', winnersCount: 4, prizeAmount: 10000.0, multiplierPrizeAmount: 20000.0 },
        { categoryName: '4 Aciertos', winnersCount: 120, prizeAmount: 500.0, multiplierPrizeAmount: 1000.0 },
        { categoryName: '3 Aciertos + Mega Ball', winnersCount: 240, prizeAmount: 200.0, multiplierPrizeAmount: 400.0 },
        { categoryName: '3 Aciertos', winnersCount: 6800, prizeAmount: 10.0 },
        { categoryName: '2 Aciertos + Mega Ball', winnersCount: 5600, prizeAmount: 10.0 },
        { categoryName: '1 Acierto + Mega Ball', winnersCount: 31000, prizeAmount: 4.0 },
        { categoryName: 'Solo Mega Ball', winnersCount: 81000, prizeAmount: 2.0 },
      ],
    },
  ];

  for (const d of megaMillionsDraws) {
    const { prizes, ...drawData } = d;
    await prisma.draw.create({
      data: {
        lotteryId: megaMillions.id,
        ...drawData,
        prizes: { create: prizes },
      },
    });
  }
  console.log(`✅ ${megaMillionsDraws.length} sorteos históricos de Mega Millions creados.`);

  console.log('\n🎉 Seed completado con éxito.');
  console.log('   • 1 país (US)');
  console.log('   • 2 loterías (Powerball, Mega Millions)');
  console.log('   • 20 sorteos históricos con premios detallados');
}

main()
  .catch((e) => {
    console.error('❌ Error ejecutando seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
