const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const User = require('../models/user')
const loginRouter = require('express').Router()

loginRouter.post('/', async (request, response)=>{
  const body = request.body

  if (!body.password || !body.username){
    return response.status(400).json({error: 'username and password required!'})
  }

  const foundUser = await User.findOne({username: body.username})

  const passwordCorrect = foundUser === null ? false : await bcrypt.compare(body.password, foundUser.passwordHash)

  if (!(passwordCorrect && foundUser)){
    return response.status(401).json({error: 'username or password incorrect'})
  }

  const forToken = {
    username: foundUser.username,
    id: foundUser._id
  }

  const token = jwt.sign(forToken, process.env.SECRET)  

  response
    .status(200)
    .send({token, username:foundUser.username, user:foundUser.user })
})

module.exports = loginRouter