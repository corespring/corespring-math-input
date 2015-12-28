/*! corespring-math-input - v0.0.1 - 2015-12-28
* Copyright (c) 2015 CoreSpring; Licensed MIT */
angular.module('corespring.math-input', [

]);

angular.module('corespring.math-input')
  .factory('MathInputController', [
  function() {


    return function controller() {

      return function($scope) {

        // TODO: Move logic here
        // this.inputChanged = function($element) {
        //   $scope.inputChanged($element);
        // };

      };
    };
  }
]);
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
          }

          init();

        };
      }

      return KeypadDefinition;
    }
  ]);
angular.module('corespring.math-input')
  .directive('keypad', [
    'KeypadDef',
    function(Def) {

      function template() {
        return [
          '<div class="keypad" ng-class="keypadType">',
          '  <div class="{{ sections[section].code }}-section" ng-repeat="section in types[keypadType].sections">',
          '    <button ng-repeat="button in sections[section].buttons" ',
          '            id="{{button}}-button"',
          '            class="button {{buttons[button].cssClass}}"',
          '            title="{{buttons[button].name}}"',
          '            ng-disabled="buttons[button].disabled"',
          '            ng-click="onClick(button)">',
          '            <div ng-bind-html="buttons[button].symbol"></div></button>',
          '  </div>',
          '</div>'
        ].join('\n');
      }

      var def = new Def(template);

      return {
        restrict: 'E',
        link: def.link,
        replace: true,
        scope: {
          keypadType: '=',
          showKeypad: '=',
          onClickCallback: '&'
        }
      };
    }
  ]);
angular.module('corespring.math-input')
  .factory('MathInputConfig', [
    '$sce',
    function($sce) {

      var buttons = {};
      // Cursor section
      buttons.left = { id: 'left', name: 'Move left', symbol: $sce.trustAsHtml('&larr;'), logic: 'cursor', command: 'left', shortcut: '', cssClass: 'cursor' };
      buttons.right = { id: 'right', name: 'Move right', symbol: $sce.trustAsHtml('&rarr;'), logic: 'cursor', command: 'right', shortcut: '', cssClass: 'cursor' };
      buttons.up = { id: 'up', name: 'Move up', symbol: $sce.trustAsHtml('&uarr;'), logic: 'cursor', command: '', shortcut: 'up', cssClass: 'cursor' };
      buttons.down = { id: 'down', name: 'Move down', symbol: $sce.trustAsHtml('&darr;'), logic: 'cursor', command: 'down', shortcut: '', cssClass: 'cursor' };
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
angular.module('corespring.math-input')
  .factory('MathInputDef', [
    'MathInputConfig',
    '$log',
    '$compile',
    '$document',
    function(MathInputConfig, $log, $compile, $document){

      var log = $log.debug.bind($log, '[math-input-def]');

      function MathInputDefinition(template, link){

        this.link = function($scope, $element, $attrs) {
          new MathInputConfig().postLink($scope);

          function initDom(el, attrs){
            var node = $(template());
            var $node = $(node);

            // set id for directive instance
            $scope.instanceId = Math.random().toString(36).substring(7);
            $node.attr('id', $scope.instanceId);
            log('Instance ID: ' + $scope.instanceId);

            return $node;
          }

          function initMethods() {

            $element.on('focus', '.mathquill-editable', function(event){
              if($scope.showKeypad === false) {
                $document.mousedown();
              }

              $scope.showKeypad = true;
              $scope.focusedInput = $(this);

              $scope.$apply(function(){
                // add mousedown event to close the keypad
                $document.on('mousedown', function (event) {
                  $scope.$apply(function(){
                    if(!$.contains($document[0].getElementById($scope.instanceId), event.target)) {
                      $scope.showKeypad = false;
                      $document.off('mousedown');
                    }
                  });
                });
              });
            });

            $scope.clickButton = function(action) {
              var button = $scope.buttons[action];
              log('Clicked button: ' + action);

              if(button.logic === 'cursor' || button.logic === 'cmd' || button.logic === 'write') {
                $scope.focusedInput.mathquill(button.logic, button.command);
              } else {
                log('Not supported. [ Logic: ' + button.logic + ', Action: ' + action + ']');
              }
            };
          }

          function init() {

            log('Math input init...');

            $scope.showKeypad = false;
            $scope.focusedInput = null;

            var $node = initDom($element, $attrs);
            $element.html($node);
            $compile($node)($scope);

            initMethods();
          }

          init();
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
          '  <div class="input" ng-class="{ \'dotted\': dotted }">',
          '    <span ng-class="editable ? \'mathquill-editable\' : \'mathquill-embedded-latex\'">{{expression}}</span>',
          '  </div>',
          '  <keypad ng-show="showKeypad" keypad-type="keypadType" show-keypad="showKeypad" on-click-callback="clickButton(action)"></keypad>',
          '</div>'

        ].join('\n');
      }

      var def = new Def(template);

      return {
        restrict: 'E',
        link: def.link,
        replace: true,
        scope: {
          expression: '=',
          editable: '=',
          dotted: '=',
          keypadType: '='
        }
      };
    }
  ]);