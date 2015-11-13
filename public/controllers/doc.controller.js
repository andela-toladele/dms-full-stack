"use strict";
angular.module('docManagerApp')
  .controller('docCtrl', ['$scope', '$rootScope', '$state', '$mdToast', '$location', 'RoleService', 'DocumentService', function($scope, $rootScope, $state, $mdToast, $location, RoleService, DocumentService) {


    $scope.loadPageData = function() {

      DocumentService.getDocument($state.params.doc_id).then(function(res) {

        $scope.doc = res.data;
        if ($scope.user._id && ($scope.doc.ownerId.toString() === $scope.user._id.toString())) {

          $scope.canEdit = true;
        }

        $scope.doc.roles = res.data.roles.map(function(role) {
          role = role.role_ref.title;

          return role;
        });

        $scope.doc.roles = $scope.doc.roles.join();

        RoleService.getRoles().then(function(res) {

          $scope.roles = res.data;
        });
      }).catch(function(err, status) {

        processError(err, status);
      });


    }

    $scope.createDocument = function() {
      DocumentService.createDocument({
        title: $scope.title,
        content: $scope.content
      }).then(function(res) {

        $state.go('user.document', {
          doc_id: res.data._id
        });

      }).catch(function(err, status) {

        processError(err, status);
      });

    }

    $scope.enableEditMode = function(mode) {

      if (mode) {

        $scope.tempDoc = angular.copy($scope.doc);
        $scope.editMode = true;
      } else {
        $scope.doc = angular.copy($scope.tempDoc);
        $scope.editMode = false;
      }
    }

    $scope.saveDocument = function() {

      DocumentService.editDocument($scope.doc._id, $scope.doc).then(function(data) {

        $scope.editMode = false;

      }).catch(function(err, status) {
        processError(err, status);
      });
    }

     $scope.deleteDocument = function() {

      DocumentService.deleteDocument($scope.doc._id).then(function(data) {

        $state.go('user.home');

      }).catch(function(err, status) {
        processError(err, status);
      });
    }

    $scope.addRole = function(selectedRole) {

      var roles = $scope.doc.roles.split(",");
      var found = false;
      for (var i = 0; i < roles.length; i++) {
        if (selectedRole === roles[i]) {

          found = true;
          break;
        }
      }
      if (found) {
        return;
      }

      RoleService.addDocumentRole($scope.doc._id, selectedRole).then(function(data) {

        if (!$scope.doc.roles || $scope.doc.roles === "") {
          $scope.doc.roles = angular.copy(selectedRole);
        } else {
          $scope.doc.roles += ", " + selectedRole;

        }


      }).catch(function(err, status) {
        processError(err, status);
      });
    }


    function processError(err, status) {

      if (Number(status) === 422 || Number(status) === 401 || Number(status) === 403) {
        var toast = $mdToast.simple()
          .content(err.message)
          .action('OK')
          .highlightAction(true)
          .hideDelay(0)
          .position('top right');
        $mdToast.show(toast);
      } else {
        var toast = $mdToast.simple()
          .content("An error just occured, please try again!")
          .action('OK')
          .highlightAction(true)
          .hideDelay(0)
          .position('top right');
        $mdToast.show(toast);
      }
    }
  }]);
