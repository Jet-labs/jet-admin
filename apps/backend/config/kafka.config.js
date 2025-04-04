const { Kafka } = require("kafkajs");
const constants = require("../constants");
const Logger = require("../utils/logger");


const kafkaDatabaseQueryJobPoster = new Kafka({
  clientId: constants.KAFKA_CLIENT_IDS.DATABASE_QUERY_RUNNER_JOB_POSTER,
  brokers: ["127.0.0.1:9092"],
});

const kafkaDatabaseQueryJobPosterProducer = kafkaDatabaseQueryJobPoster.producer();

const kafkaQueryRunnerJobResultConsumer = new Kafka({
  clientId:
    constants.KAFKA_CLIENT_IDS.DATABASE_QUERY_RUNNER_JOB_RESULT_CONSUMER,
  brokers: ["127.0.0.1:9092"],
});

const kafkaQueryRunnerJobResultConsumerInstance =
  kafkaQueryRunnerJobResultConsumer.consumer({
    groupId:
      constants.KAFKA_GROUP_IDS.DATABASE_QUERY_RUNNER_JOB_RESULT_CONSUMER_GROUP,
  });

const kafkaQueryRunnerJobResultsCache = new Map();

const initDatabaseQueryRunnerJobResultConsumer = async () => {
  await kafkaQueryRunnerJobResultConsumerInstance.connect();
  Logger.log("info", {
    message: "kafka:initDatabaseQueryRunnerJobResultConsumer:connecting",
  });
  await kafkaQueryRunnerJobResultConsumerInstance.subscribe({
    topic: constants.KAFKA_TOPIC_NAMES.DATABASE_QUERY_RUNNER_JOB_RESULTS,
  });
  Logger.log("success", {
    message: "kafka:initDatabaseQueryRunnerJobResultConsumer:subscribed",params:{topic:constants.KAFKA_TOPIC_NAMES.DATABASE_QUERY_RUNNER_JOB_RESULTS}
  });

  await kafkaQueryRunnerJobResultConsumerInstance.run({
    eachMessage: async ({ message }) => {
      const databaseQueryRunnerJobID = message.key.toString();
      const result = message.value.toString();
      Logger.log("info", {
        message:
          "kafka:eachMessage:databaseQueryRunnerJobResultConsumer:message received:eachMessage",
        params: { databaseQueryRunnerJobID, result },
      });
      kafkaQueryRunnerJobResultsCache.set(
        databaseQueryRunnerJobID,
        JSON.parse(result)
      );
      Logger.log("success", {
        message: "kafka:eachMessage:databaseQueryRunnerJobResultConsumer:cached",
        params: { databaseQueryRunnerJobID },
      });
    },
  });
};


const connectDatabaseQueryRunnerJobProducer = async () => {
  Logger.log("info", {
    message: "kafka:connectDatabaseQueryRunnerJobProducer:connecting",
  });
  await kafkaDatabaseQueryJobPosterProducer.connect();
};

const disconnectDatabaseQueryRunnerJobProducer = async () => {
  Logger.log("info", {
    message: "kafka:disconnectDatabaseQueryRunnerJobProducer:disconnecting",
  });
  await kafkaDatabaseQueryJobPosterProducer.disconnect();
};

module.exports = {
  kafkaQueryRunnerJobResultConsumer,
  kafkaQueryRunnerJobResultsCache,
  kafkaDatabaseQueryJobPosterProducer,
  initDatabaseQueryRunnerJobResultConsumer,
  connectDatabaseQueryRunnerJobProducer,
  disconnectDatabaseQueryRunnerJobProducer,
};
