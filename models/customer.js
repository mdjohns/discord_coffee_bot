const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Order = require("./order");
const Address = require("./address");

const CustomerSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  discordId: {
    type: String,
    required: true,
    unique: true,
  },
  orders: {
    type: [Order],
  },
  address: {
    type: Address,
  },
});

module.exports = mongoose.model("Customer", CustomerSchema);
