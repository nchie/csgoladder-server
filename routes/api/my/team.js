var express = require('express');
var router = express.Router();

var User = require('app/db/models/User')
var moment = require('moment');

/**********************************************************/
/***					GET /api/users					***/
/**********************************************************/
/***	Get info about the logged in user's team		***/
/**********************************************************/
router.get('/', function(req, res, next) {
	if(req.validtoken)
	{
	  	User.where('id', req.validtoken.user).fetch({
				withRelated: ['team']
			}).then(function(user) {
	  		if(user)
	  		{
	  			user.related('team').fetch({
	  				withRelated: [{'users': function(qb){ qb.column('team_id', 'id', 'alias', 'steamid64','steam_name', 'avatar_small', 'avatar_medium', 'avatar_full'); }}]
	  			}).then(function(team){
	  				if(team)
	  				{
	  					res.status(200).json(team.toJSON())
	  					//res.json({ status: 'success', data: team.toJSON() });
	  				}
	  				else
	  				{
	  					res.status(400).json({"errors":[{"message":"User is not in any team."}]})
	  				}
	  			})
	  			//res.json({ status: 'success', data: user.related('team').toJSON() });
	  		}
	  		else
	  		{
	  			console.log('invalid user')
	  			res.status(401).json({"errors":[{"message":"This action requires authentication."}]});
	  		}
	  	})
	}
	else
	{
		console.log('Forbidden: invalid token')
		res.status(401).json({"errors":[{"message":"This action requires authentication."}]});
	}
});


/**********************************************************/
/***				PUT /api/users/:id					***/
/**********************************************************/
/***	Update current or another user.					***/
/**********************************************************/
router.put('/', function(req, res, next) {
	if(req.validtoken)
	{
	  	User.where('id', req.validtoken.user).fetch({
				withRelated: ['team']
			}).then(function(user) {
	  		if(user)
	  		{
	  			if(user.get('team_id'))
	  			{
	  				//TODO: Check to make sure that the requesting user is the leader of the team
	  				user.related('team').set({
	  					name: req.body.name,
	  					description: req.body.description
	  				}).save().then(function(result){
	  					res.status(200).json();
	  				})
	  			}
	  			else
	  			{
	  				res.status(400).json({"errors":[{"message":"User is not in any team."}]});
	  			}
	  		}
	  		else
	  		{
	  			console.log('invalid user')
	  			res.status(401).json({"errors":[{"message":"This action requires authentication."}]});
	  		}
	  	})
	}
	else
	{
		console.log('Forbidden: invalid token')
		res.status(401).json({"errors":[{"message":"This action requires authentication."}]});
	}
});



/**********************************************************/
/***					DELETE /api/users/:id			***/
/**********************************************************/
/***	Delete current or another user.					***/
/**********************************************************/
router.delete('/', function(req, res, next) {

	if(req.validtoken)
	{
		//Check if the user is trying to delete itself or others
		//If trying to delete itself, make sure it's not CSRF and then delete

		//Else
		//	Check if the user has permission to delete users
		//	If they do, delete the user!
		//	Else return res.json({ status: 'fail', data: 'User does not have permission' });

	}
	else
	{
		console.log('Forbidden: invalid token')
		res.status(401).json({"errors":[{"message":"This action requires authentication."}]});
	}
});



/**********************************************************/
/***		POST /api/my/team/a/leave					***/
/**********************************************************/
/***	Leave the team. 						 		***/
/**********************************************************/
router.post('/a/leave', function(req, res, next) {
	if(req.validtoken)
	{
		User.forge({
			id: req.validtoken.user,
			team_id: null
		})
		.save()
		.then(function(user){
			res.status(200).json();
		});
	}
	else
	{
		console.log('Forbidden: invalid token')
		res.status(401).json({"errors":[{"message":"This action requires authentication."}]});
	}

});


/**********************************************************/
/***		POST /api/my/team/a/kick					***/
/**********************************************************/
/***	Kick a member of the team.				 		***/
/**********************************************************/
//TODO: Remove this because it isn't used
router.post('/a/kick', function(req, res, next) {
	console.log('KICK')
	console.log('Trying to kick user: ' + req.body.steam_name)
	//TODO: Implement
	//Make sure the user is leader before setting the team_id of the other user to null.
	res.send();
});

module.exports = router;