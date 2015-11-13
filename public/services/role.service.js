"use strict";
angular.module('docManagerApp')
  .factory('RoleService', ['$http', function($http) {

    return {
      createRole: function(roleTitle) {
        return $http.post("/api/roles", {
          role: {
            title: roleTitle
          }
        });
      },
      getRoles: function() {
        return $http.get("/api/roles");
      },
      setUserRole: function(userId, roleTitle) {
        return $http.post("/api/users/" + userId + "/roles", {
          roleTitle: roleTitle
        });
      },
      addDocumentRole: function(docId, roleTitle) {
        return $http.post("/api/documents/" + docId + "/roles", {
          roleTitle: roleTitle
        });
      }

    };

  }]);
