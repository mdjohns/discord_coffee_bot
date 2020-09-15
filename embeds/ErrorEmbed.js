const Discord = require("discord.js");
const { embedColors } = require("../config.json");

let ErrorEmbed = new Discord.MessageEmbed().setColor(embedColors.error);

module.exports = ErrorEmbed;
