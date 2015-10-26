var models = require('./schema');

DocumentManager = function() {}

//Create a new user with a default guest role
DocumentManager.prototype.createUser = function(user) {

  var promise = function() {

    return new Promise(function(resolve, reject) {

      models.User.create(user, function(err, newUser) {


        if (err) {
          reject(err);
        } else {

          models.Role.findOne({
              title: 'guest'
            },
            function(err, role) {
              if (!role) {

                models.Role.create({
                  title: 'guest'
                }, function(err, newRole) {

                  newUser.roleId = newRole._id;
                  newUser.save(function(err) {
                    resolve(newUser);
                  });
                });
              } else {

                newUser.roleId = role._id;
                newUser.save(function(err) {
                  resolve(newUser);
                });
              }
            });
        }
      });
    });
  }
  return promise();
}

//Return all users
DocumentManager.prototype.getAllUsers = function() {

  var promise = function() {
    return new Promise(function(resolve) {

      models.User.find({}, function(err, users) {
        resolve(users);
      })
    });
  }

  return promise();
}

DocumentManager.prototype.createRole = function(role) {

  var promise = function() {
    return new Promise(function(resolve, reject) {

      models.Role.create(role, function(err, role) {
        if (err) {
          reject(err)
        } else {
          resolve(role);
        }
      })
    });
  }

  return promise();
}

DocumentManager.prototype.getAllRoles = function() {

  var promise = function() {
    return new Promise(function(resolve) {

      models.Role.find({}, function(err, roles) {
        resolve(roles);
      })
    });
  }

  return promise();

}

//Create a new document, and add the user in session as the document owner
DocumentManager.prototype.createDocument = function(document, createdBy) {

  var promise = function() {
    return new Promise(function(resolve, reject) {

      models.Document.create(document, function(err, doc) {
        if (err) {
          reject(err)
        } else {
          models.User.findOne({
            username: createdBy
          }, function(err, user) {

            if (user) {

              doc.ownerId = user._id;
              doc.save(function(err, doc) {
                resolve(doc);
              });

            } else {
              resolve(doc);
            }

          });
        }
      })
    });
  }

  return promise();

}

//Add role to a document avoiding duplicate with addToSet param
DocumentManager.prototype.addDocumentRole = function(docId, roleTitle) {

  var promise = function() {
    return new Promise(function(resolve, reject) {

      models.Role.findOne({
        title: roleTitle
      }, function(err, role) {

        if (!role) {
          reject('Role not found!');
        } else {

          models.Document.findByIdAndUpdate(docId, {
              $addToSet: {
                roles: {
                  role_ref: role._id
                }
              }
            }, {
              new: true
            },
            function(err, doc) {
              resolve(doc);
            }
          );
        }
      });
    });
  }

  return promise();
}

//Return at most limit number of documents in descending order of date created
DocumentManager.prototype.getAllDocuments = function(limit) {

  var promise = function() {
    return new Promise(function(resolve) {

      var q = models.Document.find({}).sort({
        'dateCreated': -1
      }).limit(limit);
      q.exec(function(err, docs) {
        resolve(docs);
      });
    });
  }

  return promise();
}

DocumentManager.prototype.getRoles = function() {

  var promise = function() {
    return new Promise(function(resolve) {

      var q = models.Role.find({});
      q.exec(function(err, roles) {
        resolve(roles);
      });
    });
  }

  return promise();
}

//Get all documents containing the role specified and in order of date created
DocumentManager.prototype.getAllDocumentsByRole = function(roleTitle) {

  var promise = function() {
    return new Promise(function(resolve) {

      models.Role.findOne({
        title: roleTitle
      }, function(err, role) {

        if (!role) {
          resolve([]);
        } else {
          var q = models.Document.find({
            'roles.role_ref': role._id
          }).sort({
            'dateCreated': -1
          });
          q.exec(function(err, docs) {
            resolve(docs);
          });
        }
      });
    });
  }

  return promise();

}

//Get all documents created on the date specified
DocumentManager.prototype.getAllDocumentsByDate = function(date) {


  var promise = function() {
    return new Promise(function(resolve) {

      models.Document.find({
        dateCreated: date
      }, function(err, doc) {

        resolve(doc);
      });
    });
  }

  return promise();

}

DocumentManager.prototype.getUser = function(userId) {

  var promise = function() {
    return new Promise(function(resolve) {

      models.User.findById(userId, function(err, user) {

        resolve(user);
      });
    });
  }

  return promise();
};

DocumentManager.prototype.editUser = function(userId, user) {

  var promise = function() {
    return new Promise(function(resolve, reject) {

      models.User.findByIdAndUpdate(userId, {
        $set: {
          username: user.username,
          name: user.name,
          email: user.email

        }
      }, {
        new: true
      }, function(err, user) {
        if (err) {
          reject(err);
        } else {
          resolve(user);
        }
      });
    });
  }

  return promise();
};

//Set a user role after validating the role and userId
DocumentManager.prototype.setUserRole = function(userId, roleTitle) {

  var promise = function() {
    return new Promise(function(resolve, reject) {

      models.Role.findOne({
        title: roleTitle
      }, function(err, role) {

        if (!role) {
          reject({
            message: 'Role not found!'
          });
        } else {

          models.User.findById(userId, function(err, user) {

            if (!user) {
              reject({
                message: 'User not found!'
              });
            } else {

              models.User.findByIdAndUpdate(userId, {
                $set: {
                  roleId: role._id
                }
              }, {
                new: true
              }, function(err, user) {

                resolve(user);
              });
            }
          });
        }
      });
    });
  }

  return promise();
}

DocumentManager.prototype.deleteUser = function(userId) {

  var promise = function() {
    return new Promise(function(resolve, reject) {

      models.User.remove({
        _id: userId
      }, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({
            message: 'User deleted!'
          });
        }
      });
    });
  }

  return promise();
};

DocumentManager.prototype.getDocument = function(docId) {

  var promise = function() {
    return new Promise(function(resolve) {

      models.Document.findById(docId, function(err, doc) {

        resolve(doc);
      });
    });
  }

  return promise();
};

DocumentManager.prototype.editDocument = function(docId, doc) {

  var promise = function() {
    return new Promise(function(resolve, reject) {

      models.Document.findByIdAndUpdate(docId, {
        $set: {
          title: doc.title,
          content: doc.content,
          lastModified: Date.now()

        }
      }, {
        new: true
      }, function(err, doc) {
        if (err) {
          reject(err);
        } else {
          resolve(doc);
        }
      });
    });
  }

  return promise();
};

DocumentManager.prototype.deleteDocument = function(docId) {

  var promise = function() {
    return new Promise(function(resolve, reject) {

      models.Document.remove({
        _id: docId
      }, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({
            message: 'Document deleted!'
          });
        }
      });
    });
  }

  return promise();
};

//Get all documents that are accesible to a user based on user role
//and whether document was created by user
DocumentManager.prototype.getViewableDocs = function(userId) {

  var promise = function() {
    return new Promise(function(resolve, reject) {

      models.User.findById(userId, function(err, user) {

        if (!user) {

          resolve([]);
        } else {

          models.Document.find({
            $or: [{
              ownerId: user._id
            }, {
              'roles.role_ref': user.roleId
            }]
          }, function(err, docs) {

            resolve(docs);
          });
        }
      });
    });
  }

  return promise();
};

//Get documents created by user
DocumentManager.prototype.getMyDocs = function(userId) {

  var promise = function() {
    return new Promise(function(resolve, reject) {

      models.User.findById(userId, function(err, user) {

        if (!user) {

          resolve([]);
        } else {

          models.Document.find({
           ownerId: user._id
          }, function(err, docs) {

            resolve(docs);
          });
        }
      });
    });
  }

  return promise();
};

module.exports = DocumentManager;
