import { PrismaClient, BallCategory, DrawStatus } from '@prisma/client';

const prisma = new PrismaClient();

function pick(count, min, max) {
  const nums = new Set();
  while (nums.size < count) {
    nums.add(Math.floor(Math.random() * (max - min + 1)) + min);
  }
  return Array.from(nums).sort((a, b) => a - b);
}

function fmt(n, currency = '$') {
  if (n >= 1_000_000) return `${currency}${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (n >= 1_000) return `${currency}${(n / 1_000).toFixed(0)},${String(n % 1000).padStart(3, '0')}`;
  return `${currency}${n.toLocaleString()}`;
}

function generateDrawsForLottery(lottery, count = 10) {
  const config = lottery.configuration;
  if (!config) return [];

  const mainCount = config.drawnNumbers;
  const mainMin = config.minBall;
  const mainMax = config.maxBall;
  const now = new Date();
  const draws = [];

  const baseJackpot = Math.max(100_000, Math.round(Math.random() * 900_000 + 100_000));

  for (let i = 0; i < count; i++) {
    const drawNum = 1000 + i;
    const drawDate = new Date(now);
    drawDate.setDate(drawDate.getDate() - i * 2);
    drawDate.setHours(0, 0, 0, 0);

    const mainNumbers = pick(mainCount, mainMin, mainMax);
    const jackpotAmt = Math.round(baseJackpot * Math.pow(1 + 0.05, i));
    const nextJackpotAmt = Math.round(baseJackpot * Math.pow(1 + 0.05, i + 1));

    const numbers = mainNumbers.map((n, idx) => ({
      value: String(n).padStart(2, '0'),
      category: BallCategory.MAIN,
      position: idx + 1,
    }));

    const ballTypes = lottery.ballTypes || [];
    const additionalBallTypes = ballTypes
      .filter((bt) => bt.category === BallCategory.ADDITIONAL)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    const multiplierBallTypes = ballTypes
      .filter((bt) => bt.category === BallCategory.MULTIPLIER)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    if (additionalBallTypes.length > 0) {
      for (const abt of additionalBallTypes) {
        const count_ = abt.count || 1;
        const min_ = abt.minBall || 0;
        const max_ = abt.maxBall || 9;
        const vals = pick(count_, min_, max_);
        for (const v of vals) {
          numbers.push({
            value: String(v).padStart(2, '0'),
            category: BallCategory.ADDITIONAL,
            position: numbers.filter((n) => n.category === BallCategory.ADDITIONAL).length + 1,
          });
        }
      }
    }

    for (const mbt of multiplierBallTypes) {
      const allowedValues = mbt.allowedValues ? JSON.parse(mbt.allowedValues) : [2, 3, 4, 5];
      const mv = allowedValues[Math.floor(Math.random() * allowedValues.length)];
      numbers.push({
        value: `${mv}x`,
        category: BallCategory.MULTIPLIER,
        position: 1,
      });
    }

    const prizes = [];
    const jackpotPercent = 1;

    if (mainCount >= 5) {
      const patterns = mainCount === 6
        ? [
            { match: '6/6', pct: 1 },
            { match: '5+1', pct: 0.00034 },
            { match: '5+0', pct: 0.00004 },
            { match: '4+1', pct: 0.0001 },
            { match: '4+0', pct: 0.002 },
            { match: '3+1', pct: 0.008 },
            { match: '3+0', pct: 0.03 },
            { match: '2+1', pct: 0.1 },
            { match: '2+0', pct: 0.3 },
            { match: '1+1', pct: 0.35 },
          ]
        : [
            { match: '5/5', pct: 1 },
            { match: '4+1', pct: 0.0037 },
            { match: '4+0', pct: 0.0015 },
            { match: '3+1', pct: 0.015 },
            { match: '3+0', pct: 0.05 },
            { match: '2+1', pct: 0.15 },
          ];
      for (const pt of patterns) {
        prizes.push({
          matchPattern: pt.match,
          prizeAmountRaw: fmt(Math.max(Math.round(jackpotAmt * pt.pct), 1)),
          prizeAmount: Math.max(Math.round(jackpotAmt * pt.pct), 1),
          winnersCount: pt.pct === jackpotPercent ? 0 : Math.max(Math.round(Math.random() * (pt.pct * 1_000_000)), 1),
        });
      }
    } else {
      const patterns = [
        { match: 'MATCH', pct: 1 },
        { match: 'MATCH-1', pct: 0.01 },
        { match: 'MATCH-2', pct: 0.05 },
        { match: 'MATCH-3', pct: 0.15 },
      ];
      for (const pt of patterns) {
        prizes.push({
          matchPattern: pt.match,
          prizeAmountRaw: fmt(Math.max(Math.round(jackpotAmt * pt.pct), 1)),
          prizeAmount: Math.max(Math.round(jackpotAmt * pt.pct), 1),
          winnersCount: pt.pct === jackpotPercent ? 0 : Math.max(Math.round(Math.random() * (pt.pct * 100_000)), 1),
        });
      }
    }

    draws.push({
      drawNumber: String(drawNum),
      drawDate: drawDate,
      drawTime: '20:00',
      status: DrawStatus.COMPLETED,
      hasWinner: Math.random() > 0.5,
      numbers,
      jackpotHistory: {
        jackpotRaw: fmt(jackpotAmt),
        jackpotAmount: jackpotAmt,
        nextJackpotRaw: fmt(nextJackpotAmt),
        nextJackpotAmount: nextJackpotAmt,
        nextDrawDate: new Date(drawDate.getTime() + 2 * 86400000),
      },
      prizes,
    });
  }

  return draws;
}

async function main() {
  console.log('🌱 Generating test draws for jurisdiction lotteries...');

  const lotteries = await prisma.lottery.findMany({
    where: { isActive: true },
    include: { configuration: true, ballTypes: true, draws: { where: { status: DrawStatus.COMPLETED } } },
  });

  console.log(`📋 Found ${lotteries.length} active lotteries`);

  let totalDraws = 0;

  for (const lottery of lotteries) {
    if (!lottery.configuration) {
      console.log(`⚠️  Skipping ${lottery.name} (no configuration)`);
      continue;
    }

    const existingDraws = lottery.draws.length;
    if (existingDraws >= 10) {
      console.log(`⏭️  ${lottery.name} already has ${existingDraws} draws`);
      continue;
    }

    const drawsToGenerate = 10 - existingDraws;

    await prisma.jackpotHistory.deleteMany({
      where: { draw: { lotteryId: lottery.id } },
    });
    await prisma.prizeBreakdown.deleteMany({
      where: { draw: { lotteryId: lottery.id } },
    });
    await prisma.draw.deleteMany({ where: { lotteryId: lottery.id } });

    const draws = generateDrawsForLottery(lottery, drawsToGenerate);

    for (const d of draws) {
      await prisma.draw.create({
        data: {
          lotteryId: lottery.id,
          externalDrawId: parseInt(d.drawNumber),
          drawNumber: d.drawNumber,
          drawDate: d.drawDate,
          drawTime: d.drawTime,
          status: d.status,
          hasWinner: d.hasWinner,
          numbers: { create: d.numbers },
          prizes: { create: d.prizes },
          jackpotHistory: { create: d.jackpotHistory },
        },
      });
      totalDraws++;
    }

    console.log(`✅ ${lottery.name}: ${draws.length} draws generated`);
  }

  const drawCount = await prisma.draw.count();
  const jackpotCount = await prisma.jackpotHistory.count();
  const prizeCount = await prisma.prizeBreakdown.count();
  const numberCount = await prisma.drawNumber.count();

  console.log(`
🎉 Draw seed complete:
   Total draws generated: ${totalDraws}
   Total draws in DB: ${drawCount}
   Jackpot histories: ${jackpotCount}
   Prize breakdowns: ${prizeCount}
   Draw numbers: ${numberCount}
  `);
}

main()
  .catch((e) => {
    console.error('❌ Error generating draws:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

