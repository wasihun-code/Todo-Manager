/* eslint-disable no-unneeded-ternary */
const csrf = require('tiny-csrf')
const path = require('path')
const express = require('express')
const { Todo } = require('./models')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')

// app settings and usage
const app = express()
app.use(bodyParser.json())
app.use(express.urlencoded({ extended: false }))
app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, 'public')))
app.use(cookieParser('shh! some secret string'))
app.use(csrf('this_should_be_32_character_long', ['POST', 'PUT', 'DELETE']))

// Homepage route
app.get('/', async (request, response) => {
  const allTodos = await Todo.getAllTodos()
  const overduetodos = await Todo.getOverdueTodos()
  const duetodaytodos = await Todo.getTodayTodos()
  const duelatertodos = await Todo.getDueLaterTodos()
  const completedtodos = await Todo.getCompletedTodos()

  if (request.accepts('html')) {
    response.render('index', {
      allTodos,
      overduetodos,
      duetodaytodos,
      duelatertodos,
      completedtodos,
      csrfToken: request.csrfToken()
    })
  } else {
    response.json({
      overduetodos,
      duetodaytodos,
      duelatertodos,
      completedtodos
    })
  }
})

app.use(express.static(path.join(__dirname, 'public')))

app.get('/todos', async function (_request, response) {
  try {
    const alltodos = await Todo.getAllTodos()
    return response.json(alltodos)
  } catch (error) {
    console.log(error)
    return response.status(422).json(error)
  }
})

app.get('/todos/:id', async function (request, response) {
  try {
    const todo = await Todo.findByPk(request.params.id)
    return response.json(todo)
  } catch (error) {
    console.log(error)
    return response.status(422).json(error)
  }
})

app.post('/todos', async function (request, response) {
  try {
    await Todo.addTodo(request.body)
    return response.redirect('/')
  } catch (error) {
    console.log(error)
    return response.status(422).json(error)
  }
})

app.put('/todos/:id', async function (request, response) {
  const todo = await Todo.findByPk(request.params.id)

  try {
    // console.log(Object.keys(request.body))
    console.log(request.body)
    const updatedTodo = await todo.setCompletionStatus(request.body.completed)
    return response.json(updatedTodo)
  } catch (error) {
    console.log(error)
    return response.status(422).json(error)
  }
})
app.delete('/todos/:id', async function (request, response) {
  try {
    await Todo.remove(request.params.id)
    return response.json({ success: true })
  } catch (error) {
    console.log(error)
    return response.status(422).json(error)
  }
})

module.exports = app
