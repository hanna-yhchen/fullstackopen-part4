const blogsRouter = require('express').Router()
const Blog = require('../models/Blog')
const { userExtractor } = require('../utils/middleware')
const { invalidTokenError } = require('../utils/errors')

blogsRouter.get('/', async (request, response) => {
  const blogs = await populateWithUser(Blog.find({}))
  response.json(blogs)
})

blogsRouter.post('/', userExtractor, async (request, response) => {
  const user = request.user
  const { title, author, url, likes } = request.body
  const blog = new Blog({ title, author, url, likes, user: user.id })
  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()
  response.status(201).json(await populateWithUser(savedBlog))
})

blogsRouter.delete('/:id', userExtractor, async (request, response) => {
  const blogToDelete = await Blog.findById(request.params.id)
  const user = request.user
  if (!user || !(blogToDelete.user.toString() === user.id)) {
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
