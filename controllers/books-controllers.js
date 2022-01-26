const HttpError = require('../models/http-error')
const User = require('../models/user')
const books = require('./books-data.json')
const { matchSorter } = require('match-sorter')

const queryBooks = async (req, res, next) => {
  // getList by owner
  const _id = req.userData.userId
  const token = req.userData.token
  let user
  const { query } = req.query
  async function queryFromBooks(search) {
    return matchSorter(books, search, {
      keys: [
        'title',
        'author',
        'publisher',
        { threshold: matchSorter.rankings.CONTAINS, key: 'synopsis' },
      ],
    })
  }
  async function readManyNotInList(ids) {
    return books.filter((book) => !ids.includes(book.id))
  }

  let matchingBooks = []
  try {
    if (query) {
      matchingBooks = await queryFromBooks(query)
    } else {
      user = await User.findById(_id, '-password').populate('listItems')
      const bookIdsInUsersList = user.listItems.map((li) => li.bookId)
      const allBooks = await readManyNotInList(bookIdsInUsersList)
      // return a random 10 books not already in the user's list
      matchingBooks = allBooks.slice(0, 10)
    }
  } catch (e) {
    const error = new HttpError(
      `Something went wrong, could not get the user. ${e}`,
      500
    )
    return next(error)
  }

  res.status(200).json({ books: matchingBooks })
}
const getBookById = async (req, res, next) => {
  // getList by owner
  const bookId = req.params.id
  let book
  try {
    book = books.find((book) => book.id === bookId)
  } catch (e) {
    const error = new HttpError(
      'Something went wrong, could not get the user',
      500
    )
    return next(error)
  }

  if (!book) {
    const error = new HttpError('Book not found', 404)
    return next(error)
  }

  res.status(200).json({ book })
}

exports.queryBooks = queryBooks
exports.getBookById = getBookById
// exports.getUserById = getUserById
// exports.updateUser = updateUser
