describe('math input', function() {

  describe('keypad button', function() {
    'use strict';
    var element, scope, directiveScope;

    beforeEach(module('corespring.math-input'));

    function createDirective(opts) {
      return inject(function($compile, $rootScope) {
        var s = $rootScope.$new();
        var node = angular.element([
          '<keypad-button keypad-button-click="click()">',
          '</keypad-button>'
        ].join('\n'));
        element = $compile(node)(s);
        scope = s;

        s.click = jasmine.createSpy('click');

        s.$digest();
        directiveScope = element.isolateScope();
      });
    }


    describe('init', function() {
      beforeEach(createDirective());

      it('button is in rest state', function() {
        expect(directiveScope.state).toBe('rest');
      });
    });

    describe('behaviour', function() {
      beforeEach(createDirective());

      it('state changes to on when mouse button is pressed on button', function() {
        element.trigger('mousedown');
        expect(directiveScope.state).toBe('on');
      });

      it('state changes to rest when mouse gets moved out of button', function() {
        element.trigger('mousedown');
        element.trigger('mouseout');
        expect(directiveScope.state).toBe('rest');
      });

      it('state changes to rest and  click handler gets called when mouse button is released on button', function() {
        element.trigger('mouseup');
        expect(scope.click).toHaveBeenCalled();
        expect(directiveScope.state).toBe('rest');
      });

    });


  });
});