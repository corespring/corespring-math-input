angular.module('corespring.math-input')
  .factory('MathInputConfig', [
    '$sce',
    function($sce) {
      var angularUnits = {};
      angularUnits.DEGREES = 'degrees';
      angularUnits.RADIANS = 'radians';

      var buttons = {};
      // Cursor section
      buttons.left = { id: 'left', name: 'Move left', symbol: $sce.trustAsHtml('&larr;'), logic: 'cursor', command: 'left', shortcut: '', cssClass: 'cursor' };
      buttons.right = { id: 'right', name: 'Move right', symbol: $sce.trustAsHtml('&rarr;'), logic: 'cursor', command: 'right', shortcut: '', cssClass: 'cursor' };
      buttons.up = { id: 'up', name: 'Move up', symbol: $sce.trustAsHtml('&uarr;'), logic: 'cursor', command: '', shortcut: 'up', cssClass: 'cursor' };
      buttons.down = { id: 'down', name: 'Move down', symbol: $sce.trustAsHtml('&darr;'), logic: 'cursor', command: 'down', shortcut: '', cssClass: 'cursor' };
      buttons.backspace = { id: 'backspace', name: 'Backspace', symbol: $sce.trustAsHtml('&LeftArrowBar;'), logic: 'cursor', command: 'backspace', shortcut: '', cssClass: 'cursor' };
      // Numeric section
      buttons.one = { id: 'one', name: 'One', symbol: $sce.trustAsHtml('1'), logic: 'cmd', command: '1', shortcut: '', cssClass: 'number' };
      buttons.two = { id: 'two', name: 'Two', symbol: $sce.trustAsHtml('2'), logic: 'cmd', command: '2', shortcut: '', cssClass: 'number' };
      buttons.three = { id: 'three', name: 'Three', symbol: $sce.trustAsHtml('3'), logic: 'cmd', command: '3', shortcut: '', cssClass: 'number' };
      buttons.four = { id: 'four', name: 'Four', symbol: $sce.trustAsHtml('4'), logic: 'cmd', command: '4', shortcut: '', cssClass: 'number' };
      buttons.five = { id: 'five', name: 'Five', symbol: $sce.trustAsHtml('5'), logic: 'cmd', command: '5', shortcut: '', cssClass: 'number' };
      buttons.six = { id: 'six', name: 'Six', symbol: $sce.trustAsHtml('6'), logic: 'cmd', command: '6', shortcut: '', cssClass: 'number' };
      buttons.seven = { id: 'seven', name: 'Seven', symbol: $sce.trustAsHtml('7'), logic: 'cmd', command: '7', shortcut: '', cssClass: 'number' };
      buttons.eight = { id: 'eight', name: 'Eight', symbol: $sce.trustAsHtml('8'), logic: 'cmd', command: '8', shortcut: '', cssClass: 'number' };
      buttons.nine = { id: 'nine', name: 'Nine', symbol: $sce.trustAsHtml('9'), logic: 'cmd', command: '9', shortcut: '', cssClass: 'number' };
      buttons.zero = { id: 'zero', name: 'Zero', symbol: $sce.trustAsHtml('0'), logic: 'cmd', command: '0', shortcut: '', cssClass: 'number' };
      buttons.decimal = { id: 'decimal', name: 'Decimal point', symbol: $sce.trustAsHtml('.'), logic: 'cmd', command: '.', shortcut: '', cssClass: 'number' };
      buttons.equals = { id: 'equals', name: 'Equals', symbol: $sce.trustAsHtml('='), logic: 'cmd', command: '=', shortcut: '', cssClass: 'number' };
      // Basic operations section
      buttons.plus = { id: 'plus', name: 'Plus', symbol: $sce.trustAsHtml('+'), logic: 'cmd', command: '+', shortcut: '', cssClass: 'basic-operation' };
      buttons.minus = { id: 'minus', name: 'Minus', symbol: $sce.trustAsHtml('-'), logic: 'cmd', command: '-', shortcut: '', cssClass: 'basic-operation' };
      buttons.multiply = { id: 'multiply', name: 'Multiply', symbol: $sce.trustAsHtml('x'), logic: 'cmd', command: '\\times', shortcut: '', cssClass: 'basic-operation' };
      buttons.divide = { id: 'divide', name: 'Divide', symbol: $sce.trustAsHtml('&#247'), logic: 'cmd', command: '\\div', shortcut: '', cssClass: 'basic-operation' };

      var sections = {};
      sections.cursor = {
        name: 'Move cursor section',
        buttons: ['left', 'right', 'up', 'down', 'backspace'],
        code: 'cursor'
      };
      sections.numeric = {
        name: 'Numeric section',
        buttons: ['seven', 'eight', 'nine', 'four', 'five', 'six', 'one', 'two', 'three', 'zero', 'decimal', 'equals'],
        code: 'numeric'
      };
      sections.basic = {
        name: 'Basic functions section',
        buttons: ['plus', 'minus', 'multiply', 'divide'],
        code: 'basic'
      };

      var types = {};
      types.basic = {
        name: 'Basic',
        sections: ['cursor', 'numeric', 'basic']
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