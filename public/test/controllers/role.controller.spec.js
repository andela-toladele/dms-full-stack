describe('Role', function() {

  beforeEach(module('docManagerApp'));

  var roleService, httpBackend, createRoleDeferred;

  var authCtrl, scope;


  beforeEach(inject(function($q, _RoleService_, $rootScope, $controller) {

    createRoleDeferred = $q.defer();
    roleService = _RoleService_;
    // Mock services and spy on methods
    spyOn(roleService, 'createRole').and.returnValue(createRoleDeferred.promise);    

    // Initialize the controller and a mock scope.
    scope = $rootScope.$new();    
    spyOn(scope, '$emit');
    $controller('roleCtrl', {
      $scope: scope,
      RoleService: roleService
    });
  }));




  describe('Create Role', function() {

    it('should create a new role', function() {
      scope.tile = "title";
      scope.createRole();
      expect(roleService.createRole).toHaveBeenCalled();
      expect(roleService.createRole.calls.count()).toBe(1);

     
      createRoleDeferred.resolve({});

      scope.$digest();

      expect(scope.title).toBe("");
    });
  });
});
