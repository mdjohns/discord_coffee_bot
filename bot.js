import * as Discord from "discord.js";
import dotenv from "dotenv";
import { getData } from "./sheets.js";
dotenv.config();

async function menu() {
  const result = await getData();
  return result;
}

const commands = [
  {
    command: "menu",
    description: "Get all available coffee stock",
    func: menu(),
  },
];
const botPrefix = "!";

function displayCommands(prefix, cmds) {
  return cmds.map((cmd) => {
    return `\`${prefix}${cmd.command}\`: ${cmd.description}`;
  });
}

function validCommand(commands, cmd) {
  return commands.find((command) => command.command === cmd);
}

export function initializeBot() {
  try {
    const client = new Discord.Client();
    client.login(process.env.DISCORD_BOT_TOKEN);
    client.on("ready", () => {
      console.log(`Logged in as ${client.user.tag}!`);
    });

    client.on("message", async (msg) => {
      if (!msg.content.startsWith(botPrefix)) return;

      const args = msg.content.slice(botPrefix.length).trim().split(/ +/);
      const command = args.shift().toLowerCase();

      if (!validCommand(commands, command)) {
        msg.reply(
          `${command} is not a valid command. Here are the supported commands:`
        );
        displayCommands(botPrefix, commands).forEach((command) => {
          msg.channel.send(command);
        });
        return;
      }
      const data = await menu();
      console.log(data);
    });
  } catch (error) {
    console.warn(`ERROR: ${error.message}`);
  }
}
