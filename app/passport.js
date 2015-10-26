// load all the things we need
var LocalStrategy = require('passport-local').Strategy;

// load up the user model
var User = require('./schema')['User'];

// expose this function to our app using module.exports
module.exports = function(passport) {



  // used to serialize the user for the session
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  // used to deserialize the user
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

  passport.use('local-login', new LocalStrategy({
      // by default, local strategy uses username and password, we will override with email
      usernameField: 'username',
      passwordField: 'password',
      passReqToCallback: true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) {

      // asynchronous
      // User.findOne wont fire unless data is sent back
      process.nextTick(function() {

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({
          $or: [{
            'username': username
          }, {
            'email': username
          }]
        }, function(err, user) {
          // if there are any errors, return the error
          if (err) {
            return done(err);
          }

          // check to see if theres already a user with that email
          if (!user) {
            return done(null, null, 'authentication failed');
          }

          // if the user is found but the password is wrong
          if (password && user.password.toString() === password.toString()) {
            return done(null, user);
          }

          return done(null, null, 'authentication failed');


        });

      });

    }));

};
