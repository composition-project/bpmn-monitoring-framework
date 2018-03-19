'use strict';

var fs = require('fs');

var $ = require('jquery'),
  BpmnModeler = require('bpmn-js/lib/Modeler');

var propertiesPanelModule = require('bpmn-js-properties-panel'),
  propertiesProviderModule = require('./provider/composition');

// Import Angular
var angular = require('angular');

var container = $('#container');
var canvas = $('#js-canvas');

// If the application is to be tested standalone, set this to true;
// If the application is to be run with the back end, set this to false;
var isStandalone = false;

// Configure Angular controller
var module = angular.module('bpmnModellerApp', []);
module.controller('BpmnModellerController', ['$scope', '$http', '$compile', function BpmnViewerController($scope, $http, $compile) {

  $scope.screen = {
    isVisible: true,
    type: 'main'
  };

  $scope.dialog = {
    isVisible: false,
    type: 'msg',
    msgContent: '',
    listContent: [],
    dfmUploadId: ''
  }

  $scope.bpmnModeler = new BpmnModeler({
    container: canvas,
    propertiesPanel: {
      parent: '#js-properties-panel'
    },
    additionalModules: [
      propertiesPanelModule,
      propertiesProviderModule
    ]
  });

  /* $scope.bpmnModeler.on('commandStack.changed', function () {
    $scope.$digest();
  }); */

  // Load uploaded BPMN from the monitoring framework
  $scope.loadUploadedDiagram = function () {
    $scope.showLoadingScreen();

    if (!isStandalone) {
      // Use ajax to get BPMN
      $http.get('/rest/bpmn/local')
        .then(function (response) { // Handle success
          // Get BPMN model
          if (response.data == '') {
            $scope.showMsgDialog('No BPMN model has been uploaded to the monitoring framework yet. ');
          } else {
            $scope.openDiagram(response.data);
          }
        }, function (response) { // Handle error
          // Temporary solution for standalone testing
          $scope.showMsgDialog('Error while loading local BPMN');
        });
    } else {
      // Load a static resource for standalone test
      $scope.openDiagram(fs.readFileSync(__dirname + '/resources/BSL_demo_new.bpmn', 'utf-8'));
      $scope.openDiagram(response.data);
    }

  }

  // Load remote BPMN list from DFM
  $scope.loadDFMDiagramList = function () {
    $scope.showLoadingScreen();

    if (!isStandalone) {
      // Use ajax to get BPMN
      $http.get('/rest/bpmn/remote')
        .then(function (response) { // Handle success
          // parse the response, and list all available ones in the dialog content
          $scope.showDFMListDialog(response.data);

        }, function (response) { // Handle error
          $scope.showMsgDialog('Error getting model list from DFM ');
        });
    } else {
      // Show a dummy list
      $scope.showDFMListDialog([{ name: 'model_1' }, { name: 'model_2' }]);
    }

  }

  // Load remote BPMN model from DFM, specified by ID
  $scope.loadRemoteDiagram = function (id) {
    $scope.showLoadingScreen();

    // Use ajax to get BPMN
    $http.get('/rest/bpmn/remote/' + id)
      .then(function (response) { // Handle success
        // show the diagram
        $scope.openDiagram(response.data);
      }, function (response) { // Handle error
        $scope.showMsgDialog('Error getting model with ID ' + id + ' from DFM');
      });
  }

  // Load BPMN model from hard drive
  $scope.loadHardDriveDiagram = function (e) {
    if (e.files.length == 0)
      return;

    var file = e.files[0];
    var reader = new FileReader();

    reader.onload = function (e) {

      var xml = e.target.result;
      $scope.openDiagram(xml);
    };

    reader.readAsText(file);
  }

  // Create new diagram
  $scope.createNewDiagram = function () {
    var newDiagramXML = fs.readFileSync(__dirname + '/resources/newDiagram.bpmn', 'utf-8');
    $scope.openDiagram(newDiagramXML);
  }

  // Import model in the bpmnModeler
  $scope.openDiagram = function (xml) {

    $scope.bpmnModeler.importXML(xml, function (err) {

      if (err) {
        $scope.showMsgDialog('Error while trying to display BPMN: ' + err.message);
        console.error(err);
      } else {
        $scope.closeScreen();
        $scope.closeDialog();
      }
      $scope.$digest();

    });
  }

  // Upload the edited model to the monitoring framework
  $scope.uploadDiagram = function () {
    $scope.bpmnModeler.saveXML({ format: true }, function (err, xml) {
      // Use ajax to upload BPMN
      $.post("/rest/bpmn/local", xml)
        .done(function () {
          $scope.showUploadSuccessDialog();
          $scope.$digest();
        })
        .fail(function () {
          alert("BPMN post failed!");
        });
    });
  };

  // Upload the edited model to DFM
  $scope.uploadDiagramToDFM = function () {
    $scope.bpmnModeler.saveXML({ format: true }, function (err, xml) {
      // Use ajax to upload BPMN
      $.post("/rest/bpmn/remote", xml)
        .done(function () {
          alert("BPMN post to DFM successful!");
        })
        .fail(function () {
          alert("BPMN post to DFM failed!");
        });
    });
  }

  // Download model as bpmn file to hard drive
  $scope.downloadBpmn = function () {
    $scope.bpmnModeler.saveXML({ format: true }, function (err, xml) {
      var element = document.createElement('a');
      element.setAttribute('href', 'data:application/bpmn20-xml;charset=UTF-8,' + encodeURIComponent(xml));
      element.setAttribute('download', 'diagram.xml');

      element.style.display = 'none';
      document.body.appendChild(element);

      element.click();
      document.body.removeChild(element);
    });
  };

  // Download model as svg file to hard drive
  $scope.downloadSvg = function () {
    $scope.bpmnModeler.saveSVG(function (err, svg) {
      var element = document.createElement('a');
      element.setAttribute('href', 'data:application/bpmn20-xml;charset=UTF-8,' + encodeURIComponent(svg));
      element.setAttribute('download', 'diagram.svg');

      element.style.display = 'none';
      document.body.appendChild(element);

      element.click();

      document.body.removeChild(element);
    });
  };

  // Show the main menu
  $scope.showMainScreen = function () {
    $scope.screen.isVisible = true;
    $scope.screen.type = 'main';
  }

  // Show the loading screen
  $scope.showLoadingScreen = function () {
    $scope.screen.isVisible = true;
    $scope.screen.type = 'loading';
  }

  // Hide all visible screens
  $scope.closeScreen = function () {
    $scope.screen.isVisible = false;
  }

  // Show the message dialog
  $scope.showMsgDialog = function (msg) {
    $scope.dialog.isVisible = true;
    $scope.dialog.type = 'msg';
    $scope.dialog.msgContent = msg;
  }

  // Show the DFM list dialog
  $scope.showDFMListDialog = function (list) {
    $scope.dialog.isVisible = true;
    $scope.dialog.type = 'dfm_list';
    $scope.dialog.listContent = list;
  }

  // Show the upload to DFM dialog
  $scope.showUploadSuccessDialog = function () {
    $scope.dialog.isVisible = true;
    $scope.dialog.type = 'upload_success';
  }

  // Show the upload to DFM dialog
  $scope.showUploadToDFMDialog = function () {
    $scope.dialog.isVisible = true;
    $scope.dialog.type = 'dfm_upload';
    $scope.dialog.dfmUploadId = '';
  }

  // Hide all visible dialogs
  $scope.closeDialog = function () {
    $scope.dialog.isVisible = false;
  }


}]);



