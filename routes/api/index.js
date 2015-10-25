var express = require('express');
var router = express.Router();

var db = require('app/db')

var lobbies = require('./lobbies')
var users = require('./users')
var teams = require('./teams')

router.use('/users', users)
router.use('/lobbies', lobbies)
router.use('/teams', teams)


router.get('/search/:query', function(req, res, next) {
	//
	console.log(req.params.query+'%')
	if(req.validtoken)
	{
	  	db.User.findAll({where: {displayName : { $iLike: req.params.query+'%'}}}).then(function(user) {
	  		if(user)
	  			res.json(user);
	  		else
	  		{
	  			console.log('User not found')
	  			res.sendStatus(404);
	  		}
	  	})
	}
	else
	{
		console.log('User not found')
		res.sendStatus(404);
	}
});

module.exports = router;