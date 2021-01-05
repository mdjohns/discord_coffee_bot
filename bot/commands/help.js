const { prefix } = require("../config");

module.exports = {
  name: "help",
  description: "List all of my commands or info about a specific command.",
  aliases: ["commands"],
  execute(message, args) {
    const data = [];
    const { commands } = message.client;
    if (!args.length) {
      data.push("Here's a list of all my commands:");
      data.push(
        commands
          .map(
            (command) =>
              `\`\`\`${prefix}${command.name}: ${command.description}\`\`\``
          )
          .join("")
      );
      return message.channel.send(data);
    }
  },
};
