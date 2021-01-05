const dotenv = require("dotenv");
dotenv.config();

const config = {
  prefix: "!",
  maxFields: 25,
  embedColor: "#0099ff",
  token: process.env.DISCORD_BOT_TOKEN,
  url: process.env.SHEET_URL,
  filterOutOfStock: false,
};

module.exports = config;
