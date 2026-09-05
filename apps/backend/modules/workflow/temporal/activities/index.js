/**
 * Temporal Activities barrel — re-exports focused modules.
 * Worker does `require('./activities')` and passes the whole map as activities.
 * Keep this file free of logic; implementations live in sibling files.
 */
module.exports = {
  ...require('./executeNode'),
  ...require('./emitProgress'),
  ...require('./emitCompleted'),
  ...require('./dataCollection'),
};
