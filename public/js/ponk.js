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

  $scope.toggleAddModule = function () {
           $scope.showAddModule = !$scope.showAddModule;
  };

  $scope.addModule = function() {
    var newModule = {
      type: "text",
      content: $scope.textContent
    }
    console.log(newModule);
    $scope.modules.push(newModule);
    $scope.textContent = "";

  }
}]);
