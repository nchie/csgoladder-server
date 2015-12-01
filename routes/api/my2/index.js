var express = require('express');
var router = express.Router();


var user = require('./user')
var team = require('./team')

router.use('/user', user)
router.use('/team', team)





module.exports = router;