import { config } from "dotenv";
import { initialize } from "./process/init";
import { catchUp } from "./process/catch-up";
import { createLogger } from "./logger";
import { sleep } from "./utils";

config();

async function main() {
  const init = await initialize();
  const logger = createLogger('near-indexer');

  while (true) {
    try {
      await catchUp(init.provider, logger);
    } catch (error) {
      logger.error("Error: " + JSON.stringify(error));
      await sleep(4000)
    }
  }
}

function exit() {
  process.exit(0);
}

main().then(exit).catch(exit);
