// prisma/seed.js
// Script de carga de datos iniciales (Seed) para MySQL con Prisma ORM
// Inserta países, loterías y sorteos con combinaciones ganadoras en JSON

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando la carga de datos de demostración (Seed)...');

  // 1. Crear Países
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

  const esCountry = await prisma.country.upsert({
    where: { id: 'es' },
    update: {},
    create: {
      id: 'es',
      code: 'ES',
      name: 'España',
      slug: 'es',
      flagEmoji: '🇪🇸',
      currency: 'EUR',
    },
  });

  console.log('✅ Países creados/verificados: EE. UU. (US) y España (ES)');

  // 2. Crear Lotería Powerball (EE. UU.)
  const powerball = await prisma.lottery.upsert({
    where: { countryId_slug: { countryId: 'us', slug: 'powerball' } },
    update: {},
    create: {
      countryId: usCountry.id,
      name: 'Powerball',
      slug: 'powerball',
      description: 'Selecciona 5 números del 1 al 69 y 1 número Powerball del 1 al 26.',
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

  // 3. Crear Sorteo Reciente de Powerball con JSON Nativo
  await prisma.draw.create({
    data: {
      lotteryId: powerball.id,
      drawNumber: '3912',
      drawDate: new Date('2026-07-27T22:59:00Z'),
      winningCombination: {
        numbers: [12, 24, 35, 46, 59],
        specialBall: 9,
        specialBallName: 'Powerball',
        multiplier: '3x',
        multiplierName: 'Power Play',
      },
      estimatedJackpot: 340000000.0,
      jackpotFormatted: '$340 MILLONES',
      nextDrawDate: new Date('2026-07-29T22:59:00Z'),
      nextEstimatedJackpot: 360000000.0,
      nextJackpotFormatted: '$360 MILLONES',
      prizes: {
        create: [
          { categoryName: '5 Aciertos + Powerball', winnersCount: 0, prizeAmount: 340000000.0 },
          { categoryName: '5 Aciertos', winnersCount: 2, prizeAmount: 1000000.0, multiplierPrizeAmount: 2000000.0 },
          { categoryName: '4 Aciertos + Powerball', winnersCount: 18, prizeAmount: 50000.0, multiplierPrizeAmount: 150000.0 },
        ],
      },
    },
  });

  console.log('✅ Sorteo de prueba para Powerball creado exitosamente.');
  console.log('🎉 Seed completado con éxito.');
}

main()
  .catch((e) => {
    console.error('❌ Error ejecutando seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
