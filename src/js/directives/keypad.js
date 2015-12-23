angular.module('corespring.math-input')
  .directive('keypad', [
    'KeypadDef',
    function(Def) {

      function template() {
        return [
          '<div class="keypad" ng-class="keypadType">',
          '  <div class="{{ sections[section].code }}-section" ng-repeat="section in types[keypadType].sections">',
          '    <button ng-repeat="button in sections[section].buttons" ',
          '            id="{{button}}-button"',
          '            class="button {{buttons[button].cssClass}}"',
          '            title="{{buttons[button].name}}"',
          '            ng-click="onClick(button)">',
          '            {{buttons[button].symbol}}</button>',
          '  </div>',
          '</div>'
        ].join('\n');
      }

      var def = new Def(template);

      return {
        restrict: 'E',
        link: def.link,
        replace: true,
        scope: {
          keypadType: '=',
          showKeypad: '=',
          onClickCallback: '&'
        }
      };
    }
  ]);