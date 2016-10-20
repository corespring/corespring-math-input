angular.module('corespring.math-input')
  .directive('keypad', [
    'MathInputConfig',
    function(MathInputConfig) {

      function template() {
        return [
          '<div class="keypad" ng-class="keypadType">',
          '  <div class="{{sections[section].code}}-section" ng-repeat="section in types[keypadType].sections">',
          '    <div ng-repeat="button in sections[section].buttons" ',
          '            id="{{button}}-button"',
          '            class="button {{buttons[button].cssClass}}"',
          '            title="{{buttons[button].name}}"',
          '            ng-disabled="buttons[button].disabled"',
          '            keypad-button=""',
          '            keypad-button-graphics="graphics"',
          '            keypad-button-button="button"',
          '            keypad-button-click="onClick(button)">',
          '    </div>',
          '  </div>',
          '  <div ng-show="showCodeButton == \'true\'">',
          '    <div class="code-button" ng-mousedown="cancel($event)" ng-click="codeButtonClick($event)"><i class="fa fa-code"></i></div>',
          '  </div>',
          '</div>'
        ].join('\n');
      }

      var link = function($scope, $element, $attrs) {
        new MathInputConfig().postLink($scope);
        $scope.cancel = function(ev) {
          ev.stopPropagation();
          ev.preventDefault();
        };

        $scope.codeButtonClick = function(ev) {
          $scope.cancel(ev);
          $scope.showCodepadCallback();
        };

        $scope.onClick = function(button) {
          if (_.isFunction($scope.onClickCallback)) {
            $scope.onClickCallback({action: button});
          }
        };
      };

      return {
        restrict: 'E',
        link: link,
        template: template(),
        replace: true,
        scope: {
          keypadType: '=',
          onClickCallback: '&',
          codeModel: '=',
          showCodepadCallback: '&',
          showCodeButton: '@'
        }
      };
    }
  ]);