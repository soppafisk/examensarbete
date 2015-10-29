var ponk = angular.module("ponk", ["ui.router", "ngResource", "gridster"]);

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


// settings for gridster
ponk.run(['gridsterConfig', function(gridsterConfig) {
  gridsterConfig.columns = 30;
  gridsterConfig.width = 3000;
  gridsterConfig.rowHeight = 40;
  gridsterConfig.defaultSizeY = 8;
  gridsterConfig.defaultSizeX = 5;
  gridsterConfig.floating = false;
  gridsterConfig.pushing = false;
  gridsterConfig.margins = [20, 20];
  gridsterConfig.resizable.handles = ['s', 'e', 'se'];
  gridsterConfig.draggable.handle = ".draghandle";
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

  // is true while waiting for server when saving
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

  // Editing a widget
  pk.widgetToEdit;
  pk.widgetEditIndex;
  pk.showEditWidget = false;
  pk.editWidget = function($event, widget) {
    pk.showEditWidget = !pk.showEditWidget;
    if (pk.showEditWidget) {
      $('#edit-form').css("top", $event.pageY-30);
      $('#edit-form').css("left", $event.pageX-10);
      var index = pk.board.widgets.indexOf(widget);
      pk.widgetEditIndex = index;
      pk.widgetToEdit = angular.copy(widget);
    }
  }

  pk.editFormAbort = function() {
    pk.showEditWidget = !pk.showEditWidget;
  }

  // pressing the save button
  pk.editFormSave = function() {
    pk.board.widgets[pk.widgetEditIndex] = pk.widgetToEdit;
    pk.showEditWidget = false;
  }

  // delete a widget
  pk.deleteWidget = function(widget) {
    var index = pk.board.widgets.indexOf(widget);
    if(index != -1) {
      pk.board.widgets.splice(index, 1);
    }
  };

}]);

ponk.directive("module", function($compile) {

  var widgetcontrols = '<div class="widgetcontrols">' +
              '<span class="glyphicon glyphicon-remove-circle pointer" ng-click="deleteWidget(widget)"></span>' +
              '<span ng-click="editWidget($event, widget)" class="glyphicon glyphicon-pencil pointer"></span>' +
              '<span class="glyphicon glyphicon-resize-horizontal draghandle pointer"></span>' +
              '</div>';

  var youtubeLink = function(content) {
    var youtubesrc = 'src="http://www.youtube.com/embed/'+ content +'?autoplay=0"';
    var youtubeTemplate = '<div>' + widgetcontrols + '<div class="module youtube ">' +
                      '<div class="embed-responsive embed-responsive-16by9">' +
                      '<iframe class="embed-responsive-item" type="text/html" ' + youtubesrc + ' allowfullscreen />' +
                      '</div></div>' +
                      '</div>';
    return youtubeTemplate;
  }


  var textTemplate = '<div>' + widgetcontrols + '<div class="module">{{ widget.content }}</div></div>';

  var getTemplate = function(wType, content) {

    var template = "";
    switch(wType) {
      case "youtube":
        template = youtubeLink(content);
        break;
      case "text":
      default:
        template = textTemplate;
        break;
    }
    return template;
  }

  var linker = function(scope, element, attrs) {
    var el = $compile(getTemplate(scope.widget.wType, scope.widget.content))(scope);
    element.replaceWith(el);

    scope.editWidget = function($event, w) {
      scope.editFn({$event: $event, widget:w});
    }

    scope.deleteWidget = function(w){
      scope.removeFn({widget:w});
    }
  }

  return {
    scope: {widget: '=', removeFn:'&', editFn: "&"},
    transclude: 'true',
    restrict: 'E',
    link: linker,
  }
});
