const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const Schema = mongoose.Schema

const userSchema = new Schema({
  username: { type: String, required: true },
  password: { type: String, required: true, minlength: 6 },
  listItems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ListItem' }],
})

// userSchema.plugin(uniqueValidator)

module.exports = mongoose.model('User', userSchema)
