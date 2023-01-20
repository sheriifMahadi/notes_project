const mongoose = require('mongoose')

const noteSchema = new mongoose.Schema({
  label: {
    type: String, 
    required: true
  },
  content: {
    type: String,
    required: true
  },
  created: Date,
  modified: Date,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  }
})

noteSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Note', noteSchema)