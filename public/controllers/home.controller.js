'use strict';
angular.module('docManagerApp')
  .controller('homeCtrl', ['$scope', '$rootScope', '$location', '$state', '$mdToast', 'UserService', 'RoleService', 'DocumentService', function($scope, $rootScope, $location, $state, $mdToast, UserService, RoleService, DocumentService) {

    RoleService.getRoles().then(function(res) {
      $scope.roles = res.data;
    });

    DocumentService.getViewableDocs().then(function(res) {

      $scope.allDocuments = res.data;
    });

    DocumentService.getMyDocs().then(function(res) {

      $scope.myDocuments = res.data;
    });

    $scope.enableEdit = function(mode) {

      if (mode) {

        $scope.tempUser = angular.copy($rootScope.user);
        $scope.editMode = true;
      } else {
        $rootScope.user = angular.copy($scope.tempUser);
        $scope.editMode = false;
      }
    };

    $scope.editUser = function(user) {

      user.username = angular.lowercase(user.username);
      user.email = angular.lowercase(user.email);
      UserService.editProfile(user).then(function(data) {

        $scope.editMode = false;

      }).catch(function(err) {
        processError(err);
      });
    };

    $scope.setUserRole = function(userId, roleTitle) {

      RoleService.setUserRole(userId, roleTitle).then(function(data) {

        $rootScope.user.role = roleTitle;
        var toast = $mdToast.simple()
          .content("Role changed.")
          .action('OK')
          .highlightAction(true)
          .hideDelay(0)
          .position('top right');
        $mdToast.show(toast);

      }).catch(function(err) {
        processError(err);
      });
    };


    $scope.viewDocument = function(docId) {

      $state.go('user.document', {
        doc_id: docId
      });
    };

    function processError(err, status) {

      var toast;
      
      if (Number(err.status) === 422 || Number(err.status) === 401 || Number(err.status) === 403) {
        toast = $mdToast.simple()
          .content(err.data.message)
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
