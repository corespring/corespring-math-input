angular.module('corespring.math-input')
  .directive('keypad', [
    'KeypadDef',
    function(Def) {

      function template() {
        return [
          '<div class="keypad" ng-class="keypadType">',

          '<div style="width: 20px; height: 20px" ng-bind-html="graphics.rest.absolute"></div>',


          '  <div class="{{ sections[section].code }}-section" ng-repeat="section in types[keypadType].sections">',
          '    <div ng-repeat="button in sections[section].buttons" ',
          '            id="{{button}}-button"',
          '            class="button {{buttons[button].cssClass}}"',
          '            title="{{buttons[button].name}}"',
          '            ng-disabled="buttons[button].disabled"',
          '            keypad-button="" keypad-button-graphics="graphics" keypad-button-button="button" keypad-button-click="onClick(button)" ',
          '    </div>',
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