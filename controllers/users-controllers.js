const HttpError = require('../models/http-error')
const User = require('../models/user')
const books = require('./books-data.json')

const bootstrap = async (req, res, next) => {
  // getuser
  // getToken
  // getList by owner
  const _id = req.userData.userId
  const token = req.userData.token

  let user
  let listItemsBooks
  try {
    user = await User.findById(_id, '-password').populate('listItems')
    if (!user) {
      const error = new HttpError('No user found', 404)
      return next(error)
    }
    user = user.toObject({ getters: true })
    listItemsBooks = user.listItems.map((listItem) => {
      const bookId = listItem.bookId
      return {
        ...listItem,
        book: books.find((book) => book.id === bookId),
      }
    })
  } catch (e) {
    const error = new HttpError(
      'Something went wrong, could not get the user',
      500
    )
    return next(error)
  }
  delete user.listItems
  user.token = token
  // const userData = user.toObject({ getters: true })
  res.status(200).json({ user: { ...user }, listItems: [...listItemsBooks] })
}

exports.bootstrap = bootstrap
