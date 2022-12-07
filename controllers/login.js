const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')

loginRouter.post('/', async(request, response) => {
  const { email, password} = request.body 
  const user = await User.findOne({ email })
  const passwordCorrect = user === null 
    ? false
    : await bcrypt.compare(password, user.passwordHash)

  if (!(user && passwordCorrect)){
    return response.status(401).json({
      error: 'Invalid email or password'
    })
  }

  const userForToken = {
    email: user.email, 
    id: user._id,
  }

  const access_token = jwt.sign(
    userForToken, 
    process.env.ACCESS_TOKEN_SECRET, 
    { expiresIn: process.env.ACCESS_EXPIRES_IN}
  )


  response
    .status(200)
    .send({ access_token, email: user.email, 
      firstname: user.firstname, lastname: user.lastname})
})

module.exports = loginRouter
