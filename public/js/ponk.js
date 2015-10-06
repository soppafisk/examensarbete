var ponk = angular.module("ponk", []);

ponk.controller("AppCtrl", ["$scope", "$http", function($scope, $http) {
  var pk = this;

  pk.board = {};
  $http.get('/board').success(function(data){
    pk.board = data[0];
  });

  // Toggle add widget form
  pk.showAddWidget = false;

  pk.saveBoard = function() {
    console.log("put to /board");
    console.log(pk.board._id);

    $http.put('/board/' + pk.board._id, pk.board);
  };

  pk.toggleAddWidget = function () {
    pk.showAddWidget = !pk.showAddWidget;
  };

  pk.newWidget = {
    wType: "text",
    content: ""
  }

  pk.addWidget = function() {
    pk.board.widgets.push(pk.newWidget);
    pk.newWidget = { wType: "text", };
    pk.showAddWidget = false;
  };

  pk.deleteWidget = function(widget) {
    var index = pk.board.widgets.indexOf(widget);
    if(index != -1) {
      pk.board.widgets.splice(index, 1);
    }
  };

}]);

ponk.directive("module", function($compile) {
  var before = '<div><span class="glyphicon glyphicon-remove-circle pointer" ng-click="deleteWidget(widget)"></span></div>';
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
    scope.deleteWidget = function(w){
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
