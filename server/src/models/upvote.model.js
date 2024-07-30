const mongoose = require('mongoose');

const upvoteSchema = new mongoose.Schema({
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


const Upvote = mongoose.model('Upvote', upvoteSchema);

module.exports = Upvote;