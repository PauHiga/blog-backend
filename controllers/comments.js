const Comment = require('../models/comment')
const commentRouter = require('express').Router()
const User = require('../models/user')
const middleware = require('../utils/middleware')
require('express-async-errors')

commentRouter.get('/:id', async (request, response) => {
  const comments = await Comment.find({})
  response.json(comments)
})

commentRouter.post('/:id/comments', middleware.userExtractor, async (request, response) => {
  const body = request.body
  const user =  await User.findById(request.user.id)

  if(!user){
    return response.status(401).json({error: "This user ID doesn't exist"})
  }

  const comment = new Comment({
      comment: body.comment,
  })

  const savedComment = await comment.save()
  response.status(201).json(savedComment)
})


module.exports = commentRouter