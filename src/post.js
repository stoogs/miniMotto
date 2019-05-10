const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const PostSchema = new Schema({
    category: String, 
    motto: String,
      mottoDate: { 
        type: Date, 
        default: Date.now 
    } 
});

module.exports = PostSchema;