describe('math input', function() {

  describe('math-input', function() {
    'use strict';
    var element, scope, directiveScope;

    beforeEach(module('corespring.math-input'));
    beforeEach(function() {
      $.fn.extend({mathquill: function() {
      }});
    });

    function createDirective(opts) {
      opts = _.defaults(opts || {}, {editable: true});
      return inject(function($compile, $rootScope) {
        scope = $rootScope.$new();
        var node = angular.element([
          '<math-input editable="' + opts.editable + '">',
          '</math-input>'
        ].join('\n'));
        element = $compile(node)(scope);
        directiveScope = element.isolateScope();
      });
    }

    describe('init', function() {
      beforeEach(createDirective());
      it('keypad is hidden, no input focused', function() {
        expect(directiveScope.showKeypad).toBe(false);
        expect(directiveScope.focusedInput).toBe(null);
      });
    });
  });
});