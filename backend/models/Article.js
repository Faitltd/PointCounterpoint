const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  source: {
    name: String,
    url: String
  },
  url: String,
  publishedAt: Date,
  content: String,
  category: {
    type: String,
    default: 'general'
  },
  perspectives: [{
    viewpoint: String,
    summary: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Article', articleSchema);
