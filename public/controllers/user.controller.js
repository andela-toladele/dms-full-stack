'use strict';
angular.module('docManagerApp')
  .controller('userCtrl', ['$scope', '$rootScope', '$location', '$state', 'UserService', function($scope, $rootScope, $location, $state, UserService) {

    $rootScope.state = $state;

    UserService.getCurrentUser().then(function(res) {
      $rootScope.loggedIn = true;
      $rootScope.user = res.data;
      $rootScope.user.role = res.data.roleId.title;

    }).catch(function() {

      $rootScope.loggedIn = false;
      $rootScope.user = {};
      $location.url('/user/login');
    });

    $scope.logout = function() {
      UserService.logout().then(function(data) {

        $rootScope.loggedIn = false;
        $rootScope.user = {};
        $location.url('/user/login');

      });
    };

  }]);
