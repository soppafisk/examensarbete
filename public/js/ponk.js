var ponk = angular.module("ponk", ["ui.router", "ngResource"]);

ponk.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/home'); // default route

   $stateProvider.state('users.details', {
     url: '/:id',
     templateUrl: '',
     controller: 'AppCtrl'
   });

}]);

ponk.controller("AppCtrl", ["$scope", "$http", "$stateParams", "$resource", function($scope, $http, $stateParams, $resource) {
  var pk = this;
  var Board = $resource('/board/:url', {url:'url'}, {update: { method: "PUT"}});
  pk.board = Board.get({url:"abc"});

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
