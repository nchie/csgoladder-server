var express = require('express');
var router = express.Router();

var db = require('app/db')
var iptools = require('app/tools/iplookup')
var moment = require('moment');

var requestIp = require('request-ip');


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
 
	  			//Lookup country from IP-address and update if changed
	  			ip = iptools.ipv6to4(requestIp.getClientIp(req));
	  			iptools.lookup(ip).then(function(result){
					user.updateAttributes({ countryCode: result.country_code })
	  			}).catch(function(err){
	  				console.log(err)
	  			});

	  			//console.log(ip);
	  			res.json(result);
	  		}
	  		else
	  		{
	  			console.log('invalid user')
	  			result.status = "error";
	  			result.message = 'NO_LOGIN';
	  			res.json(result);
	  		}
	  	})
	}
	else
	{
		console.log('Forbidden: invalid token')
		result.status = "error";
		result.message = 'NO_LOGIN';
		res.json(result);
	}
});

router.get('/:id', function(req, res, next) {
	//TODO: Doesn't send everything to users who shouldn't see everything

	var result = {};

	if(req.validtoken)
	{
	  	db.User.findOne({where: {id : req.params.id}, include: [db.Team]}).then(function(user) {
	  		if(user)
	  		{
	  			result.status = "success";
	  			result.data = user;
	  			//res.json(result);
	  			//TODO: Remove fake delay
				setTimeout(function() {
					res.json(result);
				}, 1000);
	  		}
	  		else
	  		{
	  			console.log('User not found')
	  			result.status = "error";
	  			result.message = 'NO_LOGIN';
	  			res.json(result);
	  		}
	  	})
	}
	else
	{
		console.log('Forbidden: invalid token')
		result.status = "error";
		result.message = 'NO_LOGIN';
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
	  			result.message = 'INVALID_USER';
	  			res.json(result);
	  		}
	  	})
	}
	else
	{
		console.log('Forbidden: invalid token')
		result.status = "error";
		result.message = 'NO_LOGIN';
		res.json(result);
	}
});







module.exports = router;