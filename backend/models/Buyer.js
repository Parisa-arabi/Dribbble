const mongoose = require("mongoose");

const buyerSchema = new mongoose.Schema({
  BuyerID: { type: String, required: true, unique: true },
  Password: { type: String, required: true },
  Email: { type: String, required: true, unique: true },
  PurchasesList: { type: Array, default: [] },
  AccountBalance: { type: Number, default: 0 },
});

const Buyer = mongoose.model("Buyer", buyerSchema, "users");

const getBuyers = async () => {
  try {
    return await Buyer.find();
  } catch (error) {
    throw new Error("Error fetching buyers: " + error.message);
  }
};

const createBuyer = async (buyerData) => {
  const buyer = new Buyer(buyerData);
  try {
    return await buyer.save();
  } catch (error) {
    throw new Error("Error creating buyer: " + error.message);
  }
};

module.exports = { getBuyers, createBuyer };
