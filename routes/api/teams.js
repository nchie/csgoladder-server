var express = require('express');
var router = express.Router();

var db = require('app/db')
var moment = require('moment');


/* POST */
router.get('/me', function(req, res, next) {
	var result = {};

	//result.status = "INVALID_TOKEN";

	if(req.validtoken)
	{
	  	db.User.findOne({where: {id : req.validtoken.user}, include: [db.Team]}).then(function(user) {
	  		if(user)
	  		{
	  			result.status = "success";
	  			result.data = user;
	  			res.json(result);
	  		}
	  		else
	  		{
	  			console.log('invalid user')
	  			result.status = "error";
	  			result.message = 'Invalid user';
	  			res.json(result);
	  		}
	  	})
	}
	else
	{
		console.log('Forbidden: invalid token')
		result.status = "error";
		result.message = 'Invalid token';
		res.json(result);
	}
});

router.get('/:id', function(req, res, next) {
	//TODO: Doesn't send everything to users who shouldn't see everything

	var result = {};

	if(req.validtoken)
	{
	  	db.Team.findOne({where: {id : req.params.id}, include: [db.User]}).then(function(team) {
	  		if(team)
	  		{
	  			result.status = "success";
	  			result.data = team;
	  			//res.json(result);
	  			//TODO: Remove fake delay
				res.json(result);

	  		}
	  		else
	  		{ 
	  			console.log('Team not found')
	  			result.status = "error";
	  			result.message = 'INVALID_TEAM';
	  			res.json(result);
	  		}
	  	})
	}
	else
	{
		console.log('Forbidden: invalid token')
		result.status = "error";
		result.message = 'INVALID_TOKEN';
		res.json(result);
	}
});

router.put('/', function(req, res, next) {

	var result = {};

	var date = moment(req.body.birthDate)
	var startDate = moment("1900-01-01", "YYYY-MM-DD");
	var endDate = moment("2010-01-01", "YYYY-MM-DD");

	console.log(moment(req.body.birthDate, "YYYYMMDD").toDate())
	if(req.validtoken)
	{
	  	db.User.findOne({where: {id : req.validtoken.user}}).then(function(user) {
	  		if(user)
	  		{
				user.updateAttributes({
					realName: req.body.realName,
					email: req.body.email,
					countryCode: req.body.countryCode,
					birthDate: new Date(req.body.birthDate)
				})
				.then( function(updateduser){
		  			result.status = "success";
		  			result.data = "";
		  			res.json(result);
				},function(error)
				{
		  			result.status = "error";
		  			result.message = "Database error";
		  			res.json(result);
				});

	  		}
	  		else
	  		{
	  			console.log('User not found')
	  			result.status = "error";
	  			result.message = 'User not found';
	  			res.json(result);
	  		}
	  	})
	}
	else
	{
		console.log('Forbidden: invalid token')
		result.status = "error";
		result.message = 'Invalid token';
		res.json(result);
	}
});







module.exports = router;