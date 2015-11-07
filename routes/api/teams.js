var express = require('express');
var router = express.Router();

var moment = require('moment');

var Team = require('app/db/models/Team')
var User = require('app/db/models/User')

var Promise = require('bluebird')


var createError = require('http-errors');


/**********************************************************/
/***				GET /api/teams/:teamid					***/
/**********************************************************/
/***	Get info about a specific team.					***/
/**********************************************************/
router.get('/:teamid', function(req, res, next) {
	//TODO: Doesn't send everything to users who shouldn't see everything

	var result = {};

	if(req.validtoken)
	{
	  		Team.where('id', req.params.teamid).fetch({
				withRelated: [{'users': function(qb){ qb.column('id', 'alias', 'steamid64','steam_name', 'avatar_small', 'avatar_medium', 'avatar_full', 'team_id'); }}]
			}).then(function(team) {
	  		if(team)
	  		{
				//res.status(200).json(team.toJSON());
				res.status(200).json(team.toJSON());


	  		}
	  		else
	  		{ 
	  			console.log('Team not found')
	  			next(new createError(404, 'Team does not exist'));
	  		}
	  	})
	}
	else
	{
		console.log('Forbidden: invalid token')
		next(new createError(401));
	}
});


/**********************************************************/
/***				POST /api/teams						***/
/**********************************************************/
/***	Create a team.									***/
/**********************************************************/

router.post('/', function(req, res, next) {
	//TODO: Doesn't send everything to users who shouldn't see everything

	var result = {};

	if(req.validtoken)
	{
		User.where('id', req.validtoken.user).fetch().then(function(user) 
		{
	  		if(user)
	  		{
	  			//If user isn't already in a team, continue
	  			if(!user.get('team_id'))
	  			{
	  				//Set up the values
		            team = new Team({
		              	name: req.body.name, 
		              	description: req.body.description,
		              	leader_id: req.validtoken.user
		              });

		            //Save the team, and when finished, update the user's FK (team_id) to the team's id
		            team.save().then(function(team){

		            	user.set({ team_id: team.get('id')})
			            user.save().then(function(user){
				  			res.status(200).json(team.toJSON());
			            })
		            })
	  			}
	  			else
	  			{
	  				console.log('User is already in a team')
	  				next(new createError(409, 'User is already in a team.'));
	  			}

	  		}
	  		else
	  		{
	  			console.log('invalid user')
	  			next(new createError(401, 'You do not have permission to perform this action.'));
	  		}
	  	})
	}
	else
	{
		console.log('Forbidden: invalid token')
		next(new createError(401));
	}
});


/**********************************************************/
/***				PUT /api/teams/:teamid				***/
/**********************************************************/
/***	Update a team.									***/
/**********************************************************/
router.put('/:teamid', function(req, res, next) {
	//TODO: Implement
	if(req.validtoken)
	{
		Team.where('id', req.params.teamid).fetch()
		.then(function(team){
			if(!team) next(new createError(404, 'Team does not exist.'));

			//TODO: Add admin rights
			if(team.get('leader_id') == req.validtoken.user)
			{
				//TODO: Make sure the promoted user is part of the team if leader_id is set.
				team.save({
					name: req.body.name || team.get('name'),
					description: req.body.description || team.get('description'),
					leader_id: req.body.leader_id || team.get('leader_id'),
				})
				.then(function () {
					res.json(team.toJSON());
				})
				.catch(function (err) {
					//TODO: Change to status code 500?
					next(new createError(400));
				});

			}
			else
			{
				console.log('Forbidden: invalid token')
				next(new createError(401, 'You do not have permission to perform this action.'));
			}
		})
	}
	else
	{
		console.log('Forbidden: invalid token')
		next(new createError(401));
	}
});

/**********************************************************/
/***				DELETE /api/teams/:teamid			***/
/**********************************************************/
/***	Delete a team.									***/
/**********************************************************/
router.delete('/:teamid', function(req, res, next) {
	//TODO: Implement
	if(req.validtoken)
	{
		Team.where('id', req.params.teamid).fetch()
		.then(function(team){
			if(!team) next(new createError(404, 'Team does not exist.'));

			//TODO: Add admin rights
			if(team.get('leader_id') == req.validtoken.user)
			{

				team.destroy()
				.then(function () {
					res.json();
				})
				.catch(function (err) {
					//TODO: Change to status code 500?
					next(new createError(400));
				});

			}
			else
			{
				console.log('Forbidden: invalid token')
				next(new createError(401, 'You do not have permission to perform this action.'));
			}
		})
	}
	else
	{
		console.log('Forbidden: invalid token')
		next(new createError(401));
	}
});


/**********************************************************/
/***			GET /api/teams/:teamid/users			***/
/**********************************************************/
/***	Get users in a team.							***/
/**********************************************************/
router.get('/:teamid/users', function(req, res, next) {

	if(req.validtoken)
	{
  		Team.where('id', req.params.teamid).fetch({
			withRelated: [{'users': function(qb){ qb.column('id', 'alias', 'steamid64','steam_name', 'avatar_small', 'avatar_medium', 'avatar_full', 'team_id'); }}]
		}).then(function(team) {
	  		if(team)
	  		{

				res.status(200).json(team.related('users').toJSON());

	  		}
	  		else
	  		{ 
	  			console.log('Team not found')
	  			next(new createError(404, 'Team does not exist.'));
	  		}
  		})


	}
	else
	{
		console.log('Forbidden: invalid token')
		next(new createError(401));
	}
});


/**********************************************************/
/***		DELETE /api/teams/:teamid/users/:userid		***/
/**********************************************************/
/***	Delete a user from the team (kick/leave)		***/
/**********************************************************/
router.delete('/:teamid/users/:userid', function(req, res, next) {
	function Delete()
	{
  		var tarUser = User.where('id', req.params.userid).where('team_id', req.params.teamid).fetch({withRelated: ['team', 'usergroup']});
  		var reqUser = User.where('id', req.validtoken.user).fetch({withRelated: ['team', 'usergroup']});

  		return Promise.join(reqUser, tarUser, function(reqUser, tarUser)
		{
			if(tarUser && reqUser)
			{
				if(tarUser.related('team').get('leader_id') == tarUser.get('id'))
				{
					//Can't delete if you're leader
					return Promise.reject(new createError(409, 'You cannot leave as leader.'));
				}
				//TODO: Make sure tarUser is in a team
				//TODO: Add checking for admin permissions
				else if(tarUser.get('id') === req.validtoken.user 
					|| tarUser.related('team').get('leader_id') == reqUser.get('id'))
				{
					return tarUser.set({team_id: null}).save()
				}
				else
				{
					return Promise.reject(new createError(401, 'You do not have permission to perform this action.'));
				}
			}
			else
			{
				return Promise.reject(new createError(404, 'User not found.'));
			}
		})
	}

	if(req.validtoken)
	{
		Delete()
		.then(function(user){
			res.status(200).json(user);
		})
		.catch(function(err){
			next(err);
		})
	}
	else
	{
		next(new createError(401, 'You do not have permission to perform this action.'));
	}
});





/**********************************************************/
/***		POST /api/team/:teamid/a/challenge				***/
/**********************************************************/
/***	Send a challenge to the team. 					***/
/**********************************************************/
router.post('/:teamid/challenge', function(req, res, next) {
	//TODO: Implement
	res.send();
});


/**********************************************************/
/***		POST /api/team/:teamid/a/joinrequest			***/
/**********************************************************/
/***	Send a request asking to join the team. 		***/
/**********************************************************/
router.post('/:teamid/joinrequest', function(req, res, next) {
	//TODO: Implement
	res.send();
});



module.exports = router;