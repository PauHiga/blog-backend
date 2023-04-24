const jwt = require('jsonwebtoken')
const blogRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const middleware = require('../utils/middleware')
require('express-async-errors')

blogRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('creator', {user: 1, username: 1, })
  response.json(blogs)
})

blogRouter.post('/', middleware.userExtractor, async (request, response) => {
  const body = request.body
  const user =  await User.findById(request.user.id)

  if(!user){
    return response.status(401).json({error: "This user ID doesn't exist"})
  }
  
  if(!body.likes){
    body.likes = 0
  }

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    creator: user.id
  })

  const savedBlog = await blog.save()
  response.status(201).json(savedBlog)

  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()
})

blogRouter.delete('/:id', middleware.userExtractor, async(request, response)=>{
  
  const blog = await Blog.findById(request.params.id)

  if(!blog){
    return response.status(404).json({error: "Blog doesn't exist"})
  }
  if(!blog.creator){
    return response.status(404).json({error: "This Blog doesn't register a creator"})
  }

  const userId = request.user.id

  if(!(blog.creator.toString() === userId.toString())){
    return response.status(401).json({error: "unauthorized user"})
  }

  await Blog.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

blogRouter.put('/:id', async(request, response)=>{
  const body = request.body
  const updatedEntry = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes
  }

  await Blog.findByIdAndUpdate(request.params.id, updatedEntry, {new : true})
  response.json(updatedEntry)
})

module.exports = blogRouter