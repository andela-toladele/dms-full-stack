'use strict';
angular.module('docManagerApp')
  .controller('roleCtrl', ['$scope', '$rootScope', '$state', '$mdToast', 'RoleService', function($scope, $rootScope, $state, $mdToast, RoleService) {


    $scope.createRole = function() {
      RoleService.createRole($scope.title).then(function(data) {
        $scope.title = "";
        var toast = $mdToast.simple()
          .content("Role created")
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
