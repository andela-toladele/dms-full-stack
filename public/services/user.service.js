"use strict";
angular.module('docManagerApp')
  .factory('UserService', ['$http', function($http) {

    return {
      createUser: function(user) {
        return $http.post("/api/users", {
          user: user
        });
      },
      getCurrentUser: function() {
        return $http.get("/api/user");
      },
      getAllUsers: function() {
        return $http.get("/api/users");
      },
      editProfile: function(user) {
        return $http.put("/api/users/" + user._id, {
          user: user
        });
      },
      login: function(loginData) {
        return $http.post("/api/users/login", loginData);
      },
      logout: function() {
        return $http.post("/api/users/logout");
      }

    };

  }]);
