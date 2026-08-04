import { ingestDrawAnalyticsData } from '../src/services/drawAnalyticsService';

const stateSlug = process.argv[2] || null;
const gameId = process.argv[3] || null;

async function main() {
  console.log('🎰 Ingesting DrawAnalytics data...');
  if (stateSlug) console.log(`  State: ${stateSlug}`);
  if (gameId) console.log(`  Game: ${gameId}`);
  const result = await ingestDrawAnalyticsData(stateSlug, gameId);
  console.log(JSON.stringify(result, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });