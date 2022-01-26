const { validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const HttpError = require('../models/http-error')
const User = require('../models/user')

const register = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    )
  }

  const { username, password } = req.body

  let existingUser
  try {
    existingUser = await User.findOne({ username: username })
  } catch (err) {
    const error = new HttpError(
      'Username already exists, try with different Username.',
      500
    )
    return next(error)
  }

  if (existingUser) {
    const error = new HttpError(
      'User exists already, please login instead.',
      422
    )
    return next(error)
  }

  let hashedPassword
  try {
    hashedPassword = await bcrypt.hash(password, 12)
  } catch (err) {
    const error = new HttpError('Could not create user, please try again.', 500)
    return next(error)
  }

  const createdUser = new User({
    username,
    password: hashedPassword,
  })
  // console.log(createdUser)
  try {
    await createdUser.save()
  } catch (err) {
    const error = new HttpError(
      `Signing up failed, please try again later. ${err}`,
      500
    )
    return next(error)
  }

  let token
  try {
    token = jwt.sign(
      { userId: createdUser.id, username: createdUser.username },
      process.env.JWT_KEY
    )
  } catch (err) {
    const error = new HttpError(
      'Signing up failed, please try again later.',
      500
    )
    return next(error)
  }

  let userData = createdUser.toObject({ getters: true })
  delete userData.password
  res.status(201).json({
    user: { userId: createdUser.id, token: token, ...userData },
  })
}

const login = async (req, res, next) => {
  const { username, password } = req.body

  let existingUser

  try {
    existingUser = await User.findOne({ username: username })
  } catch (err) {
    const error = new HttpError(
      'Logging in failed, please try again later.',
      500
    )
    return next(error)
  }

  if (!existingUser) {
    const error = new HttpError(
      'Invalid credentials, could not log you in.',
      403
    )
    return next(error)
  }

  let isValidPassword = false
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password)
  } catch (err) {
    const error = new HttpError(
      'Could not log you in, please check your credentials and try again.',
      500
    )
    return next(error)
  }

  if (!isValidPassword) {
    const error = new HttpError(
      'Invalid credentials, could not log you in.',
      403
    )
    return next(error)
  }

  let token
  try {
    token = jwt.sign(
      { userId: existingUser.id, username: existingUser.username },
      process.env.JWT_KEY
    )
  } catch (err) {
    const error = new HttpError(
      'Logging in failed, please try again later.',
      500
    )
    return next(error)
  }

  delete existingUser.password
  existingUser = existingUser.toObject({ getters: true })
  res.status(201).json({
    user: { userId: existingUser.id, token: token, ...existingUser },
  })
}

exports.register = register
exports.login = login
