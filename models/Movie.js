const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  releaseYear: {
    type: Number,
    required: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 10
  },
  genre: {
    type: String,
    required: true
  },
  image: {
    type: String, // URL to image
    default: ''
  },
  watched: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Movie', movieSchema);
