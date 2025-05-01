const express = require("express");
const router = express.Router();
const Cart = require("../models/cart.cjs");
// const Product = require("../models/product");

// Get user's cart (should filter by userId)
router.get("/", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Fetch the user's cart and populate the product details in the items array
    const cart = await Cart.findOne({ userId })
      .populate("items.product", "name price image") // Populate product details (name, price, image)
      .exec();

    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    res.json(cart); // Send populated cart data back to the client
  } catch (err) {
    console.error("Error fetching cart:", err);
    res.status(500).json({ error: err.message });
  }
});

// Add/update cart item
router.post("/", async (req, res) => {
  const { userId, productId, quantity } = req.body;

  if (!userId || !productId || !quantity) {
    return res.status(400).json({ error: "userId, productId, and quantity are required" });
  }

  try {
    // Find or create the user's cart
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }else {
      console.log("Updating existing cart...");
    }

    // Check if the product already exists in the cart
    const existingItem = cart.items.find((item) => item.product.toString() === productId);
    if (existingItem) {
      // If the product exists, update the quantity
      existingItem.quantity += quantity;
    } else {
      // If the product doesn't exist, add a new item
      cart.items.push({ product: productId, quantity });
    }

    await cart.save(); // Save the cart with the updated items

    res.status(201).json(cart); // Return the updated cart
  } catch (err) {
    console.error("Error adding/updating cart item:", err);
    res.status(500).json({ error: err.message });
  }
});

// Update quantity of a cart item
router.put("/:id", async (req, res) => {
  const { quantity } = req.body;
  if (!quantity || quantity <= 0) {
    return res.status(400).json({ error: "Quantity must be greater than 0" });
  }

  try {
    const cartItem = await Cart.findOneAndUpdate(
      { "items._id": req.params.id },
      { $set: { "items.$.quantity": quantity } },
      { new: true } // Return the updated cart document
    );

    if (!cartItem) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    res.json(cartItem);
  } catch (err) {
    console.error("Error updating cart item:", err);
    res.status(500).json({ error: err.message });
  }
});

router.delete("/clear", async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const cart = await Cart.findOneAndUpdate(
      { userId },
      { $set: { items: [] } },
      { new: true }
    );

    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    res.json({ message: "Cart cleared successfully", cart });
  } catch (err) {
    console.error("Error clearing cart:", err);
    res.status(500).json({ error: err.message });
  }
});

// Remove item from the cart
router.delete("/:id", async (req, res) => {
  try {
    const cart = await Cart.findOneAndUpdate(
      { "items._id": req.params.id },
      { $pull: { items: { _id: req.params.id } } },
      { new: true } // Return the updated cart
    );

    if (!cart) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    res.json(cart);
  } catch (err) {
    console.error("Error removing item from cart:", err);
    res.status(500).json({ error: err.message });
  }
});
// Clear all items from a user's cart



module.exports = router;
