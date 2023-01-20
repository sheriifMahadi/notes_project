const groupRouter = require('express').Router()
const Group = require('../models/group')
const misc = require('../utils/misc')
const Note = require('../models/note')

groupRouter.post('/', async(request, response) => {
  if (misc.checkUser(request, response) === null){ return response.status(400).json({
    error: 'you are not authorized. Please login'
  })}  

  
  const body = request.body
  const user = request.user
  const groupName = body.groupName
  const groupExists= await Group.findOne({ groupName })

  if (groupExists) {
    return response.status(400).json({
      error: 'This group exists already'
    })
  }
  
  const group = new Group ({
    groupName: body.groupName,
    user: user._id
  })
    
  const savedGroup = await group.save()
  user.groups = user.groups.concat(savedGroup._id)
  await user.save()
  response.status(201).json(savedGroup)
})
  

groupRouter.get('/', async (request, response) => {  
  const groups = await Group.find({user: request.user})
  response.json(groups)
})

groupRouter.get('/:id', async(request, response) => {
  if (misc.checkUser(request, response) === null){ return response.status(400).json({
    error: 'you are not authorized. Please login'
  })}  
  const group = await Group.findById(request.params.id)
  if (group) {
    if (group.user.toString() === request.user.id.toString()) {
      response.json(group)
    }else {
      return response.status(400).json({
        error: 'You do not have access this group'}
      )}
  }
  else{
    return response.status(400).json({
      error: 'This group does not exist'
    })
  }
})

 
groupRouter.delete('/:id', async(request, response) => {
  if (misc.checkUser(request, response) === null){ return response.status(400).json({
    error: 'you are not authorized. Please login'
  })}
  const group = await Group.findById(request.params.id)
  if (group) {
    if (group.user.toString() === request.user.id.toString()) {
      const group = await Group.findById(request.params.id)
      const group_notes = group.notes
      await Group.findByIdAndRemove(request.params.id)

      group_notes.forEach(async (note) => {
        const singleNote = await Note.findById(note)
        singleNote.group = null
        await singleNote.save()
      })
      const index = await request.user.groups.indexOf(request.params.id)
      await request.user.groups.splice(index, 1)
      await request.user.save()
      response.status(204).end()
    }
    else {
      return response.status(400).json({
        error: 'You cannot delete this group'
      })
    }
  }
  else {
    return response.status(400).json({
      error: 'This group does not exist'
    })
  }
  
})
module.exports = groupRouter
