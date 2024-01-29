const config = require('./config')
const mongoose = require('mongoose')
const logger = require('./logger')

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

module.exports = { connectToMongoDB }
