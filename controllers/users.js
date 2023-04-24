const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')
require('express-async-errors')

usersRouter.get('/', async (request, response)=>{
  const allUsers = await User.find({}).populate({path: 'blogs', select:'url title author'})
  response.json(allUsers)
})

usersRouter.post('/', async (request, response) => {
  const body = request.body

  if (!body.username){
    response.status(400).json({error:'username is required'})
  }
  if (!body.password){
    response.status(400).json({error:'password is required'})
  }
  
  if (body.username.length <3 || body.password.length <3 ){
      response.status(400).send({error: 'username and password must be at least 3 characters long'})
  }
  
  
    const saltRounds = 10
    const passHash = await bcrypt.hash(body.password, saltRounds)
    
    const newUser = new User(
      {
        user: body.user,
        username: body.username,
        passwordHash: passHash,
      }
      ) 
      
      const savedUser = await newUser.save()
  response.status(201).json(savedUser)

})

module.exports = usersRouter
