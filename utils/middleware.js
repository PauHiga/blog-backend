const logger = require('./logger')
const jws  = require('jsonwebtoken')

const requestLogger = (request, response, next) => {
  logger.info('Method: ', request.method),
  logger.info('Path: ', request.path),
  logger.info('Body: ', request.body),
  logger.info('----')
  next()
}


const errorHandler = (error, request, response, next) => {
  logger.error(error.message)

  if (error.name == 'ValidationError') {
      return response.status(400).json({error:error.message})
  } 
  if (error.name == 'JsonWebTokenError') {
      return response.status(400).json({error:error.message})
  } 
  next(error)
}

const tokenExtractor = (request, response, next) => {
  const authorization = request.get('Authorization')

  if (authorization && authorization.startsWith('Bearer ')){
    request.token = authorization.replace('Bearer ', '')
  }
  else{
    request.token = null
  }

  next()
}

const userExtractor = async (request, response, next)=>{
  
  if(!request.token){
    return response.status(401).json({error:'no token or token invalid'})
  }
  
  const user =  await jws.verify(request.token, process.env.SECRET)
    
  if (!user.id){
    return response.status(401).json({error: 'unauthorized user'})
  }
  else{
    request.user = user
  }
  next()
}

module.exports = {requestLogger, errorHandler, tokenExtractor, userExtractor}