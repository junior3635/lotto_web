import { PrismaClient, BallCategory, DayOfWeek } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const PR_FILE = path.join(process.cwd(), 'Game Jurisdiction Format Latest draw Pri');
const LLOTERY_FILE = path.join(process.cwd(), 'lloteryforstate.json');

const COUNTRY_DISPLAY_NAME = {
  'US': 'Estados Unidos',
  'UK': 'Reino Unido',
  'AU': 'Australia',
  'CA': 'Canadá',
  'PH': 'Filipinas',
  'PR': 'Puerto Rico',
  'ZA': 'Sudáfrica',
  'NZ': 'Nueva Zelanda',
};

const countryConfigs = {
  USA: { code: 'US', slug: 'us', flagEmoji: '🇺🇸', currency: 'USD' },
  UK: { code: 'UK', slug: 'uk', flagEmoji: '🇬🇧', currency: 'GBP' },
  Australia: { code: 'AU', slug: 'au', flagEmoji: '🇦🇺', currency: 'AUD' },
  Canada: { code: 'CA', slug: 'ca', flagEmoji: '🇨🇦', currency: 'CAD' },
  Philippines: { code: 'PH', slug: 'ph', flagEmoji: '🇵🇭', currency: 'PHP' },
  'Puerto Rico': { code: 'PR', slug: 'pr', flagEmoji: '🇵🇷', currency: 'USD' },
  'South Africa': { code: 'ZA', slug: 'za', flagEmoji: '🇿🇦', currency: 'ZAR' },
  'New Zealand': { code: 'NZ', slug: 'nz', flagEmoji: '🪙', currency: 'NZD' },
};

const codeToConfig = {};
for (const cname of Object.keys(countryConfigs)) {
  codeToConfig[countryConfigs[cname].code] = countryConfigs[cname];
}

const US_STATE_ABBREV = {
  'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR',
  'California': 'CA', 'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE',
  'District of Columbia': 'DC', 'Florida': 'FL', 'Georgia': 'GA', 'Idaho': 'ID',
  'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA', 'Kansas': 'KS', 'Kentucky': 'KY',
  'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD', 'Massachusetts': 'MA',
  'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO',
  'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH',
  'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC',
  'Ohio': 'OH', 'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA',
  'Rhode Island': 'RI', 'South Carolina': 'SC', 'South Dakota': 'SD', 'Tennessee': 'TN',
  'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA',
  'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY',
};

const FORMAT_CONFIG = {
  'Lotto': { drawnNumbers: 6, minBall: 1, maxBall: 49, selectableBalls: 6 },
  'Pick': { drawnNumbers: 3, minBall: 0, maxBall: 9, selectableBalls: 3 },
  'Cash Pop': { drawnNumbers: 5, minBall: 1, maxBall: 28, selectableBalls: 5 },
};

const SCHEDULE_MAP = {
  'Daily': [DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY, DayOfWeek.SATURDAY, DayOfWeek.SUNDAY],
  'Daily (specific draw)': [DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY, DayOfWeek.SATURDAY, DayOfWeek.SUNDAY],
  '1 days/week': [DayOfWeek.SATURDAY],
  '2 days/week': [DayOfWeek.TUESDAY, DayOfWeek.FRIDAY],
  '3 days/week': [DayOfWeek.MONDAY, DayOfWeek.WEDNESDAY, DayOfWeek.SATURDAY],
  '4 days/week': [DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.THURSDAY, DayOfWeek.SATURDAY],
  '5 days/week': [DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY],
  '6 days/week': [DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY, DayOfWeek.SATURDAY],
};

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
    return { type: 'weekly', daysPerWeek: match ? parseInt(match[1]) : 0, days: SCHEDULE_MAP[cleaned] || [] };
  }
  if (cleaned.startsWith('Daily')) {
    const specific = cleaned.includes('specific draw');
    return { type: 'daily', daysPerWeek: 7, specific, days: SCHEDULE_MAP[cleaned] || [] };
  }
  return { type: 'unknown', daysPerWeek: 0, days: [] };
}

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function getCountryCode(jurisdiction) {
  if (countryConfigs[jurisdiction]) return countryConfigs[jurisdiction].code;
  if (US_STATE_ABBREV[jurisdiction]) return 'US';
  for (const cname of Object.keys(countryConfigs)) {
    if (jurisdiction.includes(cname) || cname.includes(jurisdiction)) return countryConfigs[cname].code;
  }
  return 'US';
}

function getStateCode(jurisdiction) {
  if (countryConfigs[jurisdiction]) return 'NAT';
  if (US_STATE_ABBREV[jurisdiction]) return US_STATE_ABBREV[jurisdiction];
  return jurisdiction.slice(0, 2).toUpperCase();
}

function getStateSlug(jurisdiction, countryCode) {
  if (countryConfigs[jurisdiction] && countryCode === countryConfigs[jurisdiction].code) return countryConfigs[jurisdiction].slug;
  if (jurisdiction === 'District of Columbia') return 'district-of-columbia';
  return jurisdiction.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
}

function parsePrFile() {
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

    const prizeInfo = parsePrize(prize);
    const schedInfo = parseSchedule(schedule);

    rows.push({ game, jurisdiction, format, latestDraw, prizeInfo, schedInfo });
  }

  return rows;
}

function loadLloteryMap() {
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

async function upsertCountry(prisma, code, name, slug, flagEmoji, currency) {
  return prisma.country.upsert({
    where: { code },
    update: { name, slug, flagEmoji, currency },
    create: { code, name, slug, flagEmoji, currency },
  });
}

async function upsertState(prisma, countryId, name, code, slug) {
  return prisma.state.upsert({
    where: { countryId_code: { countryId, code } },
    update: {},
    create: { countryId, name, code, slug, taxRate: 0, minimumLegalAge: 18 },
  });
}

async function upsertLottery(prisma, stateId, externalId, name, slug) {
  return prisma.lottery.upsert({
    where: { stateId_slug: { stateId, slug } },
    update: { externalId, name },
    create: { stateId, externalId, name, slug, mainDrawName: 'Main draw' },
  });
}

async function upsertConfiguration(prisma, lotteryId, config) {
  await prisma.lotteryConfiguration.upsert({
    where: { lotteryId },
    update: {},
    create: { lotteryId, ...config },
  });
}

async function upsertBallType(prisma, lotteryId, name, abbreviation, category, opts = {}) {
  return prisma.lotteryBallType.upsert({
    where: { lotteryId_name: { lotteryId, name } },
    update: {},
    create: { lotteryId, name, abbreviation, category, sortOrder: 0, ...opts },
  });
}

async function upsertSchedule(prisma, lotteryId, dayOfWeek) {
  await prisma.lotteryDrawSchedule.upsert({
    where: { lotteryId_dayOfWeek: { lotteryId, dayOfWeek } },
    update: { isActive: true },
    create: { lotteryId, dayOfWeek, isActive: true },
  });
}

async function main() {
  console.log('🌱 Starting jurisdiction seed from PR file and lloteryforstate.json...');

  const rows = parsePrFile();
  const lloteryMap = loadLloteryMap();

  console.log(`📄 Parsed ${rows.length} games from PR file`);
  console.log(`📋 Loaded ${Object.keys(lloteryMap).length} game names from lloteryforstate.json`);

  const countryCodes = [...new Set(rows.map((r) => getCountryCode(r.jurisdiction)))];
  const countryNames = {
  'US': 'Estados Unidos',
  'UK': 'Reino Unido',
  'AU': 'Australia',
  'CA': 'Canadá',
  'PH': 'Filipinas',
  'PR': 'Puerto Rico',
  'ZA': 'Sudáfrica',
  'NZ': 'Nueva Zelanda',
};

  const countries = {};

  for (const cc of countryCodes) {
    const meta = countryConfigs[Object.keys(countryConfigs).find((k) => countryConfigs[k].code === cc)];
    if (meta) {
      const displayName = countryNames[cc] || cc;
      const country = await upsertCountry(prisma, cc, displayName, meta.slug, meta.flagEmoji, meta.currency);
      countries[cc] = country;
    }
  }
  console.log(`✅ Created/updated ${Object.keys(countries).length} countries`);

  const stateCache = {};
  const lotteryCache = {};

  for (const row of rows) {
    const cc = getCountryCode(row.jurisdiction);
    const sc = getStateCode(row.jurisdiction);
    const stateSlug = getStateSlug(row.jurisdiction, cc);
    const stateKey = `${cc}:${sc}`;
    const gameSlug = slugify(row.game);
    const cacheKey = `${stateKey}:${gameSlug}`;

    if (!stateCache[stateKey]) {
      const country = countries[cc];
      if (!country) continue;
      const stateName = countryConfigs[row.jurisdiction] ? country.name : row.jurisdiction;
      const state = await upsertState(prisma, country.id, stateName, sc, stateSlug);
      stateCache[stateKey] = state;
    }

    const state = stateCache[stateKey];
    const externalId = lloteryMap[row.game.toLowerCase()] || null;

    if (!lotteryCache[cacheKey]) {
      const lottery = await upsertLottery(prisma, state.id, externalId, row.game, gameSlug);
      lotteryCache[cacheKey] = lottery;
    }
  }

  console.log(`✅ Created/updated ${rows.length} lotteries across ${Object.keys(stateCache).length} states`);

  let totalConfigs = 0;
  let totalBallTypes = 0;
  let totalSchedules = 0;

  for (const row of rows) {
    const cc = getCountryCode(row.jurisdiction);
    const sc = getStateCode(row.jurisdiction);
    const stateKey = `${cc}:${sc}`;
    const gameSlug = slugify(row.game);
    const cacheKey = `${stateKey}:${gameSlug}`;
    const lottery = lotteryCache[cacheKey];

    const config = FORMAT_CONFIG[row.format] || FORMAT_CONFIG['Lotto'];

    await upsertConfiguration(prisma, lottery.id, {
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
    });
    totalConfigs++;

    const mainBallType = await upsertBallType(prisma, lottery.id, 'main', 'MN', BallCategory.MAIN, {
      minBall: config.minBall,
      maxBall: config.maxBall,
      playerPicked: true,
      sortOrder: 0,
    });
    totalBallTypes++;

    if (row.format === 'Cash Pop') {
      const bonusType = await upsertBallType(prisma, lottery.id, 'bonus', 'BN', BallCategory.ADDITIONAL, {
        minBall: 1,
        maxBall: config.maxBall,
        playerPicked: false,
        sortOrder: 1,
      });
      totalBallTypes++;
    }

    if (row.schedInfo.days && row.schedInfo.days.length > 0) {
      for (const day of row.schedInfo.days) {
        await upsertSchedule(prisma, lottery.id, day);
        totalSchedules++;
      }
    }
  }

  console.log(`✅ Created/updated ${totalConfigs} configurations`);
  console.log(`✅ Created/updated ${totalBallTypes} ball types`);
  console.log(`✅ Created/updated ${totalSchedules} draw schedules`);

  const countryCount = await prisma.country.count();
  const stateCount = await prisma.state.count();
  const lotteryCount = await prisma.lottery.count();
  const configCount2 = await prisma.lotteryConfiguration.count();
  const ballTypeCount2 = await prisma.lotteryBallType.count();
  const schedCount2 = await prisma.lotteryDrawSchedule.count();

  console.log(`
🌱 Jurisdiction seed complete:
   Countries: ${countryCount}
   States: ${stateCount}
   Lotteries: ${lotteryCount}
   Configurations: ${configCount2}
   Ball Types: ${ballTypeCount2}
   Draw Schedules: ${schedCount2}
  `);
}

main()
  .catch((e) => {
    console.error('❌ Error executing jurisdiction seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
