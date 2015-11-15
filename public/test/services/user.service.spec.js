describe('User', function() {

  beforeEach(module('docManagerApp'));

  var userService, httpBackend;

  beforeEach(inject(function(_UserService_, $httpBackend) {

    userService = _UserService_;
    httpBackend = $httpBackend;

  }));



  describe('User services', function() {

    it('should create a user', function() {

      httpBackend.whenPOST("/api/users").respond({
        username: 'name',
        _id: '1'

      });

      userService.createUser({
        username: 'name'
      }).then(function(res) {
        expect(res.data).toEqual(jasmine.objectContaining({
          username: 'name',
          _id: '1'
        }));
      });
      httpBackend.flush();
    });


    it('should get a user', function() {

      httpBackend.whenGET("/api/user").respond({
        username: 'name',
        _id: '1'

      });

      userService.getCurrentUser().then(function(res) {
        expect(res.data).toEqual(jasmine.objectContaining({
          username: 'name',
          _id: '1'
        }));
      });
      httpBackend.flush();
    });

    it('should get all user', function() {

      httpBackend.whenGET("/api/users").respond([{
        username: 'name',
        _id: '1'

      }, {
        username: 'name2',
        _id: '2'

      }]);

      userService.getAllUsers().then(function(res) {

        expect(angular.isArray(res.data)).toBe(true);
        expect(res.data.length).toBe(2);
      });
      httpBackend.flush();
    });


    it('should edit user', function() {

      httpBackend.whenPUT("/api/users/1").respond({
        _id: '1'
      });

      userService.editProfile({
        _id: '1'
      }).then(function(res) {

        expect(res.data).toEqual(jasmine.objectContaining({
          _id: '1'
        }));
      });
      httpBackend.flush();
    });

    it('should login user', function() {

      httpBackend.whenPOST("/api/users/login").respond({
        _id: '1',
        username: 'name'
      });

      userService.login({
        _id: '1'
      }).then(function(res) {

        expect(res.data).toEqual(jasmine.objectContaining({
          _id: '1',
          username: 'name'
        }));
      });
      httpBackend.flush();
    });

    it('should login user', function() {

      httpBackend.whenPOST("/api/users/logout").respond({
        _id: undefined
      });

      userService.logout().then(function(res) {

        expect(res.data).toEqual(jasmine.objectContaining({
          _id: undefined
        }));
      });
      httpBackend.flush();
    });
  });

});
