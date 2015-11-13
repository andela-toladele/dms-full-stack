describe('User', function() {

  beforeEach(module('docManagerApp'));

  var userService, httpBackend, getRolesDeferred, getViewableDocsDeferred, getMyDocsDeferred, editProfileDeferred, setUserRoleDeferred;

  var scope, rootScope;


  beforeEach(inject(function($q, _UserService_, _RoleService_, _DocumentService_, $rootScope, $controller, $state) {
    getRolesDeferred = $q.defer();
    getViewableDocsDeferred = $q.defer();
    getMyDocsDeferred = $q.defer();
    editProfileDeferred = $q.defer();
    setUserRoleDeferred = $q.defer();

    userService = _UserService_;
    roleService = _RoleService_;
    docService = _DocumentService_;
    rootScope = $rootScope;

    // Mock services and spy on methods
    spyOn(roleService, 'getRoles').and.returnValue(getRolesDeferred.promise);
    spyOn(roleService, 'setUserRole').and.returnValue(setUserRoleDeferred.promise);
    spyOn(docService, 'getViewableDocs').and.returnValue(getViewableDocsDeferred.promise);
    spyOn(docService, 'getMyDocs').and.returnValue(getMyDocsDeferred.promise);
    spyOn(userService, 'editProfile').and.returnValue(editProfileDeferred.promise);

    // Initialize the controller and a mock scope.
    scope = $rootScope.$new();
    state = $state;

    $controller('homeCtrl', {
      $scope: scope,
      UserService: userService,
      RoleService: roleService,
      DocumentService: docService,
      $rootScope: rootScope,
      $state: state
    });

    spyOn(state, 'go');

  }));

  describe('Initialize', function() {

    it('should load all page data', function() {

      scope.$digest();

      expect(roleService.getRoles).toHaveBeenCalled();
      expect(roleService.getRoles.calls.count()).toBe(1);

      expect(docService.getViewableDocs).toHaveBeenCalled();
      expect(docService.getViewableDocs.calls.count()).toBe(1);

      expect(docService.getMyDocs).toHaveBeenCalled();
      expect(docService.getMyDocs.calls.count()).toBe(1);


      getRolesDeferred.resolve({
        data: [{
          title: 'role1'
        }, {
          title: 'role2'
        }]
      });

      getViewableDocsDeferred.resolve({
        data: [{
          title: 'doc1',
          content: 'content1'
        }, {
          title: 'doc2',
          content: 'content2'
        }]
      });

      getMyDocsDeferred.resolve({
        data: [{
          title: 'doc1',
          content: 'content1'
        }]
      });

      scope.$digest();

      expect(angular.isArray(scope.roles)).toBe(true);
      expect(angular.isArray(scope.allDocuments)).toBe(true);
      expect(angular.isArray(scope.myDocuments)).toBe(true);

      expect(scope.roles.length).toBe(2);
      expect(scope.allDocuments.length).toBe(2);
      expect(scope.myDocuments.length).toBe(1);
    });

  });

  describe('Edit user', function() {

    it('should edit user', function() {

      scope.editUser({username: 'name', email: 'email'});
      expect(userService.editProfile).toHaveBeenCalled();
      expect(userService.editProfile.calls.count()).toBe(1);      

      editProfileDeferred.resolve({});

      scope.$digest();

      expect(scope.editMode).toBe(false);      
    });

  });

  describe('User role', function() {

    it('should set user role', function() {

      rootScope.user = {};

      scope.setUserRole('1', 'admin');      

      expect(roleService.setUserRole).toHaveBeenCalled();
      expect(roleService.setUserRole.calls.count()).toBe(1);      

      setUserRoleDeferred.resolve({});

      scope.$digest();

      expect(scope.user.role).toEqual("admin");      
    });

  });

  describe('View document', function() {

    it('should navigate to document page', function() {


      scope.viewDocument('111');
      scope.$digest();

      expect(state.go).toHaveBeenCalledWith('user.document', {
        doc_id: '111'
      }); 
    });

  });

});
