"use strict";
angular.module('docManagerApp')
  .factory('DocumentService', ['$http', function($http) {

    return {
      createDocument: function(doc) {
        return $http.post("/api/documents", {
          doc: doc
        });
      },
      getDocument: function(docId) {
        return $http.get("/api/documents/" + docId);
      },
      editDocument: function(docId, doc) {
        return $http.put("/api/documents/" + docId, {
          doc: doc
        });
      },
      deleteDocument: function(docId) {
        return $http.delete("/api/documents/" + docId);
      },
      getViewableDocs: function() {
        return $http.get("/api/users/documents/viewable");
      },
      getMyDocs: function() {
        return $http.get("/api/user/documents");
      }

    };

  }]);
