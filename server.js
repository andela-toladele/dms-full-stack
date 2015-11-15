var express = require('express'); // call express
var app = express(); // define our app using express
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var session = require('express-session');

mongoose.connect('mongodb://localhost/dmsfullstackdb');

var port = process.env.PORT || 8000; // set our port
var staticdir = process.env.NODE_ENV === 'production' ? 'dist.prod' : 'dist.dev'; // get static 
require('./app/index')(app);

console.log(staticdir);

app.use(express.static(__dirname + '/' + staticdir));

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
