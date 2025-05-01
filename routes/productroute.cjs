// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const Product = require('../models/product.cjs');

const storage = multer.memoryStorage();
const upload = multer({ storage,limits: { fileSize: 10 * 1024 * 1024 }, });

router.post("/product", upload.array("images", 5), async (req, res) => {
  try {
    const { name, price, description,category } = req.body;

    const imagesBase64 = req.files.map(file => file.buffer.toString("base64"));

    const product = new Product({
      name,
      price: Number(price),
      description,
      category,
      images: imagesBase64,
    });

    const saved = await product.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: "Error creating product", error: err.message });
  }
});

router.get("/getproducts", async (req, res) => {
  try {
    const products = await Product.find();
    // Only needed if images were stored as Buffers (but yours are base64 strings)
    // So we can send directly
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Error fetching products", error: err.message });
  }
});

router.get("/cate", async (req, res) => {
  try {
    const { category, query } = req.query;

    let filter = {};

    if (category) {
      filter.category = category;
    }

    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ];
    }

    const products = await Product.find(filter);
    res.json(products);
  } catch (err) {
    console.error("Error getting products", err);
    res.status(500).json({ message: "Server error" });
  }
});

  
  
// GET single product by ID
router.get("/getproducts/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product); // Send a single object, not an array
  } catch (err) {
    res.status(500).json({ message: "Error retrieving product" });
  }
});


module.exports = router;
