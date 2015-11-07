var express = require('express');
var router = express.Router();

var User = require('app/db/models/User')
var moment = require('moment');


/**********************************************************/
/***					GET /api/users/:userid				***/
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
/***	Update current or another user.					***/
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
		if(req.validtoken.user == req.params.userid)
		{
			save();
		}
		else
		{
			//If the user isn't editing himself, we'll need to check his permissions
			User.where('id', req.validtoken.user).fetch({
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
/***					DELETE /api/users/:userid			***/
/**********************************************************/
/***	Delete current or another user.					***/
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
/***		POST /api/users/:userid/a/friendrequest			***/
/**********************************************************/
/***	Send friendrequest from current user to 		***/
/***	another.										***/
/**********************************************************/
router.post('/:userid/friendrequest', function(req, res, next) {
	console.log('FRIENDREQUEST')
	console.log('Sending friend request to user with id  ' + req.params.userid + '.')
	//id = req.params.id
	//TODO: Implement
	res.send();
})

/**********************************************************/
/***		POST /api/users/:userid/a/friendrequest			***/
/**********************************************************/
/***	Send teaminvite from current user to another.	***/
/**********************************************************/
router.post('/:userid/teaminvite', function(req, res, next) {
	console.log('TEAMINVITE')
	//id = req.params.id
	//TODO: Implement
	res.send();
})



module.exports = router;