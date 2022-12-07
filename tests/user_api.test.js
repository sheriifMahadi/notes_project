const bcrypt = require('bcrypt')
const User = require('../models/user')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const helper = require('./test_helper')

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('password', 10)
    const user = new User({ firstname: 'root', 
      lastname: 'user', email: 'rootuser@mail.com', passwordHash})
    await user.save()
  })

  test('account creation succeeds with new details', async () => {
    const usersAtStart = await helper.usersInDb()
    const newUser = {
      firstname: 'new',
      lastname: 'user', 
      email: 'newuser@mail.com',
      password: 'password'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)


    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)
  
    const usernames = usersAtEnd.map(u => u.email)
    expect(usernames).toContain(newUser.email)
  })

  test('creation fails with proper statuscode and message if email already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      firstname: 'root',
      lastname: 'user',
      email: 'rootuser@mail.com',
      password: 'password',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('This email has been used already.')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })
})

