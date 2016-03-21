describe('math input', function() {

  describe('math-input', function() {
    'use strict';
    var element, scope, directiveScope, timeout;

    beforeEach(module('corespring.math-input'));
    beforeEach(function() {
      $.fn.extend({
        mathquill: function() {
        }
      });
      spyOn($.fn, "mathquill").and.returnValue(function() {
      });
    });

    function createDirective(opts) {
      opts = _.defaults(opts || {}, {editable: true});
      return inject(function($compile, $rootScope, $timeout) {
        scope = $rootScope.$new();
        var node = angular.element([
          '<math-input ng-model="model" keypad-type="\'basic\'" editable="' + opts.editable + '" ',
          opts.expression ? ('expression="\'' + opts.expression + '\'" ') : ' ',
          opts.autoOpen ? ('keypad-auto-open="true" ') : ' ',
          '>',
          '</math-input>'
        ].join('\n'));
        element = $compile(node)(scope);
        directiveScope = element.isolateScope();
        timeout = $timeout;
        $timeout.flush();
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
        expect($.fn.mathquill.calls.argsFor(1)).toEqual(['latex', '2x+3']);
      });

      it('expression populates ngModel', function() {
        createDirective({expression: '\\\\frac{3}{4}'});
        expect(directiveScope.ngModel).toEqual('\\\\frac{3}{4}');
      });

      it('keypad auto open opens keypad', function() {
        createDirective({autoOpen: true});
        expect(directiveScope.showKeypad).toEqual(true);
        expect(directiveScope.focusedInput.selector).toEqual('.mq');
      });
    });

    describe('buttons', function() {
      it('clear clears out the input', function() {
        createDirective({autoOpen: true});
        $.fn.mathquill.calls.reset();
        directiveScope.clickButton('ac');
        expect($.fn.mathquill.calls.count()).toEqual(2);
        expect($.fn.mathquill.calls.argsFor(0)).toEqual(['latex', '']);
        expect($.fn.mathquill.calls.argsFor(1)).toEqual(['latex']);
      });
      it('cursor logic is executed', function() {
        createDirective({autoOpen: true});
        $.fn.mathquill.calls.reset();
        directiveScope.clickButton('left');
        expect($.fn.mathquill.calls.argsFor(0)).toEqual(['cursor', 'moveLeft']);
      });
      it('command logic is executed', function() {
        createDirective({autoOpen: true});
        $.fn.mathquill.calls.reset();
        directiveScope.clickButton('two');
        expect($.fn.mathquill.calls.argsFor(0)).toEqual(['cmd', '2']);
      });
      it('write logic is executed', function() {
        createDirective({autoOpen: true});
        $.fn.mathquill.calls.reset();
        directiveScope.clickButton('approx');
        expect($.fn.mathquill.calls.argsFor(0)).toEqual(['write', '\\approx']);
      });
    });


  });
});