const express = require("express");
const Message = require("../models/message.cjs");

const router = express.Router();

// Get chat messages for a user
router.get('/:userId', async (req, res) => {
  try {
    const messages = await Message.find({ userId: req.params.userId }).sort('timestamp');
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Post a new message
router.post('/', async (req, res) => {
  const { userId, sender, message } = req.body;
  try {
    const newMsg = await Message.create({ userId, sender, message });
    res.status(201).json(newMsg);
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

export default router;
