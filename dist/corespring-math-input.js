/*! corespring-math-input - v0.0.1 - 2017-06-07
* Copyright (c) 2017 CoreSpring; Licensed MIT */
angular.module('corespring.math-input', []);

angular.module('corespring.math-input')
  .directive('codepad', [
    'MathInputConfig','$document',
    function(MathInputConfig, $document) {

      function template() {
        return [
          '<div class="codepad" ng-mousedown="cancelEvent($event)">',
          '  <div>',
          '    <textarea class="code-input" placeholder="Enter MathML or LaTeX code here" ng-model="codeModel" />',
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
angular.module('corespring.math-input')
  .directive('keypadButton', [
    function() {
      return {
        restrict: 'AE',
        scope: {
          click: '&keypadButtonClick',
          graphics: '=keypadButtonGraphics',
          button: '=keypadButtonButton'
        },
        template: '<div style="width: 28px; height: 28px" ng-bind-html="graphics[state][button]"></div>',
        link: function($scope, $element) {

          $scope.state = 'rest';
          $element.mousedown(function($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.$apply(function() {
              $scope.state = 'on';
            });
          });
          $element.mouseup(function($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.$apply(function() {
              $scope.state = 'rest';
              $scope.click();
            });
          });
          $element.mouseout(function($event) {
            $scope.$apply(function() {
              $scope.state = 'rest';
            });
          });

        }
      };
    }
  ]);
angular.module('corespring.math-input')
  .directive('keypad', [
    'MathInputConfig',
    function(MathInputConfig) {

      function template() {
        return [
          '<div class="keypad" ng-class="keypadType">',
          '  <div class="{{sections[section].code}}-section" ng-repeat="section in types[keypadType].sections">',
          '    <div ng-repeat="button in sections[section].buttons" ',
          '            id="{{button}}-button"',
          '            class="button {{buttons[button].cssClass}}"',
          '            title="{{buttons[button].name}}"',
          '            ng-disabled="buttons[button].disabled"',
          '            keypad-button=""',
          '            keypad-button-graphics="graphics"',
          '            keypad-button-button="button"',
          '            keypad-button-click="onClick(button)">',
          '    </div>',
          '  </div>',
          '  <div ng-show="showCodeButton == \'true\'">',
          '    <div class="code-button" ng-mousedown="cancel($event)" ng-click="codeButtonClick($event)"><i class="fa fa-code"></i></div>',
          '  </div>',
          '</div>'
        ].join('\n');
      }

      var link = function($scope, $element, $attrs) {
        new MathInputConfig().postLink($scope);
        $scope.cancel = function(ev) {
          ev.stopPropagation();
          ev.preventDefault();
        };

        $scope.codeButtonClick = function(ev) {
          $scope.cancel(ev);
          $scope.showCodepadCallback();
        };

        $scope.onClick = function(button) {
          if (_.isFunction($scope.onClickCallback)) {
            $scope.onClickCallback({action: button});
          }
        };
      };

      return {
        restrict: 'E',
        link: link,
        template: template(),
        replace: true,
        scope: {
          keypadType: '=',
          onClickCallback: '&',
          codeModel: '=',
          showCodepadCallback: '&',
          showCodeButton: '@'
        }
      };
    }
  ]);
angular.module('corespring.math-input')
  .directive('mathInput', [
    'MathInputConfig',
    '$log',
    '$compile',
    '$document',
    '$timeout',
    function(MathInputConfig, $log, $compile, $document, $timeout) {
      var log = $log.debug.bind($log, '[math-input-def]');
      var MQ = MathQuill.getInterface(2);
      function template() {
        return [
          '<div class="math-input">',
          '  <div class="input" ng-hide="code">',
          '    <span class="mq"></span>',
          '  </div>',
          '  <div class="renderFromCode" ng-show="code" ng-click="openCodepad()"><span class="mjax"></span></div>',
          '  <keypad ng-if="showKeypad" keypad-type="keypadType" on-click-callback="clickButton(action)" show-codepad-callback="showCodepadCallback()" show-code-button="{{showCodeButton}}"></keypad>',
          '  <codepad ng-if="showCodepad" code-model="$parent.code" back-to-keypad="openKeypad()"></codepad>',
          '</div>'
        ].join('\n');
      }

      var link = function($scope, $element, $attrs) {
        new MathInputConfig().postLink($scope);
        $scope.showCodepad = false;
        $scope.parentSelectorCalculated = $scope.parentSelector || '.corespring-player';

        function onInputFieldClick() {
          $scope.showKeypad = $scope.editable === 'true' && _.isEmpty($scope.code);
          $scope.showCodepad = $scope.editable === 'true' && !_.isEmpty($scope.code);
          $scope.focusedInput = $(this);
          attachClickOutsideListener();
          $scope.$apply();
        }

        function isMathML(text) {
          return /\s*?<math.*?>/.test(text);
        }

        function isMathquillCompatible(text) {
          if (isMathML(text)) {
            return false;
          }
          if (text.match(/\$/)) {
            return false;
          }
          var supportedTags = ['aleph', 'alpha', 'amalg', 'angle', 'approx', 'arccos', 'arcsin', 'arctan', 'ast',
            'asymp', 'backslash', 'beta', 'bigcirc', 'bigtriangledown', 'bigtriangleup', 'bot', 'bowtie', 'bullet',
            'cap', 'cdot', 'cdots', 'chi', 'circ', 'clubsuit', 'cong', 'cos', 'cosh', 'cot', 'coth', 'csc', 'cup',
            'dagger', 'dashv', 'ddagger', 'ddots', 'deg', 'delta', 'det', 'diamond', 'diamondsuit', 'dim', 'div',
            'doteq', 'dots', 'downarrow', 'ell', 'emptyset', 'epsilon', 'eq', 'equiv', 'eta', 'exists', 'flat',
            'forall', 'frac', 'frown', 'gamma', 'gcd', 'ge', 'geq', 'gg', 'gt', 'hbar', 'heartsuit', 'hookleftarrow',
            'hookrightarrow', 'Im', 'in', 'inf', 'infty', 'kappa', 'lambda', 'ldots', 'left', 'leftarrow', 'leftharpoondown',
            'leftharpoonup', 'leftrightarrow', 'le', 'leq', 'lg', 'll', 'ln', 'log', 'log_b', 'longleftarrow', 'longleftrightarrow',
            'longrightarrow', 'lt', 'mapsto', 'max', 'mid', 'min', 'models', 'mp', 'mu', 'nabla', 'natural', 'nearrow', 'qqqne',
            'neg', 'neq', 'ni', 'nu', 'nwarrow', 'odot', 'omega', 'ominus', 'oplus', 'oslash', 'otimes', 'overline', 'parallel',
            'partial', 'perp', 'phi', 'pi', 'pm', 'prec', 'preceq', 'prime', 'propto', 'psi', 'Re', 'rho', 'right', 'rightarrow',
            'rightharpoondown', 'rightharpoonup', 'searrow', 'sec', 'setminus', 'sharp', 'sigma', 'sim', 'simeq', 'sin', 'sinh',
            'smile', 'spadesuit', 'sqcap', 'sqcup', 'sqrt', 'sqsubseteq', 'sqsupseteq', 'star', 'subset', 'subseteq', 'succ',
            'succeq', 'sup', 'supset', 'supseteq', 'surd', 'swarrow', 'tan', 'tanh', 'tau', 'text', 'theta', 'times', 'top',
            'triangle', 'triangleleft', 'triangleright', 'uparrow', 'updownarrow', 'uplus', 'upsilon', 'varepsilon',
            'varnothing', 'varphi', 'varpi', 'varrho', 'varsigma', 'vartheta', 'vdash', 'vdots', 'vee', 'wedge', 'wp', 'wr', 'xi',
            'zeta'];
          var matches = text.match(/\\{|\\}|\\[a-zA-Z;:#,]+/g);
          if (!matches) {
            return true;
          }
          for (var i = 0; i < matches.length; i++) {
            var m = matches[i].substring(1);
            var ix = supportedTags.indexOf(m.toLowerCase());
            if (ix == -1) return false;
          }
          return true;
        }

        function fixBackslashes(expression) {
          return ($scope.fixBackslash === 'true' || $scope.fixBackslash === undefined) ? (_.isString(expression) &&  expression.replace(/\\/g, '\\\\')) : expression;
        }

        function attachClickOutsideListener() {
          
          if (!$scope.clickOutsideListenerAttached) {
            $document.on('mousedown', function(event) {
              var isInMathInput = $.contains($element[0], event.target);
              if (!isInMathInput) {
                $scope.$apply(function() {
                  $scope.showKeypad = false;
                  $scope.showCodepad = false;
                });
                $document.off('mousedown');
                $scope.clickOutsideListenerAttached = false;
              }
            });
            $scope.clickOutsideListenerAttached = true;
          }
        }

        function repositionElement(el, referenceElement) {
          var elementWidth = el.width() + 20;
          var playerElement = $element.parents($scope.parentSelectorCalculated);

          if (!playerElement || !playerElement.offset() || elementWidth === 0) {
            return;
          }

          var playerElementLeft = playerElement.offset().left;

          var mqOffset = referenceElement.offset();
          var currentOffset = {left: mqOffset.left};

          if (currentOffset.left + elementWidth > playerElementLeft + playerElement.width()) {
            currentOffset.left = playerElementLeft + playerElement.width() - elementWidth;
          }
          currentOffset.top = mqOffset.top + referenceElement.outerHeight() + 5;
          el.offset(currentOffset);

        }

        function repositionKeypad() {
          repositionElement($element.find('.keypad'), $element.find('.mq'));
        }

        function repositionCodepad() {
          var refElem = _.isEmpty($scope.code) ? $element.find('.mq') : $element.find('.renderFromCode');
          repositionElement($element.find('.codepad'),refElem );
        }

        function onInputChange(skipApply) {
          if (!$scope.showKeypad) {
            return;
          }
          var latex = $scope.mqField.latex();
          $scope.ngModel = fixBackslashes(latex);
          if (!skipApply) {
            $scope.$apply();
          }
          repositionKeypad();
        }

        function initMethods() {
          var mqElement = $element.find('.mq');
          $element.click(onInputFieldClick);
          $element.bind('input propertychange', onInputChange);
          $element.bind('keypress', function(ev) {
            if ($(ev.target).hasClass('code-input')) {
              return;
            }
            if (ev.key.length === 1 && !ev.metaKey) {
              $scope.mqField.typedText(ev.key);
              onInputChange();
            }
            ev.preventDefault();
          });
          
          $scope.mqField = $scope.editable === 'true' ? MQ.MathField(mqElement[0]) : MQ.StaticMath(mqElement[0]);
          var expr;
          if ($scope.expressionEncoded) {
            expr = atob($scope.expressionEncoded);
          } else {
            expr = $scope.expression;
          }

          if (expr && isMathquillCompatible(expr)) {
            $scope.mqField.latex(expr);
            $scope.ngModel = fixBackslashes(expr);
            mqElement.blur();
          } else if (expr) {
            $scope.code = expr;
          } else {
            $scope.ngModel = '';
          }


          $scope.showCodepadCallback = function() {
            $scope.showKeypad = false;
            $scope.showCodepad = true;
          };

          $scope.openCodepad = function() {
            $scope.showCodepad = true;
            attachClickOutsideListener();
          };

          $scope.openKeypad = function() {
            if (!$scope.focusedInput) {
              $scope.focusedInput = mqElement;
            }
            $scope.codeModel = $scope.code = undefined;
            $scope.showCodepad = false;
            $scope.showKeypad = true;
            attachClickOutsideListener();
            var savedModel = $scope.ngModel;
            $scope.ngModel = '';
            $timeout(function() {
              $scope.ngModel = savedModel;
            });
          };

          $scope.clickButton = function(action) {
            var button = $scope.buttons[action];
            if (button.logic === 'clear') {
              $scope.mqField.latex('');
            } else if (button.logic === 'cursor') {
              $scope.mqField.keystroke(button.command);  
            } else if (button.logic === 'cmd' || button.logic === 'write') {
              $scope.mqField[button.logic](button.command);
            }

            onInputChange(true);
          };

          $scope.$watch('showKeypad', function(n) {
            if (n) {
              setTimeout(function() {
                repositionKeypad();
              }, 1);
            }
          });

          $scope.$watch('showCodepad', function(n) {
            if (n) {
              setTimeout(function() {
                repositionCodepad();
              }, 1);
            }
          });

          $scope.$watch('code', function(n) {
            $scope.codeModel = n;
            if (isMathML(n)) {
              $element.find('.mjax').html(n);
            } else {
              $element.find('.mjax').html('\\(' + n + '\\)');
            }
          });

          $timeout(function() {
            if ($scope.keypadAutoOpen === 'true') {
              onInputFieldClick.apply($element.find('.mq'));
              $scope.focusedInput.find('textarea').focus();
            }
          });
        }

        function init() {
          $scope.showKeypad = false;
          $scope.focusedInput = null;
          $timeout(initMethods, 10);
        }

        init();
      };

      return {
        restrict: 'E',
        link: link,
        template: template(),
        replace: true,
        scope: {
          expression: '=',
          expressionEncoded: '@',
          editable: '@',
          keypadType: '=',
          keypadAutoOpen: '@',
          ngModel: '=',
          codeModel: '=',
          parentSelector: '@',
          fixBackslash: '@',
          showCodeButton: '@'
        }
      };
    }
  ]);
angular.module('corespring.math-input')
  .factory('MathInputConfig', [
    '$sce',
    function($sce) {

      var buttons = {};
      // Clear section
      buttons.ac = { id: 'ac', name: 'AC', symbol: $sce.trustAsHtml('AC'), logic: 'clear', command: 'clear', shortcut: '', cssClass: 'cursor' };
      // Cursor section
      buttons.left = { id: 'left', name: 'Move left', symbol: $sce.trustAsHtml('&larr;'), logic: 'cursor', command: 'Left', shortcut: '', cssClass: 'cursor' };
      buttons.right = { id: 'right', name: 'Move right', symbol: $sce.trustAsHtml('&rarr;'), logic: 'cursor', command: 'Right', shortcut: '', cssClass: 'cursor' };
      buttons.up = { id: 'up', name: 'Move up', symbol: $sce.trustAsHtml('&uarr;'), logic: 'cursor', command: 'Up', shortcut: '', cssClass: 'cursor' };
      buttons.down = { id: 'down', name: 'Move down', symbol: $sce.trustAsHtml('&darr;'), logic: 'cursor', command: 'Down', shortcut: '', cssClass: 'cursor' };
      buttons.backspace = { id: 'backspace', name: 'Backspace', symbol: $sce.trustAsHtml('&LeftArrowBar;'), logic: 'cursor', command: 'Backspace', shortcut: '', cssClass: 'backspace' };
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
      buttons.approx = { id: 'approx', name: 'Approx', symbol: $sce.trustAsHtml('&asymp;'), logic: 'write', command: '\\approx', shortcut: '', cssClass: 'number' };
      // Basic operations section
      buttons.plus = { id: 'plus', name: 'Plus', symbol: $sce.trustAsHtml('+'), logic: 'cmd', command: '+', shortcut: '', cssClass: 'basic-operation' };
      buttons.minus = { id: 'minus', name: 'Minus', symbol: $sce.trustAsHtml('-'), logic: 'cmd', command: '-', shortcut: '', cssClass: 'basic-operation' };
      buttons.multiply = { id: 'multiply', name: 'Multiply', symbol: $sce.trustAsHtml('x'), logic: 'cmd', command: '\\times', shortcut: '', cssClass: 'basic-operation' };
      buttons.divide = { id: 'divide', name: 'Divide', symbol: $sce.trustAsHtml('&#247'), logic: 'cmd', command: '\\div', shortcut: '', cssClass: 'basic-operation' };
      // Root section
      buttons.sqrt = { id: 'sqrt', name: 'Square root', symbol: $sce.trustAsHtml('&#8730'), logic: 'cmd', command: '\\sqrt', shortcut: '', cssClass: 'root' };
      buttons.root = { id: 'root', name: 'Nth root', symbol: $sce.trustAsHtml('n&#8730'), logic: 'write', command: '\\sqrt[{}]{}', shortcut: '', cssClass: 'root' };
      // Fraction section
      buttons.fraction = { id: 'fraction', name: 'Fraction', symbol: $sce.trustAsHtml('x/n'), logic: 'cmd', command: '\\frac', shortcut: '', cssClass: 'fraction' };
      // Subscript/Superscript section
      buttons.subscript = { id: 'subscript', name: 'Subscript', symbol: $sce.trustAsHtml('x_n'), logic: 'cmd', command: '_', shortcut: '', cssClass: 'sub-sup' }; //<sub>n</sub>
      buttons.superscript = { id: 'superscript', name: 'Exponent', symbol: $sce.trustAsHtml('x^n'), logic: 'cmd', command: '^', shortcut: '', cssClass: 'sub-sup' };//<sup>n</sup>
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
        buttons: ['left', 'right', 'up', 'down','backspace', 'ac'],
        code: 'cursor'
      };
      sections.clear = {
        name: 'Clear section',
        buttons: ['left', 'ac'],
        code: 'clear'
      };
      sections.numeric = {
        name: 'Numeric section',
        buttons: ['seven', 'eight', 'nine', 'divide', 'four', 'five', 'six', 'multiply', 'one', 'two', 'three', 'minus', 'zero', 'decimal', 'equals', 'plus'],
        code: 'numeric'
      };
      sections.basic = {
        name: 'Basic functions section',
        buttons: ['plus', 'minus', 'multiply', 'divide', 'approx', 'ac'],
        code: 'basic'
      };

      sections.advanced = {
        name: 'Advanced section',
        buttons: ['superscript', 'subscript', 'fraction', 'percentage', 'sqrt', 'root', 'absolute_value', 'parenthesis', 'lt', 'gt','degree', 'approx', 'le', 'ge', 'x', 'y'],
        code: 'advanced'
      };

      var types = {};
      types.basic = {
        name: 'Basic',
        sections: ['cursor', 'numeric', 'advanced']
      };

      var graphics = {
        rest: _({
          'absolute_value': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58"><style>.st0-0{fill:#FFF;stroke:#bebebe}.st0-0,.st1-0{stroke-miterlimit:10}.st1-0{fill:none;stroke:#1a9cff;stroke-width:2.5}</style><path class="st0-0" d="M52.7 55.7H5.3c-1.7 0-3-1.3-3-3V5.3c0-1.7 1.3-3 3-3h47.5c1.7 0 3 1.3 3 3v47.5c-.1 1.6-1.4 2.9-3.1 2.9z"/><path class="st1-0" d="M23.7 15.5v27M34.3 15.5v27"/></svg>',
          'approx': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58"><style>.st0-1{fill:#FFF;stroke:#bebebe;stroke-miterlimit:10}.st1-1{fill:#1a9cff}</style><path class="st0-1" d="M52.7 55.7H5.3c-1.7 0-3-1.3-3-3V5.3c0-1.7 1.3-3 3-3h47.5c1.7 0 3 1.3 3 3v47.5c-.1 1.6-1.4 2.9-3.1 2.9z"/><path class="st1-1" d="M20.8 25.4c.5-.3 1.1-.6 1.5-.8.3-.2.7-.2 1-.3h.2c.4-.1.9-.1 1.2-.1.3 0 .6.1 1 .1l.3.1c.5.1.9.2 1.5.4.2.1.3.1.5.2.4.1.7.2 1.2.4.7.3 1.3.5 1.9.7l.4.1c.5.2.9.3 1.4.4h.3c.5.1.9.2 1.4.2 1 0 2-.2 2.9-.6.7-.3 1.9-.9 3.1-1.8v-3.1l-.4.3-.9.6-.9.6c-.3.3-.7.4-1.1.6-.1.1-.3.1-.4.2-.4.2-.7.3-1.2.4h-1.3c-.5 0-1.1-.1-1.7-.3l-.3-.1c-.8-.2-1.5-.5-2.6-.9-.2-.1-.4-.2-.7-.2-.3-.1-.5-.2-.7-.3-.4-.2-.8-.3-1.3-.4-.2-.1-.4-.1-.6-.1-.2 0-.3 0-.5-.1-.4-.1-.8-.1-1.2-.1-.9 0-1.7.3-2.6.5l-.2.1c-1 .3-2.1.9-3.3 1.7l-.1.1v3l.4-.3c.7-.5 1.3-.9 1.8-1.2zM40.5 30.4l-.4.3-.9.6-.9.6c-.3.3-.7.4-1.1.6-.1.1-.3.1-.4.2-.4.2-.7.3-1.2.4-.5.1-.9.1-1.3.1-.5 0-1.1-.1-1.7-.3l-.3-.1c-.8-.2-1.5-.5-2.6-.9-.2-.1-.4-.2-.7-.2-.3-.1-.5-.2-.7-.3-.4-.2-.8-.3-1.2-.4-.2-.1-.4-.1-.6-.1-.2 0-.3 0-.5-.1-.4-.1-.8-.1-1.2-.1-.9 0-1.7.3-2.6.5l-.2.1c-1 .3-2.1.9-3.3 1.7l-.1.1v3l.4-.3c.7-.5 1.3-.9 1.8-1.2.5-.3 1.1-.6 1.5-.8.3-.2.7-.2 1.1-.3h.2c.4-.1.9-.1 1.2-.1.3 0 .6.1 1 .1l.3.1c.5.1.9.2 1.5.4.2.1.3.1.5.2.4.1.7.2 1.2.4.7.3 1.3.5 1.9.7l.4.1c.5.2.9.3 1.4.4h.3c.5.1.9.2 1.4.2 1 0 2-.2 2.9-.6.7-.3 1.9-.9 3.1-1.8v-3.2z"/></svg>',
          'ac': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"><style>.st0-2{fill:#FFF;stroke:#bebebe}.st0-2,.st1-2{stroke-miterlimit:10}.st1-2{fill:#1a9cff;stroke:#1a9cff;stroke-width:.5}</style><circle class="st0-2" cx="22" cy="22" r="19"/><path class="st1-2" d="M28.4 20.7h-1.5c-.1-1.3-.4-2.2-1.1-2.8-.8-.6-1.7-.9-3-.9-.7 0-1.4.1-2 .4-.6.3-1.1.6-1.5 1.1-.4.5-.7 1.1-.9 1.8-.2.7-.3 1.5-.3 2.4 0 .9.1 1.7.3 2.4s.5 1.3.9 1.8.9.9 1.5 1.2c.6.3 1.2.4 2 .4 1 0 1.9-.3 2.6-.8.7-.5 1.2-1.3 1.5-2.3l1.8.3c-.2.7-.4 1.4-.8 1.9-.4.6-.8 1-1.3 1.4s-1.1.6-1.8.8-1.4.2-2.2.2c-1.1 0-2.1-.2-3-.5-.9-.3-1.6-.8-2.3-1.4-.6-.6-1.1-1.4-1.5-2.3-.3-.9-.5-1.9-.5-3 0-1 .2-2 .5-2.9.3-.9.8-1.7 1.4-2.4.6-.7 1.3-1.2 2.2-1.6.8-.4 1.8-.6 2.8-.6.4 0 .8 0 1.2.1.4.1.8.1 1.2.3.4.1.7.3 1 .5.3.2.6.5.9.8l.4-1.2H28.3v4.9z"/></svg>',
          'degree': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58"><style>.st0-3{fill:#FFF;stroke:#bebebe}.st0-3,.st1-3{stroke-miterlimit:10}.st1-3{fill:none;stroke:#1a9cff;stroke-width:2.5}</style><path class="st0-3" d="M52.7 55.7H5.3c-1.7 0-3-1.3-3-3V5.3c0-1.7 1.3-3 3-3h47.5c1.7 0 3 1.3 3 3v47.5c-.1 1.6-1.4 2.9-3.1 2.9z"/><circle class="st1-3" cx="28.7" cy="22.7" r="4.7"/></svg>',
          'divide': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58"><style>.st0-4{fill:#FFF;stroke:#bebebe}.st0-4,.st1-4{stroke-miterlimit:10}.st1-4{stroke:#1a9cff;stroke-width:.5}.st1-4,.st2-4{fill:#1a9cff}</style><path class="st0-4" d="M52.7 55.7H5.3c-1.7 0-3-1.3-3-3V5.3c0-1.7 1.3-3 3-3h47.5c1.7 0 3 1.3 3 3v47.5c-.1 1.6-1.4 2.9-3.1 2.9z"/><path class="st1-4" d="M18.9 27.8H39v2.1H18.9z"/><circle class="st2-4" cx="29" cy="35" r="2.1"/><circle class="st2-4" cx="29" cy="22.8" r="2.1"/></svg>',
          'decimal': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58"><style>.st0-5{fill:#FFF;stroke:#bebebe;stroke-miterlimit:10}.st1-5{fill:#1a9cff}</style><path class="st0-5" d="M52.7 55.7H5.3c-1.7 0-3-1.3-3-3V5.3c0-1.7 1.3-3 3-3h47.5c1.7 0 3 1.3 3 3v47.5c-.1 1.6-1.4 2.9-3.1 2.9z"/><circle class="st1-5" cx="28.9" cy="37.7" r="2.1"/></svg>',
          'down': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"><style>.st0-6{fill:#FFF;stroke:#bebebe}.st0-6,.st1-6{stroke-miterlimit:10}.st1-6{fill:none;stroke:#1a9cff;stroke-width:3}</style><circle class="st0-6" cx="22" cy="22" r="19"/><path class="st1-6" d="M22.3 12.8v18M29.8 23.7l-7.5 7.5-7.5-7.5"/></svg>',
          'eight': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58"><style>.st0-7{fill:#FFF;stroke:#bebebe}.st0-7,.st1-7{stroke-miterlimit:10}.st1-7{fill:#1a9cff;stroke:#1a9cff;stroke-width:.5}</style><path class="st0-7" d="M52.7 55.7H5.3c-1.7 0-3-1.3-3-3V5.3c0-1.7 1.3-3 3-3h47.5c1.7 0 3 1.3 3 3v47.5c-.1 1.6-1.4 2.9-3.1 2.9z"/><path class="st1-7" d="M31.9 28.3c1.8.4 3.2 1.2 4.1 2.2s1.3 2.3 1.3 3.8c0 1-.2 1.9-.6 2.7s-.9 1.5-1.6 2-1.6 1-2.6 1.3-2.2.5-3.6.5c-1.3 0-2.4-.1-3.5-.4s-1.9-.7-2.6-1.3-1.3-1.2-1.6-2-.6-1.7-.6-2.7c0-1.5.4-2.8 1.3-3.8s2.2-1.7 3.9-2.2c-1.4-.4-2.6-1-3.3-2s-1.2-2.1-1.2-3.3c0-.9.2-1.7.5-2.4s.9-1.3 1.5-1.8 1.4-.9 2.4-1.2 2-.4 3.1-.4c1.2 0 2.2.1 3.2.4s1.7.6 2.4 1.1 1.2 1.1 1.5 1.8.5 1.5.5 2.4c0 1.3-.4 2.4-1.2 3.3s-1.7 1.6-3.3 2zm-2.8 10.6c.8 0 1.6-.1 2.2-.3s1.3-.5 1.8-.9.9-.9 1.2-1.5.4-1.2.4-2c0-.6-.1-1.1-.3-1.7s-.6-1-1-1.5-1.1-.8-1.8-1.2-1.6-.6-2.6-.8c-1.8.3-3.2.9-4.1 1.7s-1.4 1.9-1.4 3.3c0 .7.1 1.3.4 1.9s.6 1.1 1.1 1.5 1.1.7 1.8.9 1.4.6 2.3.6zm0-19.9c-.7 0-1.4.1-2 .3s-1.1.4-1.6.8-.8.7-1 1.2-.4 1-.4 1.6c0 1.2.4 2.1 1.3 2.9s2.1 1.3 3.7 1.6c1.6-.3 2.8-.8 3.6-1.6s1.2-1.7 1.2-2.9c0-.7-.1-1.3-.4-1.8s-.6-.9-1.1-1.2-1-.5-1.5-.7-1.2-.2-1.8-.2z"/></svg>',
          'equals': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58"><style>.st0-8{fill:#FFF;stroke:#bebebe}.st0-8,.st1-8{stroke-miterlimit:10}.st1-8{fill:#1a9cff;stroke:#1a9cff;stroke-width:.5}</style><path class="st0-8" d="M52.7 55.7H5.3c-1.7 0-3-1.3-3-3V5.3c0-1.7 1.3-3 3-3h47.5c1.7 0 3 1.3 3 3v47.5c-.1 1.6-1.4 2.9-3.1 2.9z"/><path class="st1-8" d="M39 25.8H19v-2.1h20v2.1zm0 7.3H19V31h20v2.1z"/></svg>',
          'superscript': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58"><style>.st0-9{fill:#FFF;stroke:#bebebe}.st0-9,.st1-9{stroke-miterlimit:10}.st1-9{fill:none;stroke:#1a9cff;stroke-width:2}</style><path class="st0-9" d="M52.7 55.7H5.3c-1.7 0-3-1.3-3-3V5.3c0-1.7 1.3-3 3-3h47.5c1.7 0 3 1.3 3 3v47.5c-.1 1.6-1.4 2.9-3.1 2.9z"/><path class="st1-9" d="M15 23.6h15.8v25H15zM37.2 13.6h9v12h-9z"/></svg>',
          'five': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58"><style>.st0-10{fill:#FFF;stroke:#bebebe}.st0-10,.st1-10{stroke-miterlimit:10}.st1-10{fill:#1a9cff;stroke:#1a9cff;stroke-width:.5}</style><path class="st0-10" d="M52.7 55.7H5.3c-1.7 0-3-1.3-3-3V5.3c0-1.7 1.3-3 3-3h47.5c1.7 0 3 1.3 3 3v47.5c-.1 1.6-1.4 2.9-3.1 2.9z"/><path class="st1-10" d="M33.9 21.1v-.8-.4c0-.1-.1-.1-.1-.1h-8.7c0 .7-.1 1.4-.1 2s-.1 1.2-.1 1.8-.1 1.3-.1 1.8 0 1-.1 1.4 0 .6 0 .6c.7-.6 1.5-1 2.3-1.3s1.7-.4 2.6-.4c1.1 0 2.1.2 3 .5s1.7.8 2.3 1.5 1.1 1.4 1.5 2.3.5 1.9.5 3c0 1.3-.2 2.5-.7 3.4s-1.1 1.8-1.8 2.4-1.7 1.1-2.7 1.4-2.2.5-3.4.5c-1 0-2-.1-3-.4s-1.9-.6-2.7-1.1l-.4-4.5H24c.1 1.4.5 2.4 1.3 3.2s1.9 1.1 3.5 1.1c.8 0 1.5-.1 2.1-.4s1.2-.6 1.6-1.1.8-1.1 1.1-1.8.4-1.6.4-2.5c0-.8-.1-1.6-.4-2.3s-.6-1.3-1-1.7-1-.8-1.6-1.1-1.3-.4-2.1-.4c-1.1 0-2 .2-2.8.6s-1.5 1-2.1 1.9l-1.4-.5v-12h13.1v4.1h-1.8v-.7z"/></svg>',
          'four': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58"><style>.st0-11{fill:#FFF;stroke:#bebebe}.st0-11,.st1-11{stroke-miterlimit:10}.st1-11{fill:#1a9cff;stroke:#1a9cff;stroke-width:.5}</style><path class="st0-11" d="M52.7 55.7H5.3c-1.7 0-3-1.3-3-3V5.3c0-1.7 1.3-3 3-3h47.5c1.7 0 3 1.3 3 3v47.5c-.1 1.6-1.4 2.9-3.1 2.9z"/><path class="st1-11" d="M33.5 17.5v14.2h3.8v1.8h-3.8V38c0 .1.1.3.2.3s.3.2.5.2.6.1 1.1.1h.9v1.6H27.5v-1.6h2.3c.3 0 .5-.1.7-.1s.2-.2.3-.3.1-.3.1-.4v-4.2H21c-.1-.4-.1-.8-.2-1.2s-.2-.7-.3-1.1l9.8-13.8h3.2zm-11 14.3h8.4v-12l-8.4 12z"/></svg>',
          'fraction': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58"><style>.st0-12{fill:#FFF;stroke:#bebebe;stroke-miterlimit:10}.st1-12{fill:#1a9cff;stroke-width:.5}.st1-12,.st2-12{stroke:#1a9cff;stroke-miterlimit:10}.st2-12{fill:none;stroke-width:2}</style><path class="st0-12" d="M52.7 55.7H5.3c-1.7 0-3-1.3-3-3V5.3c0-1.7 1.3-3 3-3h47.5c1.7 0 3 1.3 3 3v47.5c-.1 1.6-1.4 2.9-3.1 2.9z"/><path class="st1-12" d="M17 27.5h24.1v2.1H17z"/><path class="st2-12" d="M21.7 14.4h14.6v8.5H21.7zM21.7 34.3h14.6v8.5H21.7z"/></svg>',
          'ge': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58"><style>.st0-13{fill:#FFF;stroke:#bebebe;stroke-miterlimit:10}.st1-13{fill:#1a9cff;stroke-width:.5}.st1-13,.st2-13{stroke:#1a9cff;stroke-miterlimit:10}.st2-13{fill:none;stroke-width:2.5}</style><path class="st0-13" d="M52.7 55.7H5.3c-1.7 0-3-1.3-3-3V5.3c0-1.7 1.3-3 3-3h47.5c1.7 0 3 1.3 3 3v47.5c-.1 1.6-1.4 2.9-3.1 2.9z"/><path class="st1-13" d="M38.9 28.3L19 36.4v-2.3l16.8-6.7L19 20.7v-2.3l19.9 8.1v1.8z"/><path class="st2-13" d="M18.8 41.4h20.7"/></svg>',
          'gt': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58"><style>.st0-14{fill:#FFF;stroke:#bebebe}.st0-14,.st1-14{stroke-miterlimit:10}.st1-14{fill:#1a9cff;stroke:#1a9cff;stroke-width:.5}</style><path class="st0-14" d="M52.7 55.7H5.3c-1.7 0-3-1.3-3-3V5.3c0-1.7 1.3-3 3-3h47.5c1.7 0 3 1.3 3 3v47.5c-.1 1.6-1.4 2.9-3.1 2.9z"/><path class="st1-14" d="M37.9 28.3L18 36.4v-2.3l16.8-6.7L18 20.7v-2.3l19.9 8.1v1.8z"/></svg>',
          'left': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"><style>.st0-15{fill:#FFF;stroke:#bebebe}.st0-15,.st1-15{stroke-miterlimit:10}.st1-15{fill:none;stroke:#1a9cff;stroke-width:3}</style><circle class="st0-15" cx="22" cy="22" r="19"/><path class="st1-15" d="M31.5 22h-18M20.5 29.5L13 22l7.5-7.5"/></svg>',
          'le': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58"><style>.st0-16{fill:#FFF;stroke:#bebebe;stroke-miterlimit:10}.st1-16{fill:#1a9cff;stroke-width:.5}.st1-16,.st2-16{stroke:#1a9cff;stroke-miterlimit:10}.st2-16{fill:none;stroke-width:2.5}</style><path class="st0-16" d="M52.7 55.7H5.3c-1.7 0-3-1.3-3-3V5.3c0-1.7 1.3-3 3-3h47.5c1.7 0 3 1.3 3 3v47.5c-.1 1.6-1.4 2.9-3.1 2.9z"/><path class="st1-16" d="M22.1 27.4l16.8 6.7v2.3L19 28.3v-1.9l19.9-8.1v2.3l-16.8 6.8z"/><path class="st2-16" d="M19 41.4h20.7"/></svg>',
          'lt': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58"><style>.st0-17{fill:#FFF;stroke:#bebebe}.st0-17,.st1-17{stroke-miterlimit:10}.st1-17{fill:#1a9cff;stroke:#1a9cff;stroke-width:.5}</style><path class="st0-17" d="M52.7 55.7H5.3c-1.7 0-3-1.3-3-3V5.3c0-1.7 1.3-3 3-3h47.5c1.7 0 3 1.3 3 3v47.5c-.1 1.6-1.4 2.9-3.1 2.9z"/><path class="st1-17" d="M22.1 27.4l16.8 6.7v2.3L19 28.3v-1.9l19.9-8.1v2.3l-16.8 6.8z"/></svg>',
          'minus': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58"><style>.st0-18{fill:#FFF;stroke:#bebebe}.st0-18,.st1-18{stroke-miterlimit:10}.st1-18{fill:#1a9cff;stroke:#1a9cff;stroke-width:.5}</style><path class="st0-18" d="M52.7 55.7H5.3c-1.7 0-3-1.3-3-3V5.3c0-1.7 1.3-3 3-3h47.5c1.7 0 3 1.3 3 3v47.5c-.1 1.6-1.4 2.9-3.1 2.9z"/><path class="st1-18" d="M22.9 29.2h12.3v2.1H22.9z"/></svg>',
          'multiply': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58"><style>.st0-19{fill:#FFF;stroke:#bebebe}.st0-19,.st1-19{stroke-miterlimit:10}.st1-19{fill:#1a9cff;stroke:#1a9cff;stroke-width:.5}</style><path class="st0-19" d="M52.7 55.7H5.3c-1.7 0-3-1.3-3-3V5.3c0-1.7 1.3-3 3-3h47.5c1.7 0 3 1.3 3 3v47.5c-.1 1.6-1.4 2.9-3.1 2.9z"/><path class="st1-19" d="M29.2 27.4l6.3-6.3 1.5 1.5-6.3 6.3 6.2 6.2-1.5 1.5-6.2-6.2-6.3 6.3-1.5-1.5 6.3-6.3-6.2-6.2 1.5-1.5 6.2 6.2z"/></svg>',
          'nine': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58"><style>.st0-20{fill:#FFF;stroke:#bebebe}.st0-20,.st1-20{stroke-miterlimit:10}.st1-20{fill:#1a9cff;stroke:#1a9cff;stroke-width:.5}</style><path class="st0-20" d="M52.7 55.7H5.3c-1.7 0-3-1.3-3-3V5.3c0-1.7 1.3-3 3-3h47.5c1.7 0 3 1.3 3 3v47.5c-.1 1.6-1.4 2.9-3.1 2.9z"/><path class="st1-20" d="M28.3 40.7c-1.4 0-2.7-.2-3.7-.6s-1.9-.9-2.6-1.6v-3.1h2.1c0 .6.1 1.2.3 1.7s.4.8.7 1.1.7.5 1.2.7 1.1.2 1.9.2c1.1 0 2-.2 2.8-.6s1.4-1 1.8-1.8.8-1.8 1-3 .3-2.5.3-4c-.7.9-1.6 1.6-2.6 2s-2.1.7-3.3.7c-1.1 0-2.1-.2-3-.5s-1.6-.8-2.3-1.5-1.1-1.4-1.5-2.3-.5-1.9-.5-3c0-1.2.2-2.3.6-3.3s.9-1.8 1.6-2.5 1.5-1.2 2.5-1.6 2.1-.5 3.3-.5c1.3 0 2.5.2 3.5.7s1.9 1.1 2.5 2 1.2 2.1 1.6 3.5.5 3.1.5 5c0 1.8-.1 3.4-.4 4.9s-.8 2.8-1.5 3.9-1.6 2-2.6 2.6-2.6.9-4.2.9zm.4-21.7c-.8 0-1.5.1-2.1.4s-1.1.6-1.6 1.1-.8 1.1-1 1.8-.4 1.6-.4 2.5c0 .8.1 1.5.3 2.2s.5 1.3.9 1.8.9.9 1.5 1.2 1.3.4 2.1.4c.6 0 1.3-.1 1.8-.3s1.1-.5 1.5-.9.9-.8 1.2-1.4.6-1.2.8-1.9c0-1.1-.1-2.1-.3-2.9s-.6-1.6-1-2.2-1-1.1-1.7-1.4-1.1-.4-2-.4z"/></svg>',
          'root': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58"><style>.st0-21{fill:#FFF;stroke:#bebebe}.st0-21,.st1-21{stroke-miterlimit:10}.st1-21{fill:none;stroke:#1a9cff;stroke-width:2}</style><path class="st0-21" d="M52.7 55.7H5.3c-1.7 0-3-1.3-3-3V5.3c0-1.7 1.3-3 3-3h47.5c1.7 0 3 1.3 3 3v47.5c-.1 1.6-1.4 2.9-3.1 2.9z"/><path class="st1-21" d="M15.4 32.4l10 10v-22h23"/><path class="st1-21" d="M32.8 29.4h9v12h-9zM10 12.1h9v12h-9z"/></svg>',
          'one': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58"><style>.st0-22{fill:#FFF;stroke:#bebebe}.st0-22,.st1-22{stroke-miterlimit:10}.st1-22{fill:#1a9cff;stroke:#1a9cff;stroke-width:.5}</style><path class="st0-22" d="M52.7 55.7H5.3c-1.7 0-3-1.3-3-3V5.3c0-1.7 1.3-3 3-3h47.5c1.7 0 3 1.3 3 3v47.5c-.1 1.6-1.4 2.9-3.1 2.9z"/><path class="st1-22" d="M30.8 18.2v19.9c0 .1.1.2.3.3s.4.1.7.2.8 0 1.3 0h1.2v1.7h-10v-1.7H26c.5 0 .8 0 1.1-.1s.4-.1.6-.2.2-.2.2-.3V20.1c-.7.4-1.4.7-2.1.9l-2.1.6v-2.2c.9-.2 1.8-.4 2.7-.7s1.7-.7 2.6-1.1l1.8.6z"/></svg>',
          'parenthesis': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58"><style>.st0-23{fill:#FFF;stroke:#bebebe}.st0-23,.st1-23{stroke-miterlimit:10}.st1-23{fill:#1a9cff;stroke:#1a9cff;stroke-width:.5}</style><path class="st0-23" d="M52.7 55.7H5.3c-1.7 0-3-1.3-3-3V5.3c0-1.7 1.3-3 3-3h47.5c1.7 0 3 1.3 3 3v47.5c-.1 1.6-1.4 2.9-3.1 2.9z"/><path class="st1-23" d="M25.1 16.4c-1.9 1.6-3.3 3.5-4.2 5.7s-1.4 4.8-1.4 7.7c0 1.5.1 2.8.3 4.1s.5 2.5 1 3.6 1 2.1 1.7 3.1 1.5 1.9 2.5 2.7l-1.4.9c-1.3-.8-2.5-1.8-3.4-2.9S18.6 39 18 37.8s-1-2.5-1.2-3.9-.4-2.6-.4-3.9c0-1.4.1-2.8.4-4.2s.7-2.7 1.2-4 1.3-2.5 2.2-3.5 2-2 3.4-2.8l1.5.9zM34.5 15.4c1.3.9 2.3 1.9 3.2 3s1.6 2.3 2.2 3.5 1 2.5 1.2 3.8.4 2.6.4 4-.1 2.7-.4 4.1-.7 2.7-1.2 4-1.3 2.5-2.2 3.6-2.1 2.1-3.4 3l-1.4-.9c1.9-1.7 3.3-3.6 4.2-5.8s1.4-4.8 1.4-7.8c0-1.5-.1-2.8-.3-4.1s-.6-2.5-1-3.6-1-2.1-1.7-3.1-1.5-1.9-2.5-2.7c.3-.1.5-.3.8-.4s.4-.4.7-.6z"/></svg>',
          'plus': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58"><style>.st0-24{fill:#FFF;stroke:#bebebe}.st0-24,.st1-24{stroke-miterlimit:10}.st1-24{fill:#1a9cff;stroke:#1a9cff;stroke-width:.5}</style><path class="st0-24" d="M52.7 55.7H5.3c-1.7 0-3-1.3-3-3V5.3c0-1.7 1.3-3 3-3h47.5c1.7 0 3 1.3 3 3v47.5c-.1 1.6-1.4 2.9-3.1 2.9z"/><path class="st1-24" d="M30.1 27.4H39v2.1h-8.9v8.8h-2.2v-8.8h-9v-2.1h9v-8.8h2.2v8.8z"/></svg>',
          'right': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"><style>.st0-25{fill:#FFF;stroke:#bebebe}.st0-25,.st1-25{stroke-miterlimit:10}.st1-25{fill:none;stroke:#1a9cff;stroke-width:3}</style><circle class="st0-25" cx="22" cy="22" r="19"/><path class="st1-25" d="M13 22h18M24 14.5l7.5 7.5-7.5 7.5"/></svg>',
          'seven': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58"><style>.st0-26{fill:#FFF;stroke:#bebebe}.st0-26,.st1-26{stroke-miterlimit:10}.st1-26{fill:#1a9cff;stroke:#1a9cff;stroke-width:.5}</style><path class="st0-26" d="M52.7 55.7H5.3c-1.7 0-3-1.3-3-3V5.3c0-1.7 1.3-3 3-3h47.5c1.7 0 3 1.3 3 3v47.5c-.1 1.6-1.4 2.9-3.1 2.9z"/><path class="st1-26" d="M21.7 17.6h15V20c-1.2 1.7-2.3 3.3-3.3 5.1s-1.8 3.5-2.5 5.2-1.3 3.4-1.7 5.1-.8 3.3-.9 4.9h-3.1c.2-1.6.6-3.2 1-5s1.1-3.5 1.8-5.3 1.6-3.6 2.6-5.3 2.2-3.4 3.5-5.1h-9.3c-.3 0-.7.1-.9.1s-.3.2-.3.3-.1.3-.1.5v2.9h-1.9v-5.8z"/></svg>',
          'six': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58"><style>.st0-27{fill:#FFF;stroke:#bebebe}.st0-27,.st1-27{stroke-miterlimit:10}.st1-27{fill:#1a9cff;stroke:#1a9cff;stroke-width:.5}</style><path class="st0-27" d="M52.7 55.7H5.3c-1.7 0-3-1.3-3-3V5.3c0-1.7 1.3-3 3-3h47.5c1.7 0 3 1.3 3 3v47.5c-.1 1.6-1.4 2.9-3.1 2.9z"/><path class="st1-27" d="M30 17.2c.8 0 1.5.1 2.2.2s1.3.2 1.8.4l1.5.6c.5.2.8.5 1.2.7v3.4h-1.8c0-1.2-.4-2.2-1.2-2.8s-2-.9-3.7-.9c-1.1 0-2 .2-2.7.6s-1.4 1-1.8 1.8-.8 1.8-1 3-.3 2.5-.3 4c.8-.9 1.7-1.6 2.7-2.1s2.1-.7 3.3-.7c1.1 0 2.1.2 3 .5s1.7.8 2.3 1.5 1.1 1.4 1.5 2.3.5 1.9.5 3c0 1.2-.2 2.3-.6 3.2s-.9 1.8-1.6 2.5-1.5 1.2-2.5 1.6-2.1.6-3.3.6c-1.3 0-2.5-.2-3.5-.7s-1.9-1.1-2.5-2-1.2-2.1-1.6-3.5-.5-3-.5-4.9c0-1.8.2-3.4.5-4.9s.8-2.8 1.5-3.9 1.6-2 2.7-2.6 2.2-.9 3.9-.9zm-.6 10.3c-.9 0-1.7.2-2.5.6s-1.5 1-2.2 1.7c-.4.8-.6 1.8-.6 2.9 0 1 .1 1.8.4 2.6s.6 1.4 1.1 2 1 1 1.7 1.2 1.4.4 2.2.4c.8 0 1.4-.1 2-.4s1.1-.6 1.6-1.1.8-1.1 1-1.8.4-1.5.4-2.4c0-.8-.1-1.6-.3-2.3s-.5-1.3-.9-1.8-.9-.9-1.5-1.2-1.5-.4-2.4-.4z"/></svg>',
          'sqrt': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58"><style>.st0-28{fill:#FFF;stroke:#bebebe}.st0-28,.st1-28{stroke-miterlimit:10}.st1-28{fill:none;stroke:#1a9cff;stroke-width:2}</style><path class="st0-28" d="M52.7 55.7H5.3c-1.7 0-3-1.3-3-3V5.3c0-1.7 1.3-3 3-3h47.5c1.7 0 3 1.3 3 3v47.5c-.1 1.6-1.4 2.9-3.1 2.9z"/><path class="st1-28" d="M14.4 32.4l10 10v-22h23"/><path class="st1-28" d="M31.8 29.4h9v12h-9z"/></svg>',
          'subscript': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58"><style>.st0-29{fill:#FFF;stroke:#bebebe}.st0-29,.st1-29{stroke-miterlimit:10}.st1-29{fill:none;stroke:#1a9cff;stroke-width:2}</style><path class="st0-29" d="M52.7 55.7H5.3c-1.7 0-3-1.3-3-3V5.3c0-1.7 1.3-3 3-3h47.5c1.7 0 3 1.3 3 3v47.5c-.1 1.6-1.4 2.9-3.1 2.9z"/><path class="st1-29" d="M14 12.6h15.8v25H14zM36.2 35.6h9v12h-9z"/></svg>',
          'three': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58"><style>.st0-30{fill:#FFF;stroke:#bebebe}.st0-30,.st1-30{stroke-miterlimit:10}.st1-30{fill:#1a9cff;stroke:#1a9cff;stroke-width:.5}</style><path class="st0-30" d="M52.7 55.7H5.3c-1.7 0-3-1.3-3-3V5.3c0-1.7 1.3-3 3-3h47.5c1.7 0 3 1.3 3 3v47.5c-.1 1.6-1.4 2.9-3.1 2.9z"/><path class="st1-30" d="M23.1 33.5c0 1.8.5 3.1 1.4 4s2.3 1.3 4 1.3c.6 0 1.3-.1 1.9-.3s1.2-.5 1.6-.9.9-.9 1.2-1.5.4-1.3.4-2.1c0-.9-.2-1.7-.5-2.3s-.8-1.1-1.4-1.5-1.3-.6-2-.8-1.6-.2-2.4-.2v-1.9c.8 0 1.6-.1 2.3-.3s1.3-.5 1.8-.8.9-.8 1.1-1.4.4-1.2.4-1.9c0-.6-.1-1.1-.3-1.6s-.5-.9-.9-1.3-.9-.6-1.5-.8-1.3-.2-2-.2c-.8 0-1.5.1-2.1.3s-1 .5-1.4.9-.6.9-.8 1.4-.2 1.2-.2 2h-2.1v-4.4c.9-.6 1.9-1.1 3-1.4s2.3-.5 3.6-.5c1.1 0 2.2.1 3 .4s1.7.6 2.3 1.2 1.1 1.1 1.4 1.8.5 1.5.5 2.4c0 1.3-.4 2.4-1.1 3.3s-1.8 1.5-3.3 1.9c.8.2 1.5.4 2.1.7s1.2.7 1.7 1.2.8 1.1 1.1 1.7.4 1.5.4 2.3c0 1-.2 2-.6 2.8s-.7 1.4-1.4 2-1.6 1-2.6 1.3-2.2.5-3.4.5c-1.1 0-2.1-.2-3-.5s-1.7-.8-2.3-1.4-1.1-1.4-1.5-2.3-.5-1.9-.5-3.1h2.1z"/></svg>',
          'two': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58"><style>.st0-31{fill:#FFF;stroke:#bebebe}.st0-31,.st1-31{stroke-miterlimit:10}.st1-31{fill:#1a9cff;stroke:#1a9cff;stroke-width:.5}</style><path class="st0-31" d="M52.7 55.7H5.3c-1.7 0-3-1.3-3-3V5.3c0-1.7 1.3-3 3-3h47.5c1.7 0 3 1.3 3 3v47.5c-.1 1.6-1.4 2.9-3.1 2.9z"/><path class="st1-31" d="M21.2 40.3v-.4-.4c0-1.6.2-2.9.7-4.1s1.1-2.1 1.9-3 1.7-1.7 2.8-2.4 2.2-1.5 3.4-2.3c.6-.4 1-.7 1.4-1.1s.8-.7 1-1.1.5-.8.6-1.2.2-.9.2-1.4c0-.6-.1-1.2-.3-1.7s-.5-.9-.9-1.3-.9-.6-1.5-.8-1.1-.1-1.8-.1c-.9 0-1.7.1-2.4.3s-1.1.5-1.5.9-.6.9-.8 1.5-.2 1.2-.2 2l-2-.1v-4.3c.4-.3.9-.6 1.4-.9s1.1-.5 1.7-.7 1.3-.3 2-.4 1.5-.1 2.4-.1c1.1 0 2.1.1 2.9.4s1.6.7 2.2 1.2 1 1.2 1.4 1.9.5 1.6.5 2.5c0 .9-.1 1.6-.4 2.3s-.7 1.2-1.3 1.8-1.3 1.1-2.1 1.7-1.9 1.3-3 2-1.9 1.4-2.6 2-1.2 1.3-1.6 1.9-.7 1.2-.9 1.7-.4 1.2-.4 1.7h9.1c.3 0 .5-.1.7-.2s.3-.3.4-.7.1-.8.1-1.4v-2.4h1.8v6.7H21.2z"/></svg>',
          'up': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"><style>.st0-32{fill:#FFF;stroke:#bebebe}.st0-32,.st1-32{stroke-miterlimit:10}.st1-32{fill:none;stroke:#1a9cff;stroke-width:3}</style><circle class="st0-32" cx="22" cy="22" r="19"/><path class="st1-32" d="M22.3 31.2v-18M14.8 20.3l7.5-7.5 7.5 7.5"/></svg>',
          'zero': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58"><style>.st0-33{fill:#FFF;stroke:#bebebe;stroke-miterlimit:10}.st1-33{enable-background:new}.st2-33{fill:#1a9cff;stroke:#1a9cff;stroke-width:.5;stroke-miterlimit:10}</style><path class="st0-33" d="M52.7 55.7H5.3c-1.7 0-3-1.3-3-3V5.3c0-1.7 1.3-3 3-3h47.5c1.7 0 3 1.3 3 3v47.5c-.1 1.6-1.4 2.9-3.1 2.9z"/><path class="st1-33 st2-33" d="M29 17.2c2.7 0 4.8 1 6.2 3s2.1 4.9 2.1 8.8-.7 6.8-2.2 8.8-3.5 3-6.2 3-4.8-1-6.2-3-2.1-4.9-2.1-8.8c0-3.8.7-6.8 2.1-8.8s3.6-3 6.3-3zm0 1.8c-3.6 0-5.4 3.3-5.4 9.9 0 1.6.1 3.1.3 4.3s.5 2.3 1 3.1 1 1.5 1.7 1.9 1.5.6 2.5.6c1.9 0 3.2-.8 4.1-2.5s1.3-4.2 1.3-7.4c0-3.4-.4-5.9-1.3-7.5S30.8 19 29 19z"/></svg>',
          'backspace': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"><style>.st0-34{fill:#FFF;stroke:#bebebe}.st0-34,.st1-34{stroke-miterlimit:10}.st1-34{fill:none;stroke:#1a9cff}.st2-34{fill:#1a9cff}</style><circle class="st0-34" cx="22" cy="22" r="19"/><path class="st1-34" d="M14.9 31.4l-6.7-8.1c-.8-.6-.8-1.8 0-2.4l6.7-8.1c.2-.2.5-.3.9-.3H31c.8 0 1.5.7 1.5 1.5v16.1c0 .8-.7 1.5-1.5 1.5H15.7c-.3.1-.6 0-.8-.2z"/><path class="st2-34" d="M26.9 18.4l-1.2-1.1-3.8 3.8-3.9-3.8-1.1 1.2 3.8 3.8-3.9 3.9 1.1 1.2 3.9-4 3.9 3.9 1.1-1.2-3.8-3.8z"/></svg>',
          'percentage': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58"><style>.st0-35{fill:#FFF;stroke:#bebebe}.st0-35,.st1-35{stroke-miterlimit:10}.st1-35{fill:#1a9cff;stroke:#1a9cff;stroke-width:.5}</style><path class="st0-35" d="M52.7 55.7H5.3c-1.7 0-3-1.3-3-3V5.3c0-1.7 1.3-3 3-3h47.5c1.7 0 3 1.3 3 3v47.5c-.1 1.6-1.4 2.9-3.1 2.9z"/><path class="st1-35" d="M20.6 18.4c.8 0 1.6.1 2.2.4s1.2.7 1.6 1.2.8 1.2 1 1.9.3 1.6.3 2.6c0 2-.5 3.6-1.4 4.6s-2.2 1.6-3.9 1.6c-1.7 0-3-.5-3.9-1.6s-1.4-2.6-1.4-4.6c0-2 .5-3.5 1.4-4.6s2.4-1.5 4.1-1.5zm-.1 1.3c-2 0-2.9 1.7-2.9 5 0 1.6.2 2.8.7 3.7s1.2 1.2 2.2 1.2c1 0 1.7-.4 2.2-1.2s.8-2 .8-3.7c0-1.7-.3-2.9-.8-3.7s-1.1-1.3-2.2-1.3zm17.3-1.1L22 41.8h-1.9l15.8-23.2h1.9zm-.4 10.9c1.7 0 3 .5 3.9 1.6s1.3 2.6 1.3 4.7c0 1.9-.5 3.4-1.4 4.5s-2.2 1.6-3.9 1.6c-1.7 0-3-.5-3.9-1.6S32 37.7 32 35.7c0-2 .5-3.5 1.4-4.6s2.3-1.6 4-1.6zm-.1 1.3c-1 0-1.7.4-2.2 1.3s-.7 2.1-.7 3.7.3 2.8.8 3.6 1.3 1.2 2.2 1.2 1.8-.4 2.3-1.2.8-2 .8-3.6c0-1.7-.3-3-.8-3.8s-1.3-1.2-2.4-1.2z"/></svg>',
          'x': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58"><style>.st0-36{fill:#FFF;stroke:#bebebe}.st0-36,.st1-36{stroke-miterlimit:10}.st1-36{fill:#1a9cff;stroke:#1a9cff;stroke-width:.25}</style><path class="st0-36" d="M52.7 55.7H5.3c-1.7 0-3-1.3-3-3V5.3c0-1.7 1.3-3 3-3h47.5c1.7 0 3 1.3 3 3v47.5c-.1 1.6-1.4 2.9-3.1 2.9z"/><path class="st1-36" d="M23.1 30.3c.9-2.2 2.5-5.5 5.3-5.5 2.4 0 2.9 2.4 3.4 4.3.9-1.4 2.5-4.3 4.4-4.3 1.2 0 2.1.7 2.1 1.9 0 1.3-.8 2-2 2-.4 0-.8-.2-1.2-.4-.4-.2-.6-.4-.8-.4-.9.1-2.3 2.2-2.2 2.8l1.2 5.4c.2.9.3 1.7 1 1.7.8 0 2.3-2.8 2.6-3.6l.8.3c-.9 2.3-2.6 5.3-5.4 5.3-3 0-3.5-3.1-4-5.4-1.2 2-2.4 5.4-5.3 5.4-1.3 0-1.9-1.1-1.9-2.3 0-1 .9-1.9 1.9-1.9.7 0 1.3.4 1.7.6.3.1.6.4.7.4.5 0 2.2-2.1 2.6-3.3l-1.3-5.7c0-.1-.2-.4-.4-.4-1 0-2.1 2.7-2.5 3.4l-.7-.3z"/></svg>',
          'y': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58"><style>.st0-37{fill:#FFF;stroke:#bebebe}.st0-37,.st1-37{stroke-miterlimit:10}.st1-37{fill:#1a9cff;stroke:#1a9cff;stroke-width:.25}</style><path class="st0-37" d="M52.7 55.7H5.3c-1.7 0-3-1.3-3-3V5.3c0-1.7 1.3-3 3-3h47.5c1.7 0 3 1.3 3 3v47.5c-.1 1.6-1.4 2.9-3.1 2.9z"/><path class="st1-37" d="M31.2 34.3l2.4-6.6c.4-1.1.9-2.9 2.4-2.9 1 0 1.7.8 1.7 1.8 0 .9-.4 2-1.5 2-.3 0-.7-.3-1-.3-.6-.1-.9 1-1.1 1.4l-3.7 9.6c-1.2 3-3.5 7.7-7.2 7.7-1.4 0-2.6-1-2.6-2.4 0-1.2.8-2.2 2.1-2.2 1.2 0 2.2.8 1.9 1.9-.1.6.2.8.6.8.8 0 3-3 3.1-3.8.1-.3.1-.6.1-.9 0-.6-.3-1.3-.5-1.9l-3-8.7c-.2-.5-.5-2.2-1.2-2.2-.8 0-1.9 2.2-2.2 2.8l-.8-.3c.8-2 2.8-5.3 5.2-5.3 1.2 0 2.6.1 3.3 2.8l2 6.7z"/></svg>'
        }).mapValues(function(v) { return $sce.trustAsHtml(v); }).value(),
        on: _({
          'approx': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58"><style>.st0-100{fill:#b6e2ef;stroke:#60564b;stroke-miterlimit:10}.st1-100{fill:#464146}</style><path class="st0-100" d="M52.7 55.7H5.3c-1.7 0-3-1.3-3-3V5.3c0-1.7 1.3-3 3-3h47.5c1.7 0 3 1.3 3 3v47.5c-.1 1.6-1.4 2.9-3.1 2.9z"/><path class="st1-100" d="M20.8 25.4c.5-.3 1.1-.6 1.5-.8.3-.2.7-.2 1-.3h.2c.4-.1.9-.1 1.2-.1.3 0 .6.1 1 .1l.3.1c.5.1.9.2 1.5.4.2.1.3.1.5.2.4.1.7.2 1.2.4.7.3 1.3.5 1.9.7l.4.1c.5.2.9.3 1.4.4h.3c.5.1.9.2 1.4.2 1 0 2-.2 2.9-.6.7-.3 1.9-.9 3.1-1.8v-3.1l-.4.3-.9.6-.9.6c-.3.3-.7.4-1.1.6-.1.1-.3.1-.4.2-.4.2-.7.3-1.2.4h-1.3c-.5 0-1.1-.1-1.7-.3l-.3-.1c-.8-.2-1.5-.5-2.6-.9-.2-.1-.4-.2-.7-.2-.3-.1-.5-.2-.7-.3-.4-.2-.8-.3-1.3-.4-.2-.1-.4-.1-.6-.1-.2 0-.3 0-.5-.1-.4-.1-.8-.1-1.2-.1-.9 0-1.7.3-2.6.5l-.2.1c-1 .3-2.1.9-3.3 1.7l-.1.1v3l.4-.3c.7-.5 1.3-.9 1.8-1.2zM40.5 30.4l-.4.3-.9.6-.9.6c-.3.3-.7.4-1.1.6-.1.1-.3.1-.4.2-.4.2-.7.3-1.2.4-.5.1-.9.1-1.3.1-.5 0-1.1-.1-1.7-.3l-.3-.1c-.8-.2-1.5-.5-2.6-.9-.2-.1-.4-.2-.7-.2-.3-.1-.5-.2-.7-.3-.4-.2-.8-.3-1.2-.4-.2-.1-.4-.1-.6-.1-.2 0-.3 0-.5-.1-.4-.1-.8-.1-1.2-.1-.9 0-1.7.3-2.6.5l-.2.1c-1 .3-2.1.9-3.3 1.7l-.1.1v3l.4-.3c.7-.5 1.3-.9 1.8-1.2.5-.3 1.1-.6 1.5-.8.3-.2.7-.2 1.1-.3h.2c.4-.1.9-.1 1.2-.1.3 0 .6.1 1 .1l.3.1c.5.1.9.2 1.5.4.2.1.3.1.5.2.4.1.7.2 1.2.4.7.3 1.3.5 1.9.7l.4.1c.5.2.9.3 1.4.4h.3c.5.1.9.2 1.4.2 1 0 2-.2 2.9-.6.7-.3 1.9-.9 3.1-1.8v-3.2z"/></svg>',
          'ac': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"><style>.st0-101{fill:#b6e2ef;stroke:#60564b}.st0-101,.st1-101{stroke-miterlimit:10}.st1-101{fill:#464146;stroke:#464146;stroke-width:.5}</style><circle class="st0-101" cx="22" cy="22" r="19"/><path class="st1-101" d="M28.4 20.7h-1.5c-.1-1.3-.4-2.2-1.1-2.8-.8-.6-1.7-.9-3-.9-.7 0-1.4.1-2 .4s-1.1.6-1.5 1.1-.7 1.1-.9 1.8c-.2.7-.3 1.5-.3 2.4s.1 1.7.3 2.4.5 1.3.9 1.8.9.9 1.5 1.2c.6.3 1.2.4 2 .4 1 0 1.9-.3 2.6-.8s1.2-1.3 1.5-2.3l1.8.3c-.2.7-.4 1.4-.8 1.9-.4.6-.8 1-1.3 1.4s-1.1.6-1.8.8-1.4.2-2.2.2c-1.1 0-2.1-.2-3-.5s-1.6-.8-2.3-1.4c-.6-.6-1.1-1.4-1.5-2.3-.3-.9-.5-1.9-.5-3 0-1 .2-2 .5-2.9.3-.9.8-1.7 1.4-2.4.6-.7 1.3-1.2 2.2-1.6.8-.4 1.8-.6 2.8-.6.4 0 .8 0 1.2.1.4.1.8.1 1.2.3.4.1.7.3 1 .5.3.2.6.5.9.8l.4-1.2H28.3v4.9h.1z"/></svg>',
          'divide': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58"><style>.st0-102{fill:#b6e2ef;stroke:#60564b}.st0-102,.st1-102{stroke-miterlimit:10}.st1-102{stroke:#464146;stroke-width:.5}.st1-102,.st2-102{fill:#464146}</style><path class="st0-102" d="M52.7 55.7H5.3c-1.7 0-3-1.3-3-3V5.3c0-1.7 1.3-3 3-3h47.5c1.7 0 3 1.3 3 3v47.5c-.1 1.6-1.4 2.9-3.1 2.9z"/><path class="st1-102" d="M18.9 27.8H39v2.1H18.9z"/><circle class="st2-102" cx="29" cy="35" r="2.1"/><circle class="st2-102" cx="29" cy="22.8" r="2.1"/></svg>',
          'decimal': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58"><style>.st0-103{fill:#b6e2ef;stroke:#60564b;stroke-miterlimit:10}.st1-103{fill:#464146}</style><path class="st0-103" d="M52.7 55.7H5.3c-1.7 0-3-1.3-3-3V5.3c0-1.7 1.3-3 3-3h47.5c1.7 0 3 1.3 3 3v47.5c-.1 1.6-1.4 2.9-3.1 2.9z"/><circle class="st1-103" cx="28.9" cy="37.7" r="2.1"/></svg>',
          'down': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"><style>.st0-104{fill:#b6e2ef;stroke:#60564b}.st0-104,.st1-104{stroke-miterlimit:10}.st1-104{fill:none;stroke:#464146;stroke-width:3}</style><circle class="st0-104" cx="22" cy="22" r="19"/><path class="st1-104" d="M22.3 12.8v18M29.8 23.7l-7.5 7.5-7.5-7.5"/></svg>',
          'eight': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58"><style>.st0-105{fill:#b6e2ef;stroke:#60564b}.st0-105,.st1-105{stroke-miterlimit:10}.st1-105{fill:#464146;stroke:#464146;stroke-width:.5}</style><path class="st0-105" d="M52.7 55.7H5.3c-1.7 0-3-1.3-3-3V5.3c0-1.7 1.3-3 3-3h47.5c1.7 0 3 1.3 3 3v47.5c-.1 1.6-1.4 2.9-3.1 2.9z"/><path class="st1-105" d="M31.9 28.3c1.8.4 3.2 1.2 4.1 2.2s1.3 2.3 1.3 3.8c0 1-.2 1.9-.6 2.7s-.9 1.5-1.6 2-1.6 1-2.6 1.3-2.2.5-3.6.5c-1.3 0-2.4-.1-3.5-.4s-1.9-.7-2.6-1.3-1.3-1.2-1.6-2-.6-1.7-.6-2.7c0-1.5.4-2.8 1.3-3.8s2.2-1.7 3.9-2.2c-1.4-.4-2.6-1-3.3-2s-1.2-2.1-1.2-3.3c0-.9.2-1.7.5-2.4s.9-1.3 1.5-1.8 1.4-.9 2.4-1.2 2-.4 3.1-.4c1.2 0 2.2.1 3.2.4 1 .3 1.7.6 2.4 1.1s1.2 1.1 1.5 1.8.5 1.5.5 2.4c0 1.3-.4 2.4-1.2 3.3s-1.7 1.6-3.3 2zm-2.8 10.6c.8 0 1.6-.1 2.2-.3s1.3-.5 1.8-.9.9-.9 1.2-1.5.4-1.2.4-2c0-.6-.1-1.1-.3-1.7s-.6-1-1-1.5-1.1-.8-1.8-1.2-1.6-.6-2.6-.8c-1.8.3-3.2.9-4.1 1.7s-1.4 1.9-1.4 3.3c0 .7.1 1.3.4 1.9s.6 1.1 1.1 1.5 1.1.7 1.8.9 1.4.6 2.3.6zm0-19.9c-.7 0-1.4.1-2 .3s-1.1.4-1.6.8-.8.7-1 1.2-.4 1-.4 1.6c0 1.2.4 2.1 1.3 2.9s2.1 1.3 3.7 1.6c1.6-.3 2.8-.8 3.6-1.6.8-.8 1.2-1.7 1.2-2.9 0-.7-.1-1.3-.4-1.8s-.6-.9-1.1-1.2-1-.5-1.5-.7-1.2-.2-1.8-.2z"/></svg>',
          'equals': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58"><style>.st0-106{fill:#b6e2ef;stroke:#60564b}.st0-106,.st1-106{stroke-miterlimit:10}.st1-106{fill:#464146;stroke:#464146;stroke-width:.5}</style><path class="st0-106" d="M52.7 55.7H5.3c-1.7 0-3-1.3-3-3V5.3c0-1.7 1.3-3 3-3h47.5c1.7 0 3 1.3 3 3v47.5c-.1 1.6-1.4 2.9-3.1 2.9z"/><path class="st1-106" d="M39 25.8H19v-2.1h20v2.1zm0 7.3H19V31h20v2.1z"/></svg>',
          'superscript': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58"><style>.st0-107{fill:#b6e2ef;stroke:#60564b}.st0-107,.st1-107{stroke-miterlimit:10}.st1-107{fill:none;stroke:#464146;stroke-width:2}</style><path class="st0-107" d="M52.7 55.7H5.3c-1.7 0-3-1.3-3-3V5.3c0-1.7 1.3-3 3-3h47.5c1.7 0 3 1.3 3 3v47.5c-.1 1.6-1.4 2.9-3.1 2.9z"/><path class="st1-107" d="M15 23.6h15.8v25H15zM37.2 13.6h9v12h-9z"/></svg>',
          'five': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58"><style>.st0-108{fill:#b6e2ef;stroke:#60564b}.st0-108,.st1-108{stroke-miterlimit:10}.st1-108{fill:#464146;stroke:#464146;stroke-width:.5}</style><path class="st0-108" d="M52.7 55.7H5.3c-1.7 0-3-1.3-3-3V5.3c0-1.7 1.3-3 3-3h47.5c1.7 0 3 1.3 3 3v47.5c-.1 1.6-1.4 2.9-3.1 2.9z"/><path class="st1-108" d="M33.9 21.1v-.8-.4c0-.1-.1-.1-.1-.1h-8.7c0 .7-.1 1.4-.1 2s-.1 1.2-.1 1.8-.1 1.3-.1 1.8 0 1-.1 1.4 0 .6 0 .6c.7-.6 1.5-1 2.3-1.3s1.7-.4 2.6-.4c1.1 0 2.1.2 3 .5s1.7.8 2.3 1.5 1.1 1.4 1.5 2.3.5 1.9.5 3c0 1.3-.2 2.5-.7 3.4s-1.1 1.8-1.8 2.4-1.7 1.1-2.7 1.4-2.2.5-3.4.5c-1 0-2-.1-3-.4s-1.9-.6-2.7-1.1l-.4-4.5H24c.1 1.4.5 2.4 1.3 3.2s1.9 1.1 3.5 1.1c.8 0 1.5-.1 2.1-.4s1.2-.6 1.6-1.1.8-1.1 1.1-1.8.4-1.6.4-2.5c0-.8-.1-1.6-.4-2.3s-.6-1.3-1-1.7-1-.8-1.6-1.1-1.3-.4-2.1-.4c-1.1 0-2 .2-2.8.6s-1.5 1-2.1 1.9l-1.4-.5v-12h13.1v4.1h-1.8v-.7z"/></svg>',
          'four': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58"><style>.st0-109{fill:#b6e2ef;stroke:#60564b}.st0-109,.st1-109{stroke-miterlimit:10}.st1-109{fill:#464146;stroke:#464146;stroke-width:.5}</style><path class="st0-109" d="M52.7 55.7H5.3c-1.7 0-3-1.3-3-3V5.3c0-1.7 1.3-3 3-3h47.5c1.7 0 3 1.3 3 3v47.5c-.1 1.6-1.4 2.9-3.1 2.9z"/><path class="st1-109" d="M33.5 17.5v14.2h3.8v1.8h-3.8V38c0 .1.1.3.2.3s.3.2.5.2.6.1 1.1.1h.9v1.6H27.5v-1.6h2.3c.3 0 .5-.1.7-.1s.2-.2.3-.3.1-.3.1-.4v-4.2H21c-.1-.4-.1-.8-.2-1.2s-.2-.7-.3-1.1l9.8-13.8h3.2zm-11 14.3h8.4v-12l-8.4 12z"/></svg>',
          'fraction': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58"><style>.st0-110{fill:#b6e2ef;stroke:#60564b;stroke-miterlimit:10}.st1-110{fill:#464146;stroke-width:.5}.st1-110,.st2-110{stroke:#464146;stroke-miterlimit:10}.st2-110{fill:none;stroke-width:2}</style><path class="st0-110" d="M52.7 55.7H5.3c-1.7 0-3-1.3-3-3V5.3c0-1.7 1.3-3 3-3h47.5c1.7 0 3 1.3 3 3v47.5c-.1 1.6-1.4 2.9-3.1 2.9z"/><path class="st1-110" d="M17 27.5h24.1v2.1H17z"/><path class="st2-110" d="M21.7 14.4h14.6v8.5H21.7zM21.7 34.3h14.6v8.5H21.7z"/></svg>',
          'ge': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58"><style>.st0-111{fill:#b6e2ef;stroke:#60564b;stroke-miterlimit:10}.st1-111{fill:#464146;stroke-width:.5}.st1-111,.st2-111{stroke:#464146;stroke-miterlimit:10}.st2-111{fill:none;stroke-width:2.5}</style><path class="st0-111" d="M52.7 55.7H5.3c-1.7 0-3-1.3-3-3V5.3c0-1.7 1.3-3 3-3h47.5c1.7 0 3 1.3 3 3v47.5c-.1 1.6-1.4 2.9-3.1 2.9z"/><path class="st1-111" d="M38.9 28.3L19 36.4v-2.3l16.8-6.7L19 20.7v-2.3l19.9 8.1v1.8z"/><path class="st2-111" d="M18.8 41.4h20.7"/></svg>',
          'gt': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58"><style>.st0-112{fill:#b6e2ef;stroke:#60564b}.st0-112,.st1-112{stroke-miterlimit:10}.st1-112{fill:#464146;stroke:#464146;stroke-width:.5}</style><path class="st0-112" d="M52.7 55.7H5.3c-1.7 0-3-1.3-3-3V5.3c0-1.7 1.3-3 3-3h47.5c1.7 0 3 1.3 3 3v47.5c-.1 1.6-1.4 2.9-3.1 2.9z"/><path class="st1-112" d="M37.9 28.3L18 36.4v-2.3l16.8-6.7L18 20.7v-2.3l19.9 8.1v1.8z"/></svg>',
          'left': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"><style>.st0-113{fill:#b6e2ef;stroke:#60564b}.st0-113,.st1-113{stroke-miterlimit:10}.st1-113{fill:none;stroke:#464146;stroke-width:3}</style><circle class="st0-113" cx="22" cy="22" r="19"/><path class="st1-113" d="M31.5 22h-18M20.5 29.5L13 22l7.5-7.5"/></svg>',
          'le': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58"><style>.st0-114{fill:#b6e2ef;stroke:#60564b;stroke-miterlimit:10}.st1-114{fill:#464146;stroke-width:.5}.st1-114,.st2-114{stroke:#464146;stroke-miterlimit:10}.st2-114{fill:none;stroke-width:2.5}</style><path class="st0-114" d="M52.7 55.7H5.3c-1.7 0-3-1.3-3-3V5.3c0-1.7 1.3-3 3-3h47.5c1.7 0 3 1.3 3 3v47.5c-.1 1.6-1.4 2.9-3.1 2.9z"/><path class="st1-114" d="M22.1 27.4l16.8 6.7v2.3L19 28.3v-1.9l19.9-8.1v2.3l-16.8 6.8z"/><path class="st2-114" d="M19 41.4h20.7"/></svg>',
          'lt': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58"><style>.st0-115{fill:#b6e2ef;stroke:#60564b}.st0-115,.st1-115{stroke-miterlimit:10}.st1-115{fill:#464146;stroke:#464146;stroke-width:.5}</style><path class="st0-115" d="M52.7 55.7H5.3c-1.7 0-3-1.3-3-3V5.3c0-1.7 1.3-3 3-3h47.5c1.7 0 3 1.3 3 3v47.5c-.1 1.6-1.4 2.9-3.1 2.9z"/><path class="st1-115" d="M22.1 27.4l16.8 6.7v2.3L19 28.3v-1.9l19.9-8.1v2.3l-16.8 6.8z"/></svg>',
          'minus': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58"><style>.st0-116{fill:#b6e2ef;stroke:#60564b}.st0-116,.st1-116{stroke-miterlimit:10}.st1-116{fill:#464146;stroke:#464146;stroke-width:.5}</style><path class="st0-116" d="M52.7 55.7H5.3c-1.7 0-3-1.3-3-3V5.3c0-1.7 1.3-3 3-3h47.5c1.7 0 3 1.3 3 3v47.5c-.1 1.6-1.4 2.9-3.1 2.9z"/><path class="st1-116" d="M22.9 29.2h12.3v2.1H22.9z"/></svg>',
          'multiply': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58"><style>.st0-117{fill:#b6e2ef;stroke:#60564b}.st0-117,.st1-117{stroke-miterlimit:10}.st1-117{fill:#464146;stroke:#464146;stroke-width:.5}</style><path class="st0-117" d="M52.7 55.7H5.3c-1.7 0-3-1.3-3-3V5.3c0-1.7 1.3-3 3-3h47.5c1.7 0 3 1.3 3 3v47.5c-.1 1.6-1.4 2.9-3.1 2.9z"/><path class="st1-117" d="M29.2 27.4l6.3-6.3 1.5 1.5-6.3 6.3 6.2 6.2-1.5 1.5-6.2-6.2-6.3 6.3-1.5-1.5 6.3-6.3-6.2-6.2 1.5-1.5 6.2 6.2z"/></svg>',
          'nine': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58"><style>.st0-118{fill:#b6e2ef;stroke:#60564b}.st0-118,.st1-118{stroke-miterlimit:10}.st1-118{fill:#464146;stroke:#464146;stroke-width:.5}</style><path class="st0-118" d="M52.7 55.7H5.3c-1.7 0-3-1.3-3-3V5.3c0-1.7 1.3-3 3-3h47.5c1.7 0 3 1.3 3 3v47.5c-.1 1.6-1.4 2.9-3.1 2.9z"/><path class="st1-118" d="M28.3 40.7c-1.4 0-2.7-.2-3.7-.6s-1.9-.9-2.6-1.6v-3.1h2.1c0 .6.1 1.2.3 1.7s.4.8.7 1.1.7.5 1.2.7 1.1.2 1.9.2c1.1 0 2-.2 2.8-.6s1.4-1 1.8-1.8.8-1.8 1-3 .3-2.5.3-4c-.7.9-1.6 1.6-2.6 2-1 .4-2.1.7-3.3.7-1.1 0-2.1-.2-3-.5s-1.6-.8-2.3-1.5-1.1-1.4-1.5-2.3-.5-1.9-.5-3c0-1.2.2-2.3.6-3.3s.9-1.8 1.6-2.5 1.5-1.2 2.5-1.6 2.1-.5 3.3-.5c1.3 0 2.5.2 3.5.7 1 .5 1.9 1.1 2.5 2s1.2 2.1 1.6 3.5.5 3.1.5 5c0 1.8-.1 3.4-.4 4.9s-.8 2.8-1.5 3.9-1.6 2-2.6 2.6-2.6.9-4.2.9zm.4-21.7c-.8 0-1.5.1-2.1.4s-1.1.6-1.6 1.1-.8 1.1-1 1.8-.4 1.6-.4 2.5c0 .8.1 1.5.3 2.2s.5 1.3.9 1.8.9.9 1.5 1.2 1.3.4 2.1.4c.6 0 1.3-.1 1.8-.3s1.1-.5 1.5-.9.9-.8 1.2-1.4.6-1.2.8-1.9c0-1.1-.1-2.1-.3-2.9s-.6-1.6-1-2.2-1-1.1-1.7-1.4-1.1-.4-2-.4z"/></svg>',
          'root': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58"><style>.st0-119{fill:#b6e2ef;stroke:#60564b}.st0-119,.st1-119{stroke-miterlimit:10}.st1-119{fill:none;stroke:#464146;stroke-width:2}</style><path class="st0-119" d="M52.7 55.7H5.3c-1.7 0-3-1.3-3-3V5.3c0-1.7 1.3-3 3-3h47.5c1.7 0 3 1.3 3 3v47.5c-.1 1.6-1.4 2.9-3.1 2.9z"/><path class="st1-119" d="M15.4 32.4l10 10v-22h23"/><path class="st1-119" d="M32.8 29.4h9v12h-9zM10 12.1h9v12h-9z"/></svg>',
          'one': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58"><style>.st0-120{fill:#b6e2ef;stroke:#60564b}.st0-120,.st1-120{stroke-miterlimit:10}.st1-120{fill:#464146;stroke:#464146;stroke-width:.5}</style><path class="st0-120" d="M52.7 55.7H5.3c-1.7 0-3-1.3-3-3V5.3c0-1.7 1.3-3 3-3h47.5c1.7 0 3 1.3 3 3v47.5c-.1 1.6-1.4 2.9-3.1 2.9z"/><path class="st1-120" d="M30.8 18.2v19.9c0 .1.1.2.3.3s.4.1.7.2c.3.1.8 0 1.3 0h1.2v1.7h-10v-1.7H26c.5 0 .8 0 1.1-.1s.4-.1.6-.2.2-.2.2-.3V20.1c-.7.4-1.4.7-2.1.9l-2.1.6v-2.2c.9-.2 1.8-.4 2.7-.7s1.7-.7 2.6-1.1l1.8.6z"/></svg>',
          'parenthesis': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58"><style>.st0-121{fill:#b6e2ef;stroke:#60564b}.st0-121,.st1-121{stroke-miterlimit:10}.st1-121{fill:#464146;stroke:#464146;stroke-width:.5}</style><path class="st0-121" d="M52.7 55.7H5.3c-1.7 0-3-1.3-3-3V5.3c0-1.7 1.3-3 3-3h47.5c1.7 0 3 1.3 3 3v47.5c-.1 1.6-1.4 2.9-3.1 2.9z"/><path class="st1-121" d="M25.1 16.4c-1.9 1.6-3.3 3.5-4.2 5.7s-1.4 4.8-1.4 7.7c0 1.5.1 2.8.3 4.1s.5 2.5 1 3.6 1 2.1 1.7 3.1 1.5 1.9 2.5 2.7l-1.4.9c-1.3-.8-2.5-1.8-3.4-2.9S18.6 39 18 37.8s-1-2.5-1.2-3.9-.4-2.6-.4-3.9c0-1.4.1-2.8.4-4.2s.7-2.7 1.2-4 1.3-2.5 2.2-3.5 2-2 3.4-2.8l1.5.9zM34.5 15.4c1.3.9 2.3 1.9 3.2 3s1.6 2.3 2.2 3.5 1 2.5 1.2 3.8.4 2.6.4 4-.1 2.7-.4 4.1-.7 2.7-1.2 4-1.3 2.5-2.2 3.6-2.1 2.1-3.4 3l-1.4-.9c1.9-1.7 3.3-3.6 4.2-5.8s1.4-4.8 1.4-7.8c0-1.5-.1-2.8-.3-4.1s-.6-2.5-1-3.6-1-2.1-1.7-3.1-1.5-1.9-2.5-2.7c.3-.1.5-.3.8-.4s.4-.4.7-.6z"/></svg>',
          'plus': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58"><style>.st0-122{fill:#b6e2ef;stroke:#60564b}.st0-122,.st1-122{stroke-miterlimit:10}.st1-122{fill:#464146;stroke:#464146;stroke-width:.5}</style><path class="st0-122" d="M52.7 55.7H5.3c-1.7 0-3-1.3-3-3V5.3c0-1.7 1.3-3 3-3h47.5c1.7 0 3 1.3 3 3v47.5c-.1 1.6-1.4 2.9-3.1 2.9z"/><path class="st1-122" d="M30.1 27.4H39v2.1h-8.9v8.8h-2.2v-8.8h-9v-2.1h9v-8.8h2.2v8.8z"/></svg>',
          'right': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"><style>.st0-123{fill:#b6e2ef;stroke:#60564b}.st0-123,.st1-123{stroke-miterlimit:10}.st1-123{fill:none;stroke:#464146;stroke-width:3}</style><circle class="st0-123" cx="22" cy="22" r="19"/><path class="st1-123" d="M13 22h18M24 14.5l7.5 7.5-7.5 7.5"/></svg>',
          'seven': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58"><style>.st0-124{fill:#b6e2ef;stroke:#60564b}.st0-124,.st1-124{stroke-miterlimit:10}.st1-124{fill:#464146;stroke:#464146;stroke-width:.5}</style><path class="st0-124" d="M52.7 55.7H5.3c-1.7 0-3-1.3-3-3V5.3c0-1.7 1.3-3 3-3h47.5c1.7 0 3 1.3 3 3v47.5c-.1 1.6-1.4 2.9-3.1 2.9z"/><path class="st1-124" d="M21.7 17.6h15V20c-1.2 1.7-2.3 3.3-3.3 5.1s-1.8 3.5-2.5 5.2-1.3 3.4-1.7 5.1-.8 3.3-.9 4.9h-3.1c.2-1.6.6-3.2 1-5s1.1-3.5 1.8-5.3 1.6-3.6 2.6-5.3 2.2-3.4 3.5-5.1h-9.3c-.3 0-.7.1-.9.1s-.3.2-.3.3-.1.3-.1.5v2.9h-1.9v-5.8h.1z"/></svg>',
          'six': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58"><style>.st0-125{fill:#b6e2ef;stroke:#60564b}.st0-125,.st1-125{stroke-miterlimit:10}.st1-125{fill:#464146;stroke:#464146;stroke-width:.5}</style><path class="st0-125" d="M52.7 55.7H5.3c-1.7 0-3-1.3-3-3V5.3c0-1.7 1.3-3 3-3h47.5c1.7 0 3 1.3 3 3v47.5c-.1 1.6-1.4 2.9-3.1 2.9z"/><path class="st1-125" d="M30 17.2c.8 0 1.5.1 2.2.2s1.3.2 1.8.4l1.5.6c.5.2.8.5 1.2.7v3.4h-1.8c0-1.2-.4-2.2-1.2-2.8s-2-.9-3.7-.9c-1.1 0-2 .2-2.7.6s-1.4 1-1.8 1.8-.8 1.8-1 3-.3 2.5-.3 4c.8-.9 1.7-1.6 2.7-2.1s2.1-.7 3.3-.7c1.1 0 2.1.2 3 .5s1.7.8 2.3 1.5 1.1 1.4 1.5 2.3.5 1.9.5 3c0 1.2-.2 2.3-.6 3.2s-.9 1.8-1.6 2.5-1.5 1.2-2.5 1.6-2.1.6-3.3.6c-1.3 0-2.5-.2-3.5-.7s-1.9-1.1-2.5-2-1.2-2.1-1.6-3.5-.5-3-.5-4.9c0-1.8.2-3.4.5-4.9s.8-2.8 1.5-3.9 1.6-2 2.7-2.6 2.2-.9 3.9-.9zm-.6 10.3c-.9 0-1.7.2-2.5.6s-1.5 1-2.2 1.7c-.4.8-.6 1.8-.6 2.9 0 1 .1 1.8.4 2.6s.6 1.4 1.1 2 1 1 1.7 1.2 1.4.4 2.2.4c.8 0 1.4-.1 2-.4.6-.3 1.1-.6 1.6-1.1s.8-1.1 1-1.8.4-1.5.4-2.4c0-.8-.1-1.6-.3-2.3s-.5-1.3-.9-1.8-.9-.9-1.5-1.2-1.5-.4-2.4-.4z"/></svg>',
          'sqrt': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58"><style>.st0-126{fill:#b6e2ef;stroke:#60564b}.st0-126,.st1-126{stroke-miterlimit:10}.st1-126{fill:none;stroke:#464146;stroke-width:2}</style><path class="st0-126" d="M52.7 55.7H5.3c-1.7 0-3-1.3-3-3V5.3c0-1.7 1.3-3 3-3h47.5c1.7 0 3 1.3 3 3v47.5c-.1 1.6-1.4 2.9-3.1 2.9z"/><path class="st1-126" d="M14.4 32.4l10 10v-22h23"/><path class="st1-126" d="M31.8 29.4h9v12h-9z"/></svg>',
          'subscript': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58"><style>.st0-127{fill:#b6e2ef;stroke:#60564b}.st0-127,.st1-127{stroke-miterlimit:10}.st1-127{fill:none;stroke:#464146;stroke-width:2}</style><path class="st0-127" d="M52.7 55.7H5.3c-1.7 0-3-1.3-3-3V5.3c0-1.7 1.3-3 3-3h47.5c1.7 0 3 1.3 3 3v47.5c-.1 1.6-1.4 2.9-3.1 2.9z"/><path class="st1-127" d="M14 12.6h15.8v25H14zM36.2 35.6h9v12h-9z"/></svg>',
          'three': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58"><style>.st0-128{fill:#b6e2ef;stroke:#60564b}.st0-128,.st1-128{stroke-miterlimit:10}.st1-128{fill:#464146;stroke:#464146;stroke-width:.5}</style><path class="st0-128" d="M52.7 55.7H5.3c-1.7 0-3-1.3-3-3V5.3c0-1.7 1.3-3 3-3h47.5c1.7 0 3 1.3 3 3v47.5c-.1 1.6-1.4 2.9-3.1 2.9z"/><path class="st1-128" d="M23.1 33.5c0 1.8.5 3.1 1.4 4s2.3 1.3 4 1.3c.6 0 1.3-.1 1.9-.3s1.2-.5 1.6-.9c.4-.4.9-.9 1.2-1.5s.4-1.3.4-2.1c0-.9-.2-1.7-.5-2.3s-.8-1.1-1.4-1.5-1.3-.6-2-.8-1.6-.2-2.4-.2v-1.9c.8 0 1.6-.1 2.3-.3s1.3-.5 1.8-.8.9-.8 1.1-1.4.4-1.2.4-1.9c0-.6-.1-1.1-.3-1.6s-.5-.9-.9-1.3-.9-.6-1.5-.8-1.3-.2-2-.2c-.8 0-1.5.1-2.1.3s-1 .5-1.4.9-.6.9-.8 1.4-.2 1.2-.2 2h-2.1v-4.4c.9-.6 1.9-1.1 3-1.4s2.3-.5 3.6-.5c1.1 0 2.2.1 3 .4s1.7.6 2.3 1.2 1.1 1.1 1.4 1.8.5 1.5.5 2.4c0 1.3-.4 2.4-1.1 3.3s-1.8 1.5-3.3 1.9c.8.2 1.5.4 2.1.7s1.2.7 1.7 1.2.8 1.1 1.1 1.7.4 1.5.4 2.3c0 1-.2 2-.6 2.8s-.7 1.4-1.4 2-1.6 1-2.6 1.3-2.2.5-3.4.5c-1.1 0-2.1-.2-3-.5s-1.7-.8-2.3-1.4-1.1-1.4-1.5-2.3-.5-1.9-.5-3.1h2.1z"/></svg>',
          'two': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58"><style>.st0-129{fill:#b6e2ef;stroke:#60564b}.st0-129,.st1-129{stroke-miterlimit:10}.st1-129{fill:#464146;stroke:#464146;stroke-width:.5}</style><path class="st0-129" d="M52.7 55.7H5.3c-1.7 0-3-1.3-3-3V5.3c0-1.7 1.3-3 3-3h47.5c1.7 0 3 1.3 3 3v47.5c-.1 1.6-1.4 2.9-3.1 2.9z"/><path class="st1-129" d="M21.2 40.3v-.4-.4c0-1.6.2-2.9.7-4.1s1.1-2.1 1.9-3 1.7-1.7 2.8-2.4 2.2-1.5 3.4-2.3c.6-.4 1-.7 1.4-1.1s.8-.7 1-1.1.5-.8.6-1.2.2-.9.2-1.4c0-.6-.1-1.2-.3-1.7s-.5-.9-.9-1.3-.9-.6-1.5-.8-1.1-.1-1.8-.1c-.9 0-1.7.1-2.4.3s-1.1.5-1.5.9-.6.9-.8 1.5-.2 1.2-.2 2l-2-.1v-4.3c.4-.3.9-.6 1.4-.9s1.1-.5 1.7-.7 1.3-.3 2-.4 1.5-.1 2.4-.1c1.1 0 2.1.1 2.9.4s1.6.7 2.2 1.2 1 1.2 1.4 1.9.5 1.6.5 2.5-.1 1.6-.4 2.3-.7 1.2-1.3 1.8-1.3 1.1-2.1 1.7-1.9 1.3-3 2-1.9 1.4-2.6 2-1.2 1.3-1.6 1.9-.7 1.2-.9 1.7-.4 1.2-.4 1.7h9.1c.3 0 .5-.1.7-.2s.3-.3.4-.7.1-.8.1-1.4v-2.4h1.8v6.7H21.2z"/></svg>',
          'up': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"><style>.st0-130{fill:#b6e2ef;stroke:#60564b}.st0-130,.st1-130{stroke-miterlimit:10}.st1-130{fill:none;stroke:#464146;stroke-width:3}</style><circle class="st0-130" cx="22" cy="22" r="19"/><path class="st1-130" d="M22.3 31.2v-18M14.8 20.3l7.5-7.5 7.5 7.5"/></svg>',
          'zero': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58"><style>.st0-131{fill:#b6e2ef;stroke:#60564b;stroke-miterlimit:10}.st1-131{enable-background:new}.st2-131{fill:#464146;stroke:#464146;stroke-width:.5;stroke-miterlimit:10}</style><path class="st0-131" d="M52.7 55.7H5.3c-1.7 0-3-1.3-3-3V5.3c0-1.7 1.3-3 3-3h47.5c1.7 0 3 1.3 3 3v47.5c-.1 1.6-1.4 2.9-3.1 2.9z"/><path class="st1-131 st2-131" d="M29 17.2c2.7 0 4.8 1 6.2 3s2.1 4.9 2.1 8.8-.7 6.8-2.2 8.8-3.5 3-6.2 3-4.8-1-6.2-3-2.1-4.9-2.1-8.8c0-3.8.7-6.8 2.1-8.8s3.6-3 6.3-3zm0 1.8c-3.6 0-5.4 3.3-5.4 9.9 0 1.6.1 3.1.3 4.3s.5 2.3 1 3.1 1 1.5 1.7 1.9 1.5.6 2.5.6c1.9 0 3.2-.8 4.1-2.5s1.3-4.2 1.3-7.4c0-3.4-.4-5.9-1.3-7.5S30.8 19 29 19z"/></svg>',
          'absolute_value': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58"><style>.st0-132{fill:#b6e2ef;stroke:#60564b}.st0-132,.st1-132{stroke-miterlimit:10}.st1-132{fill:none;stroke:#464146;stroke-width:2.5}</style><path class="st0-132" d="M52.7 55.7H5.3c-1.7 0-3-1.3-3-3V5.3c0-1.7 1.3-3 3-3h47.5c1.7 0 3 1.3 3 3v47.5c-.1 1.6-1.4 2.9-3.1 2.9z"/><path class="st1-132" d="M23.7 15.5v27M34.3 15.5v27"/></svg>',
          'degree': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58"><style>.st0-133{fill:#b6e2ef;stroke:#60564b}.st0-133,.st1-133{stroke-miterlimit:10}.st1-133{fill:none;stroke:#464146;stroke-width:2.5}</style><path class="st0-133" d="M52.7 55.7H5.3c-1.7 0-3-1.3-3-3V5.3c0-1.7 1.3-3 3-3h47.5c1.7 0 3 1.3 3 3v47.5c-.1 1.6-1.4 2.9-3.1 2.9z"/><circle class="st1-133" cx="28.7" cy="22.7" r="4.7"/></svg>',
          'backspace': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"><style>.st0-134{fill:#b6e2ef;stroke:#60564b}.st0-134,.st1-134{stroke-miterlimit:10}.st1-134{fill:none;stroke:#464146}.st2-134{fill:#464146}</style><circle class="st0-134" cx="22" cy="22" r="19"/><path class="st1-134" d="M14.9 31.4l-6.7-8.1c-.8-.6-.8-1.8 0-2.4l6.7-8.1c.2-.2.5-.3.9-.3H31c.8 0 1.5.7 1.5 1.5v16.1c0 .8-.7 1.5-1.5 1.5H15.7c-.3.1-.6 0-.8-.2z"/><path class="st2-134" d="M26.9 18.4l-1.2-1.1-3.8 3.8-3.9-3.8-1.1 1.2 3.8 3.8-3.9 3.9 1.1 1.2 3.9-4 3.9 3.9 1.1-1.2-3.8-3.8z"/></svg>',
          'percentage': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58"><style>.st0-135{fill:#b6e2ef;stroke:#60564b}.st0-135,.st1-135{stroke-miterlimit:10}.st1-135{fill:#464146;stroke:#464146;stroke-width:.5}</style><path class="st0-135" d="M52.7 55.7H5.3c-1.7 0-3-1.3-3-3V5.3c0-1.7 1.3-3 3-3h47.5c1.7 0 3 1.3 3 3v47.5c-.1 1.6-1.4 2.9-3.1 2.9z"/><path class="st1-135" d="M20.7 18.5c.8 0 1.6.1 2.2.4s1.2.7 1.6 1.2.8 1.2 1 1.9.3 1.6.3 2.6c0 2-.5 3.6-1.4 4.6-.9 1.1-2.2 1.6-3.9 1.6-1.7 0-3-.5-3.9-1.6-.9-1.1-1.4-2.6-1.4-4.6 0-2 .5-3.5 1.4-4.6s2.4-1.5 4.1-1.5zm-.1 1.3c-2 0-2.9 1.7-2.9 5 0 1.6.2 2.8.7 3.7s1.2 1.2 2.2 1.2c1 0 1.7-.4 2.2-1.2s.8-2 .8-3.7c0-1.7-.3-2.9-.8-3.7s-1.1-1.3-2.2-1.3zm17.3-1.1L22.1 41.9h-1.9L36 18.7h1.9zm-.4 10.9c1.7 0 3 .5 3.9 1.6s1.3 2.6 1.3 4.7c0 1.9-.5 3.4-1.4 4.5S39.1 42 37.4 42c-1.7 0-3-.5-3.9-1.6s-1.4-2.6-1.4-4.6c0-2 .5-3.5 1.4-4.6s2.3-1.6 4-1.6zm-.1 1.3c-1 0-1.7.4-2.2 1.3s-.7 2.1-.7 3.7.3 2.8.8 3.6 1.3 1.2 2.2 1.2 1.8-.4 2.3-1.2.8-2 .8-3.6c0-1.7-.3-3-.8-3.8s-1.3-1.2-2.4-1.2z"/></svg>',
          'x': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58"><style>.st0-136{fill:#b6e2ef;stroke:#60564b}.st0-136,.st1-136{stroke-miterlimit:10}.st1-136{fill:#464146;stroke:#464146;stroke-width:.5}</style><path class="st0-136" d="M52.7 55.7H5.3c-1.7 0-3-1.3-3-3V5.3c0-1.7 1.3-3 3-3h47.5c1.7 0 3 1.3 3 3v47.5c-.1 1.6-1.4 2.9-3.1 2.9z"/><path class="st1-136" d="M23.1 30.3c.9-2.2 2.5-5.5 5.3-5.5 2.4 0 2.9 2.4 3.4 4.3.9-1.4 2.5-4.3 4.4-4.3 1.2 0 2.1.7 2.1 1.9 0 1.3-.8 2-2 2-.4 0-.8-.2-1.2-.4-.4-.2-.6-.4-.8-.4-.9.1-2.3 2.2-2.2 2.8l1.2 5.4c.2.9.3 1.7 1 1.7.8 0 2.3-2.8 2.6-3.6l.8.3c-.9 2.3-2.6 5.3-5.4 5.3-3 0-3.5-3.1-4-5.4-1.2 2-2.4 5.4-5.3 5.4-1.3 0-1.9-1.1-1.9-2.3 0-1 .9-1.9 1.9-1.9.7 0 1.3.4 1.7.6.3.1.6.4.7.4.5 0 2.2-2.1 2.6-3.3l-1.3-5.7c0-.1-.2-.4-.4-.4-1 0-2.1 2.7-2.5 3.4l-.7-.3z"/></svg>',
          'y': '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58"><style>.st0-137{fill:#b6e2ef;stroke:#60564b}.st0-137,.st1-137{stroke-miterlimit:10}.st1-137{fill:#464146;stroke:#464146;stroke-width:.5}</style><path class="st0-137" d="M52.7 55.7H5.3c-1.7 0-3-1.3-3-3V5.3c0-1.7 1.3-3 3-3h47.5c1.7 0 3 1.3 3 3v47.5c-.1 1.6-1.4 2.9-3.1 2.9z"/><path class="st1-137" d="M31.2 34.3l2.4-6.6c.4-1.1.9-2.9 2.4-2.9 1 0 1.7.8 1.7 1.8 0 .9-.4 2-1.5 2-.3 0-.7-.3-1-.3-.6-.1-.9 1-1.1 1.4l-3.7 9.6c-1.2 3-3.5 7.7-7.2 7.7-1.4 0-2.6-1-2.6-2.4 0-1.2.8-2.2 2.1-2.2 1.2 0 2.2.8 1.9 1.9-.1.6.2.8.6.8.8 0 3-3 3.1-3.8.1-.3.1-.6.1-.9 0-.6-.3-1.3-.5-1.9l-3-8.7c-.2-.5-.5-2.2-1.2-2.2-.8 0-1.9 2.2-2.2 2.8l-.8-.3c.8-2 2.8-5.3 5.2-5.3 1.2 0 2.6.1 3.3 2.8l2 6.7z"/></svg>'
        }).mapValues(function(v) { return $sce.trustAsHtml(v); }).value()
      };

      function MathInputConfig() {
        this.postLink = function(scope) {
          scope.types = types;
          scope.sections = sections;
          scope.buttons = buttons;
          scope.graphics = graphics;
        };
      }

      return MathInputConfig;
    }
  ]);