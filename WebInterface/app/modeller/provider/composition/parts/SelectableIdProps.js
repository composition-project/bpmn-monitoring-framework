'use strict';

var comboBox = require('./ComboEntryFactory'),
  getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
  utils = require('bpmn-js-properties-panel/lib/Utils'),
  cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper');

module.exports = function (group, element, translate) {

  // Id
  group.entries.push(comboBox({
      id: 'id',
      label: translate('Id'),
      modelProperty: 'id',
      selectOptions: [{name:'a', value:'A'},{name:'b',value:'B'}],
      get: function (element) {
        return getBusinessObject(element);
      },
      set: function (element, properties) {
  
        element = element.labelTarget || element;
  
        return cmdHelper.updateProperties(element, properties);
      },
    }
  ));

};