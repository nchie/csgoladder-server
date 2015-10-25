var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var passport      = require('passport');
var SteamStrategy = require('passport-steam').Strategy;
var jwt           = require('jsonwebtoken');

var db            = require('app/db');
var socket            = require('app/socket')

var api           = require('./routes/api');

var app = express();


jwt.secret     = 'disismuhs3cret'

//test

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(function(req,res,next){
  // invalid token - synchronous
  if(req.cookies.access_token)
    //console.log('http cookies:')
    //console.log(req.cookies.access_token)
    try {
      req.validtoken = jwt.verify(req.cookies.access_token, jwt.secret);
    } catch(err) {
      //Invalid token
    }

    next();
});

app.use('/api', api);

passport.use(new SteamStrategy({
    returnURL: 'http://188.226.176.161/auth/steam/return',
    realm: 'http://188.226.176.161/',
    apiKey: 'A897DA262595847694E3304C6A93219D',
    passReqToCallback: true
  },
  function(req, identifier, profile, done) {
    //console.log(req)
    // asynchronous verification, for effect...
    process.nextTick(function () {
      db.User.findOne({where: {openId : identifier}}).then(function(user) {
        console.log(profile._json.timecreated*1000)
        if(user)
          user.updateAttributes(
          {
            displayName: profile._json.personaname,
            avatarSmall: profile._json.avatar,
            avatarMedium: profile._json.avatarmedium,
            avatarFull: profile._json.avatarfull
          }).then(function(updateduser){
            return done(null, updateduser);
          });
        else
        {
          //console.log(profile._json)
          //If profile is visible, fetch extra data
          if(profile._json.communityvisibilitystate === 3 && profile._json.profilestate === 1 )
            user = db.User.build({
              openId: identifier,
              steamId64: profile._json.steamid,
              displayName: profile._json.personaname,
              realName: profile._json.realname,
              avatarSmall: profile._json.avatar,
              avatarMedium: profile._json.avatarmedium,
              avatarFull: profile._json.avatarfull,
              countryCode: profile._json.loccountrycode,
              steamCreationDate: new Date(profile._json.timecreated*1000),
              usergroup_name: "member"
            });
          else
            user = db.User.build({
              openId: identifier,
              steamId64: profile._json.steamid,
              displayName: profile._json.personaname,
              avatarSmall: profile._json.avatar,
              avatarMedium: profile._json.avatarmedium,
              avatarFull: profile._json.avatarfull,
              usergroup_name: "member"
            });
          user.save().then(function(newuser){
            console.log("User id: " + newuser.id)
            return done(null, newuser);
          })
          //console.log(user);
        }
      })
    });
  }
));






app.get('/auth/steam', passport.authenticate('steam'));

app.get('/auth/steam/return', 
  function(req, res, next) {
    passport.authenticate('steam', function(err, user, info){ 
      var payload = {
        user: user.id
      };

      var token = jwt.sign(payload, jwt.secret, {expiresIn : 60*60*24});
      res.cookie('access_token', token, { maxAge: 60*60*24*1000, httpOnly: true /* TODO: SET secure: true */ }); 

      res.redirect('/'); 
    })(req, res, next)
  });



















/**
 * Development Settings
 */
if (app.get('env') === 'development') {
    console.log('dev env');
    // This will change in production since we'll be using the dist folder
    //app.use(express.static(path.join(__dirname, '../client')));
    // This covers serving up the index page
    //app.use(express.static(path.join(__dirname, '../client/.tmp')));
    //app.use(express.static(path.join(__dirname, '../client/app')));

    app.use('/scripts', express.static(__dirname + '/../client/app/scripts'));
    app.use('/bower_components', express.static(__dirname + '/../client/bower_components'));
    app.use('/styles', express.static(__dirname + '/../client/.tmp/styles'));
    app.use('/img', express.static(__dirname + '/../client/app/img'));
    app.use('/views', express.static(__dirname + '/../client/app/views'));
    app.use('/templates', express.static(__dirname + '/../client/app/templates'));

    app.all('/*', function(req, res, next) {
        // Just send the index.html for other files to support HTML5Mode
        res.sendFile('client/app/index.html', { root: '../' });
    });



    // Error Handling
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

/**
 * Production Settings
 */
if (app.get('env') === 'production') {

    // changes it to use the optimized version for production
    //app.use(express.static(path.join(__dirname, '/dist')));

    app.use('/scripts', express.static(__dirname + '/dist/scripts'));
    app.use('/styles', express.static(__dirname + '/dist/styles'));
    app.use('/img', express.static(__dirname + '/dist/img'));

    app.use('/robots.txt', function(req, res, next) {
        // Just send the index.html for other files to support HTML5Mode
        res.sendFile('/dist/robots.txt', { root: __dirname });
    });

    app.all('/*', function(req, res, next) {
        // Just send the index.html for other files to support HTML5Mode
        res.sendFile('/dist/index.html', { root: __dirname });
    });

    // production error handler
    // no stacktraces leaked to user
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: {}
        });
    });
}



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  console.log('notfound')
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    console.log(err)
    res.status(err.status || 500);
    res.send(err.message)
    /*res.render('error', {
      message: err.message,
      error: err
    });*/
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
      res.send('Error: ' + err.message)
  /*
  res.render('error', {
    message: err.message,
    error: {}
  });*/
});










module.exports = app;
