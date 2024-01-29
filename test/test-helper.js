const Blog = require('../models/Blog')
const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const initialBlogs = (userId) => {
  return [
    {
      title: 'React patterns',
      author: 'Michael Chan',
      url: 'https://reactpatterns.com/',
      likes: 7,
      user: userId
    },
    {
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
      likes: 5,
      user: userId
    },
    {
      title: 'Canonical string reduction',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
      likes: 12,
      user: userId
    },
    {
      title: 'First class tests',
      author: 'Robert C. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
      likes: 10,
      user: userId
    },
    {
      title: 'TDD harms architecture',
      author: 'Robert C. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
      likes: 0,
      user: userId
    }
  ]
}

const blogsInDb = async (filter) => {
  const blogs = await Blog.find(filter ?? {})
  return blogs.map((blog) => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map((user) => user.toJSON())
}

const setupRootUser = async () => {
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('secret', 10)
  const user = new User({
    username: 'root',
    name: 'Superuser',
    passwordHash
  })

  await user.save()
  return user.id
}

const rootUserAuthBearer = async () => {
  const user = await User.findOne({ username: 'root' })
  if (!user) {
    return null
  }

  const payload = {
    username: user.username,
    id: user._id
  }
  const token = jwt.sign(payload, process.env.SECRET)
  return `Bearer ${token}`
}

module.exports = {
  initialBlogs,
  blogsInDb,
  usersInDb,
  setupRootUser,
  rootUserAuthBearer
}
