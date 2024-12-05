// const express = require('express');
// const { body, validationResult } = require('express-validator');
// const User = require('../models/User.cjs')
// const upload = require('../multerGridFS.cjs'); // Import the multer-gridfs storage setup
// const router = express.Router();

// // POST route to create a user and upload an image
// router.post('/', [
//   body('email', 'Enter a valid email').isEmail(),
//   body('name', 'Enter a valid name').isLength({ min: 3 }),
//   body('password', 'Password must be at least 5 letters').isLength({ min: 5 }),
// ], upload.single('image'), (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array() });
//   }

//   const { email, name, password } = req.body;
//   const imageUrl = req.file ? req.file.id : null; // Store the file's GridFS id instead of the file path

//   // Create a new user
//   User.create({
//     email,
//     name,
//     password,
//     image: imageUrl, // Save the file's GridFS ID
//   })
//     .then(user => res.json(user))
//     .catch(err => res.status(500).json({ error: err.message }));
// });

// module.exports = router;

const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User.cjs'); // Import your User model
const router = express.Router();

// POST route to create a user without image upload
router.post('/', [
  body('email', 'Enter a valid email').isEmail(),
  body('name', 'Enter a valid name').isLength({ min: 3 }),
  body('password', 'Password must be at least 5 characters').isLength({ min: 5 }),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, name, password } = req.body;

  // Create a new user
  User.create({
    email,
    name,
    password,
    image: null, // No image is being uploaded, set this to `null` or omit this field if it's optional in the schema
  })
    .then(user => res.json(user))
    .catch(err => res.status(500).json({ error: err.message }));
});

module.exports = router;
