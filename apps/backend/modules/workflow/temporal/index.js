/**
 * Temporal Module Barrel
 * Re-exports client, worker, service for convenience.
 */
module.exports = {
  config: require('./config'),
  client: require('./client'),
  worker: require('./worker'),
  service: require('./service'),
  activities: require('./activities'),
};
