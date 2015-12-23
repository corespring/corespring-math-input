angular.module('corespring.math-input')
  .directive('mathInput', [
    'MathInputController',
    'MathInputDef',
    function(Controller, Def) {

      function template() {
        return [
          '<div class="math-input">',
          '  <div class="input" ng-class="{ \'dotted\': dotted }">',
          '    <span ng-class="editable ? \'mathquill-editable\' : \'mathquill-embedded-latex\'">{{expression}}</span>',
          '  </div>',
          '  <keypad ng-show="showKeypad" keypad-type="keypadType" show-keypad="showKeypad" on-click-callback="clickButton(action)"></keypad>',
          '</div>'

        ].join('\n');
      }

      var def = new Def(template);

      return {
        restrict: 'E',
        link: def.link,
        replace: true,
        scope: {
          expression: '=',
          editable: '=',
          dotted: '=',
          keypadType: '='
        }
      };
    }
  ]);