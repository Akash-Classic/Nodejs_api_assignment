const mongoose = require("mongoose");

const countryNeighbourSchema = new mongoose.Schema(
  {
    country_id: {
      type: Number, // Changed to Number
      ref: "Country", // Still referencing the Country model
      required: true,
    },
    neighbour_countries: [
      {
        id: { type: String, required: true }, // String for neighbour country ID
        name: { type: String, required: true }, // Name of the neighbour country
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("CountryNeighbour", countryNeighbourSchema);

