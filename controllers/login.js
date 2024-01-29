const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/User')

loginRouter.post('/', async (request, response) => {
  const { username, password } = request.body

  const user = await User.findOne({ username })
  if (!user) {
    return response.status(401).json({
      error: 'the username does not exist'
    })
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
  if (!isPasswordValid) {
    return response.status(401).json({
      error: 'invalid password'
    })
  }

  const userPayload = {
    username: user.username,
    id: user._id
  }
  const token = jwt.sign(userPayload, process.env.SECRET)

  response
    .status(200)
    .send({ token, username: user.username, name: user.name })
})

module.exports = loginRouter
