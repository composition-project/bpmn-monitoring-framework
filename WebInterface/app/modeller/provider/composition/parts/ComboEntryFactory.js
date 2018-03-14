'use strict';

var assign = require('lodash/object/assign'),
  find = require('lodash/collection/find'),
  getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
  utils = require('bpmn-js-properties-panel/lib/Utils');

var domQuery = require('min-dom/lib/query');

var selectEntryFactory = require('bpmn-js-properties-panel/lib/factory/SelectEntryFactory'),
  entryFieldDescription = require('bpmn-js-properties-panel/lib/factory/EntryFieldDescription');


/**
 * The combo box is a special implementation of the select entry and adds the option 'custom' to the
 * select box. If 'custom' is selected, an additional text input field is shown which allows to define
 * a custom value.
 *
 * @param  {Object} options
 * @param  {string} options.id
 * @param  {string} options.label
 * @param  {Array<Object>} options.selectOptions list of name/value pairs
 * @param  {string} options.modelProperty
 * @param  {function} options.get
 * @param  {function} options.set
 * @param  {string} [options.customValue] custom select option value (default: 'custom')
 * @param  {string} [options.customName] custom select option name visible in the select box (default: 'custom')
 *
 * @return {Object}
 */
var comboBox = function (options) {

  var selectOptions = options.selectOptions,
    modelProperty = options.modelProperty,
    customValue = options.customValue || 'custom',
    customName = options.customName || 'custom ' + modelProperty,
    description = options.description;

  // Helper variables    
  var _lastInvalid,
    _lastInvalidValues,
    _lastInvalidReason;

  // check if a value is not a built in value
  var isCustomValue = function (value) {
    if (typeof value[modelProperty] === 'undefined') {
      return false;
    }

    var isCustom = !find(selectOptions, function (option) {
      return value[modelProperty] === option.value;
    });

    return isCustom;
  };

  var comboOptions = assign({}, options);

  // true if the selected value in the select box is customValue
  comboOptions.showCustomInput = function (element, node) {
    var selectBox = domQuery('[data-entry="' + options.id + '"] select', node.parentNode);

    if (selectBox) {
      return selectBox.value === customValue;
    }

    return false;
  };

  comboOptions.get = function (element, node) {
    var value;

    if (_lastInvalid) {
      value = _lastInvalidValues;
      node.querySelector("#camunda-" + options.id + "-select").style['border-color'] = '#cc3333';
      node.querySelector("#camunda-" + options.id + "-select").style['background'] = '#f0c2c2';
      node.querySelector("#camunda-" + options.id + "-input").classList.add("invalid");
      node.querySelector("#invalid-reason").style.display = "block";
      node.querySelector("#invalid-reason").innerHTML = _lastInvalidReason;
    }
    else {
      value = options.get(element, node);
      node.querySelector("#camunda-" + options.id + "-select").style['border-color'] = '';
      node.querySelector("#camunda-" + options.id + "-select").style['background'] = '';
      node.querySelector("#camunda-" + options.id + "-input").classList.remove("invalid");
      node.querySelector("#invalid-reason").style.display = "none";
    }

    var modifiedValues = {};

    if (!isCustomValue(value)) {
      modifiedValues[modelProperty] = value[modelProperty] || '';
      return modifiedValues;
    }

    // The element with a name the same as the key will be updated with the value
    // For example, an element with the name "id" will be updated with customValue
    modifiedValues[modelProperty] = customValue;
    modifiedValues['custom-' + modelProperty] = value[modelProperty];

    return modifiedValues;
  };

  comboOptions.set = function (element, values, node) {
    var modifiedValues = {};

    // if the custom select option has been selected
    // take the value from the text input field
    if (values[modelProperty] === customValue) {
      modifiedValues[modelProperty] = values['custom-' + modelProperty] || '';
    }
    else if (options.emptyParameter && values[modelProperty] === '') {
      modifiedValues[modelProperty] = undefined;
    }
    else {
      modifiedValues[modelProperty] = values[modelProperty];
    }

    // Added modification from Junhong
    var bo = getBusinessObject(element);
    var idError = utils.isIdValid(bo, modifiedValues[modelProperty]);
    if (idError) {
      _lastInvalid = true;
      _lastInvalidValues = modifiedValues;
      _lastInvalidReason = idError;
      return options.set(element, {}, node);
    }
    _lastInvalid = false;
    return options.set(element, modifiedValues, node);
  };

  comboOptions.selectOptions.push({ name: customName, value: customValue });

  var comboBoxEntry = assign({}, selectEntryFactory(comboOptions, comboOptions));

  comboBoxEntry.html += '<div class="bpp-field-wrapper bpp-combo-input" ' +
    'data-show="showCustomInput"' +
    '>' +
    '<input id="camunda-' + options.id + '-input" type="text" name="custom-' + modelProperty + '" ' +
    ' />' +
    '</div>';

  comboBoxEntry.html += '<div id="invalid-reason" class="bpp-error-message">' +
    '</div>';


  // add description below combo box entry field
  if (description) {
    comboBoxEntry.html += entryFieldDescription(description);
  }

  return comboBoxEntry;
};

module.exports = comboBox;
