const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User.cjs')
const router = express.Router();
const multer = require( 'multer')
const upload = multer({ dest: 'uploads/' })

// POST route to create a user and upload an image
router.post('/', [
  body('email', 'Enter a valid email').isEmail(),
  body('name', 'Enter a valid name').isLength({ min: 3 }),
  body('password', 'Password must be at least 5 letters').isLength({ min: 5 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, name, password, image } = req.body;

  try {
    // Create a new user
    const user = await User.create({
      email,
      name,
      password,
      image  // Directly store base64 image
    });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
