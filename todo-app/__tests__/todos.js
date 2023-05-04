/* eslint-disable quote-props */
/* eslint-disable no-unneeded-ternary */
/* eslint-disable no-undef */
const request = require('supertest')
const db = require('../models/index')
const cheerio = require('cheerio')
const app = require('../app')

let server, agent

function extractCsrfToken (res) {
  const $ = cheerio.load(res.text)
  return $('[name=_csrf]').val()
}

const login = async (agent, username, password) => {
  let res = await agent.get('/login')
  const csrfToken = extractCsrfToken(res)
  res = await agent.post('/session').send({
    email: username,
    password,
    _csrf: csrfToken
  })
}

describe('Todo Application', function () {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true })
    server = app.listen(5000, () => {})
    agent = request.agent(server)
  })

  afterAll(async () => {
    try {
      await db.sequelize.close()
      await server.close()
    } catch (error) {
      console.log(error)
    }
  })

  test('Sign up', async () => {
    let response = await agent.get('/signup')
    const csrfToken = extractCsrfToken(response)
    response = await agent.post('/users').send({
      firstName: 'Test',
      lastName: 'User A',
      email: 'user.abc@gmail.com',
      password: '12345678',
      _csrf: csrfToken
    })
    expect(response.statusCode).toBe(302)
  })

  test('Sign out', async () => {
    let response = await agent.get('/todos')
    expect(response.statusCode).toBe(200)
    response = await agent.get('/signout')
    expect(response.statusCode).toBe(302)
    response = await agent.get('/todos')
    expect(response.statusCode).toBe(302)
  })

  test('Creates a todo and responds with json at /todos POST endpoint', async () => {
    const agent = request.agent(server)
    await login(agent, 'user.a@gmail.com', '12345678')
    const res = await agent.get('/')
    const csrfToken = extractCsrfToken(res)
    const response = await agent.post('/todos').send({
      title: 'Buy milk',
      dueDate: new Date().toISOString(),
      completed: false,
      '_csrf': csrfToken
    })
    expect(response.statusCode).toBe(302)
  })

  // mark a todo as complete
  test('Mark a todo as complete', async () => {
    const agent = request.agent(server)
    await login(agent, 'user.a@gmail.com', '12345678')
    let res = await agent.get('/')
    let csrfToken = extractCsrfToken(res)

    await agent.post('/todos').send({
      title: 'Buy milk',
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken
    })

    const groupedTodosResponse = await agent.get('/').set('Accept', 'application/json')
    const parsedGroupedResponse = JSON.parse(groupedTodosResponse.text)
    const dueTodayCount = parsedGroupedResponse.duetodaytodos.length
    const latestTodo = parsedGroupedResponse.duetodaytodos[dueTodayCount - 1]

    res = await agent.get('/')
    csrfToken = extractCsrfToken(res)
    const status = true
    const markCompleteResponse = await agent.put(`/todos/${latestTodo.id}`).send({
      _csrf: csrfToken,
      completed: status
    })

    expect(markCompleteResponse.status).toBe(200)
    console.log(latestTodo)
    expect(markCompleteResponse.body.completed).toBe(status)
  })

  // Test for removing a todo
  test('Delete a todos', async () => {
    const agent = request.agent(server)
    await login(agent, 'user.a@gmail.com', '12345678')
    let res = await agent.get('/')
    let csrfToken = extractCsrfToken(res)

    await agent.post('/todos').send({
      title: 'Buy milk',
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken
    })

    const groupedTodosResponse = await agent.get('/').set('Accept', 'application/json')
    const parsedGroupedResponse = JSON.parse(groupedTodosResponse.text)
    const dueTodayCount = parsedGroupedResponse.duetodaytodos.length
    const latestTodo = parsedGroupedResponse.duetodaytodos[dueTodayCount - 1]

    res = await agent.get('/')
    csrfToken = extractCsrfToken(res)

    const deletedResponse = await agent.delete(`/todos/${latestTodo.id}`).send({
      _csrf: csrfToken
    })
    expect(deletedResponse.status).toBe(200)
  })

  test('Mark a todo as incomplete', async () => {
    let res = await agent.get('/')
    let csrfToken = extractCsrfToken(res)

    await agent.post('/todos').send({
      title: 'Buy milk',
      dueDate: new Date().toISOString(),
      completed: true,
      _csrf: csrfToken
    })

    const groupedTodosResponse = await agent.get('/').set('Accept', 'application/json')
    const parsedGroupedResponse = JSON.parse(groupedTodosResponse.text)
    const dueTodayCount = parsedGroupedResponse.duetodaytodos.length
    const latestTodo = parsedGroupedResponse.duetodaytodos[dueTodayCount - 1]

    res = await agent.get('/')
    csrfToken = extractCsrfToken(res)
    const status = false
    const markCompleteResponse = await agent.put(`/todos/${latestTodo.id}`).send({
      _csrf: csrfToken,
      completed: status
    })

    expect(markCompleteResponse.status).toBe(200)
    expect(markCompleteResponse.body.completed).toBe(status)
  })
})
