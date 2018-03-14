module.exports = {
  __depends__: [
    require('diagram-js/lib/i18n/translate')
  ],
  __init__: [ 'propertiesProvider' ],
  propertiesProvider: [ 'type', require('./CompositionPropertiesProvider') ]
};
