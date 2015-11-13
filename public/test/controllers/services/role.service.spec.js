describe('Role', function() {

  beforeEach(module('docManagerApp'));

  var roleService, httpBackend;

  beforeEach(inject(function(_RoleService_, $httpBackend) {

    roleService = _RoleService_;
    httpBackend = $httpBackend;

  }));

  describe('Role services', function() {

    it('should create a role', function() {

      httpBackend.whenPOST("/api/roles").respond({
        title: 'title',
        _id: '111'
      });

      roleService.createRole('title').then(function(res) {
        expect(res.data).toEqual(jasmine.objectContaining({
          title: 'title',
          _id: '111'
        }));
      });
      httpBackend.flush();
    });


    it('should get all roles', function() {

      httpBackend.whenGET("/api/roles").respond([{
        title: 'title1',
        _id: '111'

      }, {
        title: 'title2',
        _id: '112'
      }]);

      roleService.getRoles().then(function(res) {

        expect(angular.isArray(res.data)).toBe(true);
        expect(res.data.length).toBe(2);
      });
      httpBackend.flush();
    });


    it('should set user role', function() {

      httpBackend.whenPOST("/api/users/1/roles").respond({
        message: 'User role set'
      });

      roleService.setUserRole('1', 'role').then(function(res) {

        expect(res.data).toEqual(jasmine.objectContaining({
          message: 'User role set'
        }));
      });
      httpBackend.flush();
    });

    it('should set document role', function() {

      httpBackend.whenPOST("/api/documents/111/roles").respond({
        message: 'Document role added'
      });

      roleService.addDocumentRole('111', 'role').then(function(res) {

        expect(res.data).toEqual(jasmine.objectContaining({
          message: 'Document role added'
        }));
      });
      httpBackend.flush();
    });

  });

});
