const { kafkaQueryRunnerJobResultsCache } = require("../../config/kafka.config");

const kafkaService = {};

kafkaService.getDatabaseQueryRunnerJobResult = async (databaseQueryRunnerJobID) => {
  if (kafkaQueryRunnerJobResultsCache.has(databaseQueryRunnerJobID))
    return kafkaQueryRunnerJobResultsCache.get(databaseQueryRunnerJobID);
  return null;
};

module.exports = {kafkaService};