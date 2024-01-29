const mongoose = require('mongoose')
mongoose.set('bufferTimeoutMS', 100000)

const { connectToMongoDB } = require('../utils/database')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

beforeAll(async () => {
  await connectToMongoDB()
})

afterAll(async () => {
  await mongoose.connection.close()
})

module.exports = {
  api
}
