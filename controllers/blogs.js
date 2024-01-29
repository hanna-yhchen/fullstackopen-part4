const blogsRouter = require('express').Router()
const Blog = require('../models/Blog')
const User = require('../models/User')
const jwt = require('jsonwebtoken')

const invalidTokenError = () => {
  const error = new Error('token invalid')
  error.name = 'JsonWebTokenError'
  return error
}

blogsRouter.get('/', async (request, response) => {
  const blogs = await populateWithUser(Blog.find({}))
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodedToken.id) {
    throw invalidTokenError()
  }

  const user = await User.findById(decodedToken.id)
  const { title, author, url, likes } = request.body
  const blog = new Blog({ title, author, url, likes, user: user.id })
  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()
  response.status(201).json(await populateWithUser(savedBlog))
})

blogsRouter.delete('/:id', async (request, response) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  const blogToDelete = await Blog.findById(request.params.id)
  if (!decodedToken.id || !(blogToDelete.user.toString() === decodedToken.id)) {
    throw invalidTokenError()
  }
  await blogToDelete.deleteOne()
  response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
  const updatedBlog = await Blog.findByIdAndUpdate(
    request.params.id,
    request.body,
    { new: true }
  )
  response.json(updatedBlog)
})

const populateWithUser = async (blog) => {
  return await blog.populate('user', {
    username: 1,
    name: 1
  })
}

module.exports = blogsRouter
