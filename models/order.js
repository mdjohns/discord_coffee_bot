const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
  orderedItems: {
    type: Object,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "processed", "cancelled"],
    required: true,
  },
  orderDate: {
    type: String,
    required: true,
  },
});

//module.exports = mongoose.model("Order", OrderSchema);

module.exports = OrderSchema;
