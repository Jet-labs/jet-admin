const contextResolver = require('./contextResolver');
const widgetBinding = require('./widgetBinding');

module.exports = {
  ...contextResolver,
  ...widgetBinding,
};
