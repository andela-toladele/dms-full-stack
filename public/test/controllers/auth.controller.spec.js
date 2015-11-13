describe('User', function() {

  beforeEach(module('docManagerApp'));

  var userService, httpBackend, loginDeferred, createUserDeferred;

  var scope, location;


  beforeEach(inject(function($q, _UserService_, $rootScope, $controller, $location) {
    loginDeferred = $q.defer();
    createUserDeferred = $q.defer();
    userService = _UserService_;
    // Mock services and spy on methods
    spyOn(userService, 'login').and.returnValue(loginDeferred.promise);
    spyOn(userService, 'createUser').and.returnValue(createUserDeferred.promise);

    // Initialize the controller and a mock scope.
    scope = $rootScope.$new();
    location = $location;
    $controller('authCtrl', {
      $scope: scope,
      UserService: userService,
      $location: location
    });

    spyOn(location, 'path');

  }));


  describe('Sign up', function() {

    it('should sign up user', function() {

      scope.newUser = {};
      scope.newUser.username = 'name';
      scope.newUser.email = 'email';
      scope.signUp();
      expect(userService.createUser).toHaveBeenCalled();
      expect(userService.createUser.calls.count()).toBe(1);

      var user = {
        username: 'name',
        email: 'email',
        name: {
          firstname: 'fname',
          lastname: 'lname'
        },
        roleId: '1'
      };

      createUserDeferred.resolve({
        data: user
      });

      scope.$digest();

      expect(location.path).toHaveBeenCalledWith('/user/login');
    });

  });

  describe('Log in', function() {

    it('should login user', function() {

      scope.username = 'name';
      scope.password = '****';
      scope.login();
      expect(userService.login).toHaveBeenCalled();
      expect(userService.login.calls.count()).toBe(1);

      var user = {
        username: 'name',
        email: 'email',
        name: {
          firstname: 'fname',
          lastname: 'lname'
        },
        roleId: {
          title: 'guest'
        }
      };

      loginDeferred.resolve({
        data: user
      });

      scope.$digest();

      expect(scope.loggedIn).toBe(true);
      expect(location.path).toHaveBeenCalledWith('/user/home');
    });

  });

});
