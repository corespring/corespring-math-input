angular.module('corespring.math-input')
  .directive('mathInput', [
    'MathInputDef',
    function(Def) {

      function template() {
        return [
          '<div class="math-input">',
          '  <div class="input" ng-class="{ \'dotted\': dotted }">',
          '    <span class="mq"></span>',
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
          dotted: '=',
          editable: '@',
          keypadType: '=',
          ngModel: '='
        }
      };
    }
  ]);