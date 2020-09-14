const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BeanSchema = new Schema({
  origin: {
    type: String,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
  },
  tastingNotes: {
    type: String,
  },
  farmDetails: {
    type: String,
  },
});

module.exports = mongoose.model("Bean", BeanSchema);
