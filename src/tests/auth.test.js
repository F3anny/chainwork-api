const request = require('supertest')
const app = require('../../app')

describe('Auth endpoints', () => {

  test('POST /users/register — should register a new user', async () => {
    const res = await request(app)
      .post('/users/register')
      .send({
        name: 'Test User',
        email: 'testunique@example.com',
        password: 'password123'
      })

    expect(res.statusCode).toBe(201)
    expect(res.body).toHaveProperty('user')
    expect(res.body.user).toHaveProperty('email')
  })

  test('POST /users/login — should login and return token', async () => {
    const res = await request(app)
      .post('/users/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      })

    expect(res.statusCode).toBe(200)
    expect(res.body).toHaveProperty('token')
  })

  test('POST /users/login — should fail with wrong password', async () => {
    const res = await request(app)
      .post('/users/login')
      .send({
        email: 'test@example.com',
        password: 'wrongpassword'
      })

    expect(res.statusCode).toBe(401)
  })

})