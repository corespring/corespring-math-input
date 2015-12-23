/*! corespring-math-input - v0.0.1 - 2015-12-23
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
          '            ng-click="onClick(button)">',
          '            {{buttons[button].symbol}}</button>',
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

              switch(button.logic) {
                case 'cursor':
                  clickCursor(action);
                  break;
                case 'cmd':
                  clickCmd(button.symbol);
                  break;
                default:
                  log('Not supported: ' + action);
              }
            };

            function clickCursor(action) {
              $scope.focusedInput.mathquill('cursor', action);
            }

            function clickCmd(action) {
              $scope.focusedInput.mathquill('cmd', action);
            }
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