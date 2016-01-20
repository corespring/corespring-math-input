angular.module('corespring.math-input')
  .directive('keypadButton', [
    function() {


      return {
        restrict: 'AE',
        scope: {
          click: "&keypadButtonClick",
          graphics: "=keypadButtonGraphics",
          button: "=keypadButtonButton"
        },
        template: '<div style="width: 28px; height: 28px" ng-bind-html="graphics[state][button]"></div>',
        link: function($scope, $element) {

          $scope.state = 'rest';
          $element.mousedown(function($event) {
            console.log("LI");
            $event.preventDefault();
            $event.stopPropagation();
            $scope.$apply(function() {
              $scope.state = 'on';
            });
          });
          $element.mouseup(function($event) {
            $event.preventDefault();
            $event.stopPropagation()
            $scope.$apply(function() {
              $scope.state = 'rest';
              $scope.click();
            });
          });
          $element.mouseout(function($event) {
            $scope.$apply(function() {
              $scope.state = 'rest';
            });
          });

        }
      };
    }
  ]);