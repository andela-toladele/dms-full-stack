describe('Document', function() {

  beforeEach(module('docManagerApp'));

  var roleService, docService, httpBackend, getRolesDeferred, getDocumentDeferred, createDocumentDeferred, saveDocumentDeferred, deleteDocumentDeferred, addRoleDeferred;

  var authCtrl, scope, state;


  beforeEach(inject(function($q, _RoleService_, _DocumentService_, $rootScope, $controller, $state) {

    getRolesDeferred = $q.defer();
    addRoleDeferred = $q.defer();
    getDocumentDeferred = $q.defer();
    createDocumentDeferred = $q.defer();
    saveDocumentDeferred = $q.defer();
    deleteDocumentDeferred = $q.defer();

    roleService = _RoleService_;
    docService = _DocumentService_;
    // Mock services and spy on methods
    spyOn(roleService, 'getRoles').and.returnValue(getRolesDeferred.promise);
    spyOn(roleService, 'addDocumentRole').and.returnValue(addRoleDeferred.promise);
    
    spyOn(docService, 'getDocument').and.returnValue(getDocumentDeferred.promise);
    spyOn(docService, 'createDocument').and.returnValue(createDocumentDeferred.promise);
    spyOn(docService, 'editDocument').and.returnValue(saveDocumentDeferred.promise);
    spyOn(docService, 'deleteDocument').and.returnValue(deleteDocumentDeferred.promise);

    // Initialize the controller and a mock scope.
    scope = $rootScope.$new();
    state = $state

    spyOn(state, 'go');

    $controller('docCtrl', {
      $scope: scope,
      $state: state,
      RoleService: roleService,
      DocumentService: docService
    });
  }));




  describe('Document controller methods', function() {

    it('should load a document', function() {
      state.params.doc_id = '1111';
      scope.user = {
        _id: '1'
      };

      scope.loadPageData();
      expect(docService.getDocument).toHaveBeenCalled();
      expect(docService.getDocument.calls.count()).toBe(1);

      var doc = {
        title: 'doc1',
        content: 'content1',
        ownerId: '1',
        roles: [{
          role_ref: {
            title: 'guest'
          },
          role_ref: {
            title: 'admin'
          }
        }]
      };

      getDocumentDeferred.resolve({
        data: doc
      });

      scope.$digest();

      expect(roleService.getRoles).toHaveBeenCalled();
      expect(roleService.getRoles.calls.count()).toBe(1);

      var roles = [{
        title: 'guest',
        _id: '1'
      }, {
        title: 'admin',
        _id: '2'
      }];
      getRolesDeferred.resolve({
        data: roles
      });

      scope.$digest();

    });


    it('should create a new document', function() {
      scope.tile = "title";
      scope.content = 'content1';
      scope.createDocument();
      expect(docService.createDocument).toHaveBeenCalled();
      expect(docService.createDocument.calls.count()).toBe(1);

      createDocumentDeferred.resolve({
        data: {
          _id: '1'
        }
      });

      scope.$digest();

      expect(state.go).toHaveBeenCalledWith('user.document', {
        doc_id: '1'
      });
    });

    it('should change document edit mode', function() {
      scope.editMode = false;
      scope.doc = {};
      scope.enableEditMode(true);

      scope.$digest();

      expect(scope.editMode).toBe(true);
    });

    it('should save a document', function() {
      scope.editMode = true;
      scope.doc = {};
      scope.doc._id = '111';
      scope.saveDocument();

      expect(docService.editDocument).toHaveBeenCalled();
      expect(docService.editDocument.calls.count()).toBe(1);

      saveDocumentDeferred.resolve({});
      scope.$digest();

      expect(scope.editMode).toBe(false);
    });

    it('should delete a document', function() {

      scope.doc = {
        _id: '111'
      };

      scope.deleteDocument();

      expect(docService.deleteDocument).toHaveBeenCalled();
      expect(docService.deleteDocument.calls.count()).toBe(1);

      deleteDocumentDeferred.resolve({});
      scope.$digest();

      expect(state.go).toHaveBeenCalledWith('user.home');
    });

    it('should add a role to a document', function() {

      scope.doc = {
        roles: "",
        _id: '111'
      };

      scope.addRole('role');

      expect(roleService.addDocumentRole).toHaveBeenCalled();
      expect(roleService.addDocumentRole.calls.count()).toBe(1);

      addRoleDeferred.resolve({});
      scope.$digest();

      expect(scope.doc.roles).toEqual("role");
    });


  });
});
