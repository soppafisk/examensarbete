var ponk = angular.module("ponk", []);

ponk.controller("AppCtrl", ["$scope", "$http", function($scope, $http) {
  var pk = this;

  pk.board = {};
  $http.get('/board').success(function(data){
    pk.board = data[0];
    console.log(pk.board);
  });



  //dummy data
  // pk.modules = [
  //   {
  //     wType: "text",
  //     content: "this is a text field"
  //   },
  //   {
  //     wType: "youtube",
  //     content: "address to youtubevideo"
  //   }
  //   ];
  //
  pk.showAddModule = false;

  pk.newModule = {
    wType: "text",
    content: ""
  }

  pk.toggleAddModule = function () {
           pk.showAddModule = !pk.showAddModule;
  };

  pk.addModule = function() {
    pk.board.widgets.push(pk.newModule);
    pk.newModule = { wType: "text", };
    pk.showAddModule = false;

    $http.post('/board', pk.board)
      .success(function() {

      });
  };

  pk.deleteModule = function(module) {
      var index = pk.board.widgets.indexOf(module);
      if(index != -1) {
        pk.board.widgets.splice(index, 1);
      }
  };

}]);

ponk.directive("module", function($compile) {
  var before = '<div><span class="glyphicon glyphicon-remove-circle pointer" ng-click="deleteModule(widget)"></span></div>';
  var textTemplate = '<div class=" col-xs-2">' + before + '<div class="module">{{ widget.content }}</div></div>';
  var youtubeTemplate = '<div class="col-xs-4">' + before + '<div class="module"><iframe id="ytplayer" type="text/html" width="500" height="300" src="http://www.youtube.com/embed/?autoplay=0" frameborder="0"/></div></div>';

  var getTemplate = function(wType) {

    var template = "";
    switch(wType) {
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
    var el = $compile(getTemplate(scope.widget.wType))(scope);
    element.replaceWith(el);
    scope.deleteModule = function(w){
      scope.removeFn({widget:w});
    }
  }

  return {
    scope: {widget: '=', removeFn:'&'},
    transclude: 'true',
    controller: 'AppCtrl',
    restrict: 'E',
    link: linker,
  }
});
