var ponk = angular.module("ponk", []);

ponk.controller("AppCtrl", ["$scope", function($scope) {
  var pk = this;

  //dummy data
  pk.modules = [
    {
      type: "text",
      content: "this is a text field"
    },
    {
      type: "youtube",
      content: "address to youtubevideo"
    }
    ];

    pk.showAddModule = false;

    pk.newModule = {
      type: "text",
      content: ""
    }

  pk.toggleAddModule = function () {
           pk.showAddModule = !pk.showAddModule;
  };

  pk.addModule = function() {
      pk.modules.push(pk.newModule);
      pk.newModule = { type: "text", };
      pk.showAddModule = false;
  };

  pk.deleteModule = function(module) {
      var index = pk.modules.indexOf(module);
      if(index != -1) {
        pk.modules.splice(index, 1);
      }
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
    scope.deleteModule = function(m){
      scope.removeFn({module:m});
    }
  }

  return {
    scope: {module: '=', removeFn:'&'},
    transclude: 'true',
    controller: 'AppCtrl',
    restrict: 'E',
    link: linker,
  }
});
