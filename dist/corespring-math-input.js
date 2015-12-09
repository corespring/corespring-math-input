/*! corespring-math-input - v0.0.1 - 2015-12-09
* Copyright (c) 2015 CoreSpring; Licensed MIT */
angular.module('corespring.math-input', [

]);

angular.module('corespring.math-input')
  .factory('MathInputController', [
  function() {


    return function controller() {

      return function() {
      // return function($scope) {

        // this.inputChanged = function($element) {
        //   $scope.inputChanged($element);
        // };

      };
    };
  }
]);
angular.module('corespring.math-input')
  .factory('MathInputDef', [
    '$log',
    function($log){

      var log = $log.debug.bind($log, '[new-math-input-def]');

      function MathInputDefinition(template, link){

        this.link = function($scope, $element, $attrs, ngModel) {

          console.log('math-input-definition');
          log('math-input-definition');

        };
      }

      return MathInputDefinition;
    }
  ]);

angular.module('corespring.math-input')
  .directive('mathInput', [
    'MathInputController',
    'MathInputDef',
    function(Controller, Def) {

      function template() {
        return [
          '<div class="math-input">',
          '  Math Input',
          '</div>'

        ].join('\n');
      }

      var def = new Def(template);

      return {
        restrict: 'E',
        link: def.link,
        replace: true,
        scope: {},
        controller: new Controller(),
        template: template()
      };
    }
  ]);