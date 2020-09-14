const Bean = require("../models/bean");

module.exports = {
  name: "add",
  description: "Add to current coffee inventory",
  execute(message, args) {
    let newBean = new Bean({
      origin: "testing",
      stock: 0.5,
      tastingNotes: "here are some notes",
      farmDetails: "here are some farm details",
    });
    newBean.save();
    message.reply("Added to inventory");
  },
};
