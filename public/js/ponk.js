var ponk = angular.module("ponk", []);

ponk.controller("AppCtrl", ["$scope", function($scope) {

  $scope.modules = [
    {
      type: "text",
      content: "hejhejhej"
    },
    {
      type: "youtube",
      content: "aasfaölk"
    }
    ];
    $scope.showAddModule = false;
    $scope.newModule = {
      type: "text",
      content: ""
    }

  $scope.toggleAddModule = function () {
           $scope.showAddModule = !$scope.showAddModule;
  };

  $scope.addModule = function() {
    $scope.modules.push($scope.newModule);
    $scope.newModule = { type: "text", };
    $scope.showAddModule = false;
  }
}]);

ponk.directive("module", function($compile) {


  var linker = function(scope, element, attrs) {
    var getTemplate = function(type) {

    }
    getTemplate(scope.module.type);
    console.log(element);
    element.innerHTML = "hej";
  }

  return {
    restrict: 'E',
    //template: '<div class="module">{{ module.content }}</div>',
    link: linker,
  }
});
