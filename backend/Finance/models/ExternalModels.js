// backend/Finance/models/ExternalModels.js
const mongoose = require("mongoose");

const Loose = new mongoose.Schema({}, { strict: false });


function ensureModel(modelName, collectionName) {
  if (mongoose.models[modelName]) return mongoose.models[modelName];
  return mongoose.model(modelName, Loose, collectionName);
}


const User           = ensureModel("User", "users");
const Room           = ensureModel("Room", "rooms");
const Order          = ensureModel("Order", "orders");
const Property        = ensureModel("Property", "properties");
const UtilitySetting = ensureModel("UtilitySetting", "utilitysettings");

module.exports = { User, Room, Order, Property,  UtilitySetting };
