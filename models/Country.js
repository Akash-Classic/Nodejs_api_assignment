const mongoose = require("mongoose");

const countrySchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    name: {type: String, required: true, unique: true},
    cca: { type: String, required: true },
    currency_code: { type: String, required: true },
    currency: { type: String, required: true },
    capital: { type: String, required: true },
    region: { type: String, required: true },
    subregion: { type: String, required: true },
    area: { type: Number, required: true },
    map_url: { type: String, required: true },
    population: { type: Number, required: true },
    flag_url: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Country", countrySchema);
