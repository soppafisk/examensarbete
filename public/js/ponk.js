var ponk = angular.module("ponk", ["ui.router", "ngResource"]);

ponk.config(['$stateProvider', '$urlRouterProvider', "$locationProvider", function ($stateProvider, $urlRouterProvider, $locationProvider) {
  $locationProvider.html5Mode(true);
  $urlRouterProvider.otherwise('/');

   $stateProvider.state('board', {
     url: '/b/:slug',
     views: {
       "": {
         templateUrl: 'views/board.html',
         controller: "AppCtrl",
         controllerAs: "pk",
         resolve: {
          board: ["$stateParams", "boardFactory", function($stateParams, boardFactory) {
            var board = {widgets: []};
            if($stateParams.slug) {
              board = boardFactory.get({slug:$stateParams.slug}).$promise;
            }
            return board;
          }]
         }
       }
     }
   });
}]).run(function($state) {
  $state.go('board');
});

ponk.factory("boardFactory", ["$http", "$resource", function($http, $resource) {
  return $resource('/board/:slug', {slug:'@slug'}, {update: { method: "PUT"}});
}]);

ponk.controller("AppCtrl", ["$scope", "board", "boardFactory", function($scope, board, boardFactory) {
  var pk = this;
  pk.board = board;
  console.log(pk.board);
  var emptyBoard = {
    title: "Ny board",
    widgets: [],
  };

  //Toggle add widget form
  pk.showAddWidget = false;

  pk.saveBoard = function() {
    pk.board.$update(function(){

    });

    //$http.put('/board/' + pk.board.link, pk.board);
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
    restrict: 'E',
    link: linker,
  }
});
