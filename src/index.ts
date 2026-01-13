import { config } from "dotenv";
import { initialize } from "./process/init";
import { catchUp } from "./process/catch-up";

config();

async function main() {
  const init = await initialize();

  while (true) {
    await catchUp(init.provider);
  }
}

function exit() {
  process.exit(0);
}

main().then(exit).catch(exit);
