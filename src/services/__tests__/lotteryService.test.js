import {
  buildWinningCombination,
  getCountryDashboardData,
  getLotteryDashboardData,
  getLotteryDetailData,
  getStateLotteries,
  getDrawDetail,
  invalidateLotteryCache,
} from '../lotteryService';

jest.mock('../../lib/prisma');
jest.mock('../../lib/redis');

import prisma from '../../lib/prisma';
import * as redis from '../../lib/redis';
const { __clearCache } = redis;

const makeBallType = (overrides = {}) => ({
  id: 'bt-1',
  lotteryId: 'lot-1',
  name: 'powerball',
  abbreviation: 'PB',
  category: 'ADDITIONAL',
  minBall: 1,
  maxBall: 26,
  allowZero: false,
  isString: false,
  isMultiplier: false,
  playerPicked: false,
  allowedValues: null,
  sortOrder: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeMultiplierType = (overrides = {}) =>
  makeBallType({
    id: 'bt-2',
    name: 'powerplay',
    abbreviation: 'PP',
    category: 'MULTIPLIER',
    isMultiplier: true,
    sortOrder: 2,
    ...overrides,
  });

const makeMainBallType = (overrides = {}) =>
  makeBallType({
    id: 'bt-0',
    name: 'white_ball',
    category: 'MAIN',
    sortOrder: 0,
    ...overrides,
  });

const makeDrawNumber = (overrides = {}) => ({
  id: 'dn-1',
  drawId: 'draw-1',
  ballTypeId: null,
  category: 'MAIN',
  position: 0,
  value: '10',
  ballType: null,
  ...overrides,
});

const makeJackpot = (overrides = {}) => ({
  id: 'jh-1',
  drawId: 'draw-1',
  jackpotRaw: '$300 MILLONES',
  jackpotAmount: 300000000,
  cashPayoutRaw: null,
  cashPayoutAmount: null,
  nextDrawDate: new Date('2026-08-01'),
  nextJackpotRaw: '$350 MILLONES',
  nextJackpotAmount: 350000000,
  nextCashRaw: null,
  nextCashAmount: null,
  totalPrizePool: null,
  overallWinners: null,
  recordedAt: new Date(),
  ...overrides,
});

const makePrize = (overrides = {}) => ({
  id: 'pr-1',
  drawId: 'draw-1',
  matchPattern: '5+0',
  prizeAmountRaw: '$1,000,000',
  prizeAmount: 1000000,
  winnersCount: 5,
  createdAt: new Date(),
  ...overrides,
});

const makeCountry = (overrides = {}) => ({
  id: 'country-1',
  code: 'US',
  name: 'Estados Unidos',
  slug: 'us',
  flagEmoji: '\u{1F1FA}\u{1F1F8}',
  currency: 'USD',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeState = (overrides = {}) => ({
  id: 'state-1',
  countryId: 'country-1',
  name: 'Florida',
  code: 'FL',
  slug: 'florida',
  taxRate: 0,
  minimumLegalAge: 18,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeLottery = (overrides = {}) => ({
  id: 'lot-1',
  externalId: 1111,
  stateId: 'state-1',
  name: 'Florida Lotto',
  slug: 'florida-lotto',
  mainDrawName: 'Main draw',
  logoUrl: null,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeDraw = (overrides = {}) => ({
  id: 'draw-1',
  lotteryId: 'lot-1',
  externalDrawId: 1001,
  drawNumber: '2026-01-01',
  drawDate: new Date('2026-01-01'),
  drawTime: null,
  details: null,
  note: null,
  hasWinner: false,
  status: 'COMPLETED',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('buildWinningCombination', () => {
  it('returns only main numbers when no special balls', () => {
    const numbers = [
      { category: 'MAIN', position: 0, value: '5', ballType: null },
      { category: 'MAIN', position: 1, value: '10', ballType: null },
    ];
    expect(buildWinningCombination(numbers)).toEqual({
      numbers: [5, 10],
    });
  });

  it('includes specialBall when ADDITIONAL category present', () => {
    const numbers = [
      { category: 'MAIN', position: 0, value: '5', ballType: null },
      { category: 'MAIN', position: 1, value: '10', ballType: null },
      { category: 'ADDITIONAL', position: 0, value: '7', ballType: { name: 'powerball' } },
    ];
    const result = buildWinningCombination(numbers);
    expect(result.numbers).toEqual([5, 10]);
    expect(result.specialBall).toBe(7);
    expect(result.specialBallName).toBe('powerball');
  });

  it('includes multiplier when MULTIPLIER category present', () => {
    const numbers = [
      { category: 'MAIN', position: 0, value: '5', ballType: null },
      { category: 'MULTIPLIER', position: 0, value: '3x', ballType: { name: 'powerplay' } },
    ];
    const result = buildWinningCombination(numbers);
    expect(result.numbers).toEqual([5]);
    expect(result.multiplier).toBe('3x');
    expect(result.multiplierName).toBe('powerplay');
  });

  it('sorts main numbers by position', () => {
    const numbers = [
      { category: 'MAIN', position: 2, value: '30', ballType: null },
      { category: 'MAIN', position: 0, value: '5', ballType: null },
      { category: 'MAIN', position: 1, value: '10', ballType: null },
    ];
    expect(buildWinningCombination(numbers).numbers).toEqual([5, 10, 30]);
  });

  it('handles string-based specialBall values', () => {
    const numbers = [
      { category: 'MAIN', position: 0, value: '5', ballType: null },
      { category: 'ADDITIONAL', position: 0, value: '07', ballType: { name: 'estrella' } },
    ];
    const result = buildWinningCombination(numbers);
    expect(result.specialBall).toBe(7);
    expect(result.specialBallName).toBe('estrella');
  });

  it('passes string multiplier as-is', () => {
    const numbers = [
      { category: 'MAIN', position: 0, value: '5', ballType: null },
      { category: 'MULTIPLIER', position: 0, value: '2', ballType: { name: 'multiplicador' } },
    ];
    const result = buildWinningCombination(numbers);
    expect(result.multiplier).toBe('2');
  });

  it('returns empty object when no numbers provided', () => {
    expect(buildWinningCombination([])).toEqual({ numbers: [] });
  });

  it('uses default names when ballType is null', () => {
    const numbers = [
      { category: 'MAIN', position: 0, value: '5', ballType: null },
      { category: 'ADDITIONAL', position: 0, value: '7', ballType: null },
      { category: 'MULTIPLIER', position: 0, value: '3', ballType: null },
    ];
    const result = buildWinningCombination(numbers);
    expect(result.specialBallName).toBe('Bola Especial');
    expect(result.multiplierName).toBe('Multiplicador');
  });
});

describe('getCountryDashboardData', () => {
  afterEach(() => {
    jest.clearAllMocks();
    __clearCache();
  });

  it('returns null when country not found', async () => {
    prisma.country.findUnique.mockResolvedValue(null);
    const result = await getCountryDashboardData('nonexistent');
    expect(result).toBeNull();
  });

  it('returns transformed lotteries with last draw data', async () => {
    const country = makeCountry({
      states: [
        makeState({
          lotteries: [
            makeLottery({
              configuration: null,
              ballTypes: [makeBallType(), makeMultiplierType(), makeMainBallType()],
              draws: [
                makeDraw({
                  numbers: [
                    { category: 'MAIN', position: 0, value: '5', ballType: null },
                    { category: 'MAIN', position: 1, value: '10', ballType: null },
                    { category: 'MAIN', position: 2, value: '15', ballType: null },
                    { category: 'ADDITIONAL', position: 0, value: '7', ballType: { name: 'powerball' } },
                    { category: 'MULTIPLIER', position: 0, value: '3', ballType: { name: 'powerplay' } },
                  ],
                  jackpotHistory: [makeJackpot()],
                }),
              ],
            }),
          ],
        }),
      ],
    });

    prisma.country.findUnique.mockResolvedValue(country);
    const result = await getCountryDashboardData('us');

    expect(result).not.toBeNull();
    expect(result.country.code).toBe('US');
    expect(result.lotteries).toHaveLength(1);
    expect(result.lotteries[0].name).toBe('Florida Lotto');
    expect(result.lotteries[0].hasMultiplier).toBe(true);
    expect(result.lotteries[0].multiplierName).toBe('powerplay');
    expect(result.lotteries[0].specialBallName).toBe('powerball');
    expect(result.lotteries[0].lastDraw).not.toBeNull();
    expect(result.lotteries[0].lastDraw.winningCombination.numbers).toEqual([5, 10, 15]);
    expect(result.lotteries[0].lastDraw.winningCombination.specialBall).toBe(7);
    expect(result.lotteries[0].lastDraw.winningCombination.multiplier).toBe('3');
  });

  it('caches result and returns _fromCache flag on second call', async () => {
    const country = makeCountry({
      states: [
        makeState({
          lotteries: [
            makeLottery({
              configuration: null,
              ballTypes: [],
              draws: [],
            }),
          ],
        }),
      ],
    });

    prisma.country.findUnique.mockResolvedValue(country);
    const first = await getCountryDashboardData('us');
    expect(first._fromCache).toBe(false);

    const second = await getCountryDashboardData('us');
    expect(second._fromCache).toBe(true);
    expect(prisma.country.findUnique).toHaveBeenCalledTimes(1);
  });

  it('returns null when prisma throws', async () => {
    prisma.country.findUnique.mockRejectedValue(new Error('DB error'));
    const result = await getCountryDashboardData('us');
    expect(result).toBeNull();
  });
});

describe('getLotteryDashboardData', () => {
  afterEach(() => {
    jest.clearAllMocks();
    __clearCache();
  });

  it('returns null when no lotteries match the name', async () => {
    prisma.country.findMany.mockResolvedValue([
      makeCountry({
        states: [
          makeState({
            lotteries: [
              makeLottery({ name: 'Florida Lotto', slug: 'florida-lotto' }),
            ],
          }),
        ],
      }),
    ]);

    const result = await getLotteryDashboardData('Powerball');
    expect(result).not.toBeNull();
    expect(result.lotteries).toHaveLength(0);
  });

  it('returns matching lotteries across countries', async () => {
    prisma.country.findMany.mockResolvedValue([
      makeCountry({
        code: 'US',
        name: 'Estados Unidos',
        slug: 'us',
        flagEmoji: '🇺🇸',
        currency: 'USD',
        states: [
          makeState({
            name: 'Nacional',
            code: 'NAT',
            slug: 'nacional',
            lotteries: [
              makeLottery({
                id: 'lot-pb',
                name: 'Powerball',
                slug: 'powerball',
                externalId: 1,
                isActive: true,
                ballTypes: [makeBallType(), makeMultiplierType()],
                draws: [
                  makeDraw({
                    numbers: [
                      { category: 'MAIN', position: 0, value: '5', ballType: null },
                      { category: 'MAIN', position: 1, value: '10', ballType: null },
                    ],
                    jackpotHistory: [makeJackpot()],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ]);

    const result = await getLotteryDashboardData('Powerball');
    expect(result).not.toBeNull();
    expect(result.lotteries).toHaveLength(1);
    expect(result.lotteries[0].name).toBe('Powerball');
    expect(result.lotteries[0].hasMultiplier).toBe(true);
    expect(result._fromCache).toBe(false);
  });

  it('caches result and returns _fromCache flag on second call', async () => {
    prisma.country.findMany.mockResolvedValue([
      makeCountry({
        states: [
          makeState({
            lotteries: [
              makeLottery({
                name: 'Powerball',
                slug: 'powerball',
                draws: [],
                ballTypes: [],
              }),
            ],
          }),
        ],
      }),
    ]);

    const first = await getLotteryDashboardData('Powerball');
    expect(first._fromCache).toBe(false);

    const second = await getLotteryDashboardData('Powerball');
    expect(second._fromCache).toBe(true);
    expect(prisma.country.findMany).toHaveBeenCalledTimes(1);
  });

  it('returns null when prisma throws', async () => {
    prisma.country.findMany.mockRejectedValue(new Error('DB error'));
    const result = await getLotteryDashboardData('Powerball');
    expect(result).toBeNull();
  });
});

describe('getLotteryDetailData', () => {
  afterEach(() => {
    jest.clearAllMocks();
    __clearCache();
  });

  it('returns null when country not found', async () => {
    prisma.country.findUnique.mockResolvedValue(null);
    const result = await getLotteryDetailData('us', 'florida-lotto');
    expect(result).toBeNull();
  });

  it('returns null when lottery not found in country', async () => {
    prisma.country.findUnique.mockResolvedValue(
      makeCountry({ states: [] })
    );
    const result = await getLotteryDetailData('us', 'nonexistent');
    expect(result).toBeNull();
  });

  it('returns detailed lottery data with draws and prizes', async () => {
    const now = new Date();
    const pastDraw = makeDraw({
      id: 'draw-2',
      drawDate: new Date('2025-12-25'),
      drawNumber: '2025-12-25',
      numbers: [
        { category: 'MAIN', position: 0, value: '1', ballType: null },
        { category: 'MAIN', position: 1, value: '2', ballType: null },
      ],
      prizes: [makePrize({ matchPattern: '2+0', winnersCount: 100, prizeAmountRaw: '$5' })],
      jackpotHistory: [],
    });

    const latestDraw = makeDraw({
      id: 'draw-1',
      drawDate: now,
      externalDrawId: 1001,
      numbers: [
        { category: 'MAIN', position: 0, value: '10', ballType: null },
      ],
      prizes: [makePrize()],
      jackpotHistory: [makeJackpot()],
    });

    const lottery = makeLottery({
      configuration: null,
      ballTypes: [makeBallType()],
      state: makeState({ country: makeCountry() }),
      draws: [latestDraw, pastDraw],
    });

    const country = makeCountry({
      states: [makeState({ lotteries: [lottery] })],
    });

    prisma.country.findUnique.mockResolvedValue(country);
    const result = await getLotteryDetailData('us', 'florida-lotto');

    expect(result.name).toBe('Florida Lotto');
    expect(result.latestDraw).not.toBeNull();
    expect(result.latestDraw.drawNumber).toBe('2026-01-01');
    expect(result.latestDraw.winningCombination.numbers).toEqual([10]);
    expect(result.latestDraw.prizes).toHaveLength(1);
    expect(result.latestDraw.prizes[0].categoryName).toBe('5+0');
    expect(result.historicalDraws).toHaveLength(1);
    expect(result.historicalDraws[0].drawNumber).toBe('2025-12-25');
    expect(result.country.currency).toBe('USD');
  });

  it('returns null on error', async () => {
    prisma.country.findUnique.mockRejectedValue(new Error('fail'));
    const result = await getLotteryDetailData('us', 'florida-lotto');
    expect(result).toBeNull();
  });
});

describe('getStateLotteries', () => {
  afterEach(() => {
    jest.clearAllMocks();
    __clearCache();
  });

  it('returns null when state not found', async () => {
    prisma.state.findFirst.mockResolvedValue(null);
    const result = await getStateLotteries('us', 'nonexistent');
    expect(result).toBeNull();
  });

  it('returns transformed state data with lotteries', async () => {
    prisma.state.findFirst.mockResolvedValue(
      makeState({
        country: makeCountry(),
        lotteries: [
          makeLottery({
            draws: [
              makeDraw({
                numbers: [
                  { category: 'MAIN', position: 0, value: '3', ballType: null },
                ],
                jackpotHistory: [makeJackpot()],
              }),
            ],
          }),
        ],
      })
    );

    const result = await getStateLotteries('us', 'florida');
    expect(result.state.name).toBe('Florida');
    expect(result.state.country.name).toBe('Estados Unidos');
    expect(result.lotteries).toHaveLength(1);
    expect(result.lotteries[0].name).toBe('Florida Lotto');
    expect(result.lotteries[0].lastDraw.winningCombination.numbers).toEqual([3]);
    expect(result.lotteries[0].stateOrRegion).toBe('Exclusiva de Florida');
  });

  it('returns null on error', async () => {
    prisma.state.findFirst.mockRejectedValue(new Error('fail'));
    const result = await getStateLotteries('us', 'florida');
    expect(result).toBeNull();
  });
});

describe('getDrawDetail', () => {
  afterEach(() => {
    jest.clearAllMocks();
    __clearCache();
  });

  it('returns null when draw not found', async () => {
    prisma.draw.findUnique.mockResolvedValue(null);
    const result = await getDrawDetail('us', 'florida-lotto', 'nonexistent');
    expect(result).toBeNull();
  });

  it('returns full draw detail with prizes and jackpot', async () => {
    prisma.draw.findUnique.mockResolvedValue(
      makeDraw({
        lottery: makeLottery({
          state: makeState({ country: makeCountry() }),
          ballTypes: [makeMultiplierType()],
        }),
        numbers: [
          { category: 'MAIN', position: 0, value: '5', ballType: null },
          { category: 'MAIN', position: 1, value: '10', ballType: null },
          { category: 'MULTIPLIER', position: 0, value: '2', ballType: { name: 'powerplay' } },
        ],
        prizes: [
          makePrize({ matchPattern: '5+0', prizeAmountRaw: '$2,000,000', winnersCount: 1 }),
          makePrize({ matchPattern: '4+0', prizeAmountRaw: '$100', winnersCount: 50 }),
        ],
        jackpotHistory: [makeJackpot()],
      })
    );

    const result = await getDrawDetail('us', 'florida-lotto', 'draw-1');
    expect(result.lotteryName).toBe('Florida Lotto');
    expect(result.winningCombination.numbers).toEqual([5, 10]);
    expect(result.winningCombination.multiplier).toBe('2');
    expect(result.prizes).toHaveLength(2);
    expect(result.prizes[0].categoryName).toBe('5+0');
    expect(result.jackpotFormatted).toBe('$300 MILLONES');
    expect(result.nextJackpotFormatted).toBe('$350 MILLONES');
  });

  it('returns null on error', async () => {
    prisma.draw.findUnique.mockRejectedValue(new Error('fail'));
    const result = await getDrawDetail('us', 'florida-lotto', 'draw-1');
    expect(result).toBeNull();
  });
});

describe('invalidateLotteryCache', () => {
  it('deletes dashboard and detail cache keys', async () => {
    await redis.setCache('lottery:country:us:dashboard', { data: true });
    await redis.setCache('lottery:us:florida-lotto:detail', { data: true });

    expect(await redis.getCache('lottery:country:us:dashboard')).toEqual({ data: true });
    expect(await redis.getCache('lottery:us:florida-lotto:detail')).toEqual({ data: true });

    await invalidateLotteryCache('us', 'florida-lotto');

    expect(await redis.getCache('lottery:country:us:dashboard')).toBeNull();
    expect(await redis.getCache('lottery:us:florida-lotto:detail')).toBeNull();
  });
});
