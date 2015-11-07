var express = require('express');
var router = express.Router();

var moment = require('moment');

var Team = require('app/db/models/Team')
var User = require('app/db/models/User')


/**********************************************************/
/***				GET /api/teams/:teamid					***/
/**********************************************************/
/***	Get info about a specific team.					***/
/**********************************************************/
router.get('/', function(req, res, next) {
	if(req.validtoken)
	{
	  	User.where('id', req.validtoken.user).fetch({
				withRelated: ['team', 'usergroup']
			}).then(function(user) {
	  		if(user)
	  		{
	  			res.status(200).json(user.toJSON());
	  		}
	  		else
	  		{
	  			console.log('invalid user')
	  			res.status(401).json({"errors":[{"message":"Not authenticated."}]});
	  		}
	  	})
	}
	else
	{
		console.log('Forbidden: invalid token')
		res.status(401).json({"errors":[{"message":"Not authenticated."}]});
	}
});


/**********************************************************/
/***				DELETE /api/teams/:teamid			***/
/**********************************************************/
/***	Delete a team.									***/
/**********************************************************/
router.delete('/', function(req, res, next) {
	var result = {};
	console.log('logged out')
	//TODO: Blacklist token
	res.cookie('access_token', '', { maxAge: 0, httpOnly: true /* TODO: SET secure: true */ });

	res.status(200).json();
});




module.exports = router;