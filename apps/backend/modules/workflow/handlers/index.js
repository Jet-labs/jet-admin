const startHandler = require('./startHandler');
const dataQueryHandler = require('./dataQueryHandler');
const javascriptHandler = require('./javascriptHandler');
const conditionHandler = require('./conditionHandler');
const loopHandler = require('./loopHandler');
const delayHandler = require('./delayHandler');
const endHandler = require('./endHandler');
const dataCollectionHandler = require('./dataCollectionHandler');
const constants = require('../../../constants');

const handlers = {
  [constants.WORKFLOW_NODE_TYPES.START]: startHandler,
  [constants.WORKFLOW_NODE_TYPES.DATA_QUERY]: dataQueryHandler,
  [constants.WORKFLOW_NODE_TYPES.JAVASCRIPT]: javascriptHandler,
  [constants.WORKFLOW_NODE_TYPES.CONDITION]: conditionHandler,
  [constants.WORKFLOW_NODE_TYPES.LOOP]: loopHandler,
  [constants.WORKFLOW_NODE_TYPES.DELAY]: delayHandler,
  [constants.WORKFLOW_NODE_TYPES.END]: endHandler,
  [constants.WORKFLOW_NODE_TYPES.DATA_COLLECTION]: dataCollectionHandler,
};

function getHandler(nodeType) {
  const handler = handlers[nodeType];
  if (!handler) throw new Error(`No handler found for node type: ${nodeType}`);
  return handler;
}

module.exports = { handlers, getHandler };