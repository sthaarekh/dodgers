const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const mongoose = require('mongoose');
const connection = require('./db.cjs'); // DB connection

// Create GridFS storage engine for MongoDB Atlas
const storage = new GridFsStorage({
  url: 'mongodb+srv://sthaarekh:1234567890@dodgerdb.86ahe.mongodb.net/', // Atlas connection string
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      const fileInfo = {
        filename: Date.now() + '-' + file.originalname, // Unique filename
        bucketName: 'uploads', // GridFS bucket name
      };
      resolve(fileInfo); // Resolve file info for storing
    });
  },
});

const upload = multer({ storage }); // Initialize multer with GridFS storage

module.exports = upload;
