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
    server = app.listen(3000, () => {})
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
      // eslint-disable-next-line quote-props
      '_csrf': csrfToken
    })
    expect(response.statusCode).toBe(302)
    // const parsedResponse = JSON.parse(response.text)
    // expect(parsedResponse.id).toBeDefined()
  })

  test('Marks a todo with the given ID as complete', async () => {
    let res = await agent.get('/')
    let csrfToken = extractCsrfToken(res)
    await agent.post('/todos').send({
      title: 'Buy milk',
      dueDate: new Date().toISOString(),
      completed: false,
      '_csrf': csrfToken
    })
    const groupedTodosResponse = await agent.get('/')
      .set('Accept', 'application/json')
    const parsedResponse = JSON.parse(groupedTodosResponse.text)
    const dueTodayCount = parsedResponse.duetodaytodos.length
    const latestTodo = parsedResponse.duetodaytodos[dueTodayCount - 1]

    res = await agent.get('/')
    csrfToken = extractCsrfToken(res)

    const markCompleteResponse = await agent.put(`/todos/${latestTodo.id}/markAsCompleted`).send({
      _csrf: csrfToken
    })
    const parsedUpdatedResponse = JSON.parse(markCompleteResponse.text)
    expect(parsedUpdatedResponse.completed).toBe(true)
  })

  //   test('Fetches all todos in the database using /todos endpoint', async () => {
  //     const res = await agent.get('/')
  //     const csrfToken = extractCsrfToken(res)
  //     await agent.post('/todos').send({
  //       title: 'Buy xbox',
  //       dueDate: new Date().toISOString(),
  //       completed: false,
  //       '_csrf': csrfToken

  //     })
  //     await agent.post('/todos').send({
  //       title: 'Buy ps3',
  //       dueDate: new Date().toISOString(),
  //       completed: false,
  //       '_csrf': csrfToken
  //     })
  //     const response = await agent.get('/todos')
  //     const parsedResponse = JSON.parse(response.text)
  //     console.log(parsedResponse)
  //     expect(parsedResponse.length).toBe(3)
  //     expect(parsedResponse[2].title).toBe('Buy ps3')
  //   })

  //   test('Deletes a todo with the given ID if it exists and sends a boolean response', async () => {
  //     // FILL IN YOUR CODE HERE
  //     const res = await agent.get('/')
  //     const csrfToken = extractCsrfToken(res)
  //     const response = await agent.post('/todos').send({
  //       title: 'Buy Buy',
  //       dueDate: new Date().toISOString(),
  //       completed: false,
  //       '_csrf': csrfToken
  //     })

  //     // find the id of the new item
  //     const parsedResponse = JSON.parse(response.text)
  //     const todoID = parsedResponse.id

//     // Send put request to delete the databasae
//     const deleteResponse = await agent.delete(`/todos/${todoID}`).send()
//     expect(deleteResponse.statusCode).toBe(200)
//     expect(deleteResponse.body).toBe(true)
//   })
})
