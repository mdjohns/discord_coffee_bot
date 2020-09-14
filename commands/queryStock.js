const Bean = require("../models/bean");
const Discord = require("discord.js");

// Query all Beans on hand, return formatted MessageEmbed for each beans
module.exports = {
  name: "inventory",
  description: "Get current coffee inventory",
  usage: "",
  execute(message, args) {
    async function getAllBeans() {
      const results = await Bean.find({}, { _id: 0, __v: 0 }, function (
        err,
        beans
      ) {
        if (err) {
          console.log(err);
        }
      }).lean();

      results.forEach((result) => {
        const embed = new Discord.MessageEmbed().setColor("#0099ff");
        for (key in result) {
          if (key === "origin") {
            const originTitle =
              result[key].charAt(0).toUpperCase() + result[key].slice(1);
            embed.setTitle(originTitle);
          } else {
            const newKey = key.replace(/([A-Z])/g, " $1");
            const titleCased = newKey.charAt(0).toUpperCase() + newKey.slice(1);
            if (titleCased === "Stock") {
              const formatted = `${result[key]} lbs`;
              embed.addField(titleCased, formatted);
            } else {
              embed.addField(titleCased, result[key]);
            }
          }
        }
        message.reply(embed);
      });
    }
    getAllBeans();
  },
};
