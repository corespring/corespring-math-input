angular.module('corespring.math-input')
  .directive('mathInput', [
    'MathInputConfig',
    '$log',
    '$compile',
    '$document',
    '$timeout',
    function(MathInputConfig, $log, $compile, $document, $timeout) {
      var log = $log.debug.bind($log, '[math-input-def]');

      function template() {
        return [
          '<div class="math-input">',
          '  <div class="input">',
          '    <span class="mq"></span>',
          '  </div>',
          '  <keypad ng-show="showKeypad" keypad-type="keypadType" show-keypad="showKeypad" on-click-callback="clickButton(action)"></keypad>',
          '</div>'

        ].join('\n');
      }

      var link = function($scope, $element, $attrs) {
        new MathInputConfig().postLink($scope);

        function initDom(el, attrs) {
          var node = $(template());
          var $node = $(node);

          // set id for directive instance
          $scope.instanceId = Math.random().toString(36).substring(7);
          $node.attr('id', $scope.instanceId);
          log('Instance ID: ' + $scope.instanceId);

          return $node;
        }

        function onInputFieldClick() {
          $scope.showKeypad = $scope.editable === 'true';
          $scope.focusedInput = $(this);
          $document.on('mousedown', function(event) {
            $scope.$apply(function() {
              $scope.showKeypad = false;
            });
            $document.off('mousedown');
          });
          $scope.$apply();
        }

        function fixBackslashes(expression) {
          return _.isString(expression) &&  expression.replace(/\\/g, '\\\\');
        }

        function onInputChange(skipApply) {
          var latex = $element.find('.mq').mathquill('latex');
          $scope.ngModel = fixBackslashes(latex);
          if (!skipApply) {
            $scope.$apply();
          }
        }

        function initMethods() {
          var mqElement = $element.find('.mq');
          mqElement.click(onInputFieldClick);
          $element.bind('input propertychange', onInputChange);
          $element.bind('keyup', function(ev) {
            // input propertychange does not fire for backspace, need to handle separately
            if (ev.keyCode === 8) {
              onInputChange();
            }
          });

          mqElement.mathquill($scope.editable === 'true' ? 'editable' : undefined);
          if ($scope.expression) {
            mqElement.mathquill('latex', $scope.expression);
            $scope.ngModel = fixBackslashes($scope.expression);
            mqElement.blur();
          } else {
            $scope.ngModel = '';
          }

          $scope.clickButton = function(action) {
            var button = $scope.buttons[action];
            if (button.logic === 'clear') {
              $scope.focusedInput.mathquill('latex', '');
              $timeout(function() {
                $scope.focusedInput.find('textarea').focus();
              }, 1);

            } else if (button.logic === 'cursor' || button.logic === 'cmd' || button.logic === 'write') {
              $scope.focusedInput.mathquill(button.logic, button.command);
              $timeout(function() {
                $scope.focusedInput.find('textarea').focus();
              }, 1);
            }

            onInputChange(true);
          };

          $timeout(function() {
            if ($scope.keypadAutoOpen === 'true') {
              onInputFieldClick.apply($element.find('.mq'));
              $scope.focusedInput.find('textarea').focus();
            }
          });
        }

        function init() {
          $scope.showKeypad = false;
          $scope.focusedInput = null;
          initMethods();
        }

        init();
      };

      return {
        restrict: 'E',
        link: link,
        template: template(),
        replace: true,
        scope: {
          expression: '=',
          editable: '@',
          keypadType: '=',
          keypadAutoOpen: '@',
          ngModel: '='
        }
      };
    }
  ]);