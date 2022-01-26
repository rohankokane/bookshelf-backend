const mongoose = require('mongoose')
const HttpError = require('../models/http-error')
const ListItem = require('../models/list-item')
const User = require('../models/user')
const books = require('./books-data.json')

const getListItems = async (req, res, next) => {
  // getList by owner
  const _id = req.userData.userId

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

  res.status(200).json({ listItems: [...listItemsBooks] })
}

const addListItem = async (req, res, next) => {
  // getList by owner

  //save in list-items collection
  //add id in user
  let book
  function createListItem({
    bookId,
    ownerId,
    rating = -1,
    notes = '',
    startDate = Date.now(),
    finishDate = null,
  }) {
    book = books.find((book) => book.id === bookId)
    if (!book) {
      const error = new HttpError('No book found', 404)
      return next(error)
    }
    return {
      bookId,
      finishDate,
      startDate,
      notes,
      ownerId,
      rating,
    }
  }

  const _id = req.userData.userId
  const { bookId } = req.body

  if (!bookId) {
    const error = new HttpError('Book id is required', 400)
    return next(error)
  }

  let createdListItem = new ListItem({
    ...createListItem({ bookId, ownerId: _id }),
  })
  // console.log(createdListItem)
  try {
    const sess = await mongoose.startSession()
    sess.startTransaction()
    const savedListItem = await createdListItem.save({ session: sess })
    await User.updateOne(
      { _id: _id },
      { $push: { listItems: savedListItem._id } },
      { session: sess }
    )
    await sess.commitTransaction()
  } catch (e) {
    const error = new HttpError(
      `Something went wrong, could not add list item. ${e}`,
      500
    )
    return next(error)
  }
  createdListItem = createdListItem.toObject({ getters: true })
  res.status(200).json({ listItem: { ...createdListItem, book } })
}

const deleteListItem = async (req, res, next) => {
  // return {
  //   bookId,
  //   finishDate,
  //   startDate,
  //   notes,
  //   ownerId,
  //   rating,
  // }

  const userId = req.userData.userId
  const listItemId = req.params.id
  let user, listItem

  try {
    user = await User.findById(userId, '-password')
    listItem = await ListItem.findById(listItemId).populate('ownerId')

    const sess = await mongoose.startSession()
    sess.startTransaction()
    await listItem.remove({ session: sess })
    await listItem.ownerId.listItems.pull(listItem)
    await listItem.ownerId.save({ session: sess })
    await sess.commitTransaction()

    // let itemFound = user.listItems.find((i) => i._id == listItemId)
    // if (!itemFound) {
    //   const error = new HttpError(
    //     'You are not authorized to update this list item',
    //     402
    //   )
    //   return next(error)
    // }
    // listItem = await ListItem.findById(listItemId)
  } catch (e) {
    const error = new HttpError(
      `Something went wrong, could not get the user. ${e}`,
      500
    )
    return next(error)
  }

  res.status(200).json({ success: true })
}

const updateListItem = async (req, res, next) => {
  // return {
  //   bookId,
  //   finishDate,
  //   startDate,
  //   notes,
  //   ownerId,
  //   rating,
  // }

  const userId = req.userData.userId
  const listItemId = req.params.id
  const updates = req.body
  let user, listItem, book
  try {
    // user = await User.findById(userId, '-password')
    // let itemFound = user.listItems.find((i) => i._id == listItemId)
    // if (!itemFound) {
    //   const error = new HttpError(
    //     'You are not authorized to update this list item',
    //     402
    //   )
    //   return next(error)
    // }

    listItem = await ListItem.findOneAndUpdate(
      { _id: listItemId, ownerId: userId },
      { ...updates },
      { returnDocument: 'after' }
    )
    console.log({ listItem })
  } catch (e) {
    const error = new HttpError(
      `Something went wrong, could not update the list item. ${e}`,
      500
    )
    return next(error)
  }
  // console.log(listItem)

  book = books.find((book) => book.id === listItem.bookId)
  // console.log({ listItem })
  if (!book) {
    const error = new HttpError('No book found', 404)
    return next(error)
  }

  // try {
  //   await listItem.save()
  // } catch (e) {
  //   const error = new HttpError(
  //     `Something went wrong, could not get the user. ${e}`,
  //     500
  //   )
  //   return next(error)
  // }

  res
    .status(200)
    .json({ listItem: { ...listItem.toObject({ getters: true }), book } })
}

exports.getListItems = getListItems
exports.addListItem = addListItem
exports.updateListItem = updateListItem
exports.deleteListItem = deleteListItem
// exports.getUserById = getUserById
// exports.updateUser = updateUser
