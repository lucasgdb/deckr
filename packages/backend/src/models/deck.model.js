const mongoose = require('mongoose');

const { Schema } = mongoose;

const deckerSchema = new Schema({
   cards: {
      type: Array,
      required: true,
   },
   link: String,
});

mongoose.model('decks', deckerSchema);
