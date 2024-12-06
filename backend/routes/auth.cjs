const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User.cjs'); // Replace with the correct path to your User model
const router = express.Router();

// JWT Secret Key
const JWT_SECRET = 'hellofriends'; // Replace with a secure secret key

router.post(
  '/',
  [
    body('email', 'Enter a valid email').isEmail(),
    body('name', 'Enter a valid name').isLength({ min: 3 }),
    body('password', 'Password must be at least 5 characters long').isLength({ min: 5 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, name, password, image } = req.body;

    try {
      // Check if a user with the same email already exists
      let existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }

      // Create a new user
      const user = await User.create({
        email,
        name,
        password,
        image, 
      });

      // Generate a JWT token
      const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });

      res.json({ userId: user._id, token });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);
router.post(
  '/login',
  [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password cannot be blank').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Check if the user exists
      const user = await User.findOne({ email });
      if (!user || user.password !== password) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Generate a JWT token
      const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });

      res.json({ userId: user._id, token });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('name image');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ 
      name: user.name, 
      image: user.image 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
router.get('/user', async (req, res) => {
  try {
    // Retrieve all users, selecting only name and image fields
    const users = await User.find({}).select('name, image');
    
    // Check if no users found
    if (!users || users.length === 0) {
      return res.status(404).json({ message: 'No users found' });
    }

    // Map users to return only necessary information
    const userList = users.map(user => ({
      id: user._id,
      name: user.name,
      image: user.image
    }));

    res.json(userList);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});
router.put('/users/:id/add-contact', async (req, res) => {
  const userId = req.params.id; // ID of the user to whom we add the contact
  const contactId = req.body.contactId; // ID of the contact to add

  try {
    // Validate if the contactId exists
    const contact = await User.findById(contactId);
    if (!contact) {
      return res.status(404).json({ message: 'Contact user not found' });
    }

    // Add contactId to the contacts array
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { contacts: contactId } }, // $addToSet ensures no duplicates
      { new: true } // Returns the updated document
    ).populate('contacts'); // Populate contacts for better response

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'Contact added successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});
router.get('/users/:id/contacts', async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId).populate('contacts', 'name image');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ contacts: user.contacts });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

module.exports = router;
