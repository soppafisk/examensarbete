var ponk = angular.module("ponk", ["ui.router", "gridster", "restangular", "ngSanitize", "ui.bootstrap"]);

ponk.config(['$stateProvider', '$urlRouterProvider', "$locationProvider", function ($stateProvider, $urlRouterProvider, $locationProvider) {
  $locationProvider.html5Mode(true);
  $urlRouterProvider.otherwise('/');

  /* Landning page */
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

  /* State for creating a new board */
  $stateProvider.state('empty', {
    url: '/b/',
    views: {
      "": {
        templateUrl: 'views/board.html',
        controller: "AppCtrl",
        controllerAs: "pk",
        resolve: {
          board: ["boardFactory", "Restangular", function(boardFactory, Restangular) {
              var emptyBoard = {
                title: "Ny board",
                widgets: [],
              }
              var board = Restangular.restangularizeElement(null, emptyBoard, "board");
              return board;
          }]
        }
      }
    }
  });

  /* State for existing board */
  $stateProvider.state('board', {
    url: '/b/:slug',
    views: {
      "": {
        templateUrl: 'views/board.html',
        controller: "AppCtrl",
        controllerAs: "pk",
        resolve: {
          board: ["$stateParams", "boardFactory", function($stateParams, boardFactory) {
            return boardFactory.one($stateParams.slug).get().then(function(board) {
              return board;
            });
          }]
        }
      }
    }
  });
}]);

ponk.config(function(RestangularProvider) {
    RestangularProvider.setRestangularFields({
      id: "slug"
    });
});

/* settings for gridster */
ponk.run(['gridsterConfig', function(gridsterConfig) {
  gridsterConfig.columns = 30;
  gridsterConfig.width = 3000;
  gridsterConfig.rowHeight = 40;
  gridsterConfig.defaultSizeY = 8;
  gridsterConfig.defaultSizeX = 5;
  gridsterConfig.draggable.handle = ".draghandle";
  gridsterConfig.draggable.enabled = true;
  gridsterConfig.floating = false;
  gridsterConfig.pushing = false;
  gridsterConfig.margins = [0, 0];
  gridsterConfig.resizable.handles = ['s', 'e', 'se'];

}]);

/*  Landing page  */
ponk.controller("HomeCtrl", [function(){
  var hc = this;
}]);

ponk.factory("boardFactory", ["Restangular", function(Restangular) {
  return Restangular.service('board');
}]);

ponk.controller("AppCtrl", ["$scope", "boardFactory", "$state", 'gridsterConfig', "board", "$timeout", function($scope, boardFactory, $state, gridsterConfig, board, $timeout) {
  var pk = this;

  pk.board = board;

  pk.updateBackground = function() {
    if(pk.board.settings) {
      pk.boardstyle = {
        'background-color': pk.board.settings.background || "#78b087",
      }
    }
  }
  pk.updateBackground();

  /* Toggle add widget form */
  pk.showAddWidget = false;
  pk.toggleAddWidget = function () {
    pk.showAddWidget = !pk.showAddWidget;
  };

  /* is true while waiting for server when saving */
  pk.saving = false;

  /* save board. If new/no slug, post, if existing, put */
  pk.saveBoard = function() {
    pk.saving = true;
    if(pk.board.slug) {
      pk.board.put().then(function() {
        $timeout(function() {
          pk.saving = false;
        }, 1000);

      });
    } else {
      pk.board.post().then(function(newBoard) {
        pk.board = newBoard;

        $state.go("board", {slug: newBoard.slug} );
        $timeout(function() {
          pk.saving = false;
        }, 1000);
      });
    }
  };

  var extractYoutubeId = function(url) {
    var pattern = /.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    var yId = pattern.exec(url)[7];
    var idPattern = /(\w){11}/;

    if(!idPattern.test(yId)) {
      var err = new Error("Fel i valideringen");
    } else {
      return yId;
    }
  }

  var emptyWidget = {
    wType: "text",
    content: "",
    youtubeURL: "",
    imageURL: "",
  }
  /* new wigets has text preselected */
  pk.newWidget = emptyWidget;

  pk.addWidget = function() {
    if(pk.newWidget.wType === "youtube") {
      pk.newWidget.youtubeURL = extractYoutubeId(pk.newWidget.youtubeURL);
    }
    pk.board.widgets.push(pk.newWidget);
    console.log(pk.board.widgets);
    pk.newWidget = emptyWidget;
  };

  /* Editing a widget */
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

  /* pressing the save button */
  pk.editFormSave = function() {
    pk.board.widgets[pk.widgetEditIndex] = pk.widgetToEdit;
    pk.showEditWidget = false;
    $timeout(function() {
    },100);
  }

  /* delete a widget */
  pk.deleteWidget = function(widget) {
    var index = pk.board.widgets.indexOf(widget);
    if(index != -1) {
      pk.board.widgets.splice(index, 1);
    }
  };

}]);

ponk.controller("SettingsCtrl", ["$scope", function($scope) {


  var st = this;
  st.colors = [
    "#FFF",
    "#111111",
    "#78b087",
    "#3e97d6",
    "#d63e3e",
    "#d6993e",
    "#78a4b0",
    "#ba7136",
    "#4f2ad4",
  ];

}]);

/*
  Switch content in widget depending on type
*/
ponk.directive("module", function($compile) {

  /* controlbar */
  var widgetcontrols = '<div class="widgetcontrols">' +
              '<span class="glyphicon glyphicon-remove pointer" ng-click="deleteWidget(widget)"></span>' +
              '<span ng-click="editWidget($event, widget)" class="glyphicon glyphicon-pencil pointer"></span>' +
              '<span class="glyphicon glyphicon-move draghandle hand"></span>' +
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

  var imageTemplate = '<div>' + widgetcontrols + '<div class="module image"><img ng-src="{{ widget.imageURL }}" /></div></div>';

  var textTemplate = '<div>' + widgetcontrols + '<div class="module" ng-bind-html="widget.content | linky"></div></div>';

  var getTemplate = function(wType, content) {

    var template = "";
    switch(wType) {
      case "youtube":
        template = youtubeLink(content);
        break;
      case "image":
        template = imageTemplate;
        break;
      case "text":
      default:
        template = textTemplate;
        break;
    }
    return template;
  }

  var linker = function(scope, element, attrs) {
    var el = $compile(getTemplate(scope.widget.wType, scope.widget.youtubeURL))(scope);
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
