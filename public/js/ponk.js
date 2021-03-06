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

  $stateProvider.state('404', {
    url: '/404',
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
                title: "Ny ponk",
                settings: {
                  background: "#5bc0eb",
                },
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
          board: ["$stateParams", "boardFactory", "Restangular", function($stateParams, boardFactory, Restangular) {
            return boardFactory.one($stateParams.slug).get().then(function(board) {
              return board;
            }, function(err) {
              var emptyBoard = {
                title: "Ny ponk",
                settings: {
                  background: "#5bc0eb",
                },
                widgets: [],
              }
              var board = Restangular.restangularizeElement(null, emptyBoard, "board");
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
  gridsterConfig.width = 'auto';
  gridsterConfig.rowHeight = 'match';
  gridsterConfig.defaultSizeY = 5;
  gridsterConfig.defaultSizeX = 9;
  gridsterConfig.draggable.handle = ".draghandle";
  gridsterConfig.draggable.enabled = true;
  gridsterConfig.floating = false;
  gridsterConfig.pushing = false;
  gridsterConfig.outerMargin = false;
  gridsterConfig.margins = [15, 15];
  gridsterConfig.resizable.handles = ['s', 'e', 'se'];
  gridsterConfig.minSizeY = 2;
  gridsterConfig.minSizeX = 2;

}]);

ponk.run( function ($http, $state, $rootScope) {
    $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
        $state.get('error').error = error;
        return $state.go('error');
    });
});

/*  Landing page  */
ponk.controller("HomeCtrl", [function(){
  var hc = this;
}]);

ponk.factory("boardFactory", ["Restangular", function(Restangular) {
  return Restangular.service('board');
}]);

ponk.controller("AppCtrl", ["$scope", "boardFactory", "$state", 'gridsterConfig', "board", "$timeout", "$uibModal", function($scope, boardFactory, $state, gridsterConfig, board, $timeout, $uibModal) {
  var pk = this;

  pk.board = board;

  pk.updateBackground = function() {
    if(pk.board.settings) {
      pk.boardstyle = {
        'background-color': pk.board.settings.background || "#5bc0eb",
      }
    }
  }
  pk.updateBackground();

  pk.editTitle = function(title) {
    var old = title;
    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'editTitle.html',
      scope: $scope
    });

    modalInstance.result.then(function (title) {
      pk.isSaved = false;
    }, function () {
      pk.board.title = old;
    });

    pk.titleOk = function () {
      modalInstance.close(title);
      pk.isSaved = false;
    };

    pk.titleCancel = function () {
      modalInstance.dismiss('cancel');
    };
  };

  /* Toggle add widget form */
  pk.showAddWidget = false;
  pk.toggleAddWidget = function () {
    pk.showAddWidget = !pk.showAddWidget;
  };

  /* */
  pk.alerts = [];
  pk.closeAlert = function(index) {
    pk.alerts.splice(index, 1);
  };

  /* is true while waiting for server when saving */
  pk.saving = false;
  /* false if widgets are changed */
  pk.isSaved = true;

  /* save board. If new/no slug, post, if existing, put */
  pk.saveBoard = function() {
    pk.saving = true;
    if(pk.board.slug) {
      pk.board.put().then(function() {
        $timeout(function() {
          pk.saving = false;
          pk.isSaved = true;
        }, 700);

      }, function(err){
        pk.alerts.push({ type: 'danger', msg: err.data.message });
        pk.saving = false;
        pk.isSaved = false;
      });
    } else {
      pk.board.post().then(function(newBoard) {
        pk.board = newBoard;

        $state.go("board", {slug: newBoard.slug} );
        $timeout(function() {
          pk.isSaved = true;
          pk.saving = false;
        }, 700);
      }, function(err) {
        pk.alerts.push({ type: 'danger', msg: err.data.message });
        pk.saving = false;
        pk.isSaved = false;
      });
    }
  };

  var extractYoutubeId = function(url) {
    /*pattern for complete URL */
    var pattern = /.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    var matches = pattern.exec(url);

    var yId;
    if (matches !== null && matches[7]) {
      yId = matches[7];
    } else {
      yId = url;
    }

    /* pattern for youtube ID */
    var idPattern = /([\w-_]){11}/;

    if(!idPattern.test(yId)) {
      if(idPattern.test(url)) {
        return url;
      }
      var err = new Error("Fel i valideringen");
    } else {
      return yId;
    }
  }

  var emptyWidget = {
    wType: "text",
    content: null,
    youtubeURL: null,
    imageURL: null,
  }
  /* new wigets has text preselected */
  pk.newWidget = angular.copy(emptyWidget);

  pk.addWidget = function() {
    if(pk.newWidget.wType === "youtube") {
      pk.newWidget.youtubeURL = extractYoutubeId(pk.newWidget.youtubeURL);
    }
    pk.board.widgets.push(pk.newWidget);
    pk.newWidget = angular.copy(emptyWidget);
    pk.isSaved = false;
  };

  pk.editWidget = function(widget) {
    var index = pk.board.widgets.indexOf(widget);
    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'editWidgetContent.html',
      controller: 'EditCtrl',
      resolve: {
        widget: function () {
          return angular.copy(pk.board.widgets[index]);
        }
      }
    });

    modalInstance.result.then(function (editedWidget) {
      pk.board.widgets[index] = editedWidget;
      pk.isSaved = false;
    }, function () {

    });
  };

  /* delete a widget */
  pk.deleteWidget = function(widget) {
    var index = pk.board.widgets.indexOf(widget);
    if(index != -1) {
      pk.board.widgets.splice(index, 1);
      pk.isSaved = false;
    }
  };

}]);


/* controller for edit widget modal window */
ponk.controller("EditCtrl", ["$scope", "$uibModalInstance", "widget", function($scope, $uibModalInstance, widget) {

  $scope.widget = widget;

  $scope.ok = function () {
    $uibModalInstance.close($scope.widget);
    pk.isSaved = false;
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
}]);

ponk.controller("SettingsCtrl", ["$scope", function($scope) {

  var st = this;
  st.colors = [
    "#FFF",
    "#222",
    "#aaa",
    "#5bc0eb",
    "#fde74c",
    "#9bc53d",
    "#e55934",
    "#fa7921",
    "#1D3557",
    "#E63946",
  ];

}]);

/*
  Switch content in widget depending on type
*/
ponk.directive("module", function($compile) {

  /* controlbar */
  var widgetcontrols = '<div class="widgetcontrols">' +
              '<span class="glyphicon glyphicon-remove pointer" ng-click="deleteWidget(widget)"></span>' +
              '<span ng-click="editWidget(widget)" class="glyphicon glyphicon-pencil pointer"></span>' +
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

    scope.editWidget = function(w) {
      scope.editFn({widget:w});
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
