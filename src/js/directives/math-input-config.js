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
      // Numeric section
      buttons.one = { id: 'one', name: 'One', symbol: '1', logic: 'cmd', comamnd: '', cssClass: 'number' };
      buttons.two = { id: 'two', name: 'Two', symbol: '2', logic: 'cmd', comamnd: '', cssClass: 'number' };
      buttons.three = { id: 'three', name: 'Three', symbol: '3', logic: 'cmd', comamnd: '', cssClass: 'number' };
      buttons.four = { id: 'four', name: 'Four', symbol: '4', logic: 'cmd', comamnd: '', cssClass: 'number' };
      buttons.five = { id: 'five', name: 'Five', symbol: '5', logic: 'cmd', comamnd: '', cssClass: 'number' };
      buttons.six = { id: 'six', name: 'Six', symbol: '6', logic: 'cmd', comamnd: '', cssClass: 'number' };
      buttons.seven = { id: 'seven', name: 'Seven', symbol: '7', logic: 'cmd', comamnd: '', cssClass: 'number' };
      buttons.eight = { id: 'eight', name: 'Eight', symbol: '8', logic: 'cmd', comamnd: '', cssClass: 'number' };
      buttons.nine = { id: 'nine', name: 'Nine', symbol: '9', logic: 'cmd', comamnd: '', cssClass: 'number' };
      buttons.zero = { id: 'zero', name: 'Zero', symbol: '0', logic: 'cmd', comamnd: '', cssClass: 'number' };
      buttons.decimal = { id: 'decimal', name: 'Decimal point', symbol: '.', logic: 'cmd', comamnd: '', cssClass: 'number' };
      buttons.equals = { id: 'equals', name: 'Equals', symbol: '=', logic: 'cmd', comamnd: '', cssClass: 'number' };

      var sections = {};
      sections.cursor = {
        name: 'Move cursor area',
        buttons: ['left', 'right', 'up', 'down', 'backspace'],
        code: 'cursor'
      };
      sections.numeric = {
        name: 'Numeric area',
        buttons: ['seven', 'eight', 'nine', 'four', 'five', 'six', 'one', 'two', 'three', 'zero', 'decimal', 'equals'],
        code: 'numeric'
      };

      var types = {};
      types.basic = {
        name: 'Basic',
        sections: ['cursor', 'numeric']
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