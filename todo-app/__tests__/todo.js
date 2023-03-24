/* eslint-disable no-undef */
const request = require('supertest')
const db = require('../models/index')
const app = require('../app')

let server, agent

describe('Todo Test suite', () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true })
    server = app.listen(3000, () => {})
    agent = request.agent(server)
  })
  afterAll(async () => {
    await db.sequelize.close()
    server.close()
  })
  test('Creating todo', async () => {
    const response = await agent.post('/todos').send({
      title: 'Buy stuff',
      dueDate: new Date().toISOString,
      completed: false
    })
    expect(response.statusCode).toBe(200)
    expect(response.header['content-type']).toBe(
      'application/json; charset=utf-8'
    )
    const parsedResponse = JSON.parse(response.text)
    expect(parsedResponse.id).toBeDefined()
  })
  test('Mark as completed', async () => {
    const response = await agent.post('/todos').send({
      title: 'Complete Project',
      dueDate: new Date().toISOString(),
      completed: false
    })
    const parsedResponse = JSON.parse(response.text)
    const todoID = parsedResponse.id

    expect(parsedResponse.completed).toBe(false)

    const markCompletedResponse = await agent
      .put(`/todos/${todoID}/markAsCompleted`)
      .send()
    const updatedResponse = JSON.parse(markCompletedResponse.text)
    expect(updatedResponse.completed).toBe(true)
  })
})
