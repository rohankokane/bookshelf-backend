const mongoose = require('mongoose')
const { Schema } = mongoose

const listItemSchema = new Schema({
  bookId: { type: String, required: true },
  finishDate: { type: Number },
  notes: { type: String },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating: { type: Number, required: true },
  startDate: { type: Number, required: true },
})

module.exports = mongoose.model('ListItem', listItemSchema)
