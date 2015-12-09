/* jshint maxparams: 24 */
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
