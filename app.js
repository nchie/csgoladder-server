var express           = require('express');
var path              = require('path');
var favicon           = require('serve-favicon');
var logger            = require('morgan');
var cookieParser      = require('cookie-parser');
var bodyParser        = require('body-parser');
var jwt               = require('jsonwebtoken');
var csrf              = require('csurf');

var app = express();

var config = require('./config');




// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
//app.use(csrf({ cookie: true }));


//Set the cookie XSRF-TOKEN to the CSRF-secret, which will be sent back in a header from angular.
app.use(function(req, res, next){
  //res.cookie('XSRF-TOKEN', req.csrfToken());
  next();
})


//Look for a valid JWT in cookies, if found, put it in req.validtoken
app.use(function(req,res,next){
  if(req.cookies.access_token)
    try {
      req.validtoken = jwt.verify(req.cookies.access_token, config.jwtSecret);
    } catch(err) {
      //Invalid token
    }

    next();
});

/*******************************/
/***         ROUTING         ***/
/*******************************/
var api = require('./routes/api');
var auth = require('./routes/auth');

app.use('/auth', auth);
app.use('/api', api);







/**
 * Development Settings
 */
if (app.get('env') === 'development') {
    console.log('dev env');
    // This will change in production since we'll be using the dist folder
    //app.use(express.static(path.join(__dirname, '../client')));
    // This covers serving up the index page
    //app.use(express.static(path.join(__dirname, '../client/.tmp')));
    //app.use(express.static(path.join(__dirname, '../client/src')));

    //app.use('/scripts', express.static(__dirname + '/../client/src/scripts'));
    app.use('/app', express.static(__dirname + '/../client/src/app'));
    app.use('/bower_components', express.static(__dirname + '/../client/bower_components'));
    app.use('/styles', express.static(__dirname + '/../client/.tmp/styles'));
    app.use('/img', express.static(__dirname + '/../client/src/img'));
    app.use('/vid', express.static(__dirname + '/../client/src/vid'));
    app.use('/views', express.static(__dirname + '/../client/src/views'));
    app.use('/templates', express.static(__dirname + '/../client/src/templates'));
    app.use('/fonts', express.static(__dirname + '/../client/src/fonts'));

    app.use('/robots.txt', function(req, res) {
        // Just send the index.html for other files to support HTML5Mode
        res.sendFile('client/src/robots.txt', { root: '../' });
    });

    app.all('/*', function(req, res, next) {
        //Set CSRF-cookie
        //res.cookie('pappa', 'koko', { maxAge: 60*60*24*1000 });
        // Just send the index.html for other files to support HTML5Mode
        res.sendFile('client/src/index.html', { root: '../' });
    });



    /*// Error Handling
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });*/
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
    app.use('/vid', express.static(__dirname + '/dist/vid'));
    app.use('/fonts', express.static(__dirname + '/dist/fonts'));

    app.use('/robots.txt', function(req, res) {
        res.sendFile('/dist/robots.txt', { root: __dirname });
    });

    app.all('/*', function(req, res, next) {
        // Just send the index.html for other files to support HTML5Mode
        
        res.sendFile('/dist/index.html', { root: __dirname });
    });

    /*// production error handler
    // no stacktraces leaked to user
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: {}
        });
    });*/
}



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  console.log('notfound')
  err.status = 404;
  next(err);
});

// error handlers

// API error handler
app.use(function (err, req, res, next) {
  console.log(err.statusCode)
  if(!err.statusCode)
    next(err);

  res.status(err.statusCode || 500).json({message: err.message});

})

// error handler
app.use(function (err, req, res, next) {
  if (err.code !== 'EBADCSRFTOKEN') return next(err)
  console.log(err)
  // handle CSRF token errors here
  res.status(403)
  res.send('form tampered with')
})


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
