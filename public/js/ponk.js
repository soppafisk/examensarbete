var ponk = angular.module("ponk", ["ui.router", "ngResource"]);

ponk.config(['$stateProvider', '$urlRouterProvider', "$locationProvider", function ($stateProvider, $urlRouterProvider, $locationProvider) {
  $locationProvider.html5Mode(true);
  $urlRouterProvider.otherwise('/'); // default route

   $stateProvider.state('board', {
     url: '/b/:url',
     templateUrl: 'views/board.html',
     controller: "AppCtrl as pk",
     resolve: {
      board: ['$stateParams', 'boardFactory', function($stateParams, boardFactory) {
        console.log($stateParams.url);
        return boardFactory.get({url:$stateParams.url});

      }]
     }
   });

}]).run(function($state) {
  $state.go('board'); //make a transition to movies state when app starts
});;

ponk.factory("boardFactory", ["$http", "$resource", function($http, $resource) {
  return $resource('/board/:url', {url:'url'}, {update: { method: "PUT"}});
}]);

// ponk.controller("boardController", ["board", function(board){
//
// }]);

ponk.controller("AppCtrl", ["$scope", "$http", "$resource", "boardFactory", "board", function($scope, $http, $resource, boardFactory, board ) {
  var pk = this;
  pk.board =
  //var Board = $resource('/board/:url', {url:'url'}, {update: { method: "PUT"}});
  pk.board = boardFactory.get();

  // Toggle add widget form
  pk.showAddWidget = false;

  pk.saveBoard = function() {
    $http.put('/board/' + pk.board.link, pk.board);
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
