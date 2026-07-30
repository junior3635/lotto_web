import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { PrismaClient, BallCategory, DayOfWeek, DrawStatus } from '@prisma/client';

const prisma = new PrismaClient();

const JSON_RESPONSES_DIR = path.join(process.cwd(), 'json_responses');
const PROCESSED_DIR = path.join(process.cwd(), '.processed_json');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function getFileHash(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return crypto.createHash('md5').update(content).digest('hex');
}

function getProcessedHash(fileName) {
  const hashFile = path.join(PROCESSED_DIR, `${fileName}.hash`);
  if (!fs.existsSync(hashFile)) return null;
  return fs.readFileSync(hashFile, 'utf-8').trim();
}

function saveProcessedHash(fileName, hash) {
  ensureDir(PROCESSED_DIR);
  const hashFile = path.join(PROCESSED_DIR, `${fileName}.hash`);
  fs.writeFileSync(hashFile, hash);
}

function loadJsonFile(fileName) {
  const filePath = path.join(JSON_RESPONSES_DIR, fileName);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

export async function ingestMainDraws() {
  const data = loadJsonFile('main_draw.json');
  if (!data || !data.data || !Array.isArray(data.data)) {
    return { processed: 0, skipped: 0, errors: [] };
  }

  const results = { processed: 0, skipped: 0, errors: [] };

  for (const game of data.data) {
    try {
      const stateSlug = game.state && game.state.length > 0 ? game.state[0].slug : null;
      let state = null;
      if (stateSlug) {
        state = await prisma.state.findUnique({ where: { slug: stateSlug } });
      }
      if (!state && game.state && game.state.length > 0) {
        const stateData = game.state[0];
        const countryCode = determineCountryCode(stateData.stateCode);
        const country = await prisma.country.upsert({
          where: { code: countryCode },
          update: {},
          create: {
            code: countryCode,
            name: stateData.state,
            slug: countryCode.toLowerCase(),
            flagEmoji: '🏳️',
            currency: 'USD',
          },
        });
        state = await prisma.state.upsert({
          where: { countryId_code: { countryId: country.id, code: stateData.stateCode } },
          update: {},
          create: {
            countryId: country.id,
            name: stateData.state,
            code: stateData.stateCode,
            slug: stateData.slug,
            taxRate: parseTaxRate(stateData.taxRate),
            minimumLegalAge: stateData.minimumLegalAge || 18,
          },
        });
      }

      const gameName = game.gameName;
      const slug = slugify(gameName);
      const externalId = game.id;

      const existingLottery = await prisma.lottery.findFirst({
        where: { externalId },
      });

      if (existingLottery) {
        await prisma.lottery.update({
          where: { id: existingLottery.id },
          data: { name: gameName, slug, mainDrawName: game.mainDrawName || null },
        });
        results.processed++;
      } else {
        await prisma.lottery.create({
          data: {
            externalId,
            name: gameName,
            slug,
            mainDrawName: game.mainDrawName || null,
            stateId: state?.id || null,
            isActive: true,
          },
        });
        results.processed++;
      }

      let lottery = existingLottery;
      if (!lottery) {
        lottery = await prisma.lottery.findFirst({ where: { externalId } });
      }

      await upsertConfiguration(prisma, lottery.id, {
        drawTimezone: game.drawTimezone || 'America/New_York',
        drawTime: extractTime(game.drawTime),
        stopSaleTime: extractTime(game.stopSaleTime),
        claimDeadline: game.claimDeadline || 365,
        allowZero: game.allowZero || false,
        minBall: game.minBall,
        maxBall: game.maxBall,
        drawnNumbers: game.drawnNumbers,
        selectableBalls: game.selectableBalls,
        minimumSelectableBalls: game.minimumSelectableBalls,
        uniqueMainNumbers: game.uniqueMainNumbers ?? 1,
        uniqueExtraNumbers: game.uniqueExtraNumbers ?? 0,
        allowDuplicates: game.allowDuplicates ?? false,
      });
      results.processed++;

      const existingBallTypes = await prisma.lotteryBallType.findMany({
        where: { lotteryId: lottery.id },
      });
      const existingBallTypeNames = new Set(existingBallTypes.map((bt) => bt.name));

      const bonusNumbers = game.bonusNumbers || [];
      const prizeMultipliers = game.prizeMultipliers || [];

      for (const bn of bonusNumbers) {
        if (!existingBallTypeNames.has(bn.name)) {
          await prisma.lotteryBallType.create({
            data: {
              lotteryId: lottery.id,
              name: bn.name,
              abbreviation: bn.abbreviation || bn.name,
              category: BallCategory.ADDITIONAL,
              isString: false,
              isMultiplier: false,
              playerPicked: false,
              sortOrder: existingBallTypes.length,
            },
          });
        }
      }

      for (const pm of prizeMultipliers) {
        if (!existingBallTypeNames.has(pm.name)) {
          await prisma.lotteryBallType.create({
            data: {
              lotteryId: lottery.id,
              name: pm.name,
              abbreviation: pm.abbreviation || pm.name,
              category: BallCategory.ADDITIONAL,
              isString: false,
              isMultiplier: true,
              playerPicked: false,
              sortOrder: existingBallTypes.length + 1,
            },
          });
        }
      }

      for (const an of game.additionalNumbers || []) {
        if (an.playerPicked && !existingBallTypeNames.has(an.name)) {
          await prisma.lotteryBallType.create({
            data: {
              lotteryId: lottery.id,
              name: an.name,
              abbreviation: an.name,
              category: BallCategory.ADDITIONAL,
              minBall: an.minBall,
              maxBall: an.maxBall,
              allowZero: an.allowZero || false,
              isString: an.isString || false,
              isMultiplier: an.isMultiplier || false,
              playerPicked: an.playerPicked,
              allowedValues: an.allowedValues ? JSON.stringify(an.allowedValues) : null,
              sortOrder: existingBallTypes.length,
            },
          });
        } else if (!an.playerPicked && an.name && !existingBallTypeNames.has(an.name)) {
          await prisma.lotteryBallType.create({
            data: {
              lotteryId: lottery.id,
              name: an.name,
              abbreviation: an.name,
              category: BallCategory.ADDITIONAL,
              minBall: an.minBall,
              maxBall: an.maxBall,
              allowZero: an.allowZero || false,
              isString: an.isString || false,
              isMultiplier: an.isMultiplier || false,
              playerPicked: an.playerPicked,
              allowedValues: an.allowedValues ? JSON.stringify(an.allowedValues) : null,
              sortOrder: existingBallTypes.length,
            },
          });
        }
      }

      await syncDrawSchedules(lottery.id, game.drawDays);

      results.processed++;
    } catch (error) {
      results.errors.push({ game: game.gameName, error: error.message });
    }
  }

  return results;
}

export async function ingestStatesGameList() {
  const data = loadJsonFile('states_game_list.json');
  if (!data || !data.data || !Array.isArray(data.data)) {
    return { processed: 0, skipped: 0, errors: [] };
  }

  const results = { processed: 0, skipped: 0, errors: [] };

  for (const game of data.data) {
    try {
      const stateData = game.state;
      if (!stateData || !stateData.stateCode) {
        results.errors.push({ game: game.gameName, error: 'No state data' });
        continue;
      }

      const countryCode = determineCountryCode(stateData.stateCode);
      const country = await prisma.country.upsert({
        where: { code: countryCode },
        update: {},
        create: {
          code: countryCode,
          name: stateData.state,
          slug: countryCode.toLowerCase(),
          flagEmoji: '🏳️',
          currency: 'USD',
        },
      });

      const state = await prisma.state.upsert({
        where: { countryId_code: { countryId: country.id, code: stateData.stateCode } },
        update: { name: stateData.state, slug: stateData.slug, taxRate: parseTaxRate(stateData.taxRate) },
        create: {
          countryId: country.id,
          name: stateData.state,
          code: stateData.stateCode,
          slug: stateData.slug,
          taxRate: parseTaxRate(stateData.taxRate),
          minimumLegalAge: stateData.minimumLegalAge || 18,
        },
      });

      const gameName = game.gameName;
      const slug = slugify(gameName);
      const externalId = game.id;

      const existingLottery = await prisma.lottery.findFirst({
        where: { externalId },
      });

      if (existingLottery) {
        await prisma.lottery.update({
          where: { id: existingLottery.id },
          data: { name: gameName, slug, stateId: state.id, mainDrawName: game.mainDrawName || null },
        });
        results.processed++;
      } else {
        await prisma.lottery.create({
          data: {
            externalId,
            name: gameName,
            slug,
            stateId: state.id,
            mainDrawName: game.mainDrawName || null,
            isActive: true,
          },
        });
        results.processed++;
      }

      let lottery = existingLottery;
      if (!lottery) {
        lottery = await prisma.lottery.findFirst({ where: { externalId } });
      }

      await upsertConfiguration(prisma, lottery.id, {
        drawTimezone: game.drawTimezone || 'America/New_York',
        drawTime: extractTime(game.drawTime),
        stopSaleTime: extractTime(game.stopSaleTime),
        claimDeadline: game.claimDeadline || 365,
        allowZero: game.allowZero || false,
        minBall: game.minBall,
        maxBall: game.maxBall,
        drawnNumbers: game.drawnNumbers,
        selectableBalls: game.selectableBalls,
        minimumSelectableBalls: game.minimumSelectableBalls,
        uniqueMainNumbers: game.uniqueMainNumbers ?? 0,
        uniqueExtraNumbers: game.uniqueExtraNumbers ?? 0,
        allowDuplicates: game.allowDuplicates ?? false,
      });

      for (const an of game.additionalNumbers || []) {
        const ballType = await prisma.lotteryBallType.upsert({
          where: { lotteryId_name: { lotteryId: lottery.id, name: an.name } },
          update: {},
          create: {
            lotteryId: lottery.id,
            name: an.name,
            abbreviation: an.name,
            category: an.isMultiplier ? BallCategory.MULTIPLIER : BallCategory.ADDITIONAL,
            minBall: an.minBall,
            maxBall: an.maxBall,
            allowZero: an.allowZero || false,
            isString: an.isString || false,
            isMultiplier: an.isMultiplier || false,
            playerPicked: an.playerPicked,
            allowedValues: an.allowedValues ? JSON.stringify(an.allowedValues) : null,
            sortOrder: 0,
          },
        });
      }

      for (const bn of game.bonusNumbers || []) {
        await prisma.lotteryBallType.upsert({
          where: { lotteryId_name: { lotteryId: lottery.id, name: bn.name } },
          update: {},
          create: {
            lotteryId: lottery.id,
            name: bn.name,
            abbreviation: bn.abbreviation || bn.name,
            category: bn.isMultiplier ? BallCategory.MULTIPLIER : BallCategory.ADDITIONAL,
            isString: false,
            isMultiplier: bn.isMultiplier || false,
            playerPicked: false,
            sortOrder: 0,
          },
        });
      }

      await syncDrawSchedules(lottery.id, game.drawDays);
      results.processed++;
    } catch (error) {
      results.errors.push({ game: game.gameName, error: error.message });
    }
  }

  return results;
}

export async function ingestPastDraws() {
  const data = loadJsonFile('pass_draw_365days.json');
  if (!data || !data.data || !data.data.date || !Array.isArray(data.data.date)) {
    return { processed: 0, skipped: 0, errors: [] };
  }

  const results = { processed: 0, skipped: 0, errors: [] };
  const gameDetails = data.data.gameDetails;

  if (!gameDetails || !gameDetails.gameName) {
    return results;
  }

  const gameName = gameDetails.gameName;
  const slug = slugify(gameName);
  const externalId = gameDetails.id;

  const lottery = await prisma.lottery.findFirst({
    where: { slug },
  });

  if (!lottery) {
    results.errors.push({ game: gameName, error: 'Lottery not found' });
    return results;
  }

  const existingDraws = await prisma.draw.findMany({
    where: { lotteryId: lottery.id },
    select: { externalDrawId: true },
  });
  const existingDrawIds = new Set(existingDraws.map((d) => String(d.externalDrawId)));

  for (const dateEntry of data.data.date) {
    const drawId = String(dateEntry.drawID);
    if (existingDrawIds.has(drawId)) {
      results.skipped++;
      continue;
    }

    try {
      await prisma.draw.upsert({
        where: { lotteryId_externalDrawId: { lotteryId: lottery.id, externalDrawId: dateEntry.drawNumber } },
        update: {},
        create: {
          lotteryId: lottery.id,
          externalDrawId: dateEntry.drawNumber,
          drawNumber: String(dateEntry.drawNumber),
          drawDate: new Date(dateEntry.drawDate),
          drawTime: dateEntry.drawTime || null,
          status: DrawStatus.COMPLETED,
          hasWinner: false,
        },
      });
      results.processed++;
    } catch (error) {
      results.errors.push({ drawId, error: error.message });
    }
  }

  return results;
}

export async function ingestDrawingResult() {
  const data = loadJsonFile('drawing_result.json');
  if (!data || !data.data) {
    return { processed: 0, skipped: 0, errors: [] };
  }

  const results = { processed: 0, errors: [] };
  const drawData = data.data;
  const gameDetails = drawData.gameDetails;

  if (!gameDetails || !gameDetails.gameName) {
    return results;
  }

  const gameName = gameDetails.gameName;
  const slug = slugify(gameName);
  const externalId = gameDetails.id;

  const lottery = await prisma.lottery.findFirst({
    where: { OR: [{ externalId }, { slug }] },
    include: { configuration: true, ballTypes: true },
  });

  if (!lottery) {
    results.errors.push({ game: gameName, error: 'Lottery not found' });
    return results;
  }

  const existingDraw = await prisma.draw.findFirst({
    where: { lotteryId: lottery.id, externalDrawId: drawData.drawNumber },
  });

  const winningNumbers = [];
  for (const winNum of (drawData.winningNumbers || [])) {
    winningNumbers.push({
      value: String(winNum).padStart(2, '0'),
      category: BallCategory.MAIN,
      position: winningNumbers.length + 1,
    });
  }

  for (const addNum of (drawData.additionalNumbers || [])) {
    const ballType = lottery.ballTypes.find(
      (bt) => bt.category === BallCategory.ADDITIONAL && bt.playerPicked
    );
    winningNumbers.push({
      value: String(addNum).padStart(2, '0'),
      category: BallCategory.ADDITIONAL,
      position: winningNumbers.filter((n) => n.category === BallCategory.ADDITIONAL).length + 1,
      ballTypeId: ballType?.id || null,
    });
  }

  const prizes = (drawData.prize || []).map((p) => ({
    matchPattern: p.match,
    prizeAmountRaw: p.prize,
    prizeAmount: parsePrizeAmount(p.prize),
    winnersCount: p.winner || 0,
  }));

  let jackpotAmount = null;
  if (drawData.jackpot) {
    jackpotAmount = parseAmount(drawData.jackpot);
  }

  const draw = await prisma.draw.upsert({
    where: {
      lotteryId_externalDrawId: {
        lotteryId: lottery.id,
        externalDrawId: drawData.drawNumber,
      },
    },
    update: {
      drawDate: new Date(drawData.drawDate),
      drawTime: drawData.drawTime,
      status: DrawStatus.COMPLETED,
      hasWinner: prizes.some((p) => p.winnersCount > 0),
      numbers: {
        deleteMany: {},
        create: winningNumbers,
      },
      prizes: {
        deleteMany: {},
        create: prizes,
      },
    },
    create: {
      lotteryId: lottery.id,
      externalDrawId: drawData.drawNumber,
      drawNumber: String(drawData.drawNumber),
      drawDate: new Date(drawData.drawDate),
      drawTime: drawData.drawTime,
      details: drawData.details || null,
      note: drawData.note || null,
      status: DrawStatus.COMPLETED,
      hasWinner: prizes.some((p) => p.winnersCount > 0),
      numbers: { create: winningNumbers },
      prizes: { create: prizes },
      jackpotHistory: jackpotAmount
        ? {
            create: {
              jackpotRaw: drawData.jackpot,
              jackpotAmount,
              nextJackpotRaw: drawData.nextJackpot || null,
              nextJackpotAmount: drawData.nextJackpot ? parseAmount(drawData.nextJackpot) : null,
              nextDrawDate: drawData.nextDrawDate ? new Date(drawData.nextDrawDate) : null,
            },
          }
        : undefined,
    },
  });

  await prisma.jackpotHistory.deleteMany({
    where: { drawId: draw.id },
  });

  if (drawData.jackpot && jackpotAmount) {
    await prisma.jackpotHistory.create({
      data: {
        drawId: draw.id,
        jackpotRaw: drawData.jackpot,
        jackpotAmount,
        nextJackpotRaw: drawData.nextJackpot || null,
        nextJackpotAmount: drawData.nextJackpot ? parseAmount(drawData.nextJackpot) : null,
        nextDrawDate: drawData.nextDrawDate ? new Date(drawData.nextDrawDate) : null,
      },
    });
  }

  results.processed++;
  return results;
}

export async function ingestAllJsonFiles() {
  const processedFiles = [];
  const skippedFiles = [];
  const allErrors = [];

  const files = fs.readdirSync(JSON_RESPONSES_DIR).filter((f) => f.endsWith('.json'));

  files.sort();

  for (const fileName of files) {
    const currentHash = getFileHash(path.join(JSON_RESPONSES_DIR, fileName));
    const previousHash = getProcessedHash(fileName);

    if (currentHash === previousHash) {
      skippedFiles.push(fileName);
      continue;
    }

    try {
      let result;
      switch (fileName) {
        case 'main_draw.json':
          result = await ingestMainDraws();
          break;
        case 'states_game_list.json':
          result = await ingestStatesGameList();
          break;
        case 'pass_draw_365days.json':
          result = await ingestPastDraws();
          break;
        case 'drawing_result.json':
          result = await ingestDrawingResult();
          break;
        default:
          result = { processed: 0, skipped: 0, errors: [] };
      }

      saveProcessedHash(fileName, currentHash);
      processedFiles.push({ fileName, ...result });
    } catch (error) {
      allErrors.push({ fileName, error: error.message });
    }
  }

  return { processedFiles, skippedFiles, allErrors };
}

async function syncDrawSchedules(lotteryId, drawDays) {
  if (!drawDays) return;

  const dayOfWeekMap = {
    Sunday: DayOfWeek.SUNDAY,
    Monday: DayOfWeek.MONDAY,
    Tuesday: DayOfWeek.TUESDAY,
    Wednesday: DayOfWeek.WEDNESDAY,
    Thursday: DayOfWeek.THURSDAY,
    Friday: DayOfWeek.FRIDAY,
    Saturday: DayOfWeek.SATURDAY,
  };

  for (const [dayName, active] of Object.entries(drawDays)) {
    const dayOfWeek = dayOfWeekMap[dayName];
    if (!dayOfWeek) continue;

    await prisma.lotteryDrawSchedule.upsert({
      where: { lotteryId_dayOfWeek: { lotteryId, dayOfWeek } },
      update: { isActive: active },
      create: { lotteryId, dayOfWeek, isActive: active },
    });
  }
}

function determineCountryCode(stateCode) {
  const usStates = new Set([
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL', 'GA', 'ID', 'IL', 'IN', 'IA',
    'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT',
    'VA', 'WA', 'WV', 'WI', 'WY',
  ]);
  return usStates.has(stateCode) ? 'US' : 'XX';
}

function parseTaxRate(taxRateStr) {
  if (!taxRateStr) return 0;
  const match = taxRateStr.match(/%([\d.]+)/);
  if (match) return parseFloat(match[1]);
  return 0;
}

function parsePrizeAmount(prizeStr) {
  if (!prizeStr) return null;
  const cleaned = prizeStr.replace(/[$,\s]/g, '');
  const num = parseFloat(cleaned);
  if (prizeStr.includes('Million') || prizeStr.includes('MILLION')) return num * 1_000_000;
  if (prizeStr.includes('Thousand') || prizeStr.includes('THOUSAND')) return num * 1_000;
  return num;
}

function parseAmount(amountStr) {
  if (!amountStr) return null;
  const cleaned = amountStr.replace(/[$,]/g, '');
  const num = parseFloat(cleaned);
  if (amountStr.includes('Million') || amountStr.includes('MILLION')) return num * 1_000_000;
  return num;
}

function extractTime(timeStr) {
  if (!timeStr) return null;
  return timeStr.slice(0, 5);
}

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function upsertConfiguration(prismaClient, lotteryId, config) {
  await prismaClient.lotteryConfiguration.upsert({
    where: { lotteryId },
    update: {},
    create: { lotteryId, ...config },
  });
}

export async function getIngestionStatus() {
  const files = fs.readdirSync(JSON_RESPONSES_DIR).filter((f) => f.endsWith('.json'));
  const status = [];

  for (const fileName of files) {
    const currentHash = getFileHash(path.join(JSON_RESPONSES_DIR, fileName));
    const previousHash = getProcessedHash(fileName);
    status.push({
      fileName,
      processed: previousHash !== null,
      changed: currentHash !== previousHash,
    });
  }

  return status;
}

export default {
  ingestMainDraws,
  ingestStatesGameList,
  ingestPastDraws,
  ingestDrawingResult,
  ingestAllJsonFiles,
  getIngestionStatus,
};