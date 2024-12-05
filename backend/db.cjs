const mongoose = require('mongoose');
const mongooseURI = "mongodb+srv://sthaarekh:1234567890@dodgerdb.86ahe.mongodb.net/";

const connectToMongo=async()=>{
    try {
        mongoose.set("strictQuery", false);
        mongoose.connect(mongooseURI);
        console.log("Connected to Mongodb Atlas!");
      } catch (error) {
        console.log(error);
      }
    }
module.exports = connectToMongo;