var Controller = require('./controller');
var express = require('express');
var router = express.Router();


module.exports = function(app, passport) {

  var ctrl = new Controller(passport);

  router.route('/users/login')
    .post(ctrl.login);

  router.route('/users/logout')
    .post(ctrl.logout);

  router.route('/users')
    .post(ctrl.signup)
    .get(ctrl.getAllUsers);

  router.route('/user')
    .get(ctrl.getCurrentUser);

  router.route('/users/:user_id')
    .put(ctrl.isLoggedIn, ctrl.editUser)
    .get(ctrl.getUser)
    .delete(ctrl.isLoggedIn, ctrl.deleteUser);

  router.route('/users/:user_id/roles')
    .post(ctrl.isLoggedIn, ctrl.setUserRole);

  router.route('/users/documents/viewable')
    .get(ctrl.isLoggedIn, ctrl.getViewableDocs);

  router.route('/documents')
    .post(ctrl.isLoggedIn, ctrl.createDocument);

  router.route('/documents/limit/:limit')
    .get(ctrl.getAllDocuments);

  router.route('/documents/date/:date')
    .get(ctrl.getAllDocumentsByDate);

  router.route('/documents/roles/:role_title')
    .get(ctrl.getAllDocumentsByRole);


  router.route('/documents/:doc_id')
    .put(ctrl.isLoggedIn, ctrl.editDocument)
    .get(ctrl.getDocument)
    .delete(ctrl.isLoggedIn, ctrl.deleteDocument);

  router.route('/user/documents')
    .get(ctrl.isLoggedIn, ctrl.getMyDocs);

  router.route('/documents/:doc_id/roles')
    .post(ctrl.isLoggedIn, ctrl.addDocumentRole);

  router.route('/roles')
    .post(ctrl.isLoggedIn, ctrl.createRole)
    .get(ctrl.getRoles);


  router.route('/')
    .get(function(req, res, next) {
      req.logout();
      return res.send({
        success: true,
        message: 'API where you at!'
      });
    });

  app.use('/api', router);

  app.use(function(req, res, next) {

    next();
  });


};
