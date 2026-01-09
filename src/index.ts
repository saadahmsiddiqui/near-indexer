import { config } from "dotenv";
import { initialize } from "./process/init";
import { catchUp } from "./process/catch-up";

config();

async function main() {
  try {
    const init = await initialize();
    await catchUp(init.provider);
  } catch (error) {
    console.error(error)
  }
}

function exit() {
  process.exit(0);
}

main().then(exit).catch(exit);
