const Note = require('../models/note')

let notes = [
  {   
    label: 'A tale of iron and blood',
    content: 'This is the content of a tale of iron and blood',
  },
  {   
    label: 'Sword and fire',
    content: 'This is the content of sword and fire',
  }
]


const nonExistingId = async () => {
  const note = new Note({
    label: 'not for long', 
    content: 'willberemovedsoon'
  })
  await note.save()
  await note.remove()

  return note._id.toString()

}

const notesInDb = async () => {
  const notes = await Note.find({})
  return notes.map(note => note.toJSON())
}

module.exports = {
  notes, nonExistingId, notesInDb
}