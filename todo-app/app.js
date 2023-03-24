const express = require('express')
const app = express()
const { Todo } = require('./models')
const bodyParser = require('body-parser')
app.use(bodyParser.json())

app.get('/', async (request, response) => {
  console.log('List todos')
  try {
    const alltodos = await Todo.getAllTodos()
    return response.json(alltodos)
  } catch (error) {
    console.log(error)
    return response.status(422).json(error)
  }
})

app.get('/todos', async function (_request, response) {
  console.log('Processing list of all Todos ...')
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
    const todo = await Todo.addTodo(request.body)
    return response.json(todo)
  } catch (error) {
    console.log(error)
    return response.status(422).json(error)
  }
})

app.put('/todos/:id/markAsCompleted', async function (request, response) {
  const todo = await Todo.findByPk(request.params.id)
  try {
    const updatedTodo = await todo.markAsCompleted()
    return response.json(updatedTodo)
  } catch (error) {
    console.log(error)
    return response.status(422).json(error)
  }
})

app.delete('/todos/:id', async function (request, response) {
  console.log('We have to delete a Todo with ID: ', request.params.id)
  try {
    const todo = await Todo.findByPk(request.params.id)
    if (todo.dataValues.id) {
      await Todo.destroy({
        where: {
          id: todo.dataValues.id
        }
      })
      return response.send({ success: true })
    }
  } catch (error) {
    console.log(error)
    return response.status(500).send({ success: false, error: 'Error deleting todo' })
  }
})

module.exports = app
