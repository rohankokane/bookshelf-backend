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

// const getUserById = async (req, res, next) => {
//   const _id = req.params.id
//   let user
//   try {
//     user = await User.findById(_id, '-password')
//       .populate('followers', 'username fullname image')
//       .populate('following', 'username fullname image')
//     if (!user) {
//       const error = new HttpError('No user found', 404)
//       return next(error)
//     }
//   } catch (e) {
//     const error = new HttpError(
//       'Something went wrong, could not get the user',
//       500
//     )
//     return next(error)
//   }
//   const userData = user.toObject({ getters: true })
//   res.status(200).json({ ...userData, userId: userData.id })
// }

// const updateUser = async (req, res, next) => {
//   const id = req.params.id
//   const errors = validationResult(req)
//   if (!errors.isEmpty()) {
//     return next(
//       new HttpError('Invalid inputs passed, please check your data.', 422)
//     )
//   }

//   // const updates = Object.keys(req.body)
//   // const allowedUpdates = ['username', 'fullname', 'bio', 'image']
//   // const isValidUpdates = updates.every((update) => {
//   //   return allowedUpdates.includes(update)
//   // })

//   // if (!isValidUpdates) {
//   //   const error = new HttpError('invalid updates!', 400)
//   //   return next(error)
//   // }

//   const { username, fullname, image, bio } = req.body

//   let user
//   try {
//     user = await User.findById(id, '-password')
//       .populate('followers', 'username fullname')
//       .populate('following', 'username fullname')
//   } catch (err) {
//     const error = new HttpError(
//       'Something went wrong, could not update user.',
//       500
//     )
//     return next(error)
//   }

//   user.username = username
//   user.fullname = fullname
//   user.image = image || ''
//   user.bio = bio

//   try {
//     await user.save()
//   } catch (e) {
//     const error = new HttpError(
//       'Something went wrong, could not update user.',
//       500
//     )
//     return next(error)
//   }

//   res.status(200).json({ user: user.toObject({ getters: true }) })
// }

exports.bootstrap = bootstrap
// exports.getUserById = getUserById
// exports.updateUser = updateUser
