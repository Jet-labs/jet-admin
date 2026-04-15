import { Kafka, logLevel } from "kafkajs";
import { Logger } from "../../utils/logger.js";
import DataSource from "../datasource.js";

export default class KafkaDataSource extends DataSource {
  getKafkaClient() {
    const opts = this.config.datasourceOptions || {};
    
    const brokers = (opts.brokers || "localhost:9092").split(",").map(b => b.trim());
    
    const config = {
      clientId: opts.clientId || "jet-admin",
      brokers,
      connectionTimeout: opts.connectionTimeout || 10000,
      requestTimeout: opts.requestTimeout || 30000,
      logLevel: logLevel.WARN,
    };

    if (opts.ssl) {
      config.ssl = true;
    }

    if (opts.sasl?.enabled) {
      config.sasl = {
        mechanism: opts.sasl.mechanism || "plain",
        username: opts.sasl.username,
        password: opts.sasl.password,
      };
    }

    return new Kafka(config);
  }

  async execute(dataQueryOptions, context) {
    Logger.log("info", {
      message: "kafka:KafkaDataSource:execute:params",
      params: { dataQueryOptions, datasourceID: this.config.datasourceID },
    });

    const {
      operation,
      topic,
      message,
      key,
      partition,
      consumerGroup,
      messageCount = 10,
      fromBeginning = false,
      consumeMode = "preview",
      storeDestination,
      topicConfig,
    } = dataQueryOptions;

    const kafka = this.getKafkaClient();

    try {
      let result;

      switch (operation) {
        case "produce":
          result = await this.produce(kafka, topic, message, key, partition);
          break;
        case "consume":
          result = await this.consume(kafka, topic, consumerGroup, messageCount, fromBeginning, consumeMode, storeDestination, context);
          break;
        case "getTopicMetadata":
          result = await this.getTopicMetadata(kafka, topic);
          break;
        case "listTopics":
          result = await this.listTopics(kafka);
          break;
        case "createTopic":
          result = await this.createTopic(kafka, topic, topicConfig);
          break;
        case "deleteTopic":
          result = await this.deleteTopic(kafka, topic);
          break;
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }

      Logger.log("info", {
        message: "kafka:KafkaDataSource:execute:success",
        params: { operation, topic },
      });

      return result;
    } catch (error) {
      Logger.log("error", {
        message: "kafka:KafkaDataSource:execute:catch",
        params: { error: error.message },
      });
      throw new Error(`Kafka ${operation} failed: ${error.message}`);
    }
  }

  async produce(kafka, topic, message, key, partition) {
    const producer = kafka.producer();
    await producer.connect();

    try {
      const msgValue = typeof message === "string" ? message : JSON.stringify(message);
      
      const record = {
        topic,
        messages: [{
          value: msgValue,
          ...(key ? { key } : {}),
          ...(partition !== undefined ? { partition } : {}),
        }],
      };

      const result = await producer.send(record);
      
      return {
        success: true,
        topic,
        partition: result[0]?.partition,
        offset: result[0]?.baseOffset,
      };
    } finally {
      await producer.disconnect();
    }
  }

  async consume(kafka, topic, consumerGroup, messageCount, fromBeginning, consumeMode, storeDestination, context) {
    const consumer = kafka.consumer({ groupId: consumerGroup || `jet-admin-${Date.now()}` });
    await consumer.connect();

    const messages = [];

    try {
      await consumer.subscribe({ topic, fromBeginning });

      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          resolve();
        }, 5000); // 5 second timeout for collecting messages

        consumer.run({
          eachMessage: async ({ topic, partition, message }) => {
            if (messages.length >= messageCount) return;

            let content;
            try {
              content = JSON.parse(message.value.toString());
            } catch {
              content = message.value.toString();
            }

            messages.push({
              content,
              key: message.key?.toString(),
              partition,
              offset: message.offset,
              timestamp: message.timestamp,
            });

            // If consumeAndStore, execute the store query
            if (consumeMode === "consumeAndStore" && storeDestination?.dataQueryId && context?.executeDataQuery) {
              await context.executeDataQuery(storeDestination.dataQueryId, { message: content });
            }

            if (messages.length >= messageCount) {
              clearTimeout(timeout);
              resolve();
            }
          },
        }).catch(reject);
      });

      return {
        messages,
        count: messages.length,
        topic,
        consumerGroup,
        consumeMode,
      };
    } finally {
      await consumer.disconnect();
    }
  }

  async getTopicMetadata(kafka, topic) {
    const admin = kafka.admin();
    await admin.connect();

    try {
      const metadata = await admin.fetchTopicMetadata({ topics: topic ? [topic] : [] });
      
      return {
        topics: metadata.topics.map(t => ({
          name: t.name,
          partitions: t.partitions.map(p => ({
            partitionId: p.partitionId,
            leader: p.leader,
            replicas: p.replicas,
            isr: p.isr,
          })),
        })),
      };
    } finally {
      await admin.disconnect();
    }
  }

  async listTopics(kafka) {
    const admin = kafka.admin();
    await admin.connect();

    try {
      const topics = await admin.listTopics();
      return { topics };
    } finally {
      await admin.disconnect();
    }
  }

  async createTopic(kafka, topic, config = {}) {
    const admin = kafka.admin();
    await admin.connect();

    try {
      await admin.createTopics({
        topics: [{
          topic,
          numPartitions: config.numPartitions || 1,
          replicationFactor: config.replicationFactor || 1,
        }],
      });

      return { success: true, topic };
    } finally {
      await admin.disconnect();
    }
  }

  async deleteTopic(kafka, topic) {
    const admin = kafka.admin();
    await admin.connect();

    try {
      await admin.deleteTopics({ topics: [topic] });
      return { success: true, topic };
    } finally {
      await admin.disconnect();
    }
  }

  async subscribe(config, onEvent) {
    const { topic, consumerGroup, fromBeginning = false } = config;
    const kafka = this.getKafkaClient();
    const consumer = kafka.consumer({ groupId: consumerGroup || `jet-admin-sub-${Date.now()}` });

    await consumer.connect();
    await consumer.subscribe({ topic, fromBeginning });

    // Do not await this. It runs continuously.
    consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        let payload;
        const msgStr = message.value?.toString();
        try {
          payload = JSON.parse(msgStr);
        } catch {
          payload = msgStr;
        }

        const event = {
          topic,
          partition,
          key: message.key?.toString(),
          payload,
          timestamp: message.timestamp,
        };

        if (onEvent) {
          await onEvent(event);
        }
      },
    }).catch(err => {
      Logger.log("error", {
        message: "kafka:KafkaDataSource:subscribe:runError",
        params: { topic, consumerGroup, error: err.message },
      });
    });

    return consumer; // Return consumer as handle
  }

  async unsubscribe(consumer) {
    if (consumer) {
      await consumer.disconnect();
    }
  }
}
