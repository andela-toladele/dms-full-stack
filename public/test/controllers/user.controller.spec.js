describe('Authentication', function() {

  beforeEach(module('docManagerApp'));

  var userService, httpBackend, logoutDeferred, getCurrentUserDeferred;

  var authCtrl, scope, location;


  beforeEach(inject(function($q, _UserService_, $rootScope, $controller, $location) {
    logoutDeferred = $q.defer();
    getCurrentUserDeferred = $q.defer();
    userService = _UserService_;
    // Mock services and spy on methods
    spyOn(userService, 'getCurrentUser').and.returnValue(getCurrentUserDeferred.promise);
    spyOn(userService, 'logout').and.returnValue(logoutDeferred.promise);

    // Initialize the controller and a mock scope.
    scope = $rootScope.$new();
    location = $location;
    $controller('userCtrl', {
      $scope: scope,
      UserService: userService,
      $location: location
    });

    spyOn(location, 'path');

  }));




  describe('Get current user in session', function() {

    it('should log in user in session', function() {

      expect(userService.getCurrentUser).toHaveBeenCalled();
      expect(userService.getCurrentUser.calls.count()).toBe(1);

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

      getCurrentUserDeferred.resolve({
        data: user
      });

      scope.$digest();

      expect(scope.loggedIn).toBe(true);
      expect(scope.user.role).toEqual('guest');
    });

    it('should route to login page if no user in session', function() {

      expect(userService.getCurrentUser).toHaveBeenCalled();
      expect(userService.getCurrentUser.calls.count()).toBe(1);



      getCurrentUserDeferred.reject({});

      scope.$digest();

      expect(scope.loggedIn).toBe(false);
      expect(location.path).toHaveBeenCalledWith('/user/login');
    });

  });

  describe('Log out', function() {

    it('should log user out', function() {

      scope.logout();

      expect(userService.logout).toHaveBeenCalled();
      expect(userService.logout.calls.count()).toBe(1);

      logoutDeferred.resolve({});

      scope.$digest();

      expect(scope.loggedIn).toBe(false);
      expect(location.path).toHaveBeenCalledWith('/user/login');
    });

  });

});
