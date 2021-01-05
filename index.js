const dotenv = require("dotenv");
dotenv.config();
const runBot = require("./bot/index.js");

function go() {
  runBot();
}

go();
