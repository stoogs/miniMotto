const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const postSchema = new Schema({
    category: String, 
    motto: String,
      mottoDate: { 
        type: Date, 
        default: Date.now 
    } 
});

module.exports = postSchema;