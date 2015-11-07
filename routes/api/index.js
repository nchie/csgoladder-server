var express = require('express');
var router = express.Router();

//var db = require('app/db')

var lobbies = require('./lobbies')
var users = require('./users')
var teams = require('./teams')
var session = require('./session')


router.use('/users', users)
router.use('/lobbies', lobbies)
router.use('/teams', teams)
router.use('/session', session)


var User = require('app/db/models/User')


router.get('/search/:query', function(req, res, next) {
	//
	console.log(req.params.query+'%')
	if(req.validtoken)
	{
	  	User.where('steam_name', 'ILIKE', req.params.query+'%').fetchAll().then(function(users) {
	  		if(users)
	  		{
	  			res.status(200).json(users.toJSON());
	  		}
	  		else
	  		{
	  			//This should never happen:
	  			res.status(404).json({"errors":[{"message":"No users found"}]});
	  		}
	  	})
	}
	else
	{
		res.status(401).json({"errors":[{"message":"This action requires authentication."}]});
	}
});

module.exports = router;