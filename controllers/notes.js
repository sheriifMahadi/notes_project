const notesRouter = require('express').Router()
const Note = require('../models/note')

notesRouter.get('/', async (request, response) => {
  const notes = await Note.find({})
  response.json(notes)
})

notesRouter.get('/:id', async(request, response) => {
  const note = await Note.findById(request.params.id)
  if (note) {
    response.json(note)
  } else {
    response.status(404).end()
  }
})

notesRouter.post('/', async(request, response) => {
  const body = request.body
  
  const note = new Note ({
    label: body.label,
    content: body.content,
    created: new Date(),
    modified: new Date()
  })
  
  const savedNote = await note.save()
  response.status(201).json(savedNote)
})
  

notesRouter.put('/:id', async(request, response) => {
  const {label, content } = request.body
  const modified = new Date()
  
  
  const note = await Note.findByIdAndUpdate(
    request.params.id, 
    { label, content, modified }, 
    { new: true, runValidators: true, context: 'query'})
  response.json(note)
})
  
notesRouter.delete('/:id', async(request, response) => {
  await Note.findByIdAndRemove(request.params.id)
  response.status(204).end()
  
})
  
module.exports = notesRouter
