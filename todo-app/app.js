/* eslint-disable quotes */
/* eslint-disable no-unused-vars */
const express = require('express')
const { Todo } = require('./models')
const bodyParser = require('body-parser')
const { response, request } = require('express')

// creating express app
const app = express()

// connect app with body parser
app.use(bodyParser.json())

// Creating list todos route
app.get('/todos', async (request, response) => {
  console.log('List todos')
  try {
    const alltodos = await Todo.findAll()
    return response.json(alltodos)
  } catch (error) {
    console.log(error)
    return response.status(422).json(error)
  }
})

// Route for creating a todo
app.post('/todos', async (request, response) => {
  console.log('Creating a todo')
  try {
    const todo = await Todo.create({
      title: request.body.title,
      dueDate: request.body.dueDate,
      completed: false
    })
    return response.json(todo)
  } catch (error) {
    console.log(error)
    return response.status(422).json(error)
  }
})

// Route for updating a todo with an id
app.put('/todos/:id/markAsCompleted/', async (request, response) => {
  console.log('Update todo with id:', request.params.id)
  try {
    const todo = await Todo.findByPk(request.params.id)
    const updatedTodo = await todo.markAsCompleted()
    return response.json(updatedTodo)
  } catch (error) {
    console.log('error')
    return response.status('422').json(error)
  }
})

app.delete('/todos/:id', (request, response) => {
  console.log('Delete todo with id:', request.params.id)
})

module.exports = app
