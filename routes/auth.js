var express           = require('express');
var passport          = require('passport');
var SteamStrategy     = require('passport-steam').Strategy;
var requestIp         = require('request-ip');
var jwt               = require('jsonwebtoken');
var iptools           = require('app/tools/iplookup')
var User              = require('app/db/models/User');
var config            = require('../config');


var router = express.Router();



router.get('/steam', passport.authenticate('steam'));

router.get('/steam/return', 
  function(req, res, next) {
    passport.authenticate('steam', function(err, user, info){ 
      var payload = {
        user: {
          id: user.id
        },
      };

      var token = jwt.sign(payload, config.jwtSecret, {expiresIn : 60*60*24});


      

      res.cookie('access_token', token, { maxAge: 60*60*24*1000, httpOnly: true /* TODO: SET secure: true */ }); 

      res.redirect('/home'); 
    })(req, res, next)
  });


passport.use(new SteamStrategy({
    returnURL: config.realm + 'auth/steam/return',
    realm: config.realm,
    apiKey: 'A897DA262595847694E3304C6A93219D',
    passReqToCallback: true
  },
  function(req, identifier, profile, done) {
    //console.log(req)
    // asynchronous verification, for effect...
    process.nextTick(function () {

      ///////////////FIOXAAAAAAAAAAAAAA
      User.where('steamid64', profile._json.steamid).fetch().then(function(user){
        //If user already exists, update the data
        if(user)
        {
          //Lookup country from IP-address and update if changed
          ip = iptools.ipv6to4(requestIp.getClientIp(req));
          iptools.lookup(ip).then(function(result){
            user.set({ country_code: result.countryCode })
            user.save();
          }).catch(function(err){
            console.log(err)
          });

          user.set(
          {
            steam_name: profile._json.personaname,
            avatar_small: profile._json.avatar,
            avatar_medium: profile._json.avatarmedium,
            avatar_full: profile._json.avatarfull
          });
          user.save().then(function(updateduser){
            return done(null, updateduser);
          });
        }
        //If user didn't exist, create it
        else
        {
          // If profile is visible, fetch extra data
          if(profile._json.communityvisibilitystate === 3 && profile._json.profilestate === 1 )
          {

            user = new User({
              steamid64: profile._json.steamid,
              steam_name: profile._json.personaname,
              real_name: profile._json.realname,
              avatar_small: profile._json.avatar,
              avatar_medium: profile._json.avatarmedium,
              avatar_full: profile._json.avatarfull,
              steam_creation_date: new Date(profile._json.timecreated*1000),
              usergroup_name: "member"

            });

          }
          // Otherwise only fetch the basics
          else
          {

            user = new User({
              steamid64: profile._json.steamid,
              steam_name: profile._json.personaname,
              avatar_small: profile._json.avatar,
              avatar_medium: profile._json.avatarmedium,
              avatar_full: profile._json.avatarfull,
              usergroup_name: "member"

            });

          }

          user.save().then(function(newuser){

            //Lookup country from IP-address and update if changed
            ip = iptools.ipv6to4(requestIp.getClientIp(req));
            iptools.lookup(ip).then(function(result){
              newuser.set({ country_code: result.countryCode })
              newuser.save();
            }).catch(function(err){
              console.log(err)
            });

            return done(null, newuser);
          })
        }
      });
    })
  }
));






module.exports = router;