const notesRouter = require('express').Router()
const Note = require('../models/note')
const misc = require('../utils/misc')

notesRouter.get('/', async (request, response) => {  
  const notes = await Note.find({user: request.user}).populate('user', { email: 1, firstname: 1 })
  response.json(notes)
})

notesRouter.get('/:id', async(request, response) => {
  if (misc.checkUser(request, response) === null){ return response.status(400).json({
    error: 'you are not authorized. Please login'
  })}  
  const note = await Note.findById(request.params.id)
  if (note) {
    if (note.user.toString() === request.user.id.toString()) {
      response.json(note)
    }else {
      return response.status(400).json({
        error: 'You do not have access to this post.'}
      )}
  }
  else{
    return response.status(400).json({
      error: 'This post does not exist'
    })
  }
})

notesRouter.post('/', async(request, response) => {
  if (misc.checkUser(request, response) === null){ return response.status(400).json({
    error: 'you are not authorized. Please login'
  })}  

  const body = request.body
  const user = request.user

  const note = new Note ({
    label: body.label,
    content: body.content,
    created: new Date(),
    modified: new Date(),
    user: user._id
  })
  
  const savedNote = await note.save()
  user.notes = user.notes.concat(savedNote._id)
  await user.save()
  console.log(savedNote)
  response.status(201).json(savedNote)
})
  
notesRouter.put('/:id', async(request, response) => {
  const {label, content } = request.body
  if (misc.checkUser(request, response) === null){ return response.status(400).json({
    error: 'you are not authorized. Please login'
  })}
  const note = await Note.findById(request.params.id)
  if (note) {
    if (note.user.toString() === request.user.id.toString()) {
      const modified = new Date()
      const updated_note = await Note.findByIdAndUpdate(
        request.params.id, 
        { label, content, modified }, 
        { new: true, runValidators: true, context: 'query'})
      response.json(updated_note)
    }
    else {
      return response.status(400).json({
        error: 'you are not authorized to update this post'
      })
    }
  }
  else{
    return response.status(400).json({
      error: 'This post does not exist'
    })
  }
  
})
  
notesRouter.delete('/:id', async(request, response) => {
  if (misc.checkUser(request, response) === null){ return response.status(400).json({
    error: 'you are not authorized. Please login'
  })}
  const note = await Note.findById(request.params.id)
  if (note) {
    if (note.user.toString() === request.user.id.toString()) {
      await Note.findByIdAndRemove(request.params.id)
      const index = await request.user.notes.
        indexOf(request.params.id)
      await request.user.notes.splice(index, 1)
      await request.user.save()
      response.status(204).end()
    }
    else {
      return response.status(400).json({
        error: 'You cannot delete this post'
      })
    }
  }
  else {
    return response.status(400).json({
      error: 'This post does not exist'
    })
  }
  
})
  
module.exports = notesRouter

//TODO: write tests and remove ref