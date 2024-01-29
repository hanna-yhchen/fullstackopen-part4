const config = require('./utils/config')
const app = require('./app')
const { connectToMongoDB } = require('./utils/database')
const logger = require('./utils/logger')

connectToMongoDB()
app.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`)
})
