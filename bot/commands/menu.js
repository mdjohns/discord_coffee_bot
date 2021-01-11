const { MessageEmbed } = require("discord.js");
const getSpreadsheetData = require("../../sheets/index");
const {
  embedColor,
  filterOutOfStock,
  maxFields,
  sortByStock,
} = require("../config");
const chunk = require("lodash.chunk");

module.exports = {
  name: "menu",
  description: "Get all available coffee stock",
  execute: async (message, args) => {
    try {
      const stockHeader = "Stock (12 oz bag)"; //TODO: get header value dynamically
      let data = await getSpreadsheetData();

      // Check configs and modify data if needed
      if (filterOutOfStock) {
        data = data.filter((item) => item[stockHeader] > 0);
      }
      if (sortByStock) {
        data = data.sort((a, b) => b[stockHeader] - a[stockHeader]);
      }

      const embedTitle = "Coffee Inventory";
      const headers = Object.keys(data[0]).length;
      const fields = headers * data.length;

      // Break data into multiple embeds
      if (fields > maxFields) {
        const embedCount = Math.ceil(fields / maxFields);
        const chunkSize = data.length / embedCount;
        const dataChunks = chunk(data, chunkSize);

        const embeds = Array.from({ length: embedCount }).map((_, i) => {
          const embed = new MessageEmbed()
            .setColor(embedColor)
            .setTitle(`${embedTitle} (${i + 1}/${embedCount})`);
          dataChunks[i].forEach((obj) => {
            for (const val in obj) {
              embed.addField(val, obj[val], true);
            }
          });
          return embed;
        });

        embeds.forEach((embed) => {
          message.channel.send(embed);
        });
      } else {
        const embed = new MessageEmbed()
          .setColor(embedColor)
          .setTitle(embedTitle);
        data.forEach((obj) => {
          for (const val in obj) {
            embed.addField(val, obj[val], true);
          }
        });

        message.channel.send(embed);
      }
    } catch (error) {
      message.channel.send(
        "There was an error getting the coffee menu! Try again."
      );
    }
  },
};
