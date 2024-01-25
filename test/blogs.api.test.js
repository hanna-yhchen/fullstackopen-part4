const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/Blog')
const { initialBlogs } = require('./test-helper')

const api = supertest(app)
const blogsEndpoint = '/api/blogs'

beforeAll(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(initialBlogs)
})

test('blogs are returned as json', async () => {
  await api
    .get(blogsEndpoint)
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('all blogs are returned', async () => {
  const response = await api.get(blogsEndpoint)
  expect(response.body).toHaveLength(initialBlogs.length)
})

test('the returned json has a property named id', async () => {
  const response = await api.get(blogsEndpoint)
  const blog = response.body[0]
  expect(blog.id).toBeDefined()
})

afterAll(async () => {
  await mongoose.connection.close()
})
