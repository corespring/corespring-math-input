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
