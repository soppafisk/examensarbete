var ponk = angular.module("ponk", ["ui.router", "ngResource"]);

ponk.config(['$stateProvider', '$urlRouterProvider', "$locationProvider", function ($stateProvider, $urlRouterProvider, $locationProvider) {
  $locationProvider.html5Mode(true);
  $urlRouterProvider.otherwise('/');

  $stateProvider.state('home', {
    url: '/',
    views: {
      "": {
        templateUrl: 'views/home.html',
        controller: "HomeCtrl",
        controllerAs: "hc",
      }
    }
  });

  $stateProvider.state('empty', {
    url: '/b/',
    views: {
      "": {
        templateUrl: 'views/board.html',
        controller: "AppCtrl",
        controllerAs: "pk",
        resolve: {
          board: ["$stateParams", "boardFactory", function($stateParams, boardFactory) {
            var board = new boardFactory();
            board.widgets = [];
            board.title = "Ny board";
            console.log(board);
            console.log("här är jag");
            return board;
          }]
        }
      }
    }
  });

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
}]);


ponk.controller("HomeCtrl", [function(){
  console.log("home");
  var hc = this;
  hc.createNewBoard = function() {
    console.log("ny board");
    $state.go("empty");
  };

}]);

ponk.factory("boardFactory", ["$http", "$resource", function($http, $resource) {
  return $resource('/board/:slug', {slug:'@slug'}, {update: { method: "PUT"}});
}]);

ponk.controller("AppCtrl", ["$scope", "board", "boardFactory", "$state", function($scope, board, boardFactory, $state) {
  var pk = this;

  pk.board = board;

  //Toggle add widget form
  pk.showAddWidget = false;
  pk.toggleAddWidget = function () {
    pk.showAddWidget = !pk.showAddWidget;
  };

  pk.saving = false;

  // save board. If new, post, if existing, put
  pk.saveBoard = function() {
    pk.saving = true;
    if(pk.board.slug) {
      console.log("put");
      pk.board.$update(function(){
        pk.saving = false;
      });
    } else {
      pk.board.$save(function(newBoard) {
        console.log("post");
        pk.board = newBoard;
        pk.saving = false;
        $state.go("board", {slug: newBoard.slug} );
      });

    }

  };

  // new wigets has text preselected
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
