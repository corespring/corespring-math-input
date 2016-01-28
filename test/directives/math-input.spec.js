describe('math input', function() {

  describe('math-input', function() {
    'use strict';
    var element, scope, directiveScope;

    beforeEach(module('corespring.math-input'));
    beforeEach(function() {
      $.fn.extend({mathquill: function() {
      }});
      spyOn($.fn, "mathquill").and.returnValue(function() {});
    });

    function createDirective(opts) {
      opts = _.defaults(opts || {}, {editable: true});
      return inject(function($compile, $rootScope) {
        scope = $rootScope.$new();
        var node = angular.element([
          '<math-input editable="' + opts.editable + '"',
          opts.expression ? ('expression="\''+opts.expression+'\'"') : '',
          '>',
          '</math-input>'
        ].join('\n'));
        element = $compile(node)(scope);
        directiveScope = element.isolateScope();
      });
    }

    describe('init', function() {
      it('keypad is hidden, no input focused', function() {
        createDirective();
        expect(directiveScope.showKeypad).toBe(false);
        expect(directiveScope.focusedInput).toBe(null);
      });
      it('editable by default', function() {
        createDirective();
        expect($.fn.mathquill.calls.argsFor(0)).toEqual(['editable']);
      });
      it('calls mathquill with non editable if editable is false', function() {
        createDirective({editable: false});
        expect($.fn.mathquill.calls.argsFor(0)).toEqual([undefined]);
      });
      it('without expression', function() {
        createDirective();
        expect($.fn.mathquill.calls.count()).toEqual(1);
        expect($.fn.mathquill.calls.argsFor(0)).toEqual(['editable']);
      });
      it('with expression', function() {
        createDirective({expression: "2x+3"});
        expect($.fn.mathquill.calls.count()).toEqual(2);
        expect($.fn.mathquill.calls.argsFor(0)).toEqual(['editable']);
        expect($.fn.mathquill.calls.argsFor(1)).toEqual(['latex','2x+3']);
      });
      it('expression populates ngModel', function() {
        createDirective({expression: '\\\\frac{3}{4}'});
        expect(directiveScope.ngModel).toEqual('\\\\frac{3}{4}');
      });
    });
  });
});