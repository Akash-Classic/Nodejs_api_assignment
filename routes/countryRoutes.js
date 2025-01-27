const express = require("express");
const mongoose = require("mongoose");
const Country = require("../models/Country");
const CountryNeighbour = require("../models/CountryNeighbour");
const router = express.Router();

router.use(express.urlencoded({ extended: false }));
router.use(express.json());

// // Get all countries
// router.get("/country", async (req, res) => {
//   try {
//     const countries = await Country.find();
//     res.status(200).json({
//       message: "Country list",
//       data: { list: countries },
//     });
//   } catch (err) {
//     res.status(500).json({ message: "Internal server error", data: {} });
//   }
// });

// Get all countries (with optional sorting)
// Get paginated country list
router.get("/country", async (req, res) => {
  try {
    // Default values for pagination and sorting
    const { sort_by, page, limit } = req.query;

    // Convert `page` and `limit` to integers
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;

    // Fetch all countries from the database
    let countries = await Country.find();

    // Apply sorting based on `sort_by` query parameter
    if (sort_by === "a_to_z") {
      countries = countries.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort_by === "z_to_a") {
      countries = countries.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sort_by === "population_high_to_low") {
      countries = countries.sort((a, b) => b.population - a.population);
    } else if (sort_by === "population_low_to_high") {
      countries = countries.sort((a, b) => a.population - b.population);
    } else if (sort_by === "area_high_to_low") {
      countries = countries.sort((a, b) => b.area - a.area);
    } else if (sort_by === "area_low_to_high") {
      countries = countries.sort((a, b) => a.area - b.area);
    }

    // Calculate pagination details
    const totalCountries = countries.length;
    const totalPages = Math.ceil(totalCountries / limitNum);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = pageNum * limitNum;

    // Get the paginated data
    const paginatedCountries = countries.slice(startIndex, endIndex);

    // Response object with paginated data
    res.status(200).json({
      message: "Country list",
      data: {
        list: paginatedCountries,
        has_next: pageNum < totalPages,
        has_prev: pageNum > 1,
        page: pageNum,
        pages: totalPages,
        per_page: limitNum,
        total: totalCountries,
      },
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Internal server error", data: {} });
  }
});

router.post("/country", async (req, res) => {
  const body = req.body;
  if (!body || !body.name || !body.id) {
    return res.status(400).json({ msg: "required fields" });
  }
  const result = await Country.create({
    id: body.id,
    name: body.name,
    cca: body.cca,
    currency_code: body.currency_code,
    currency: body.currency,
    capital: body.capital,
    region: body.region,
    subregion: body.subregion,
    area: body.area,
    map_url: body.map_url,
    population: body.population,
    flag_url: body.flag_url,
  });
  console.log("result", result);
  return res.status(201).json({ msg: "Success", data: result });
});

// Get country by ID
router.get("/country/:id", async (req, res) => {
  try {
    const countryId = parseInt(req.params.id); // Convert id to number
    const country = await Country.findOne({ id: countryId }); // Query MongoDB by id

    if (!country) {
      return res.status(404).json({
        message: "Country not found",
        data: {},
      });
    }

    res.status(200).json({
      message: "Country details",
      data: { country: country },
    });
  } catch (error) {
    console.error("Error fetching country:", error);
    res.status(500).json({
      message: "Internal server error",
      data: {},
    });
  }
});

// // Get countries sorted
// router.get("/country", async (req, res) => {
//   console.log(req.query, "akashJindal");
//   try {
//     let countries = await Country.find();
//     const { sort_by } = req.query;

//     if (sort_by === "a_to_z") {
//       countries = countries.sort((a, b) =>
//         a.name.localeCompare(b.name)
//       );
//     } else if (sort_by === "z_to_a") {
//       countries = countries.sort((a, b) =>
//         b.name.localeCompare(a.name)
//       );
//     }
//     console.log(countries, sort_by);
//     res.status(200).json({
//       message: "Country list",
//       data: { list: countries },
//     });
//   } catch (err) {
//     res.status(500).json({ message: "Internal server error", data: {} });
//   }
// });

// Get country neighbours
// router.get("/country/:id/neighbour", async (req, res) => {
//   try {
//     const country = await Country.findById(req.params.id);
//     if (!country) {
//       return res.status(404).json({ message: "Country not found", data: {} });
//     }

//     const neighbours = await CountryNeighbour.find({
//       country_id: req.params.id,
//     }).populate("neighbour_country_id");
//     if (neighbours.length === 0) {
//       return res
//         .status(200)
//         .json({ message: "Country neighbours", data: { countries: [] } });
//     }

//     res.status(200).json({
//       message: "Country neighbours",
//       data: {
//         countries: neighbours.map(
//           (neighbour) => neighbour.neighbour_country_id
//         ),
//       },
//     });
//   } catch (err) {
//     res.status(500).json({ message: "Internal server error", data: {} });
//   }
// });

router.get("/country/:id/neighbour", async (req, res) => {
  const { id } = req.params; // Get country ID from the URL

  try {
    // Find the CountryNeighbour entry by country_id
    const countryNeighbours = await CountryNeighbour.findOne({
      country_id: id,
    });

    if (!countryNeighbours) {
      return res
        .status(404)
        .json({ msg: "Neighbours not found for this country" });
    }

    res.status(200).json({
      msg: "Neighbour countries retrieved successfully",
      data: countryNeighbours,
    });
  } catch (error) {
    console.error("Error retrieving neighbour countries:", error);
    res.status(500).json({ msg: "Internal server error" });
  }
});

router.post("/country/:id/neighbour", async (req, res) => {
  const { id } = req.params; // Country ID from URL
  const body = req.body;

  // Validate the request body
  if (
    !body ||
    !body.neighbour_countries ||
    !Array.isArray(body.neighbour_countries)
  ) {
    return res
      .status(400)
      .json({ msg: "neighbour_countries is required and must be an array" });
  }

  try {
    // Convert `id` to a number and validate
    const countryId = Number(id);
    if (isNaN(countryId)) {
      return res.status(400).json({ msg: "Invalid country ID" });
    }

    // Check if the country exists
    const country = await Country.findOne({ id: countryId });
    if (!country) {
      return res.status(404).json({ msg: "Country not found" });
    }

    // Prepare neighbour_countries data
    const neighbourCountries = body.neighbour_countries.map((neighbour) => ({
      id: neighbour.id, // Keep as String
      name: neighbour.name,
    }));

    // Save the data in the CountryNeighbour collection
    const result = await CountryNeighbour.create({
      country_id: countryId, // Use the numeric country ID
      neighbour_countries: neighbourCountries,
    });

    console.log("Neighbour countries added:", result);
    return res
      .status(201)
      .json({ msg: "Neighbour countries added successfully", data: result });
  } catch (error) {
    console.error("Error adding neighbour countries:", error);
    return res.status(500).json({ msg: "Internal server error" });
  }
});




module.exports = router;
