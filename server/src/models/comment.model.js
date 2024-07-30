const mongoose = require('mongoose');

const commmentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  blog:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog',
    required: true,
  },
  owner:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
},{
  timestamps: true
})


const Comment = mongoose.model('Comment', commmentSchema);

module.exports = Comment;