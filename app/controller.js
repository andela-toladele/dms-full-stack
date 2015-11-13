var DocManager = require('./documentManager');
var User = require('./schema')['User'];
var Role = require('./schema')['Role'];
var docManager = new DocManager();

var Controller = function(passport) {

  Controller.passport = passport;
}

//Sign user up by creating a new user model
Controller.prototype.signup = function(req, res, next) {

  docManager.createUser(req.body.user).then(function(user) {
    res.json(user);
  }).catch(function(err) {
    //Check if error occurs because of email or username
    //unique constraint violation
    if (Number(err.code) === 11000) {
      res.status(422).send({
        message: 'Duplicate username or email found'
      });
    } else {

      res.status(500).send({
        message: 'Error occured during signup'
      });
    }
  });
};

//Log user in and save user to session using passport auth
Controller.prototype.login = function(req, res, next) {

  Controller.passport.authenticate('local-login', function(err, user, info) {
    if (err) {
      res.status(500).send({
        message: 'Error occured during signup'
      });
    }

    // Generate a JSON response reflecting authentication status
    if (!user) {
      return res.status(401).send({
        message: 'Authentication failed!'
      });
    } else {

      Role.populate(user, {
        'path': 'roleId'
      }, function(err, user) {

        req.login(user, function(err) {
          if (err) {
            return next(err);
          }
          return res.json(user);
        });
      });
    }
  })(req, res, next);
};


Controller.prototype.logout = function(req, res, next) {

  req.logout();
  return res.json({
    success: true,
    message: 'User logged out!'
  });
};

//Check if user object is in session
Controller.prototype.isLoggedIn = function(req, res, next) {

  if (req.user) {

    return next();
  }

  res.status(401).send({
    message: 'Please login!'
  });
};


Controller.prototype.getCurrentUser = function(req, res, next) {

  if (req.user) {

    Role.populate(req.user, {
      'path': 'roleId'
    }, function(err, user) {

      req.login(user, function(err) {
        res.json(user);
      });
    });
  } else {

    return res.status(401).send({
      success: false,
      message: 'No user in session!'
    });
  }
}

Controller.prototype.getAllUsers = function(req, res, next) {

  docManager.getAllUsers().then(function(users) {

    res.json(users);
  }).catch(function(err) {

    res.status(422).send(err);
  });
};

Controller.prototype.getUser = function(req, res, next) {

  docManager.getUser(req.params.user_id).then(function(user) {

    res.json(user);
  }).catch(function(err) {

    res.status(422).send(err);
  });
};

Controller.prototype.editUser = function(req, res, next) {

  docManager.editUser(req.params.user_id, req.body.user).then(function(user) {

    Role.populate(user, {
      'path': 'roleId'
    }, function(err, user) {
      req.login(user, function(err) {
        res.json(user);
      });
    });
  }).catch(function(err) {

    res.status(422).send(err);
  });
};

Controller.prototype.deleteUser = function(req, res, next) {

  docManager.deleteUser(req.params.user_id).then(function(user) {

    res.json(user);
  }).catch(function(err) {

    res.status(422).send(err);
  });
};

//Set role type for a user
Controller.prototype.setUserRole = function(req, res, next) {

  docManager.setUserRole(req.params.user_id, req.body.roleTitle).then(function(user) {
    req.login(user, function(err) {
      res.json(user);
    });
  }).catch(function(err) {

    res.status(422).send(err);
  });
};

Controller.prototype.createDocument = function(req, res, next) {

  docManager.createDocument(req.body.doc, req.user.username).then(function(user) {

    res.json(user);
  }).catch(function(err) {

    if (Number(err.code) === 11000) {

      //Check if error occurs because of title
      //unique constraint violation
      res.status(422).send({
        message: 'Duplicate title found'
      });
    } else {

      res.status(500).send({
        message: 'Error occured while creating document'
      });
    }
  });
};

Controller.prototype.getAllDocuments = function(req, res, next) {

  docManager.getAllDocuments(req.params.limit).then(function(docs) {

    res.json(docs);
  }).catch(function(err) {

    res.status(422).send(err);
  });
};

Controller.prototype.getAllDocumentsByDate = function(req, res, next) {

  var date = req.params.date;

  docManager.getAllDocumentsByDate(date).then(function(docs) {

    res.json(docs);
  }).catch(function(err) {

    res.status(422).send(err);
  });
};

Controller.prototype.getAllDocumentsByRole = function(req, res, next) {


  docManager.getAllDocumentsByRole(req.params.role_title).then(function(docs) {

    res.json(docs);
  }).catch(function(err) {

    res.status(422).send(err);
  });
};


Controller.prototype.getDocument = function(req, res, next) {

  docManager.getDocument(req.params.doc_id).then(function(doc) {

    Role.populate(doc, {
      'path': 'roles.role_ref'
    }, function(err, doc) {      
        res.json(doc);
    });
  }).catch(function(err) {

    res.status(422).send(err);
  });
};

Controller.prototype.editDocument = function(req, res, next) {

  docManager.editDocument(req.params.doc_id, req.body.doc).then(function(doc) {

    res.json(doc);
  }).catch(function(err) {

    res.status(422).send(err);
  });
};

Controller.prototype.deleteDocument = function(req, res, next) {

  docManager.deleteDocument(req.params.doc_id).then(function(doc) {

    res.json({
      message: 'Document deleted!'
    });
  }).catch(function(err) {

    res.status(422).send(err);
  });
};

//Get all documents that are accesible to a user based on user role
//and whether document was created by user
Controller.prototype.getViewableDocs = function(req, res, next) {

  docManager.getViewableDocs(req.user._id).then(function(docs) {

    res.json(docs);
  }).catch(function(err) {

    res.status(422).send(err);
  });
};

//Get documents created by user
Controller.prototype.getMyDocs = function(req, res, next) {

  docManager.getMyDocs(req.user._id).then(function(docs) {

    res.json(docs);
  }).catch(function(err) {

    res.status(422).send(err);
  });
};

//Add role to a document
Controller.prototype.addDocumentRole = function(req, res, next) {

  docManager.addDocumentRole(req.params.doc_id, req.body.roleTitle).then(function(doc) {

    res.json(doc);
  }).catch(function(err) {

    res.status(422).send(err);
  });
};

Controller.prototype.createRole = function(req, res, next) {

  docManager.createRole(req.body.role).then(function(role) {

    res.json(role);
  }).catch(function(err) {
    //Check if error occurs because of title
    //unique constraint violation
    if (Number(err.code) === 11000) {
      res.status(422).send({
        message: 'Duplicate title found'
      });
    } else {

      res.status(500).send({
        message: 'Error occured while creating role'
      });
    }
  });
};

Controller.prototype.getRoles = function(req, res, next) {

  docManager.getRoles().then(function(roles) {

    res.json(roles);
  }).catch(function(err) {

    res.status(422).send(err);
  });
};

module.exports = Controller;
