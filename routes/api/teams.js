var express = require('express');
var router = express.Router();

var moment = require('moment');

var Team = require('app/db/models/Team')
var User = require('app/db/models/User')
var TeamInvite = require('app/db/models/TeamInvite')

var Promise = require('bluebird');


var createError = require('http-errors');

/**********************************************************/
/***				GET /api/teams						***/
/**********************************************************/
/***	Get list of teams.								***/
/**********************************************************/
router.get('/', function(req, res, next) {
	//TODO: Implement
	res.send();
});

/**********************************************************/
/***				GET /api/teams/:teamid				***/
/**********************************************************/
/***	Get a specific team.							***/
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
		User.where('id', req.validtoken.user.id).fetch().then(function(user) 
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
		              	leader_id: req.validtoken.user.id
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
			if(team.get('leader_id') == req.validtoken.user.id)
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
			if(team.get('leader_id') == req.validtoken.user.id)
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
/***		PUT /api/teams/:teamid/users/:userid		***/
/**********************************************************/
/***	Add a user to the team.							***/
/**********************************************************/
router.put('/:teamid/users/:userid', function(req, res, next) {
	//TODO: Implement
	//If not admin, make sure that:
	//*  user is not already in a team
	//*  If from member of team: make sure user has actually requested to join the team, and then delete the request.
	//*  If from user: make sure team has actually invited him, and then delete the invite.
	//If admin: force it?

	function Invite()
	{
  		var reqUser = User.where('id', req.validtoken.user.id).fetch({withRelated: ['usergroup']});
  		var tarUser;
  		if(req.validtoken.user.id === req.params.userid)
  			{	tarUser = reqUser;	}
  		else
  		{	tarUser = User.where('id', req.params.userid).fetch();	}

  		var team 	= Team.where('id', req.params.teamid).fetch({withRelated: ['teaminvites']});

  		return Promise.join(reqUser, tarUser, team, function(reqUser, tarUser, team)
		{
			console.log(reqUser.get('id') +" - "+ tarUser.get('id') +" - "+ team.get('id'))
			
			console.log()

			return Promise.reject(new createError(401, 'You can\'t invite to this team.'));
		})
	}

	if(req.validtoken)
	{
		Invite()
		.then(function(){
			res.status(200).json();
		})
		.catch(function(err){
			next(err);
		})

	}
	else
	{
		console.log('Forbidden: invalid token')
		next(new createError(401, 'You do not have permission to perform this action.'));
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
  		var reqUser = User.where('id', req.validtoken.user.id).fetch({withRelated: ['team', 'usergroup']});

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
				else if(tarUser.get('id') === req.validtoken.user.id
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
/***  	 	GET /api/teams/:teamid/teaminvites			***/
/**********************************************************/
/***	Get all active invites from :team.				***/
/**********************************************************/
router.get('/:teamid/teaminvites', function(req, res, next) {
	//TODO: Implement
	res.send();
});

/**********************************************************/
/***   GET /api/teams/:teamid/teaminvite/:userid		***/
/**********************************************************/
/***	Check if :user is invited to :team.				***/
/**********************************************************/
router.get('/:teamid/teaminvites/:userid', function(req, res, next) {
	//TODO: Implement
	res.send();
});


/**********************************************************/
/***	PUT /api/teams/:teamid/teaminvites/:userid		***/
/**********************************************************/
/***	Send invite to :team to :user.					***/
/**********************************************************/
router.put('/:teamid/teaminvites/:userid', function(req, res, next) {
	console.log('TEAMINVITE')
	//LIST OF CASES:
	//-User is already on the team
	//-User does not exist
	//-Inviter is not in any team
	//-User is already invited
	//-Inviter not found (deleted for example)
	//-Inviter is not logged in

	function Invite()
	{
  		var tarUser = User.where('id', req.params.userid).fetch();
  		var reqUser = User.where('id', req.validtoken.user.id).fetch({withRelated: ['usergroup']});
  		var team 	= Team.where('id', req.params.teamid).fetch();

  		return Promise.join(reqUser, tarUser, team, function(reqUser, tarUser, team)
		{
			console.log('User' + reqUser.get('id') + " trying to invite user"+ tarUser.get('id') + " to team"+team.get('id'));
			if(tarUser && reqUser && team)
			{
				if(true) //TODO: Change this to check if user is admin or not!
				{
					if(reqUser.get('team_id') !== team.get('id'))
					{
						return Promise.reject(new createError(401, 'You can\'t invite to this team.'));
					}
					if(tarUser.get('team_id') === team.get('id'))
					{
						return Promise.reject(new createError(409, 'User is already in the team.'));
					}

					return TeamInvite.forge({team_id : team.get('id'), user_id: tarUser.get('id')}).save()
					.catch(function(e)
					{
						return Promise.reject(new createError(409, 'User is already invited to this team.'));
					})
				}
			}
			else
			{
				return Promise.reject(new createError(404, 'Not found.'));
			}
		})
	}

	if(req.validtoken)
	{
		Invite()
		.then(function(){
			res.status(200).json();
		})
		.catch(function(err){
			next(err);
		})

	}
	else
	{
		console.log('Forbidden: invalid token')
		next(new createError(401, 'You do not have permission to perform this action.'));
	}
});



/**********************************************************/
/***   DELETE /api/teams/:teamid/teaminvite/:userid		***/
/**********************************************************/
/***	Uninvite a user from the team.					***/
/**********************************************************/
router.delete('/:teamid/teaminvites/:userid', function(req, res, next) {
	//TODO: Implement
	res.send();
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