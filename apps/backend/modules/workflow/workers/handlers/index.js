/**
 * Node Handlers Index
 * Registry of all node type handlers
 */
const startHandler = require('./startHandler');
const dataQueryHandler = require('./dataQueryHandler');
const javascriptHandler = require('./javascriptHandler');
const conditionHandler = require('./conditionHandler');
const loopHandler = require('./loopHandler');
const delayHandler = require('./delayHandler');
const endHandler = require('./endHandler');

const handlers = {
  start: startHandler,
  dataQuery: dataQueryHandler,
  javascript: javascriptHandler,
  condition: conditionHandler,
  loop: loopHandler,
  delay: delayHandler,
  end: endHandler,
};

/**
 * Get handler for a node type
 * @param {string} nodeType 
 * @returns {Object} Handler with execute function
 */
function getHandler(nodeType) {
  const handler = handlers[nodeType];
  if (!handler) {
    throw new Error(`No handler found for node type: ${nodeType}`);
  }
  return handler;
}

module.exports = {
  handlers,
  getHandler,
};
