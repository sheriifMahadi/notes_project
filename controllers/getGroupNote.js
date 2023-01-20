const notesGroupRouter = require('express').Router()
const Group = require('../models/group')
const misc = require('../utils/misc')
const Note = require('../models/note')


notesGroupRouter.post('/', async(request, response) => {
  if (misc.checkUser(request, response) === null){ return response.status(400).json({
    error: 'you are not authorized. Please login'
  })}  

  const ids = request.body
  if (ids) {
    const records = await Note.find({ '_id': { $in: ids } })
    response.status(201).json(records)
  }

})

module.exports = notesGroupRouter
