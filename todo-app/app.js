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

app.use(function (req, resp, next) {
  resp.locals.messages = req.flash()
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

app.get('/todos',
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    const loggedUser = request.user.id
    const overduedTodos = await Todo.getOverdueTodos(loggedUser)
    const dueTodayTodos = await Todo.getTodayTodos(loggedUser)
    const dueLaterTodos = await Todo.getDueLaterTodos(loggedUser)
    const completedTodos = await Todo.getCompletedTodos(loggedUser)
    if (request.accepts('html')) {
      response.render('todos', {
        title: 'Todo Application',
        overdue: overduedTodos,
        dueLater: dueLaterTodos,
        dueToday: dueTodayTodos,
        completedItems: completedTodos,
        csrfToken: request.csrfToken()
      })
    } else {
      response.status(200).json({
        overdue: overduedTodos,
        dueToday: dueTodayTodos,
        dueLater: dueLaterTodos,
        completedItems: completedTodos
      })
    }
  })

app.get('/todos/:id', async function (req, resp) {
  try {
    const todo = await Todo.findByPk(req.params.id)
    return resp.json(todo)
  } catch (error) {
    console.log(error)
    return resp.status(422).json(error)
  }
})

app.post('/todos', connectEnsureLogin.ensureLoggedIn(), async function (req, resp) {
  if (req.body.title.trim().length === 0) {
    req.flash('error', 'Title can not be empty')
    return resp.redirect('/todos')
  }

  if (req.body.dueDate.length === 0) {
    req.flash('error', 'Date cannot be empty!')
    return resp.redirect('/todos')
  }

  try {
    await Todo.addTodo({
      title: req.body.title,
      dueDate: req.body.dueDate,
      userId: req.user.id
    })
    return resp.redirect('/todos')
  } catch (error) {
    console.log(error)
    return resp.status(422).json(error)
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

app.delete(
  '/todos/:id',
  connectEnsureLogin.ensureLoggedIn(),
  async (req, resp) => {
    try {
      await Todo.remove(req.params.id, req.user.id)
      return resp.json({ success: true })
    } catch (error) {
      console.log(error)
      return resp.status(422).json(error)
    }
  }
)

app.post('/users', async (req, resp) => {
  if (req.body.firstName.length === 0) {
    req.flash('error', 'First name is required')
    return resp.redirect('/signup')
  }

  if (req.body.lastName.length === 0) {
    req.flash('error', 'Last name is required')
    return resp.redirect('/signup')
  }

  if (req.body.email.length === 0) {
    req.flash('error', 'Email is required')
    return resp.redirect('/signup')
  }

  if (req.body.password.length < 6) {
    req.flash('error', 'Minimum password length is 6')
    return resp.redirect('/signup')
  }

  const hashedPassword = await bcrypt.hash(req.body.password, saltRounds)
  console.log(hashedPassword)
  try {
    const user = await User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: hashedPassword
    })
    req.login(user, (err) => {
      if (err) {
        console.log(err)
      }
      resp.redirect('/todos')
    })
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      req.flash('error', 'Email already exists')
      return resp.redirect('/signup')
    }
  }
})

app.get('/login', (req, resp) => {
  resp.render('login', { title: 'Login', csrfToken: req.csrfToken() })
})

app.post('/session',
  passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true
  }),
  function (req, resp) {
    console.log(req.user)
    resp.redirect('/todos')
  }
)

app.get('/signup', (request, response) => {
  response.render('signup', {
    title: 'Signup',
    csrfToken: request.csrfToken()
  })
})

app.get('/signout', (req, resp, next) => {
  req.logout((error) => {
    if (error) {
      return next(error)
    }
    resp.redirect('/')
  })
})

module.exports = app
