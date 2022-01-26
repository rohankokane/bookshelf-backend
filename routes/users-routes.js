const express = require('express')
const { check } = require('express-validator')

const usersController = require('../controllers/users-controllers')
const checkAuth = require('../middleware/check-auth')

const router = express.Router()

router.use(checkAuth)

// user/bootstrap data.listItems
router.get('/bootstrap', usersController.bootstrap)

module.exports = router
