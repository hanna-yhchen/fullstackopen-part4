const config = require('./utils/config')
const express = require('express')
require('express-async-errors')
const cors = require('cors')
const blogsRouter = require('./controllers/blogs')
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')
const mongoose = require('mongoose')

async function connectToMongoDB() {
  logger.info(`Connecting to ${config.MONGODB_URI}`)
  try {
    mongoose.set('strictQuery', false)
    await mongoose.connect(config.MONGODB_URI)
    logger.info('Successfully connected to MongoDB.')
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error.message}`)
  }
}
connectToMongoDB()

const app = express()
app.use(cors())
app.use(express.json())
app.use(middleware.requestLogger)

app.use('/api/blogs', blogsRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
