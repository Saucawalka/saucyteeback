const express=require('express') // Notice the .js extension!
const Address=require('../models/address.cjs')
const router = express.Router();

// Get all addresses for a user
router.get("/", async (req, res) => {
  const { userId } = req.query;
  try {
    const addresses = await Address.find({ userId });
    res.json(addresses);
  } catch (err) {
    res.status(500).json({ message: "Error fetching addresses" });
  }
});
// Example backend route (Express)
router.get('/api/address/default', async (req, res) => {
  const { userId } = req.query;
  
  if (!userId) return res.status(400).send('Missing userId');

  const defaultAddress = await Address.findOne({ userId, isDefault: true });

  if (!defaultAddress) {
    return res.status(404).send('No default address found');
  }

  res.json(defaultAddress);
});


// Add a new address
router.post("/", async (req, res) => {
  try {
    const { userId } = req.body;
    const existingAddresses = await Address.find({ userId });

    const isFirstAddress = existingAddresses.length === 0;

    const newAddress = new Address({
      ...req.body,
      isDefault: isFirstAddress, // Set isDefault=true if it's the first address
    });

    const savedAddress = await newAddress.save();

    // If not the first address, don't touch others
    res.status(201).json(savedAddress);
  } catch (err) {
    res.status(500).json({ message: "Error adding address" });
  }
});

// Update an address
router.put("/:id", async (req, res) => {
  try {
    const updated = await Address.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error updating address" });
  }
});

// Delete an address
router.delete("/:id", async (req, res) => {
  try {
    await Address.findByIdAndDelete(req.params.id);
    res.json({ message: "Address deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting address" });
  }
});

// Set a specific address as default
router.put("/set-default", async (req, res) => {
  const { userId, addressId } = req.body;
  try {
    // Set all user's addresses isDefault = false
    await Address.updateMany({ userId }, { isDefault: false });
    // Set the selected address isDefault = true
    await Address.findByIdAndUpdate(addressId, { isDefault: true });

    res.json({ message: "Default address set" });
  } catch (err) {
    res.status(500).json({ message: "Error setting default address" });
  }
});

module.exports = router;
