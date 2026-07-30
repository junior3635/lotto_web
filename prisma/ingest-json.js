import { ingestAllJsonFiles } from '../src/services/jsonIngestionService.js';

async function main() {
  console.log('📂 Reading JSON files from json_responses/...');
  const result = await ingestAllJsonFiles();
  console.log(JSON.stringify(result, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });