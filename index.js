const fs = require("fs");
const env = require("dotenv");
env.config();
const winston = require("winston");
const mongoose = require("mongoose");
const Discord = require("discord.js");

// DB Set up
const dbURL = `mongodb+srv://${process.env.db_user}:${process.env.db_pass}@${process.env.db_uri}`;
mongoose.connect(dbURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

// Set up commands
const client = new Discord.Client();
client.commands = new Discord.Collection();
const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}
const prefix = "!";
const headRoaster = process.env.discord_headroaster;

// Mongo models
const Bean = require("./models/bean");
const Customer = require("./models/customer");

// Log configs
const logger = winston.createLogger({
  transports: [new winston.transports.Console()],
  format: winston.format.printf(
    (log) => `[${log.level.toUpperCase()}] - ${log.message}`
  ),
});
client.on("ready", () => logger.log("info", "Coffee bot is online!"));
client.on("debug", (m) => logger.log("debug", m));
client.on("warn", (m) => logger.log("warn", m));
client.on("error", (m) => logger.log("error", m));
process.on("uncaughtException", (error) => logger.log("error", error));

client.login(process.env.discord_key);

client.on("message", (message) => {
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  try {
    const current = client.commands.get(command);
    if (current.args && !args.length) {
      let reply = `You didn't provide any arguments!`;

      if (current.usage) {
        reply += `\nThe proper usage would be: \`${prefix}${current.name} ${current.usage}\``;
      }
      return message.reply(reply);
    } else {
      current.execute(message, args);
    }
  } catch (e) {
    logger.log("error", e);
    message.reply("There was an error executing that command.");
  }
});
