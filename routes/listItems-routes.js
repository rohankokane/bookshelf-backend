const express = require('express')
const { check } = require('express-validator')

const listItemControllers = require('../controllers/listItems-controllers')
const checkAuth = require('../middleware/check-auth')

const router = express.Router()

router.use(checkAuth)
// api/list-items

router.get('/', listItemControllers.getListItems)
router.post('/', listItemControllers.addListItem)
router.patch('/:id', listItemControllers.updateListItem)
router.delete('/:id', listItemControllers.deleteListItem)

module.exports = router
