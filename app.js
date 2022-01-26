const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

const authRoutes = require('./routes/auth-routes')
const usersRoutes = require('./routes/users-routes')
const booksRoutes = require('./routes/books-routes')
const listItemsRoutes = require('./routes/listItems-routes')
const HttpError = require('./models/http-error')

const cors = require('cors')
const app = express()

// app.options('*', cors())
app.use(cors())
app.use(bodyParser.json())
// login register
app.use('/api/auth', authRoutes)
//bootstrap
app.use('/api/user', usersRoutes)
// list-items GET POST , list-items/:id PATCH, DELETE
app.use('/api/list-items', listItemsRoutes)
// books GET POST, books/:id PATCH, DELETE
app.use('/api/books', booksRoutes)
app.post('/api/report/profile', (req, res, next) => {
  res.status(200).json({ success: true })
})

app.use((req, res, next) => {
  const error = new HttpError('Could not find this route.', 404)
  throw error
})

app.use((error, req, res, next) => {
  res.status(error.code || 500)
  res.json({ message: error.message || 'An unknown error occurred!' })
})

mongoose
  .connect(
    `mongodb+srv://cluster0.wtuap.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,
    {
      user: process.env.DB_USER,
      pass: process.env.DB_PASSWORD,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    app.listen(process.env.PORT)
    console.log('db connected')
  })
  .catch((err) => {
    console.log(err)
  })
