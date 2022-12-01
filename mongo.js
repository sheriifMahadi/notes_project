const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('Password not provided')
  process.exit(1)
}

const password = process.argv[2]

const url =
    `mongodb+srv://xxxxren:${password}@cluster0.8ex2psk.mongodb.net/?retryWrites=true&w=majority`

mongoose.connect(url)

const noteSchema = new mongoose.Schema({
  label: String,
  content: String,
  created: Date,
  modified: Date
})

const Note = mongoose.model('Note', noteSchema)

const note = new Note({
  label: 'Arash the sun god',
  content: 'This is the content arash the sun god',
  created: new Date(),
  modified: new Date()
})

note.save().then(() => {
  console.log('note saved!')
  mongoose.connection.close()
})