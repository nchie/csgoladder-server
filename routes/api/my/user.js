var express = require('express');
var router = express.Router();

var User = require('app/db/models/User')
var moment = require('moment');

/**********************************************************/
/***					GET /api/my/user				***/
/**********************************************************/
/***	Get info about the logged in user.				***/
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
/***				PUT /api/my/user					***/
/**********************************************************/
/***	Update logged in user.							***/
/**********************************************************/
router.put('/', function(req, res, next) {
	if(req.validtoken)
	{
		User.forge({
			id: req.validtoken.user,
			alias: req.body.alias,
			real_name: req.body.real_name,
			email: req.body.email
		})
		.save()
		.then(function(user){
			res.status(200).json();
		})
		.catch(function(e){
			res.status(400).json({"errors":[{"message":"Database error."}]});
		})

	}
	else
	{
		console.log('Forbidden: invalid token')
		res.status(401).json({"errors":[{"message":"This action requires authentication."}]});
	}
});



/**********************************************************/
/***					DELETE /api/my/user 			***/
/**********************************************************/
/***	Delete logged in user.							***/
/**********************************************************/
router.delete('/', function(req, res, next) {

	if(req.validtoken)
	{
		//Check if the user is trying to delete itself or others
		//If trying to delete itself, make sure it's not CSRF and then delete

		//Else
		//	Check if the user has permission to delete users
		//	If they do, delete the user!
		//	Else return res.json({ status: 'error', data: 'NO_PERMISSION' });

	}
	else
	{
		console.log('Forbidden: invalid token')
		res.status(401).json({"errors":[{"message":"This action requires authentication."}]});
	}
});

/**********************************************************/
/***			POST /api/my/user/a/logout 				***/
/**********************************************************/
/***	Log out.										***/
/**********************************************************/
router.post('/a/logout', function(req, res, next) {
  var result = {};

  //TODO: Blacklist token
  res.cookie('access_token', '', { maxAge: 0, httpOnly: true /* TODO: SET secure: true */ });

  res.status(200).json();
});


module.exports = router;