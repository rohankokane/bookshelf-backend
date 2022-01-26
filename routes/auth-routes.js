const express = require('express')
const { check } = require('express-validator')
const authController = require('../controllers/auth-controllers')

const router = express.Router()

router.post(
  '/register',
  [check('username').not().isEmpty(), check('password').isLength({ min: 6 })],
  authController.register
)
router.post('/login', authController.login)

module.exports = router
