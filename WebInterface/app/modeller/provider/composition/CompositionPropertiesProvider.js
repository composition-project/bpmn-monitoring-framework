'use strict';

var inherits = require('inherits');

var PropertiesActivator = require('bpmn-js-properties-panel/lib/PropertiesActivator');

var is = require('bpmn-js/lib/util/ModelUtil').is;

// bpmn properties
var eventProps = require('bpmn-js-properties-panel/lib/provider/bpmn/parts/EventProps'),
  linkProps = require('bpmn-js-properties-panel/lib/provider/bpmn/parts/LinkProps'),
  documentationProps = require('bpmn-js-properties-panel/lib/provider/bpmn/parts/DocumentationProps'),
  idProps = require('bpmn-js-properties-panel/lib/provider/bpmn/parts/IdProps'),
  nameProps = require('bpmn-js-properties-panel/lib/provider/bpmn/parts/NameProps');

// My custom id property, allow user to choose from a list of already available ID
// Uncomment to use
// var idProps = require('./parts/selectableIdProps');

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;


function createGeneralTabGroups(element, bpmnFactory, elementRegistry, translate) {


  var generalGroup = {
    id: 'general',
    label: translate('General'),
    entries: []
  };
  idProps(generalGroup, element, translate);
  nameProps(generalGroup, element, translate);

  var detailsGroup = {
    id: 'details',
    label: translate('Details'),
    entries: []
  };
  linkProps(detailsGroup, element, translate);
  eventProps(detailsGroup, element, bpmnFactory, elementRegistry, translate);

  var documentationGroup = {
    id: 'documentation',
    label: translate('Documentation'),
    entries: []
  };

  documentationProps(documentationGroup, element, bpmnFactory, translate);

  return [
    generalGroup,
    detailsGroup,
    documentationGroup
  ];

}



// COMPOSITION Properties Provider /////////////////////////////////////

/**
 * A properties provider for COMPOSITION related properties.
 *
 * @param {EventBus} eventBus
 * @param {BpmnFactory} bpmnFactory
 * @param {ElementRegistry} elementRegistry
 */
function CompositionPropertiesProvider(eventBus, bpmnFactory, elementRegistry, translate) {

  PropertiesActivator.call(this, eventBus);

  this.getTabs = function (element) {

    var generalTab = {
      id: 'general',
      label: translate('General'),
      groups: createGeneralTabGroups(
        element, bpmnFactory,
        elementRegistry, translate)
    };

    return [
      generalTab
    ];
  };

}

CompositionPropertiesProvider.$inject = [
  'eventBus',
  'bpmnFactory',
  'elementRegistry',
  'translate'
];

inherits(CompositionPropertiesProvider, PropertiesActivator);

module.exports = CompositionPropertiesProvider;
