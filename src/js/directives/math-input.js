angular.module('corespring.math-input')
  .directive('mathInput', [
    'MathInputConfig',
    '$log',
    '$compile',
    '$document',
    '$timeout',
    function(MathInputConfig, $log, $compile, $document, $timeout) {
      var log = $log.debug.bind($log, '[math-input-def]');

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
          var supportedTags = ['aleph', 'alpha', 'amalg', 'angle', 'approx', 'arccos', 'arcsin', 'arctan', 'ast',
            'asymp', 'backslash', 'beta', 'bigcirc', 'bigtriangledown', 'bigtriangleup', 'bot', 'bowtie', 'bullet',
            'cap', 'cdot', 'cdots', 'chi', 'circ', 'clubsuit', 'cong', 'cos', 'cosh', 'cot', 'coth', 'csc', 'cup',
            'dagger', 'dashv', 'ddagger', 'ddots', 'deg', 'delta', 'det', 'diamond', 'diamondsuit', 'dim', 'div',
            'doteq', 'dots', 'downarrow', 'ell', 'emptyset', 'epsilon', 'eq', 'equiv', 'eta', 'exists', 'flat',
            'forall', 'frac', 'frown', 'gamma', 'gcd', 'ge', 'geq', 'gg', 'gt', 'hbar', 'heartsuit', 'hookleftarrow',
            'hookrightarrow', 'Im', 'in', 'inf', 'infty', 'kappa', 'lambda', 'ldots', 'left', 'leftarrow', 'leftharpoondown',
            'leftharpoonup', 'leftrightarrow', 'leq', 'lg', 'll', 'ln', 'log', 'log_b', 'longleftarrow', 'longleftrightarrow',
            'longrightarrow', 'lt', 'mapsto', 'max', 'mid', 'min', 'models', 'mp', 'mu', 'nabla', 'natural', 'nearrow', 'qqqne',
            'neg', 'neq', 'ni', 'nu', 'nwarrow', 'odot', 'omega', 'ominus', 'oplus', 'oslash', 'otimes', 'overline', 'parallel',
            'partial', 'perp', 'phi', 'pi', 'pm', 'prec', 'preceq', 'prime', 'propto', 'psi', 'Re', 'rho', 'right', 'rightarrow',
            'rightharpoondown', 'rightharpoonup', 'searrow', 'sec', 'setminus', 'sharp', 'sigma', 'sim', 'simeq', 'sin', 'sinh',
            'smile', 'spadesuit', 'sqcap', 'sqcup', 'sqrt', 'sqsubseteq', 'sqsupseteq', 'star', 'subset', 'subseteq', 'succ',
            'succeq', 'sup', 'supset', 'supseteq', 'surd', 'swarrow', 'tan', 'tanh', 'tau', 'text', 'theta', 'times', 'top',
            'triangle', 'triangleleft', 'triangleright', 'uparrow', 'updownarrow', 'uplus', 'upsilon', 'varepsilon',
            'varnothing', 'varphi', 'varpi', 'varrho', 'varsigma', 'vartheta', 'vdash', 'vdots', 'vee', 'wedge', 'wp', 'wr', 'xi',
            'zeta'];
          var matches = text.match(/\\[a-zA-Z]+/g);
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
              $scope.$apply(function() {
                $scope.showKeypad = false;
                $scope.showCodepad = false;
              });
              $document.off('mousedown');
              $scope.clickOutsideListenerAttached = false;
            });
            $scope.clickOutsideListenerAttached = true;
          }
        }


        function repositionKeypad() {
          var kpWidth = 290;
          var playerElement = $element.parents($scope.parentSelectorCalculated);

          if (!playerElement) {
            return;
          }

          var playerElementLeft = playerElement.offset().left;
          var mqElement = $element.find('.mq');

          var mqOffset = mqElement.offset();
          var currentOffset = {left: mqOffset.left};

          if (currentOffset.left + kpWidth > playerElementLeft + playerElement.width()) {
            currentOffset.left = playerElementLeft + playerElement.width() - kpWidth;
          }
          currentOffset.top = mqOffset.top + mqElement.outerHeight() + 5;
          $element.find('.keypad').offset(currentOffset);
        }

        function onInputChange(skipApply) {
          if (!$scope.showKeypad) {
            return;
          }
          var latex = $element.find('.mq').mathquill('latex');
          $scope.ngModel = fixBackslashes(latex);
          if (!skipApply) {
            $scope.$apply();
          }
          repositionKeypad();
        }

        function initMethods() {
          var mqElement = $element.find('.mq');
          mqElement.click(onInputFieldClick);
          $element.bind('input propertychange', onInputChange);
          $element.bind('keyup', function(ev) {
            // input propertychange does not fire for backspace, need to handle separately
            if (ev.keyCode === 8) {
              onInputChange();
            }
          });

          mqElement.mathquill($scope.editable === 'true' ? 'editable' : undefined);
          if ($scope.expression && isMathquillCompatible($scope.expression)) {
            mqElement.mathquill('latex', $scope.expression);
            $scope.ngModel = fixBackslashes($scope.expression);
            mqElement.blur();
          } else if ($scope.expression) {
            $scope.code = $scope.expression;
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
              $scope.focusedInput.mathquill('latex', '');
              $timeout(function() {
                $scope.focusedInput.find('textarea').focus();
              }, 1);

            } else if (button.logic === 'cursor' || button.logic === 'cmd' || button.logic === 'write') {
              $scope.focusedInput.mathquill(button.logic, button.command);
              $timeout(function() {
                $scope.focusedInput.find('textarea').focus();
              }, 1);
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
          initMethods();
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