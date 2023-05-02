/* eslint-disable no-unneeded-ternary */
const csrf = require('tiny-csrf')
const path = require('path')
const express = require('express')
const { Todo, User } = require('./models')
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
app.use(express.static(path.join(__dirname, 'public')))

// bcrypt config
const passport = require('passport')
const connectEnsureLogin = require('connect-ensure-login')
const session = require('express-session')
const flash = require('connect-flash')
const LocalStrategy = require('passport-local')
const bcrypt = require('bcrypt')
const saltRounds = 10

// Passport Js Configuration
app.use(flash())

app.use(
  session({
    secret: 'my-super-secret-key-187657654765423456788',
    cookies: {
      maxAge: 24 * 60 * 60 * 1000
    }
  })
)

app.use(function (request, response, next) {
  response.locals.messages = request.flash()
  next()
})

app.use(passport.initialize())
app.use(passport.session())

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    (username, password, done) => {
      User.findOne({ where: { email: username } })
        .then(async (user) => {
          const result = await bcrypt.compare(password, user.password)
          if (result) {
            return done(null, user)
          } else {
            return done(null, false, {
              message: 'Try again with a correct password'
            })
          }
        })
        .catch(() => {
          return done(null, false, {
            message: 'No account found with this email. Please create new account'
          })
        })
    }
  )
)

passport.serializeUser((user, done) => {
  console.log('Serializing user in session', user.id)
  done(null, user.id)
})

passport.deserializeUser((id, done) => {
  User.findByPk(id)
    .then((user) => {
      done(null, user)
    })
    .catch((error) => {
      done(error, null)
    })
})

app.get('/', async (request, response) => {
  response.render('index', {
    title: 'Todo Application',
    csrfToken: request.csrfToken()
  })
})

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

app.post('/todos', connectEnsureLogin.ensureLoggedIn(), async function (request, response) {
  if (request.body.title.length === 0) {
    request.flash('Error Occured', 'Title can not be empty')
    return response.redirect('/todos')
  }

  if (request.body.dueDate.length === 0) {
    request.flash('Error Occured', 'Date cannot be empty!')
    return response.redirect('/todos')
  }

  try {
    await Todo.addTodo(request.body)
    return response.redirect('/')
  } catch (error) {
    console.log(error)
    return response.status(422).json(error)
  }
})

app.put('/todos/:id', connectEnsureLogin.ensureLoggedIn(), async function (request, response) {
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
app.delete('/todos/:id', connectEnsureLogin.ensureLoggedIn(), async function (request, response) {
  try {
    await Todo.remove(request.params.id)
    return response.json({ success: true })
  } catch (error) {
    console.log(error)
    return response.status(422).json(error)
  }
})

app.post('/users', async (request, response) => {
  if (request.body.firstName.length === 0) {
    request.flash('Error Occured', 'First name is required')
    return response.redirect('/signup')
  }

  if (request.body.email.length === 0) {
    request.flash('Error Occured', 'Email is required field')
    return response.redirect('/signup')
  }

  if (request.body.password.length < 6) {
    request.flash('Error Occured', 'Minimum password length is 6')
    return response.redirect('/signup')
  }

  const hashedPassword = await bcrypt.hash(request.body.password, saltRounds)
  console.log(hashedPassword)
  try {
    const user = await User.create({
      firstName: request.body.firstName,
      lastName: request.body.lastName,
      email: request.body.email,
      password: hashedPassword
    })
    request.login(user, (err) => {
      if (err) {
        console.log(err)
      }
      response.redirect('/todos')
    })
  } catch (error) {
    console.log(error)
  }
})

app.get('/login', (request, response) => {
  response.render('login', { title: 'Login', csrfToken: request.csrfToken() })
})

app.post('/session',
  passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true
  }),
  function (request, response) {
    console.log(request.user)
    response.redirect('/todos')
  }
)

app.get('/signout', (request, response, next) => {
  request.logout((err) => {
    if (err) {
      return next(err)
    }
    response.redirect('/')
  })
})

module.exports = app
