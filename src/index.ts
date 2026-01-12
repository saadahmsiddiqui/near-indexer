import { config } from "dotenv";
import { initialize } from "./process/init";
import { catchUp } from "./process/catch-up";
import { processChunks } from "./process/process-chunks";

config();

async function main() {
  const processName = process.argv[2];
  const init = await initialize();

  switch (processName) {
    case "catchUp":
      await catchUp(init.provider);
      return;
    case "processChunks":
      await processChunks(init.provider);
      return;
    default:
      break;
  }
}

function exit() {
  process.exit(0);
}

main().then(exit).catch(exit);
