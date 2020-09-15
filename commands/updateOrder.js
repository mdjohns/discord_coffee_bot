const Customer = require("../models/customer");
const Discord = require("discord.js");
const moment = require("moment");
const Embeds = require("../embeds");
const { headRoaster } = require("../config.json");

module.exports = {
  name: "update-order",
  description: "Update status of order",
  args: true,
  usage: "",
};
