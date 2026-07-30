import fs from 'fs';
import path from 'path';
import prisma from '../lib/prisma';

const PR_FILE = path.join(process.cwd(), 'Game Jurisdiction Format Latest draw Pri');
const LLOTERY_FILE = path.join(process.cwd(), 'lloteryforstate.json');

const COUNTRY_DISPLAY_NAME = {
  US: 'Estados Unidos',
  UK: 'Reino Unido',
  AU: 'Australia',
  CA: 'Canadá',
  PH: 'Filipinas',
  PR: 'Puerto Rico',
  ZA: 'Sudáfrica',
  NZ: 'Nueva Zelanda',
};

const JURISDICTION_COUNTRY_MAP = {
  USA: 'US',
  UK: 'UK',
  Australia: 'AU',
  Canada: 'CA',
  Philippines: 'PH',
  'Puerto Rico': 'PR',
  'South Africa': 'ZA',
  'New Zealand': 'NZ',
};

const US_STATE_ABBREV = {
  Alabama: 'AL', Alaska: 'AK', Arizona: 'AZ', Arkansas: 'AR',
  California: 'CA', Colorado: 'CO', Connecticut: 'CT', Delaware: 'DE',
  'District of Columbia': 'DC', Florida: 'FL', Georgia: 'GA', Idaho: 'ID',
  Illinois: 'IL', Indiana: 'IN', Iowa: 'IA', Kansas: 'KS', Kentucky: 'KY',
  Louisiana: 'LA', Maine: 'ME', Maryland: 'MD', Massachusetts: 'MA',
  Michigan: 'MI', Minnesota: 'MN', Mississippi: 'MS', Missouri: 'MO',
  Montana: 'MT', Nebraska: 'NE', Nevada: 'NV', 'New Hampshire': 'NH',
  'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC',
  Ohio: 'OH', Oklahoma: 'OK', Oregon: 'OR', Pennsylvania: 'PA',
  'Rhode Island': 'RI', 'South Carolina': 'SC', 'South Dakota': 'SD', Tennessee: 'TN',
  Texas: 'TX', Utah: 'UT', Vermont: 'VT', Virginia: 'VA', Washington: 'WA',
  'West Virginia': 'WV', Wisconsin: 'WI', Wyoming: 'WY',
};

const FORMAT_CONFIG = {
  Lotto: { drawnNumbers: 6, minBall: 1, maxBall: 49, selectableBalls: 6 },
  Pick: { drawnNumbers: 3, minBall: 0, maxBall: 9, selectableBalls: 3 },
  'Cash Pop': { drawnNumbers: 5, minBall: 1, maxBall: 28, selectableBalls: 5 },
};

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function parsePrize(prizeStr) {
  const cleaned = prizeStr.trim();
  if (cleaned.startsWith('Jackpot ')) {
    const amountStr = cleaned.replace('Jackpot ', '').replace(/[$,\s]/g, '');
    return { type: 'jackpot', amount: parseFloat(amountStr) || null, raw: cleaned };
  }
  if (cleaned.startsWith('Top prize ')) {
    const amountStr = cleaned.replace('Top prize ', '').replace(/[$,\s]/g, '');
    return { type: 'top_prize', amount: parseFloat(amountStr) || null, raw: cleaned };
  }
  if (cleaned === 'No listed prize') {
    return { type: 'none', amount: 0, raw: cleaned };
  }
  return { type: 'other', amount: null, raw: cleaned };
}

function parseSchedule(schedStr) {
  const cleaned = schedStr.trim();
  if (cleaned.includes('days/week')) {
    const match = cleaned.match(/(\d+)\s+days?\/week/);
    const daysPerWeek = match ? parseInt(match[1]) : 0;
    return { type: 'weekly', daysPerWeek, days: [] };
  }
  if (cleaned.startsWith('Daily')) {
    const specific = cleaned.includes('specific draw');
    return { type: 'daily', daysPerWeek: 7, specific, days: [] };
  }
  return { type: 'unknown', daysPerWeek: 0, days: [] };
}

export function parsePRFile() {
  const content = fs.readFileSync(PR_FILE, 'utf-8');
  const lines = content.split('\n');
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split('\t');
    if (parts.length < 5) continue;

    let game = parts[0].trim();
    const jurisdiction = parts[1].trim();
    const format = parts[2].trim();
    const latestDraw = parts[3].trim();
    let prize = parts[4].trim();
    let schedule = parts.length >= 6 ? parts[5].trim() : '';

    if (schedule === '' && parts.length === 5) {
      const schedMatch = prize.match(/\s+(1\s+days?\/week|\d+\s+days?\/week|Daily(?:\s+\(specific draw\))?)$/);
      if (schedMatch) {
        schedule = schedMatch[1].trim();
        prize = prize.replace(schedMatch[0], '').trim();
      }
    }

    if (!game || !jurisdiction || !format) continue;
    game = game.replace(/\s+/g, ' ').trim();

    rows.push({
      game,
      jurisdiction,
      format,
      latestDraw,
      prizeInfo: parsePrize(prize),
      schedInfo: parseSchedule(schedule),
    });
  }

  return rows;
}

export function loadLloteryMap() {
  try {
    const content = fs.readFileSync(LLOTERY_FILE, 'utf-8');
    const data = JSON.parse(content);
    const map = {};
    for (const item of data.data) {
      map[item.name.toLowerCase()] = item.gameID;
    }
    return map;
  } catch {
    return {};
  }
}

export async function ingestJurisdictionData() {
  const rows = parsePRFile();
  const lloteryMap = loadLloteryMap();

  const results = {
    countriesCreated: 0,
    countriesUpdated: 0,
    statesCreated: 0,
    statesUpdated: 0,
    lotteriesCreated: 0,
    lotteriesUpdated: 0,
    configurationsCreated: 0,
    ballTypesCreated: 0,
    schedulesCreated: 0,
    errors: [],
  };

  const seenCountries = new Set();
  const seenStates = new Set();

  for (const row of rows) {
    try {
      const cc = getCountryCode(row.jurisdiction);
      const sc = getStateCode(row.jurisdiction);
      const stateSlug = getStateSlug(row.jurisdiction);
      const stateKey = `${cc}:${sc}`;

      const countryDisplayName = COUNTRY_DISPLAY_NAME[cc] || cc;
      const country = await prisma.country.upsert({
        where: { code: cc },
        update: {},
        create: { code: cc, name: countryDisplayName, slug: cc.toLowerCase(), flagEmoji: '🏳️', currency: 'USD' },
      });

      if (seenCountries.has(cc)) {
        results.countriesUpdated++;
      } else {
        seenCountries.add(cc);
        results.countriesCreated++;
      }

      const state = await prisma.state.upsert({
        where: { countryId_code: { countryId: country.id, code: sc } },
        update: {},
        create: { countryId: country.id, name: row.jurisdiction, code: sc, slug: stateSlug, taxRate: 0, minimumLegalAge: 18 },
      });

      if (seenStates.has(stateKey)) {
        results.statesUpdated++;
      } else {
        seenStates.add(stateKey);
        results.statesCreated++;
      }

      const gameSlug = slugify(row.game);
      const externalId = lloteryMap[row.game.toLowerCase()] || null;

      const existingLottery = await prisma.lottery.findFirst({
        where: { stateId: state.id, slug: gameSlug },
      });

      const lottery = await prisma.lottery.upsert({
        where: { stateId_slug: { stateId: state.id, slug: gameSlug } },
        update: { externalId, name: row.game },
        create: { stateId: state.id, externalId, name: row.game, slug: gameSlug, mainDrawName: 'Main draw' },
      });

      if (existingLottery) {
        results.lotteriesUpdated++;
      } else {
        results.lotteriesCreated++;
      }

      const config = getFormatConfig(row.format);
      await prisma.lotteryConfiguration.upsert({
        where: { lotteryId: lottery.id },
        update: {},
        create: {
          lotteryId: lottery.id,
          drawTimezone: 'America/New_York',
          drawTime: '20:00',
          stopSaleTime: '19:00',
          claimDeadline: 180,
          allowZero: false,
          minBall: config.minBall,
          maxBall: config.maxBall,
          drawnNumbers: config.drawnNumbers,
          selectableBalls: config.selectableBalls,
          minimumSelectableBalls: config.selectableBalls,
          uniqueMainNumbers: 1,
          uniqueExtraNumbers: 0,
          allowDuplicates: false,
        },
      });
      results.configurationsCreated++;

      await prisma.lotteryBallType.upsert({
        where: { lotteryId_name: { lotteryId: lottery.id, name: 'main' } },
        update: {},
        create: {
          lotteryId: lottery.id,
          name: 'main',
          abbreviation: 'MN',
          category: 'MAIN',
          minBall: config.minBall,
          maxBall: config.maxBall,
          playerPicked: true,
          sortOrder: 0,
        },
      });
      results.ballTypesCreated++;

      if (row.format === 'Cash Pop') {
        await prisma.lotteryBallType.upsert({
          where: { lotteryId_name: { lotteryId: lottery.id, name: 'bonus' } },
          update: {},
          create: {
            lotteryId: lottery.id,
            name: 'bonus',
            abbreviation: 'BN',
            category: 'ADDITIONAL',
            minBall: 1,
            maxBall: config.maxBall,
            playerPicked: false,
            sortOrder: 1,
          },
        });
        results.ballTypesCreated++;
      }

    } catch (error) {
      results.errors.push({ game: row.game, jurisdiction: row.jurisdiction, error: error.message });
    }
  }

  return results;
}

function getCountryCode(jurisdiction) {
  if (JURISDICTION_COUNTRY_MAP[jurisdiction]) return JURISDICTION_COUNTRY_MAP[jurisdiction];
  if (US_STATE_ABBREV[jurisdiction]) return 'US';
  return 'US';
}

function getStateCode(jurisdiction) {
  if (US_STATE_ABBREV[jurisdiction]) return US_STATE_ABBREV[jurisdiction];
  if (jurisdiction === 'District of Columbia') return 'DC';
  if (jurisdiction === 'Puerto Rico') return 'PR';
  return jurisdiction.slice(0, 2).toUpperCase();
}

function getStateSlug(jurisdiction) {
  if (jurisdiction === 'District of Columbia') return 'district-of-columbia';
  if (jurisdiction === 'Puerto Rico') return 'puerto-rico';
  return jurisdiction.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
}

function getFormatConfig(format) {
  const configs = {
    'Lotto': { drawnNumbers: 6, minBall: 1, maxBall: 49, selectableBalls: 6 },
    'Pick': { drawnNumbers: 3, minBall: 0, maxBall: 9, selectableBalls: 3 },
    'Cash Pop': { drawnNumbers: 5, minBall: 1, maxBall: 28, selectableBalls: 5 },
  };
  return configs[format] || configs['Lotto'];
}

export async function getIngestionStats() {
  const [countryCount, stateCount, lotteryCount, configCount, ballTypeCount, schedCount, drawCount] = await Promise.all([
    prisma.country.count(),
    prisma.state.count(),
    prisma.lottery.count(),
    prisma.lotteryConfiguration.count(),
    prisma.lotteryBallType.count(),
    prisma.lotteryDrawSchedule.count(),
    prisma.draw.count(),
  ]);

  return { countryCount, stateCount, lotteryCount, configCount, ballTypeCount, schedCount, drawCount };
}

export async function clearJurisdictionData() {
  const lotteries = await prisma.lottery.findMany({ include: { state: { select: { countryId: true } } } });
  const stateIds = [...new Set(lotteries.map((l) => l.stateId))];

  for (const lottery of lotteries) {
    await prisma.jackpotHistory.deleteMany({ where: { draw: { lotteryId: lottery.id } } });
    await prisma.drawNumber.deleteMany({ where: { draw: { lotteryId: lottery.id } } });
    await prisma.prizeBreakdown.deleteMany({ where: { draw: { lotteryId: lottery.id } } });
    await prisma.draw.deleteMany({ where: { lotteryId: lottery.id } });
    await prisma.lotteryDrawSchedule.deleteMany({ where: { lotteryId: lottery.id } });
    await prisma.lotteryBallType.deleteMany({ where: { lotteryId: lottery.id } });
    await prisma.lotteryConfiguration.deleteMany({ where: { lotteryId: lottery.id } });
    await prisma.lottery.deleteMany({ where: { id: lottery.id } });
  }

  for (const stateId of stateIds) {
    await prisma.state.deleteMany({ where: { id: stateId } });
  }

  const countryCodes = ['US', 'UK', 'AU', 'CA', 'PH', 'PR', 'ZA', 'NZ'];
  for (const code of countryCodes) {
    await prisma.country.deleteMany({ where: { code } });
  }

  return { deleted: true, countryCodes };
}

export default {
  parsePRFile,
  loadLloteryMap,
  ingestJurisdictionData,
  getIngestionStats,
  clearJurisdictionData,
};