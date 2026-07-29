import { formatCurrency } from '../lib/formatters';

const SPECIAL_BALL_CATEGORIES = ['ADDITIONAL', 'MULTIPLIER'];

export function checkUserNumbers(playerNumbers, draw) {
  const { main: playerMain, special: playerSpecial, multiplier: playerMultiplier } = playerNumbers;
  const drawNumbers = draw.numbers || [];
  const prizes = draw.prizes || [];

  const drawMains = drawNumbers
    .filter((n) => n.category === 'MAIN')
    .sort((a, b) => a.position - b.position)
    .map((n) => parseInt(n.value, 10));

  const drawAdditionals = drawNumbers.filter((n) => n.category === 'ADDITIONAL');
  const drawMultipliers = drawNumbers.filter((n) => n.category === 'MULTIPLIER');

  const matchedMain = playerMain.filter((n) => drawMains.includes(n)).length;
  const totalMain = drawMains.length;

  const matchedSpecial = playerSpecial !== null && playerSpecial !== undefined && drawAdditionals.length > 0
    ? parseInt(drawAdditionals[0].value, 10) === playerSpecial
    : null;

  const matchedMultiplier = playerMultiplier !== null && playerMultiplier !== undefined && drawMultipliers.length > 0
    ? drawMultipliers[0].value === String(playerMultiplier)
    : null;

  const hasSpecialBall = drawAdditionals.length > 0;

  const matchKey = hasSpecialBall
    ? `${matchedMain}+${matchedSpecial ? 1 : 0}`
    : `${matchedMain}/${totalMain}`;

  const matchedPrize = prizes.find((p) => p.matchPattern === matchKey) || null;
  const isWinner = matchedPrize !== null;

  const ballTypeMap = {};
  const lotteryBallTypes = draw.lottery?.ballTypes || [];
  for (const bt of lotteryBallTypes) {
    ballTypeMap[bt.category] = bt;
  }

  const formattedPlayerNumbers = {
    main: playerMain,
    special: playerSpecial,
    multiplier: playerMultiplier,
  };

  const drawMainNumbers = drawMains;
  const drawSpecialNumber = drawAdditionals.length > 0 ? parseInt(drawAdditionals[0].value, 10) : null;
  const drawMultiplierValue = drawMultipliers.length > 0 ? drawMultipliers[0].value : null;

  const ballResults = playerMain.map((num) => ({
    value: num,
    category: 'MAIN',
    matched: drawMainNumbers.includes(num),
  }));

  if (matchedSpecial !== null) {
    ballResults.push({
      value: playerSpecial,
      category: 'ADDITIONAL',
      matched: matchedSpecial,
    });
  }

  if (matchedMultiplier !== null) {
    ballResults.push({
      value: playerMultiplier,
      category: 'MULTIPLIER',
      matched: matchedMultiplier,
    });
  }

  return {
    matchedMain,
    totalMain,
    matchedSpecial,
    matchedMultiplier,
    matchKey,
    isWinner,
    prize: matchedPrize
      ? {
          categoryName: matchedPrize.matchPattern,
          winnersCount: matchedPrize.winnersCount || 0,
          prizeAmountFormatted:
            matchedPrize.prizeAmountRaw ||
            (matchedPrize.prizeAmount
              ? formatCurrency(matchedPrize.prizeAmount, draw.lottery?.state?.country?.currency || 'USD')
              : '-'),
        }
      : null,
    ballResults,
  };
}
