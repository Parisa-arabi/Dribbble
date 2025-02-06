const mongoose = require("mongoose");

const designerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  designs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Design",
    },
  ],
  income: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Designer", designerSchema);
