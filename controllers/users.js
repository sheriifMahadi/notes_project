const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.post('/', async (request, response) => {
  const { firstname, lastname, email, password } = request.body

  const userExists = await User.findOne({ email })
  if (userExists) {
    return response.status(400).json({
      error: 'This email has been used already.'
    })
  }
  if (password.length < 8) {
    return response.status(400).json({
      error: 'Password too short. Minimum length is 8.'
    })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    firstname, 
    lastname, 
    email, 
    passwordHash
  })

  const savedUser = await user.save()

  response.status(201).json(savedUser)
})


usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('notes', {label: 1, created: 1})
  response.json(users)
})

module.exports = usersRouter
