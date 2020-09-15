const Discord = require("discord.js");
const { embedColors } = require("../config.json");

let SuccessEmbed = new Discord.MessageEmbed().setColor(embedColors.success);

module.exports = SuccessEmbed;
