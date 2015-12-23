angular.module('corespring.math-input')
  .factory('MathInputConfig', [
    function() {
      var angularUnits = {};
      angularUnits.DEGREES = 'degrees';
      angularUnits.RADIANS = 'radians';

      var buttons = {};
      // Cursor section
      buttons.left = { id: 'left', name: 'Move left', symbol: 'l', logic: 'cursor', comamnd: '', cssClass: 'cursor' };
      buttons.right = { id: 'right', name: 'Move right', symbol: 'r', logic: 'cursor', comamnd: '', cssClass: 'cursor' };
      buttons.up = { id: 'up', name: 'Move up', symbol: 'u', logic: 'cursor', comamnd: '', cssClass: 'cursor' };
      buttons.down = { id: 'down', name: 'Move down', symbol: 'd', logic: 'cursor', comamnd: '', cssClass: 'cursor' };
      buttons.backspace = { id: 'left', name: 'Move left', symbol: 'b', logic: 'cursor', comamnd: '', cssClass: 'cursor' };

      var sections = {};
      sections.cursor = {
        name: 'Move cursor area',
        buttons: ['left', 'right', 'up', 'down', 'backspace'],
        code: 'cursor'
      };

      var types = {};
      types.basic = {
        name: 'Basic',
        sections: ['cursor']
      };

      function MathInputConfig() {

        this.postLink = function(scope) {
          scope.types = types;
          scope.sections = sections;
          scope.buttons = buttons;
          scope.angularUnits = angularUnits;
        };
      }

      return MathInputConfig;
    }
  ]);