const { Kafka } = require("kafkajs");
const constants = require("../constants");
const { databaseQueryService } = require("../services/databaseQuery.service");
const Logger = require("../utils/logger");


const kafkaWorker = new Kafka({
  clientId: constants.KAFKA_CLIENT_IDS.DATABASE_QUERY_RUNNER_JOB_WORKER,
  brokers: ["127.0.0.1:9092"],
});

const kafkaQueryRunnerJobConsumer = kafkaWorker.consumer({
  groupId: constants.KAFKA_GROUP_IDS.DATABASE_QUERY_RUNNER_JOB_CONSUMER_GROUP,
});

const kafkaQueryRunnerJobResultProducer = kafkaWorker.producer();


const connectQueryRunnerJobResultProducer = async () => {
  try {
    await kafkaQueryRunnerJobResultProducer.connect();
  } catch (error) {
    Logger.log("error", { message: "Error connecting to Kafka:", params: { error } });
    throw error;
  }
};

const disconnectQueryRunnerJobResultProducer = async () => {
  try {
    await kafkaQueryRunnerJobResultProducer.disconnect();
  } catch (error) {
    Logger.log("error", { message: "Error disconnecting from Kafka:", params: { error } });
    throw error;
  }
};

const postQueryRunnerJobResult = async (databaseQueryRunnerJobID, result) => {
  await kafkaQueryRunnerJobResultProducer.send({
    topic: constants.KAFKA_TOPIC_NAMES.DATABASE_QUERY_RUNNER_JOB_RESULTS,
    messages: [
      { key: databaseQueryRunnerJobID, value: JSON.stringify(result) },
    ],
  });
  Logger.log("success", {
    message: "kafka:postQueryRunnerJobResult:success",
    params: { databaseQueryRunnerJobID },
  });
};

const listenQueryRunnerJobs = async () => {
  await kafkaQueryRunnerJobConsumer.connect();
  await kafkaQueryRunnerJobConsumer.subscribe({
    topic: constants.KAFKA_TOPIC_NAMES.DATABASE_QUERY_RUNNER_JOBS,
    fromBeginning: true,
  });
  await kafkaQueryRunnerJobConsumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      Logger.log("info", {
        message: "kafka:listenQueryRunnerJobs:eachMessage",
        params: { topic, partition, message },
      });
      if(topic == constants.KAFKA_TOPIC_NAMES.DATABASE_QUERY_RUNNER_JOBS){
        await databaseQueryService.runDatabaseQuery({
          databaseQueryRunnerJobID: message.key.toString(),
          ...JSON.parse(message.value.toString()),
          postQueryRunnerJobResult: async (result) => {
            await postQueryRunnerJobResult(message.key.toString(), result);
          },
        });
      }
      // Acknowledge the message
      await kafkaQueryRunnerJobConsumer.commitOffsets([
        { topic, partition, offset: (parseInt(message.offset) + 1).toString() }
      ]);
      
      // Note: Kafka automatically removes consumed messages after the retention period.
      // If you want to manually delete a message, you'd need to use the Admin API,
      // but this is not typically necessary or recommended in most use cases.
      // Process the job here
      
    },
    
  });
};



module.exports = {
  connectQueryRunnerJobResultProducer,
  disconnectQueryRunnerJobResultProducer,
  listenQueryRunnerJobs,
  postQueryRunnerJobResult,
  kafkaQueryRunnerJobResultProducer,
};
