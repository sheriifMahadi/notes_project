const mongoose = require('mongoose')

const groupSchema = mongoose.Schema({
  groupName: {
    type: String,
    required: true,
    minlength: 2

  },  
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Note'
    }
  ],
})

groupSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})


const group = mongoose.model('group', groupSchema)

module.exports = group
