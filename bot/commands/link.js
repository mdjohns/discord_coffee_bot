const { url } = require("../config");

module.exports = {
  name: "link",
  description: "Get link to the full spreadsheet",
  execute(message, args) {
    message.channel.send(`Here's the full coffee spreadsheet:\n ${url}`);
  },
};
