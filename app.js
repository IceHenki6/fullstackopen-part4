const config = require('./utils/config')
const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const blogsRouter = require('./controllers/blogs')
const middleware = require('./utils/middleware')

// const morgan = require('morgan')




mongoose.connect(config.MONGODB_URI)

app.use(cors())
app.use(express.json())
// app.use(morgan('tiny'))
app.use('/api/blogs', blogsRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app