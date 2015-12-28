angular.module('corespring.math-input')
  .factory('MathInputConfig', [
    '$sce',
    function($sce) {

      var buttons = {};
      // Cursor section
      buttons.left = { id: 'left', name: 'Move left', symbol: $sce.trustAsHtml('&larr;'), logic: 'cursor', command: 'moveLeft', shortcut: '', cssClass: 'cursor' };
      buttons.right = { id: 'right', name: 'Move right', symbol: $sce.trustAsHtml('&rarr;'), logic: 'cursor', command: 'moveRight', shortcut: '', cssClass: 'cursor' };
      buttons.up = { id: 'up', name: 'Move up', symbol: $sce.trustAsHtml('&uarr;'), logic: 'cursor', command: '', shortcut: 'moveUp', cssClass: 'cursor' };
      buttons.down = { id: 'down', name: 'Move down', symbol: $sce.trustAsHtml('&darr;'), logic: 'cursor', command: 'moveDown', shortcut: '', cssClass: 'cursor' };
      buttons.backspace = { id: 'backspace', name: 'Backspace', symbol: $sce.trustAsHtml('&LeftArrowBar;'), logic: 'cursor', command: 'backspace', shortcut: '', cssClass: 'cursor' };
      // Numeric section
      buttons.one = { id: 'one', name: 'One', symbol: $sce.trustAsHtml('1'), logic: 'write', command: '1', shortcut: '', cssClass: 'number' };
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
      // Root section
      buttons.sqrt = { id: 'sqrt', name: 'Square root', symbol: $sce.trustAsHtml('&#8730'), logic: 'cmd', command: '\\sqrt', shortcut: '', cssClass: 'root' };
      buttons.root = { id: 'root', name: 'Root', symbol: $sce.trustAsHtml('n&#8730'), logic: 'write', command: '\\sqrt[{}]{}', shortcut: '', cssClass: 'root' };
      // Fraction section
      buttons.fraction = { id: 'fraction', name: 'Fraction', symbol: $sce.trustAsHtml('x/n'), logic: 'cmd', command: '\\frac', shortcut: '', cssClass: 'fraction' };
      buttons.mixed_fraction = { id: 'mixed_fraction', name: 'Mixed fraction', symbol: $sce.trustAsHtml('x a/b'), logic: 'write', command: 'x\\frac{}{}', shortcut: '', cssClass: 'fraction' };
      // Subscript/Superscript section
      buttons.subscript = { id: 'subscript', name: 'Subscript', symbol: $sce.trustAsHtml('x_n'), logic: 'cmd', command: '_', shortcut: '', cssClass: 'sub-sup' }; //<sub>n</sub>
      buttons.superscript = { id: 'superscript', name: 'Superscript', symbol: $sce.trustAsHtml('x^n'), logic: 'cmd', command: '^', shortcut: '', cssClass: 'sub-sup' };//<sup>n</sup>
      // Vars section
      buttons.x = { id: 'x', name: 'X', symbol: $sce.trustAsHtml('x'), logic: 'cmd', command: 'x', shortcut: '', cssClass: 'vars' }; //<sub>n</sub>
      buttons.y = { id: 'y', name: 'Y', symbol: $sce.trustAsHtml('y'), logic: 'cmd', command: 'y', shortcut: '', cssClass: 'vars' };//<sup>n</sup>
      // Misc section
      buttons.percentage = { id: 'percentage', name: 'Percentage', symbol: $sce.trustAsHtml('%'), logic: 'cmd', command: '%', shortcut: '', cssClass: 'misc' };
      buttons.parenthesis = { id: 'parenthesis', name: 'Parenthesis', symbol: $sce.trustAsHtml('( )'), logic: 'cmd', command: '(', shortcut: '', cssClass: 'misc' };
      buttons.absolute_value = { id: 'absolute_value', name: 'Absolute Value', symbol: $sce.trustAsHtml('| |'), logic: 'cmd', command: '|', shortcut: '', cssClass: 'misc' };
      buttons.degree = { id: 'degree', name: 'Degree', symbol: $sce.trustAsHtml('°'), logic: 'cmd', command: '°', shortcut: '', cssClass: 'misc' };
      // Comparison section
      buttons.le = { id: 'le', name: 'Less than or equal', symbol: $sce.trustAsHtml('<='), logic: 'cmd', command: '\\le', shortcut: '', cssClass: 'comparison' };
      buttons.lt = { id: 'lt', name: 'Less than', symbol: $sce.trustAsHtml('<'), logic: 'cmd', command: '<', shortcut: '', cssClass: 'comparison' };
      buttons.gt = { id: 'gt', name: 'Greater than', symbol: $sce.trustAsHtml('>'), logic: 'cmd', command: '>', shortcut: '', cssClass: 'comparison' };
      buttons.ge = { id: 'ge', name: 'Greater than or equal', symbol: $sce.trustAsHtml('>='), logic: 'cmd', command: '\\ge', shortcut: '', cssClass: 'comparison' };

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

      sections.advanced = {
        name: 'Advanced section',
        buttons: ['sqrt', 'root', 'fraction', 'mixed_fraction', 'superscript', 'subscript', 'x', 'y', 'percentage', 'parenthesis', 'absolute_value', 'degree', 'le', 'lt', 'gt', 'ge'],
        code: 'advanced'
      };

      var types = {};
      types.basic = {
        name: 'Basic',
        sections: ['cursor', 'numeric', 'basic', 'advanced']
      };

      function MathInputConfig() {

        this.postLink = function(scope) {
          scope.types = types;
          scope.sections = sections;
          scope.buttons = buttons;
        };
      }

      return MathInputConfig;
    }
  ]);