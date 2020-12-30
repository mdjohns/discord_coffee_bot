import dotenv from "dotenv";
dotenv.config();
import { initializeBot } from "./bot.js";

function go() {
  initializeBot();
}

go();
