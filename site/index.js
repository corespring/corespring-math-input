angular.module('app', ['corespring.math-input']);

angular.module('app').controller('Main', ['$scope', '$log',

  function($scope) {
    // $scope.expression = '\\frac{1}\\editable{} + \\sqrt\\editable{}';
    // $scope.editable = false;
    $scope.expression = '';
    $scope.editable = true;
    $scope.keypadType = 'basic';
    $scope.keypadShown = true;
  }
]);