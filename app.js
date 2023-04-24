const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const config = require('./utils/config')
const blogRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const middleware = require('./utils/middleware.js')

const mongoUrl = config.MONGODB_URI
mongoose.connect(mongoUrl).then(console.log(`connected to ` + mongoUrl))

app.use(cors())
app.use(express.json())

app.use(middleware.tokenExtractor)

app.use('/api/blog', blogRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

app.use(middleware.errorHandler)

module.exports = app