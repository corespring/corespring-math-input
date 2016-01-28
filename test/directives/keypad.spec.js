describe('math input', function() {

  describe('keypad', function() {
    'use strict';
    var element, scope, directiveScope;

    beforeEach(module('corespring.math-input'));

    function createDirective() {
      return inject(function($compile, $rootScope) {
        scope = $rootScope.$new();
        var node = angular.element([
          '<keypad on-click-callback="clickButton()">',
          '</keypad>'
        ].join('\n'));
        element = $compile(node)(scope);
        directiveScope = element.isolateScope();

        scope.clickButton = jasmine.createSpy();
      });
    }

    describe('behaviour', function() {
      beforeEach(createDirective());
      it('onClick calls onclick handler', function() {
        directiveScope.onClick();
        expect(scope.clickButton).toHaveBeenCalled();
      });
    });
  });
});