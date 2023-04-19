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

  test('Creates a todo and responds with json at /todos POST endpoint', async () => {
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

  test('Mark a todo as complete', async () => {
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

    const markCompleteResponse = await agent.put(`/todos/${latestTodo.id}`).send({
      _csrf: csrfToken
    })

    expect(markCompleteResponse.status).toBe(200)
    expect(markCompleteResponse.body.completed).toBe(true)

    res = await agent.get('/')
    csrfToken = extractCsrfToken(res)

    const markInCompleteResponse = await agent.put(`/todos/${latestTodo.id}`).send({
      _csrf: csrfToken
    })

    expect(markInCompleteResponse.status).toBe(200)
    expect(markInCompleteResponse.body.completed).toBe(false)
  })

  test('Delete a todos', async () => {
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
})
