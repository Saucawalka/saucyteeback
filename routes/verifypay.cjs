// routes/paymentRoutes.ts
const express = require("express");
const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();
const paystack=process.env.PAYSTACK;

const router = express.Router();

// POST /api/verify-payment
router.post("/verify-payment", async (req, res) => {
  const { reference } = req.body;

  if (!reference) {
    return res.status(400).json({ status: "error", message: "Reference is required" });
  }

  try {
    const paystackSecretKey = paystack; // ⚡ Replace with your SECRET key

    const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${paystack}`,
      },
    });
    console.log("Paystack Key:", paystack);


    const paymentData = response.data;

    if (paymentData.data.status === "success") {
      res.json({ status: "success", paymentData: paymentData.data });
    } else {
      res.json({ status: "failed", paymentData: paymentData.data });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
});

module.exports = router;
