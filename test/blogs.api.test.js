const { api } = require('./test-setup')
const Blog = require('../models/Blog')
const { initialBlogs, blogsInDb, setupRootUser, rootUserAuthBearer } = require('./test-helper')
const { map } = require('lodash')

const blogsEndpoint = '/api/blogs'

beforeEach(async () => {
  const userId = await setupRootUser()
  await Blog.deleteMany({})
  await Blog.insertMany(initialBlogs(userId))
})

describe('getting blogs', () => {
  test('blogs are returned as json', async () => {
    await api
      .get(blogsEndpoint)
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get(blogsEndpoint)
    expect(response.body).toHaveLength(initialBlogs().length)
  })

  test('the returned json has a property named id', async () => {
    const response = await api.get(blogsEndpoint)
    const blog = response.body[0]
    expect(blog.id).toBeDefined()
  })
})

describe('adding new blog', () => {
  test('succeeds with valid data', async () => {
    const authBearer = await rootUserAuthBearer()
    const newBlog = {
      title: 'Type wars',
      author: 'Robert C. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
      likes: 2
    }

    await api
      .post(blogsEndpoint)
      .set('Authorization', authBearer)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogs = await blogsInDb()
    expect(blogs).toHaveLength(initialBlogs().length + 1)

    const fields = {
      titles: map(blogs, 'title'),
      authors: map(blogs, 'author'),
      urls: map(blogs, 'url'),
      likes: map(blogs, 'likes')
    }
    expect(fields.titles).toContain(newBlog.title)
    expect(fields.authors).toContain(newBlog.author)
    expect(fields.urls).toContain(newBlog.url)
    expect(fields.likes).toContain(newBlog.likes)
  })

  test('succeeds if missing likes property', async () => {
    const authBearer = await rootUserAuthBearer()
    const newBlog = {
      title: 'Type wars',
      author: 'Robert C. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html'
    }

    await api.post(blogsEndpoint)
      .set('Authorization', authBearer)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const created = (await blogsInDb({ url: newBlog.url }))[0]
    expect(created.likes).toBe(0)
  })

  test('fails if missing title or url', async () => {
    const authBearer = await rootUserAuthBearer()
    const blogWithoutTitle = {
      author: 'Robert C. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html'
    }

    await api.post(blogsEndpoint)
      .set('Authorization', authBearer)
      .send(blogWithoutTitle)
      .expect(400)

    const blogWithoutUrl = {
      title: 'Type wars',
      author: 'Robert C. Martin'
    }

    await api.post(blogsEndpoint)
      .set('Authorization', authBearer)
      .send(blogWithoutUrl)
      .expect(400)
  })

  test('fails if missing `Authorization` token', async () => {
    const newBlog = {
      title: 'Type wars',
      author: 'Robert C. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
      likes: 2
    }

    await api
      .post(blogsEndpoint)
      .send(newBlog)
      .expect(401)
  })
})

describe('deleting a blog', () => {
  test('succeeds with valid id', async () => {
    const authBearer = await rootUserAuthBearer()
    const originalBlogs = await blogsInDb()
    const blogToDelete = originalBlogs[0]

    await api
      .delete(`${blogsEndpoint}/${blogToDelete.id}`)
      .set('Authorization', authBearer)
      .expect(204)

    const remainingBlogs = await blogsInDb()
    expect(remainingBlogs).toHaveLength(originalBlogs.length - 1)

    const blogUrls = map(remainingBlogs, 'url')
    expect(blogUrls).not.toContain(blogToDelete)
  })

  test('fails if missing `Authorization` token', async () => {
    const originalBlogs = await blogsInDb()
    const blogToDelete = originalBlogs[0]

    await api
      .delete(`${blogsEndpoint}/${blogToDelete.id}`)
      .expect(401)
  })
})

describe('updating a blog', () => {
  test('succeeds with valid id', async () => {
    const originalBlogs = await blogsInDb()
    const blogToUpdate = originalBlogs[0]
    const updateRequest = {
      title: blogToUpdate.title,
      author: blogToUpdate.author,
      url: blogToUpdate.url,
      likes: blogToUpdate.likes + 1
    }

    await api
      .put(`${blogsEndpoint}/${blogToUpdate.id}`)
      .send(updateRequest)
      .expect(200)

    const updatedBlog = await Blog.findById(blogToUpdate.id)
    expect(updatedBlog.likes).toBe(updateRequest.likes)
  })
})
