// const loadingBook = {
//   title: 'Loading...',
//   author: 'loading...',
//   coverImageUrl: bookPlaceholderSvg,
//   publisher: 'Loading Publishing',
//   synopsis: 'Loading...',
//   loadingBook: true,
// }
const express = require('express')
const { check } = require('express-validator')

const booksController = require('../controllers/books-controllers')
const checkAuth = require('../middleware/check-auth')

const router = express.Router()
router.use(checkAuth)

// params books?query=abcd
router.get('/', booksController.queryBooks)
// books/:id
router.get('/:id', booksController.getBookById)

module.exports = router
