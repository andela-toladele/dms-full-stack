var express = require('express'); // call express
var app = express(); // define our app using express
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var session = require('express-session');

mongoose.connect('mongodb://localhost/dmsapidb');



var port = 8080;

require('./app/index')(app);


// application -------------------------------------------------------------
app.get('/*', function(req, res) {
  res.sendfile('./public/index.html');
});

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
