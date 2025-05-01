const express = require("express");
const router = express.Router();
const Product = require("../models/product.cjs");
const Order = require("../models/order.cjs");
const { authenticateUser, isAdmin } = require("../middleware/authenticateUser.cjs");

// =======================
// Products Management
// =======================

// Get all products
router.get("/products", authenticateUser, isAdmin, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch products", error: err.message });
  }
});

// Create a product
router.post("/products", authenticateUser, isAdmin, async (req, res) => {
  try {
    const product = new Product(req.body);
    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    res.status(400).json({ message: "Failed to create product", error: err.message });
  }
});

// Update a product
router.put("/products/:id", authenticateUser, isAdmin, async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json(updatedProduct);
  } catch (err) {
    res.status(400).json({ message: "Failed to update product", error: err.message });
  }
});

// Delete a product
router.delete("/products/:id", authenticateUser, isAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Product deleted" });
  } catch (err) {
    res.status(400).json({ message: "Failed to delete product", error: err.message });
  }
});

// =======================
// Orders Management
// =======================

// Get all orders
router.get("/orders",authenticateUser, isAdmin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email")
      .populate("items.product", "name price");
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders", error: err.message });
  }
});

// Update an order's status
router.put("/orders/:id", authenticateUser, isAdmin, async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.status(200).json(updatedOrder);
  } catch (err) {
    res.status(400).json({ message: "Failed to update order", error: err.message });
  }
});

// (Optional) Delete an order
router.delete("/orders/:id", authenticateUser, isAdmin, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Order deleted" });
  } catch (err) {
    res.status(400).json({ message: "Failed to delete order", error: err.message });
  }
});

module.exports = router;
