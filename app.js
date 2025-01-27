const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const countryRoutes = require('./routes/countryRoutes');

const app = express();

// Middleware
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb+srv://jindalakash238:idY78V748GBiGk4f@cluster0.anctu.mongodb.net/countriesProjectDB?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.log('MongoDB connection error:', err);
});

// Routes
app.use(countryRoutes);

// Start server
const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
