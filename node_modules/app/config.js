var express = require('express');
var app = express();

var realm = 'http://192.168.1.127:3000/';
if (app.get('env') === 'production') {
  realm = 'http://188.226.176.161/';
}
module.exports = {
	jwtSecret: 'disismuhs3cret',
	realm: realm
};