const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AddressSchema = new Schema({
  street: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  zip: {
    type: String,
    required: true,
    maxlength: 5,
  },
  state: {
    type: String,
    maxlength: 2,
  },
});

module.exports = AddressSchema;
