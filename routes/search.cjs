// Example in routes/search.js or wherever your routes are defined
const express = require('express');
const router = express.Router();
const Product = require('../models/product.cjs');

router.get('/', async (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ message: 'No search query provided' });
  }

  try {
    const products = await Product.find({ name: { $regex: query, $options: 'i' } });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
