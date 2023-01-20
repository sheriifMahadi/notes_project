const notesRouter = require('express').Router()
const Note = require('../models/note')
const misc = require('../utils/misc')
const Group = require('../models/group')

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
  const groupname = body.groupname
  const group = await Group.findOne({groupName: groupname})

  const note = new Note ({
    label: body.label,
    content: body.content,
    created: new Date(),
    modified: new Date(),
    group: group === null ? null : group._id,
    user: user._id
  })
  
  const savedNote = await note.save()
  user.notes = user.notes.concat(savedNote._id)
  await user.save()
  if (group) {
    group.notes = group.notes.concat(savedNote._id)
    await group.save()
  }
  response.status(201).json(savedNote)
})
  
notesRouter.put('/:id', async(request, response) => {
  const {label, content, groupname } = request.body
  const group = await Group.findOne({groupName: groupname})
  if (misc.checkUser(request, response) === null){ return response.status(400).json({
    error: 'you are not authorized. Please login'
  })}
  const note = await Note.findById(request.params.id)
  if (note) {
    if (note.user.toString() === request.user.id.toString()) {
      const modified = new Date()
      const groupN = await Group.findById(note.group)
      
      if (groupN) {
        const group_index = await groupN.notes.indexOf(request.params.id)
        await groupN.notes.splice(group_index, 1)
        await groupN.save()
      }

      if (group) {
        group.notes = group.notes.concat(note._id)
        await group.save()
      }
      
      const updated_note = await Note.findByIdAndUpdate(
        request.params.id, 
        { label, content, modified, group: group === null ? null : group._id }, 
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
      const group = await Group.findById(note.group)
      const index = await request.user.notes.indexOf(request.params.id)

      if (group) {
        const group_index = await group.notes.indexOf(request.params.id)
        await group.notes.splice(group_index, 1)
        await group.save()

        await request.user.notes.splice(index, 1)
        await request.user.save()
      }
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