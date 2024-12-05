const mongoose = require('mongoose');
const { Schema } = mongoose;

const dataSchema = new Schema({
    amount:{
        type: Number,
        required: true,
    },
    category:{
        type: String,
        required: true,
    },
    description:{
        type: String
    },
    date:{
        type: Date,
        default: Date.now
    }
});
const Data = mongoose.model('data',dataSchema)
module.exports = Data
