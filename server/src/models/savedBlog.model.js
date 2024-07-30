const mongoose = require('mongoose');

const savedBlogSchema = new mongoose.Schema({
  blog: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog',
      required: true,
    }
  ],
  owner:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
},{
  timestamps: true
})


const SavedBlog = mongoose.model('SavedBlog', savedBlogSchema);

module.exports = SavedBlog;