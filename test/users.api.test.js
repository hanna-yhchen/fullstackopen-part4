const { api } = require('./test-setup')
const bcrypt = require('bcrypt')
const User = require('../models/User')
const { usersInDb } = require('./test-helper')

const usersEndpoint = '/api/users'

describe('creating a new user when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('secret', 10)
    const user = new User({
      username: 'root',
      name: 'Superuser',
      passwordHash
    })

    await user.save()
  })

  test('succeeds with a fresh username', async () => {
    const originalUsers = await usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen'
    }

    await api
      .post(usersEndpoint)
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const users = await usersInDb()
    expect(users).toHaveLength(originalUsers.length + 1)

    const usernames = users.map((user) => user.username)
    expect(usernames).toContain(newUser.username)
  })

  test('fails if username already taken', async () => {
    const originalUsers = await usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen'
    }

    const result = await api
      .post(usersEndpoint)
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('expected `username` to be unique')

    const users = await usersInDb()
    expect(users).toEqual(originalUsers)
  })

  test('fails if username is shorter than 3 characters long', async () => {
    const originalUsers = await usersInDb()

    const newUser = {
      username: 'ml',
      name: 'Matti Luukkainen',
      password: 'salainen'
    }

    const result = await api
      .post(usersEndpoint)
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('shorter than the minimum allowed length')

    const users = await usersInDb()
    expect(users).toEqual(originalUsers)
  })

  test('fails if password is shorter than 3 characters long', async () => {
    const originalUsers = await usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'sa'
    }

    const result = await api
      .post(usersEndpoint)
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('expected `password` to be at least 3 characters long')

    const users = await usersInDb()
    expect(users).toEqual(originalUsers)
  })
})
