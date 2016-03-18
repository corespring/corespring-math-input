angular.module('corespring.math-input')
  .directive('codepad', [
    'MathInputConfig','$document',
    function(MathInputConfig, $document) {

      function template() {
        return [
          '<div class="codepad" ng-mousedown="cancelEvent($event)">',
          '  <div>',
          '    <textarea class="code-input" placeholder="Enter MathML or LaTeX code here" ng-mousedown="cancelEvent($event)" ng-click="inputClick($event)" ng-model="codeModel" />',
          '  </div>',
          '  <div class="code-button" ng-class="{disabled: codeModel.length > 0}" ng-mousedown="cancelEvent($event)" ng-click="codeButtonClick()"><i class="fa fa-code"></i></div>',
          '</div>'
        ].join('\n');
      }

      var link = function($scope, $element, $attrs) {
        new MathInputConfig().postLink($scope);
        $scope.cancelEvent = function(ev) {
          ev.stopPropagation();
        };

        $scope.inputClick = function(ev) {
          $scope.cancelEvent(ev);
          $element.find('textarea').focus();
        };

        $scope.codeButtonClick = function() {
          if (_.isEmpty($scope.codeModel)) {
            $scope.backToKeypad();
          }
        };

        $element.find('textarea').focus();
      };

      return {
        restrict: 'E',
        link: link,
        template: template(),
        replace: true,
        scope: {
          codeModel: '=',
          backToKeypad: '&'
        }
      };
    }
  ]);