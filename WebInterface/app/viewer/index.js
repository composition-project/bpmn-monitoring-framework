'use strict';

var fs = require('fs');
var diagram = fs.readFileSync(__dirname + '/resources/BSL_demo_new.bpmn', 'utf-8');

var $ = require('jquery');

// Import Angular
var angular = require('angular');

var BpmnViewer = require('bpmn-js/lib/NavigatedViewer');
var util = require('bpmn-js/lib/util/ModelUtil');
var parser = require('./Parser');

// If the application is to be tested in standalone mode, set this to true;
// If the application runs with the back end, set this to false.
var isStandalone = false;

// Configure Angular controller
var module = angular.module('bpmnViewerApp', [require('angular-sanitize')]);
module.controller('BpmnViewerController', ['$scope', '$http', '$compile', function BpmnViewerController($scope, $http, $compile) {
  $scope.config = {
    showColor: true,
    showHeader: true,
    showBody: true,
    showFooter: true,
    pollInterval: 1000
  }

  $scope.message = {
    isVisible: true,
    msgType: 'loading'
  }

  $scope.canvas = {
    isSidePanelVisible: false,
    sidePanelContent: '',
    isSettingPanelVisible: false
  }

  // Variable to hold temporary configuration before saving
  $scope.tempConfig = angular.copy($scope.config);

  $scope.status = {
    showMessage: 'loading',
    showPanelInfo: '',
    isPolling: false
  }

  // Variable to store the status of all machines
  $scope.machines;

  $scope.updateTime = "--";

  // The poller object for polling periodically
  $scope.poller;

  $scope.bpmnViewer = new BpmnViewer({
    container: '#canvas'
  });

  // Initialize BPMN viewer (invoked after using ajax to get model)
  $scope.initializeViewer = function (model) {
    $scope.bpmnViewer.importXML(model, function (err) {
      if (err) {
        $scope.message.isVisible = true;
        $scope.message.msgType = 'error';
        return console.error('could not import BPMN 2.0 diagram', err);
      }

      var canvas = $scope.bpmnViewer.get('canvas'),
        overlays = $scope.bpmnViewer.get('overlays');

      // zoom to fit full viewport
      canvas.zoom('fit-viewport');

      var elementRegistry = $scope.bpmnViewer.get('elementRegistry');

      // Setup default overlays on task elements
      var elements = elementRegistry.filter(function (element) {
        return util.is(element, 'bpmn:ServiceTask');
      });


      elements.forEach(function (e) {
        var shape = elementRegistry.get(e.id);

        // Add overlay for header
        var $overlayHtml = $('<div class="diagram-note" ng-bind="machines.' + e.id + '.header" ng-show="config.showHeader"></div>')
          .css({
            width: shape.width,
            height: 20
          });
        // Need to use compile to register this element to the scope, otherwise Angular is not aware of this element
        var temp = $compile($overlayHtml.prop('outerHTML'))($scope);
        overlays.add(e.id, 'note', {
          position: {
            top: -20,
            left: 0
          },
          scale: true,
          html: $(temp)
        });

        // Add overlay for body
        var $overlayHtml = $('<div class="diagram-note" ng-bind="machines.' + e.id + '.footer" ng-show="config.showFooter"></div>')
          .css({
            width: 200
          });
        // Need to use compile to register this element to the scope, otherwise Angular is not aware of this element
        var temp = $compile($overlayHtml.prop('outerHTML'))($scope);
        overlays.add(e.id, 'note', {
          position: {
            bottom: 0,
            left: -100 + shape.width / 2,
          },
          show: {
            minZoom: 0.7
          },
          html: $(temp)
        });

        // Add overlay showing items
        var $overlayHtml = $('<div><span ng-bind="machines.' + e.id + '.body" ng-show="config.showBody"></div>');
        var temp = $compile($overlayHtml.prop('outerHTML'))($scope);
        overlays.add(e.id, 'note', {
          position: {
            top: 0,
            left: 0
          },
          show: {
            minZoom: 0.7
          },
          html: $(temp)
        });

        // Add a block in side panel
        var temp = $compile('<div ng-show="canvas.sidePanelContent==\'' + e.id + '\'">' +
          '<h3>' + e.businessObject.name + '</h3>' +
          '<div ng-bind-html="machines.' + e.id + '.panel"></div>' +
          '<p>' + e.businessObject.documentation[0].text + '</p>' +
          '</div>')($scope);
        angular.element(document.getElementById('panel-group')).append(temp);
      });

      // Manually call $digest() to update the newly added elements
      $scope.$digest();

      $scope.startPolling();

      // Add event listener to bpmn task
      var eventBus = $scope.bpmnViewer.get('eventBus');
      var events = [
        'element.click'
      ];

      events.forEach(function (event) {
        if (event == 'element.click') {
          eventBus.on(event, function (e) {
            // e.element = the model element
            // e.gfx = the graphical element
            if (e.element.type == 'bpmn:ServiceTask') {
              // Have to use $apply to register this event in Angular
              $scope.$apply(function () {
                $scope.showSidePanel();
                $scope.canvas.sidePanelContent = e.element.id;
              });
            }
          });
        }
      });

    });
  };

  // Start polling machine status periodically
  $scope.startPolling = function () {
    var poller = setInterval(function () {
      if (!isStandalone) {
        // Use ajax to get machine status
        $http.get('/rest/machine_status').
          then(function (response) { // Handle success
            var res = parser.parse(response);
            $scope.machines = res['machines'];
            $scope.updateTime = res['time']; 
            $scope.updateElementAppearance();
          }, function (response) { // Handle error
            // Handle error
            // Temporary solution for standalone testing
          });
      } else {
        $scope.machines = $scope.generateDummyData()['machines'];
        $scope.updateElementAppearance();
        $scope.$digest();
      }

    }, $scope.config.pollInterval);
    $scope.status.isPolling = true;
    $scope.poller = poller;
  }

  // Stop polling
  $scope.stopPolling = function () {
    clearInterval($scope.poller);
    $scope.status.isPolling = false;
    console.log('Polling stopped');
  }

  // Show side panel
  $scope.showSidePanel = function () {
    $scope.canvas.isSidePanelVisible = true;
    $scope.canvas.isSettingPanelVisible = false;
  }

  // Hide side panel
  $scope.hideSidePanel = function () {
    $scope.canvas.isSidePanelVisible = false;
  }

  // Show setting panel
  $scope.showSettingPanel = function () {
    $scope.tempConfig = angular.copy($scope.config);
    $scope.canvas.isSettingPanelVisible = true;
    $scope.canvas.isSidePanelVisible = false;
  }

  // Hide setting panel
  $scope.hideSettingPanel = function () {
    $scope.canvas.isSettingPanelVisible = false;
  }

  // Save configuration from the setting panel
  $scope.saveConfig = function () {
    $scope.config = angular.copy($scope.tempConfig);
    if ($scope.status.isPolling) {
      $scope.stopPolling();
      $scope.startPolling();
    }
  }

  // Util function for updating visual appearance of elements (called after getting data from the backend)
  $scope.updateElementAppearance = function () {
    var canvas = $scope.bpmnViewer.get('canvas');
    var elementRegistry = $scope.bpmnViewer.get('elementRegistry');
    for (var id in $scope.machines) {
      if (elementRegistry.get(id) != undefined) {
        canvas.removeMarker(id, 'red');
        canvas.removeMarker(id, 'green');
        canvas.removeMarker(id, 'yellow');
        canvas.addMarker(id, $scope.machines[id]['color']);
      }
    }
  }

  // Only used for standalone mode to generate dummy data
  $scope.generateDummyData = function () {
    var dummy = {};
    var targetNumber = 1000;
    

    dummy['machines'] = {};
    for (var i = 1; i < 8; i++) {
      var id = 'machine_' + i;
      dummy['machines'][id] = {};

      var colorRng = Math.random();
      if (colorRng < 0.85) {
        dummy['machines'][id]['color'] = 'green';
      } else if (colorRng < 0.93) {
        dummy['machines'][id]['color'] = 'yellow';
      } else {
        dummy['machines'][id]['color'] = 'red';
      }
      
      var processedNumber = Math.floor(Math.random() * 10);  
      dummy['machines'][id]['header'] = processedNumber + '/' + targetNumber;
      dummy['machines'][id]['footer'] = '';
      dummy['machines'][id]['panel'] = '<p>ID: ' + id + '</p>' +
        '<p>Currently processed amount: ' + processedNumber + '</p>' +
        '<p>Target amount: ' + targetNumber + '</p>';
      dummy['machines'][id]['body'] = '';

    }
    return dummy;
  }

  // Bootstraping the bpmnViewer
  if (!isStandalone) {   // Get model using ajax
    $http.get('/rest/bpmn/local')
      .then(function (response) { // Handle success
        // Get BPMN model
        if (response.data == '') {
          $scope.message.isVisible = true;
          $scope.message.msgType = 'empty';
        } else {
          $scope.message.isVisible = false;
          var model = response.data;
          $scope.initializeViewer(model);
        }

      }, function (response) { // Handle error
        $scope.message.isVisible = true;
        $scope.message.msgType = 'error';
      });
  }
  else { // Temporary solution for standalone testing   
    $scope.message.isVisible = false;
    $scope.initializeViewer(diagram);
  }


}]);





