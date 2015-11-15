'use strict';
angular.module('docManagerApp', ['ui.router', 'ngMaterial'])
  .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

    $stateProvider
      .state('user', {
        url: '/user',
        templateUrl: 'partials/user.html',
        controller: 'userCtrl'
      })
      .state('user.home', {
        url: '/home',
        templateUrl: 'partials/home.html',
        controller: 'homeCtrl'
      })
      .state('user.login', {
        url: '/login',
        templateUrl: 'partials/login.html',
        controller: 'authCtrl'
      })
      .state('user.signup', {
        url: '/signup',
        templateUrl: 'partials/signup.html',
        controller: 'authCtrl'
      })
      .state('user.roles', {
        url: '/create-role',
        templateUrl: 'partials/role.html',
        controller: 'roleCtrl'
      })
      .state('user.createdoc', {
        url: '/create-document',
        templateUrl: 'partials/document.create.html',
        controller: 'docCtrl'
      })
      .state('user.document', {
        url: '/manage-document/:doc_id',
        templateUrl: 'partials/document.view.html',
        controller: 'docCtrl'
      });

    $urlRouterProvider.otherwise('/user/home');
  }]);
