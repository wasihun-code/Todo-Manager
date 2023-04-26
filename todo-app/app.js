/* eslint-disable no-unneeded-ternary */
const csrf = require('tiny-csrf')
const path = require('path')
const express = require('express')
const { Todo, User } = require('./models')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')

const passport = require('passport')
// eslint-disable-next-line no-unused-vars
const connectEnsureLogin = require('connect-ensure-login')
const session = require('express-session')
const LocalStrategy = require('passport-local')

// app settings and usage
const app = express()
app.use(bodyParser.json())
app.use(express.urlencoded({ extended: false }))
app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, 'public')))
app.use(cookieParser('shh! some secret string'))
app.use(csrf('this_should_be_32_character_long', ['POST', 'PUT', 'DELETE']))

app.use(session({
  secret: 'my-supersecret-key-217822384752839',
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}))

app.use(passport.initialize())
app.use(passport.session())

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, (username, password, done) => {
  User.findOne({
    where: { email: username, password }
  }).then((user) => {
    return done(null, user)
  }).catch((error) => {
    return (error)
  })
}))

passport.serializeUser((user, done) => {
  console.log('Serialization user in session', user.id)
  done(null, user.id)
})

passport.deserializeUser((id, done) => {
  User.findByPk(id)
    .then(user => {
      done(null, user)
    })
    .catch(error => {
      done(error, null)
    })
})
// Homepage route
app.get('/', async (request, response) => {
  response.render('index', {
    csrfToken: request.csrfToken()
  })
})

app.get('/todos', async (request, response) => {
  const allTodos = await Todo.getAllTodos()
  const overduetodos = await Todo.getOverdueTodos()
  const duetodaytodos = await Todo.getTodayTodos()
  const duelatertodos = await Todo.getDueLaterTodos()
  const completedtodos = await Todo.getCompletedTodos()

  if (request.accepts('html')) {
    response.render('todo', {
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
    const updatedTodo = await todo.setCompletionStatus(!todo.completed)
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

app.get('/signup', (request, response) => {
  response.render('signup', { title: 'sign up', csrfToken: request.csrfToken() })
})

app.post('/users', async (request, response) => {
  try {
    // eslint-disable-next-line no-unused-vars
    const user = await User.create({
      firstName: request.body.firstName,
      lastName: request.body.lastName,
      email: request.body.email,
      password: request.body.password
    })
    response.redirect('/')
  } catch (error) {
    console.log(error)
  }
})

module.exports = app
