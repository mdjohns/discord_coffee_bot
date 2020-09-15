const Discord = require("discord.js");
const { embedColors } = require("../config.json");

let InfoEmbed = new Discord.MessageEmbed().setColor(embedColors.info);

module.exports = InfoEmbed;
