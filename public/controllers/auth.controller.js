'use strict';
angular.module('docManagerApp')
  .controller('authCtrl', ['$scope', '$rootScope', '$location', '$state', '$mdToast', 'UserService', function($scope, $rootScope, $location, $state, $mdToast, UserService) {
    $scope.newUser = {};
    $scope.login = function() {

      UserService.login({
        username: angular.lowercase($scope.username),
        password: $scope.password
      }).then(function(res) {

        $rootScope.loggedIn = true;
        $rootScope.user = res.data;
        
        $rootScope.user.role = res.data.roleId.title;
        $location.url('/user/home');

      }).catch(function(err, status) {
        console.log(err, status);
        processError(err, status);
      });
    };


    $scope.signUp = function() {

      $scope.newUser.username = angular.lowercase($scope.newUser.username);
      $scope.newUser.email = angular.lowercase($scope.newUser.email);
      UserService.createUser($scope.newUser).then(function(data) {

        $location.url('/user/login');
         var toast = $mdToast.simple()
          .content("User signed up, please log in.")
          .action('OK')
          .highlightAction(true)
          .hideDelay(0)
          .position('top right');
          $mdToast.show(toast);

      }).catch(function(err, status) {
        processError(err, status);
      });
    };


    function processError(err, status) {

      var toast;

      if (Number(status) === 422 || Number(status) === 401 || Number(status) === 403) {
        toast = $mdToast.simple()
          .content(err.message)
          .action('OK')
          .highlightAction(true)
          .hideDelay(0)
          .position('top right');
          $mdToast.show(toast);
      } else {
        toast = $mdToast.simple()
          .content("An error just occured, please try again!")
          .action('OK')
          .highlightAction(true)
          .hideDelay(0)
          .position('top right');
          $mdToast.show(toast);
      }
    }

  }]);
