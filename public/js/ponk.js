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
      type: null,
      content: ""
    }

  $scope.toggleAddModule = function () {
           $scope.showAddModule = !$scope.showAddModule;
  };

  $scope.addModule = function() {
    $scope.newModule = {
      type: $scope.newModule.moduleType,
      content: $scope.newModule.textContent
    }
    $scope.modules.push($scope.newModule);
    $scope.textContent = "";
    $scope.showAddModule = false;
  }
}]);

ponk.directive("typeInput", function($compile){

  var test = function($scope){
    console.log($scope.newModule.moduletype);
  }

  return {
    restrict: 'E',
    scope: {
      moduletype: "=",
    },
    template: "<textarea> {{ moduletype }}</textarea>",
    controller: function($scope) {
      console.log($scope.moduletype);
      test();
    }

  }


  });
