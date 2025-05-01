// routes/account.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const dotenv = require('dotenv');
const User = require('../models/models.cjs');
const {authenticateUser} = require('../middleware/authenticateUser.cjs');
dotenv.config();

// SIGNUP
// routes/auth.js (or wherever your signup route is)

const ADMIN_SECRET_CODE = process.env.ADMIN_SECRET_CODE; // Replace with a strong secret

router.post('/signup', async (req, res) => {
  try {
    const { name, username, email, password, phone, address, isAdmin, adminCode } = req.body;

    // Validate required fields
    if (!name || !username || !email || !password || !phone || !address) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Email or phone already in use' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Only allow admin creation if the adminCode matches
    const makeAdmin = isAdmin && adminCode === ADMIN_SECRET_CODE;

    // Create new user
    const newUser = new User({
      name,
      username,
      email,
      password: hashedPassword,
      phone,
      address,
      isAdmin: makeAdmin, // Set admin status based on secret code
    });

    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// SIGNIN
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: 'All fields are required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const { password: _, ...userData } = user._doc;
    res.status(200).json({ message: 'Login successful', token, user: userData });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET user info
router.get('/user', authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: 'Failed to fetch user data' });
  }
});

// UPDATE user info
router.put('/user/update', authenticateUser, async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: 'Name and email are required' });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { name, email },
      { new: true, runValidators: true }
    ).select('-password');
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update user data' });
  }
});

// CHANGE password
router.put('/user/change-password', authenticateUser, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current and new passwords are required' });
  }

  try {
    const user = await User.findById(req.user._id);

    // Using bcrypt.compare to check the current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    // Hash the new password and save
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to change password' });
  }
});

// DELETE account
router.delete('/user/delete', authenticateUser, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Failed to delete account' });
  }
});

module.exports = router;
