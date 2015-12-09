angular.module('corespring.math-input')
  .directive('mathInput', [
    'MathInputController',
    'MathInputDef',
    function(Controller, Def) {

      // function template(config) {
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
        require: 'ngModel',
        replace: true,
        scope: {
        },
        controller: new Controller()

      };
    }
  ]);