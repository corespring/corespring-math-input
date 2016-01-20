angular.module('corespring.math-input')
  .factory('KeypadDef', [
    'MathInputConfig',
    '$log',
    '$compile',
    function(MathInputConfig, $log, $compile){

      var log = $log.debug.bind($log, '[new-keypad-def]');

      function KeypadDefinition(template, link){

        this.link = function($scope, $element, $attrs, ngModel) {
          new MathInputConfig().postLink($scope);

          function initMethods() {

            $scope.onClick = function(button) {
              if(_.isFunction($scope.onClickCallback)){
                $scope.onClickCallback({ action: button });
              }
            };
          }

          function init() {
            var node = $(template());
            var $node = $(node);
            $element.html($node);
            $compile($node)($scope);

            initMethods();

            $scope.state = 'rest';
          }

          init();

        };
      }

      return KeypadDefinition;
    }
  ]);