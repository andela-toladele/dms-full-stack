describe('Document', function() {

  beforeEach(module('docManagerApp'));

  var docService, httpBackend;

  beforeEach(inject(function(_DocumentService_, $httpBackend) {

    docService = _DocumentService_;
    httpBackend = $httpBackend;

  }));

  describe('Document services', function() {

    it('should create a document', function() {

      httpBackend.whenPOST("/api/documents").respond({
        title: 'title',
        content: 'content',
        _id: '111'

      });

      docService.createDocument({
        title: 'title',
        content: 'content'
      }).then(function(res) {
        expect(res.data).toEqual(jasmine.objectContaining({
          title: 'title',
          content: 'content',
          _id: '111'
        }));
      });
      httpBackend.flush();
    });


    it('should get a document', function() {

      httpBackend.whenGET("/api/documents/111").respond({
        title: 'title',
        content: 'content',
        _id: '111'
      });

      docService.getDocument('111').then(function(res) {
        expect(res.data).toEqual(jasmine.objectContaining({
          title: 'title',
          content: 'content',
          _id: '111'
        }));
      });
      httpBackend.flush();
    });

    it('should delete a document', function() {

      httpBackend.whenDELETE("/api/documents/111").respond({
        _id: undefined
      });

      docService.deleteDocument('111').then(function(res) {

        expect(res.data).toEqual(jasmine.objectContaining({
          _id: undefined
        }));
      });
      httpBackend.flush();
    });

    it('should get viewable documents', function() {

      httpBackend.whenGET("/api/users/documents/viewable").respond([{
        title: 'title1',
        content: 'content1',
        _id: '111'

      }, {
        title: 'title2',
        content: 'content2',
        _id: '112'
      }]);

      docService.getViewableDocs().then(function(res) {

        expect(angular.isArray(res.data)).toBe(true);
        expect(res.data.length).toBe(2);
      });
      httpBackend.flush();
    });


    it('should get my documents', function() {

      httpBackend.whenGET("/api/user/documents").respond([{
        title: 'title1',
        content: 'content1',
        _id: '111'

      }]);

      docService.getMyDocs().then(function(res) {

        expect(angular.isArray(res.data)).toBe(true);
        expect(res.data.length).toBe(1);
      });
      httpBackend.flush();
    });

    it('should edit document', function() {

      httpBackend.whenPUT("/api/documents/111").respond({
        _id: '111',
        title: 'title1',
        content: 'content1'
      });

      docService.editDocument('111', {
        title: 'title2',
        content: 'content2'
      }).then(function(res) {

        expect(res.data).toEqual(jasmine.objectContaining({
          _id: '111',
          title: 'title1',
          content: 'content1'
        }));
      });
      httpBackend.flush();
    });

  });

});
