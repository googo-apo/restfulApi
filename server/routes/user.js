const express = require('express')

const user = require('../controllers/user')

const router = express.Router()

router.post('/signup',user.signup)

router.post('/singin', user.signin)

router.get('/users', user.getUserLists)
router.put('/users/:id', user.editUserById)
router.delete('/users/:id', user.delUserById)

module.exports = router