'use strict';

var request = require('supertest');
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require("body-parser");
var models = require('./schema');


mongoose.connect('mongodb://localhost/dmsapitestdb');

var conn = mongoose.connection;

var app = express();

// load the routes
require('./index')(app);

app.use(bodyParser.json());

var server = request.agent(app);

conn.on('error', function() {
  throw new Error('unable connect to database');
});

describe("Document Manager API", function() {

  describe("User CRUD", function() {

    beforeEach(function(done) {

      models.User.remove({}, function(err) {
        done();
      });

    });

    it('should create a new user', function(done) {

      server
        .post('/api/users')
        .set('Content-Type', 'application/json')
        .send({
          user: {
            email: 'mail@dee',
            username: 'name',
            password: '1234',
            name: {
              firstname: 'Matt',
              lastname: 'Dame'
            }
          }
        })
        .expect(200)
        .end(function(err, response) {

          expect(response.body).toEqual(jasmine.objectContaining({
            email: 'mail@dee',
            username: 'name',
            name: {
              firstname: 'Matt',
              lastname: 'Dame'
            }
          }));

          expect(response.body.roleId).toBeDefined();

          done();

        });
    });

    it('should not create duplicate user', function(done) {

      var user = new models.User();
      user.email = 'mail@dee';
      user.password = '****';
      user.username = 'name';

      user.save(function() {
        server
          .post('/api/users')
          .set('Content-Type', 'application/json')
          .send({
            user: {
              username: 'name',
              email: 'mail@dee',
              password: '7777'
            }
          })
          .expect(422)
          .end(function(err, response) {

            expect(response.body).toEqual(jasmine.objectContaining({
              message: 'Duplicate username or email found'

            }));
            done();
          });
      });
    });

    it('should edit user', function(done) {

      var user = new models.User();
      user.email = 'mail@dee';
      user.password = 'pass';
      user.username = 'name';

      user.save(function(err, user) {

        server
          .post('/api/users/login')
          .set('Content-Type', 'application/json')
          .send({
            username: "name",
            password: "pass"
          })
          .expect(200)
          .end(function(err, response) {

            server
              .put('/api/users/' + user._id)
              .set('Content-Type', 'application/json')
              .send({
                user: {
                  username: 'name1',
                  email: 'mail1@dee',
                }
              })
              .expect(200)
              .end(function(err, response) {

                expect(response.body).toEqual(jasmine.objectContaining({
                  email: 'mail1@dee',
                  username: 'name1'
                }));
                done();
              });
          });
      });

    });


    it('should get user', function(done) {

      var user = new models.User();
      user.email = 'mail@dee';
      user.password = 'pass';
      user.username = 'name';
      user.name = {
        firstname: 'Matt',
        lastname: 'Dame'
      }

      user.save(function(err, user) {

        server
          .get('/api/users/' + user._id)
          .set('Content-Type', 'application/json')
          .expect(200)
          .end(function(err, response) {

            expect(response.body).toEqual(jasmine.objectContaining({
              email: 'mail@dee',
              username: 'name'
            }));
            done();
          });
      });

    });

    it('should get all users', function(done) {

      createUser({
        username: 'name',
        email: 'mail@mail.com',
        password: 'pass'
      }).then(function(user) {

        createUser({
          username: 'name1',
          email: 'mail1@mail.com',
          password: 'pass'
        }).then(function(user) {

          server
            .get('/api/users')
            .set('Content-Type', 'application/json')
            .expect(200)
            .end(function(err, response) {

              expect(response.body.length).toBe(2);
              done();
            });
        });

      });
    });


    it('should delete user', function(done) {

      var user = new models.User();
      user.email = 'mail@dee';
      user.password = 'pass';
      user.username = 'name';
      user.name = {
        firstname: 'Matt',
        lastname: 'Dame'
      }

      user.save(function(err, user) {

        server
          .post('/api/users/login')
          .set('Content-Type', 'application/json')
          .send({
            username: "name",
            password: "pass"
          })
          .expect(200)
          .end(function(err, response) {

            server
              .delete('/api/users/' + user._id)
              .set('Content-Type', 'application/json')
              .expect(200)
              .end(function(err, response) {

                expect(response.body).toEqual(jasmine.objectContaining({
                  message: 'User deleted!'
                }));
                done();
              });
          });
      });

    });
  });



  describe("Role", function() {
    var user;
    beforeEach(function(done) {

      models.Role.remove({}, function(err) {
        models.User.remove({}, function(err) {

          user = new models.User();
          user.email = 'mail@dee';
          user.password = 'pass';
          user.username = 'name';
          user.name = {
            firstname: 'Matt',
            lastname: 'Dame'
          }

          user.save(function(err, newUser) {

            user = newUser;
            done();
          });
        });
      });

    });

    it('should create a new role', function(done) {

      server
        .post('/api/users/login')
        .set('Content-Type', 'application/json')
        .send({
          username: "name",
          password: "pass"
        })
        .expect(200)
        .end(function(err, response) {

          server
            .post('/api/roles')
            .set('Content-Type', 'application/json')
            .send({
              role: {
                title: 'view1'
              }
            })
            .expect(200)
            .end(function(err, response) {

              expect(response.body).toEqual(jasmine.objectContaining({
                title: 'view1'
              }));

              done();
            });
        });
    });


    it('should not create duplicate roles', function(done) {

      server
        .post('/api/users/login')
        .set('Content-Type', 'application/json')
        .send({
          username: "name",
          password: "pass"
        })
        .expect(200)
        .end(function(err, response) {

          createRole('view1').then(function(role) {
            createRole('view1').then(function(res) {
              expect(res).toEqual(jasmine.objectContaining({
                message: 'Duplicate title found'
              }));

              done();
            });
          });
        });
    });


    it('should get all roles', function(done) {

      server
        .post('/api/users/login')
        .set('Content-Type', 'application/json')
        .send({
          username: "name",
          password: "pass"
        })
        .expect(200)
        .end(function(err, response) {

          createRole('view1').then(function(user) {

            createRole('view2').then(function(user) {

              server
                .get('/api/roles')
                .set('Content-Type', 'application/json')
                .expect(200)
                .end(function(err, response) {

                  expect(response.body.length).toBe(2);
                  done();
                });
            });

          });
        });
    });
  });


  describe("Document CRUD", function() {
    var user;
    beforeEach(function(done) {

      models.Document.remove({}, function(err) {
        models.User.remove({}, function(err) {

          user = new models.User();
          user.email = 'mail@dee';
          user.password = 'pass';
          user.username = 'name';
          user.name = {
            firstname: 'Matt',
            lastname: 'Dame'
          }

          user.save(function(err, newUser) {

            user = newUser;
            done();
          });
        });
      });
    });


    it('should not create a document without user logged in', function(done) {

      server
        .post('/api/documents')
        .set('Content-Type', 'application/json')
        .send({
          doc: {
            title: 'doc1',
            content: 'content1'
          }
        })
        .expect(200)
        .end(function(err, response) {

          expect(response.body).toEqual(jasmine.objectContaining({
            message: 'Please login!'
          }));
          done();
        });
    });

    it('should create a document', function(done) {


      server
        .post('/api/users/login')
        .set('Content-Type', 'application/json')
        .send({
          username: "name",
          password: "pass"
        })
        .expect(200)
        .end(function(err, response) {

          server
            .post('/api/documents')
            .set('Content-Type', 'application/json')
            .send({
              doc: {
                title: 'doc1',
                content: 'content1'
              }
            })
            .expect(200)
            .end(function(err, response) {

              expect(response.body).toEqual(jasmine.objectContaining({
                ownerId: user._id.toString(),
                title: 'doc1',
                content: 'content1'
              }));
              expect(response.body.dateCreated).toBeDefined();
              done();
            });
        });
    });



    it('should not create documents with duplicate title', function(done) {


      server
        .post('/api/users/login')
        .set('Content-Type', 'application/json')
        .send({
          username: "name",
          password: "pass"
        })
        .expect(200)
        .end(function(err, response) {

          createDocument({
            title: 'doc1',
            content: 'content1'
          }).then(function(doc) {

            createDocument({
              title: 'doc1',
              content: 'content1'
            }).then(function(res) {

              expect(res).toEqual(jasmine.objectContaining({
                message: 'Duplicate title found'
              }));
              done();
            });

          });
        });
    });


    it('should edit a document', function(done) {

      server
        .post('/api/users/login')
        .set('Content-Type', 'application/json')
        .send({
          username: "name",
          password: "pass"
        })
        .expect(200)
        .end(function(err, response) {

          server
            .post('/api/documents')
            .set('Content-Type', 'application/json')
            .send({
              doc: {
                title: 'doc1',
                content: 'content1'
              }
            })
            .expect(200)
            .end(function(err, response) {
              var docId = response.body._id;


              server
                .put('/api/documents/' + docId)
                .set('Content-Type', 'application/json')
                .send({
                  doc: {
                    title: 'docOne',
                    content: 'contentOne'
                  }
                })
                .expect(200)
                .end(function(err, response) {

                  expect(response.body).toEqual(jasmine.objectContaining({
                    ownerId: user._id.toString(),
                    title: 'docOne',
                    content: 'contentOne'
                  }));
                  done();
                });

            });
        });
    });

    it('should get a document', function(done) {

      server
        .post('/api/users/login')
        .set('Content-Type', 'application/json')
        .send({
          username: "name",
          password: "pass"
        })
        .expect(200)
        .end(function(err, response) {

          server
            .post('/api/documents')
            .set('Content-Type', 'application/json')
            .send({
              doc: {
                title: 'doc1',
                content: 'content1'
              }
            })
            .expect(200)
            .end(function(err, response) {
              var docId = response.body._id;


              server
                .get('/api/documents/' + docId)
                .set('Content-Type', 'application/json')
                .expect(200)
                .end(function(err, response) {

                  expect(response.body).toEqual(jasmine.objectContaining({
                    ownerId: user._id.toString(),
                    title: 'doc1',
                    content: 'content1'
                  }));
                  done();
                });

            });
        });
    });


    it('should delete a document', function(done) {

      server
        .post('/api/users/login')
        .set('Content-Type', 'application/json')
        .send({
          username: "name",
          password: "pass"
        })
        .expect(200)
        .end(function(err, response) {

          server
            .post('/api/documents')
            .set('Content-Type', 'application/json')
            .send({
              doc: {
                title: 'doc1',
                content: 'content1'
              }
            })
            .expect(200)
            .end(function(err, response) {
              var docId = response.body._id;


              server
                .delete('/api/documents/' + docId)
                .set('Content-Type', 'application/json')
                .expect(200)
                .end(function(err, response) {

                  expect(response.body).toEqual(jasmine.objectContaining({
                    message: 'Document deleted!'
                  }));
                  done();
                });

            });
        });
    });


    it('should get first two documents ordered by date created', function(done) {

      server
        .post('/api/users/login')
        .set('Content-Type', 'application/json')
        .send({
          username: "name",
          password: "pass"
        })
        .expect(200)
        .end(function(err, response) {


          createDocument({
            title: 'doc1',
            content: 'content1',
            dateCreated: new Date(2015, 9, 5)
          }).then(function(doc) {

            createDocument({
              title: 'doc2',
              content: 'content2',
              dateCreated: new Date(2015, 9, 4)
            }).then(function(doc) {

              createDocument({
                title: 'doc3',
                content: 'content3',
                dateCreated: new Date(2015, 9, 6)
              }).then(function(doc) {

                server
                  .get('/api/documents/limit/2')
                  .set('Content-Type', 'application/json')
                  .expect(200)
                  .end(function(err, response) {
                    var docs = response.body;

                    expect(docs.length).toBe(2);
                    expect(docs[0]).toEqual(jasmine.objectContaining({
                      ownerId: user._id.toString(),
                      title: 'doc3',
                      content: 'content3'
                    }));

                    expect(docs[1]).toEqual(jasmine.objectContaining({
                      ownerId: user._id.toString(),
                      title: 'doc1',
                      content: 'content1'
                    }));
                    done();
                  });
              });
            });
          });
        });
    });
  });

  describe("Document Role", function() {
    var user, users, docs;

    beforeEach(function(done) {



      models.Document.remove({}, function(err) {

        models.Document.remove({}, function(err) {

          models.User.remove({}, function(err) {


            createUser({
              username: 'name',
              email: 'mail@mail.com',
              password: 'pass'
            }).then(
              function() {

                loginUser({
                  username: 'name',
                  password: 'pass'
                }).then(function() {

                  createRole('view1').then(function(role) {
                    createRole('view2').then(function(role) {

                      createDocument({
                        title: 'doc1',
                        content: 'content1',
                        dateCreated: new Date(2015, 9, 6)
                      }).then(function(doc) {


                        addDocumentRole(doc._id, 'view1').then(function() {

                          addDocumentRole(doc._id, 'view2').then(function() {

                            createDocument({
                              title: 'doc2',
                              content: 'content2',
                              dateCreated: new Date(2015, 9, 5)
                            }).then(function(doc1) {


                              addDocumentRole(doc1._id, 'view1').then(function() {

                                createDocument({
                                  title: 'doc3',
                                  content: 'content3',
                                  dateCreated: new Date(2015, 9, 4)
                                }).then(function(doc1) {


                                  addDocumentRole(doc1._id, 'view2').then(function() {

                                    done();

                                  });
                                });

                              });
                            });

                          });

                        });
                      });

                    });

                  });
                });
              });
          });
        });
      });
    });


    it('should get documents by role', function(done) {

      server
        .get('/api/documents/roles/view1')
        .set('Content-Type', 'application/json')
        .expect(200)
        .end(function(err, response) {
          var docs = response.body;
          expect(docs.length).toBe(2);
          expect(docs[0]).toEqual(jasmine.objectContaining({
            title: 'doc1',
            content: 'content1'
          }));
          expect(docs[1]).toEqual(jasmine.objectContaining({
            title: 'doc2',
            content: 'content2'
          }));
          done();
        });
    });

    it('should get documents by date', function(done) {

      server
        .get('/api/documents/date/2015-9-4')
        .set('Content-Type', 'application/json')
        .expect(200)
        .end(function(err, response) {
          var docs = response.body;
          expect(docs.length).toBe(1);
          expect(docs[0]).toEqual(jasmine.objectContaining({
            title: 'doc3',
            content: 'content3'
          }));

          done();
        });
    });

  });

  function createUser(user) {

    return new Promise(function(resolve) {

      server
        .post('/api/users')
        .set('Content-Type', 'application/json')
        .send({
          user: user
        })
        .expect(200)
        .end(function(err, response) {
          resolve(response.body);
        });

    });
  }

  function loginUser(user) {

    return new Promise(function(resolve) {

      server
        .post('/api/users/login')
        .set('Content-Type', 'application/json')
        .send({
          username: user.username,
          password: user.password
        })
        .expect(200)
        .end(function(err, response) {

          resolve(response.body);
        });

    });
  }

  function createRole(roleTitle) {

    return new Promise(function(resolve) {

      server
        .post('/api/roles')
        .set('Content-Type', 'application/json')
        .send({
          role: {
            title: roleTitle
          }
        })
        .expect(200)
        .end(function(err, response) {

          resolve(response.body);
        });

    });
  }

  function createDocument(doc) {

    return new Promise(function(resolve) {

      server
        .post('/api/documents')
        .set('Content-Type', 'application/json')
        .send({
          doc: doc
        })
        .expect(200)
        .end(function(err, response) {

          resolve(response.body);
        });

    });
  }

  function setUserRole(userId, roleTitle) {

    return new Promise(function(resolve) {

      server
        .post('/api/users/' + userId + '/roles')
        .set('Content-Type', 'application/json')
        .send({
          roleTitle: roleTitle
        })
        .expect(200)
        .end(function(err, response) {

          resolve(response.body);
        });

    });
  }

  function addDocumentRole(docId, roleTitle) {

    return new Promise(function(resolve) {

      server
        .post('/api/documents/' + docId + '/roles')
        .set('Content-Type', 'application/json')
        .send({
          roleTitle: roleTitle
        })
        .expect(200)
        .end(function(err, response) {

          resolve(response.body);
        });

    });
  }


});
