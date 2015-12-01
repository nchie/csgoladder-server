var express = require('express');
var router = express.Router();

var User = require('app/db/models/User')
var Team = require('app/db/models/Team')
var TeamInvite = require('app/db/models/TeamInvite')
var moment = require('moment');

var Promise = require('bluebird');

var createError = require('http-errors');


/**********************************************************/
/***					GET /api/users.					***/
/**********************************************************/
/***	Get list of users.								***/
/**********************************************************/
router.get('/', function(req, res, next) {
	//TODO: Implement
	res.send();
});

/**********************************************************/
/***					GET /api/users/:userid			***/
/**********************************************************/
/***	Get info about a specific user.					***/
/**********************************************************/
router.get('/:userid', function(req, res, next) {
	//TODO: Doesn't send everything to users who shouldn't see everything
	if(req.validtoken)
	{
	  		User.where('id', req.params.userid).fetch({
				withRelated: ['team']
			}).then(function(user) {
	  		if(user)
	  		{
	  			var data = user.toJSON();

	  			//Email should not be sent to others
	  			delete data.email;

	  			//TODO: Remove fake delay
				setTimeout(function() {
					res.status(200).json(data);
				}, 1000);
	  		}
	  		else
	  		{
	  			console.log('User not found')
	  			next(new createError(404, 'User does not exit.'));
	  		}
	  	})
	}
	else
	{
		console.log('Forbidden: invalid token')
		next(new createError(401, 'You do not have permission to perform this action.'));
	}
});

/**********************************************************/
/***					PUT /api/users/:userid			***/
/**********************************************************/
/***	Update a user.									***/
/**********************************************************/
router.put('/:userid', function(req, res, next) {
	function save()
	{
		User.forge({id : req.params.userid})
		.fetch()
		.then(function(user){
			user.save({
				alias: req.body.alias || user.get('alias'),
				real_name: req.body.real_name || user.get('real_name'),
				email: req.body.email || user.get('email'),
			})
			.then(function () {
				res.json(user.toJSON());
			})
			.catch(function (err) {
				//TODO: Change to status code 500?
				next(new createError(400));
			});
		})
	}


	if(req.validtoken)
	{
		if(req.validtoken.user.id == req.params.userid)
		{
			save();
		}
		else
		{
			//If the user isn't editing himself, we'll need to check his permissions
			User.where('id', req.validtoken.user.id).fetch({
		  		withRelated: ['usergroup']
		  	}).then(function(user) {
		  		if(user)
		  		{
		  			//If usergroup has rights to edit other users
		  			if(user.related('usergroup').get('p_edit_users'))
		  			{
						save();
		  			}
		  			else
		  			{
		  				next(new createError(401, 'You do not have permission to perform this action.'));
		  			}
		  		}
		  		else
		  		{
		  			next(new createError(404, 'User does not exist.'));
		  		}
		  	})
		}
	}
	else
	{
		console.log('Forbidden: invalid token')
		next(new createError(401, 'You do not have permission to perform this action.'));
	}
});



/**********************************************************/
/***				DELETE /api/users/:userid			***/
/**********************************************************/
/***	Delete a user.									***/
/**********************************************************/
router.delete('/:userid', function(req, res, next) {

	if(req.validtoken)
	{
		//Check if the user is trying to delete itself or others

		//Else
		//	Check if the user has permission to delete users
		//	If they do, delete the user!
		//	Else return res.json({ status: 'error', data: 'NO_PERMISSION' });

	}
	else
	{
		console.log('Forbidden: invalid token')
		next(new createError(401, 'You do not have permission to perform this action.'));
	}
});


/**********************************************************/
/***		POST /api/users/:userid/a/friendrequest		***/
/**********************************************************/
/***	Send friendrequest from current user to 		***/
/***	another.										***/
/**********************************************************/
router.post('/:userid/friendrequests', function(req, res, next) {
	console.log('FRIENDREQUEST')
	console.log('Sending friend request to user with id  ' + req.params.userid + '.')
	//id = req.params.id
	//TODO: Implement
	res.send();
})

/**********************************************************/
/***	PUT /api/users/:userid/teaminvite/:teamid		***/
/**********************************************************/
/***	Send invite to :team to :user.					***/
/**********************************************************/
router.put('/:userid/teaminvites/:teamid', function(req, res, next) {
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
})

/**********************************************************/
/***		GET /api/users/:userid/teaminvite 			***/
/**********************************************************/
/***	Get all current invites sent to this player.	***/
/**********************************************************/
router.get('/:userid/teaminvite', function(req, res, next) {
	console.log('GET /api/users/:userid/friendrequest');
	//TODO: Implement
	res.send();
})

module.exports = router;