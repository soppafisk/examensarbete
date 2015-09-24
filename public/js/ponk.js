var ponk = angular.module("ponk", []);

ponk.controller("AppCtrl", ["$scope", function($scope) {

  //dummy data
  $scope.modules = [
    {
      type: "text",
      content: "this is a text field"
    },
    {
      type: "youtube",
      content: "adress to youtubevideo"
    }
    ];

    $scope.showAddModule = false;

    $scope.newModule = {
      type: "text",
      content: ""
    }

  $scope.toggleAddModule = function () {
           $scope.showAddModule = !$scope.showAddModule;
           console.log($scope.modules);
  };

  $scope.addModule = function() {
      $scope.modules.push($scope.newModule);
      $scope.newModule = { type: "text", };
      $scope.showAddModule = false;
  };

  $scope.deleteModule = function(module) {
      var index = $scope.$parent.modules.indexOf(module);
      if(index != -1) {
        $scope.$parent.modules.splice(index, 1);
        console.log(index);
      } else {
        console.log("nosplice");
      }
      console.log($scope.$parent.modules);
  };

}]);

ponk.directive("module", function($compile) {
  var before = '<div><span class="glyphicon glyphicon-remove-circle pointer" ng-click="deleteModule(module)"></span></div>';
  var textTemplate = '<div class=" col-xs-2">' + before + '<div class="module">{{ module.content }}</div></div>';
  var youtubeTemplate = '<div class="col-xs-4">' + before + '<div class="module"><iframe id="ytplayer" type="text/html" width="500" height="300" src="http://www.youtube.com/embed/?autoplay=0" frameborder="0"/></div></div>';

  var getTemplate = function(type) {

    var template = "";
    switch(type) {
      case "youtube":
        template = youtubeTemplate;
        break;
      case "text":
      default:
        template = textTemplate;
        break;
    }
    return template;
  }

  var linker = function(scope, element, attrs) {
    var el = $compile(getTemplate(scope.module.type))(scope);
    element.replaceWith(el);
  }

  return {
    scope: true,
    transclude: 'true',
    controller: 'AppCtrl',
    restrict: 'E',
    link: linker,
  }
});
