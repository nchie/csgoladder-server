var express = require('express');
var router = express.Router();

var redis = require("redis"),
    redisclient = redis.createClient();

var io = require('app/socket')



router.get('/:name', function(req, res, next) {
	redisclient.hget("lobbies", req.params.name, function(err, obj){
		res.json(JSON.parse(obj))
	});
});

router.put('/', function(req, res, next) {
	if(req.body.teamname && req.body.maps && req.body.rating )
	{
		var obj = {
			desc: req.body.desc,
			maps: req.body.maps,
			rating: req.body.rating
		}
		redisclient.hset("lobbies", req.body.teamname, JSON.stringify(obj))

		io.emit('addLobby', {
				name: req.body.teamname,
				rating: req.body.rating,
				description: req.body.desc,
				maps: req.body.maps
			})

		res.send();
	}
});


router.delete('/:name', function(req, res, next) {
	redisclient.hdel("lobbies", req.params.name);
	io.emit('delLobby', {
			name: req.params.name
		})
	res.send();
});



router.get('/', function(req, res, next) {

	var result = {};

	redisclient.hgetall(("lobbies"), function(err, obj){
		var array = [];
		for(var i in obj)
		{
			//Remove comment if needed
			obj[i] = JSON.parse(obj[i]);
			tempobj = {
				name: i,
				rating: obj[i].rating,
				description: obj[i].desc,
				maps: obj[i].maps
			};
			array.push(tempobj);
		}
		result.status = 'success';
		result.data = array;
		res.json(result)
	});

});

module.exports = router;