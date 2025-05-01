const express = require("express");
const router = express.Router();
const Order = require("../models/order.cjs");

// Create a new Order
router.post("/", async (req, res) => {
  try {
    const {
      userId,
      items,
      shippingAddress,
      paymentMethod,
      totalPrice,
    } = req.body;

    if (!userId || !items || !shippingAddress || !paymentMethod || !totalPrice) {
      return res.status(400).json({ message: "Missing required order fields" });
    }

    const newOrder = new Order({
      userId,
      items,
      shippingAddress,
      paymentMethod,
      totalPrice,
    });

    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({ message: "Error creating order", error: err.message });
  }
});

// Get all Orders for a User
router.get("/user/:userId", async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId })
      .populate("items.product", "name price image") // populate product details inside items
      .sort({ createdAt: -1 }); // newest orders first

    res.status(200).json(orders);
  } catch (err) {
    console.error("Error fetching user orders:", err);
    res.status(500).json({ message: "Error fetching orders", error: err.message });
  }
});

module.exports = router;
