import amqp from "amqplib";
import { Logger } from "../../utils/logger.js";
import DataSource from "../datasource.js";

export default class RabbitMQDataSource extends DataSource {
  buildConnectionUrl() {
    const opts = this.config.datasourceOptions || {};
    
    if (opts.connectionUrl) {
      return opts.connectionUrl;
    }
    
    const details = opts.connectionDetails || opts;
    const protocol = details.ssl ? "amqps" : "amqp";
    const auth = details.username && details.password 
      ? `${encodeURIComponent(details.username)}:${encodeURIComponent(details.password)}@`
      : "";
    const vhost = encodeURIComponent(details.vhost || "/");
    const heartbeat = details.heartbeat ? `?heartbeat=${details.heartbeat}` : "";
    
    return `${protocol}://${auth}${details.host || "localhost"}:${details.port || 5672}/${vhost}${heartbeat}`;
  }

  async execute(dataQueryOptions, context) {
    Logger.log("info", {
      message: "rabbitmq:RabbitMQDataSource:execute:params",
      params: { dataQueryOptions, datasourceID: this.config.datasourceID },
    });

    const { 
      operation, 
      queue, 
      exchange, 
      routingKey, 
      message, 
      messageCount = 1,
      consumeMode = "preview",
      storeDestination,
      queueOptions = {},
      messageOptions = {}
    } = dataQueryOptions;

    let connection;
    let channel;
    
    try {
      const url = this.buildConnectionUrl();
      // Mask password if present in the URL
      const maskedUrl = url.replace(/([^:]+):([^@]+)@/, "$1:****@");
      
      Logger.log("info", {
        message: "rabbitmq:RabbitMQDataSource:connecting",
        params: { url: maskedUrl, datasourceID: this.config.datasourceID },
      });

      connection = await amqp.connect(url);
      connection.on("error", (err) => {
        Logger.log("error", { message: "rabbitmq:connection:error", params: { error: err.message, datasourceID: this.config.datasourceID } });
      });

      channel = await connection.createChannel();
      channel.on("error", (err) => {
        Logger.log("error", { message: "rabbitmq:channel:error", params: { error: err.message, datasourceID: this.config.datasourceID } });
      });
      
      let result;
      
      switch (operation) {
        case "publish":
          result = await this.publish(channel, queue, exchange, routingKey, message, queueOptions, messageOptions);
          break;
        case "consume":
        case "peek":
          result = await this.consume(channel, queue, messageCount, consumeMode, storeDestination, queueOptions, context);
          break;
        case "ack":
          result = { success: true, message: "Messages acknowledged" };
          break;
        case "nack":
          result = { success: true, message: "Messages rejected" };
          break;
        case "purge":
          result = await this.purge(channel, queue);
          break;
        case "getQueueInfo":
          result = await this.getQueueInfo(channel, queue);
          break;
        case "deleteQueue":
          result = await this.deleteQueue(channel, queue);
          break;
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }

      Logger.log("info", {
        message: "rabbitmq:RabbitMQDataSource:execute:success",
        params: { operation, queue },
      });

      return result;
    } catch (error) {
      Logger.log("error", {
        message: "rabbitmq:RabbitMQDataSource:execute:catch",
        params: { error: error.message },
      });
      throw new Error(`RabbitMQ ${operation} failed: ${error.message}`);
    } finally {
      if (channel) await channel.close();
      if (connection) await connection.close();
    }
  }

  async publish(channel, queue, exchange, routingKey, message, queueOptions, messageOptions) {
    const msgContent = typeof message === "string" ? message : JSON.stringify(message);
    const buffer = Buffer.from(msgContent);
    
    const options = {
      persistent: messageOptions.persistent !== false,
      contentType: messageOptions.contentType || "application/json",
      ...(messageOptions.expiration ? { expiration: messageOptions.expiration } : {}),
    };

    if (exchange) {
      const exchangeType = dataQueryOptions.exchangeType || "direct";
      await channel.assertExchange(exchange, exchangeType, { durable: true });
      channel.publish(exchange, routingKey || queue, buffer, options);
    } else {
      await channel.assertQueue(queue, {
        durable: queueOptions.durable !== false,
        autoDelete: queueOptions.autoDelete || false,
        exclusive: queueOptions.exclusive || false,
      });
      channel.sendToQueue(queue, buffer, options);
    }

    return { success: true, queue, exchange, routingKey, messageSize: buffer.length };
  }

  async consume(channel, queue, messageCount, consumeMode, storeDestination, queueOptions, context) {
    await channel.assertQueue(queue, {
      durable: queueOptions.durable !== false,
      autoDelete: queueOptions.autoDelete || false,
      exclusive: queueOptions.exclusive || false,
    });

    const messages = [];
    
    for (let i = 0; i < messageCount; i++) {
      const msg = await channel.get(queue, { noAck: false });
      
      if (!msg) break;
      
      let content;
      try {
        content = JSON.parse(msg.content.toString());
      } catch {
        content = msg.content.toString();
      }
      
      const messageData = {
        content,
        properties: {
          messageId: msg.properties.messageId,
          contentType: msg.properties.contentType,
          timestamp: msg.properties.timestamp,
          deliveryTag: msg.fields.deliveryTag,
          redelivered: msg.fields.redelivered,
        },
      };
      
      messages.push(messageData);
      
      if (consumeMode === "preview") {
        // Put message back in queue
        channel.nack(msg, false, true);
      } else if (consumeMode === "consume") {
        // Acknowledge and remove from queue
        channel.ack(msg);
      }
    }

    return {
      messages,
      count: messages.length,
      queue,
      consumeMode,
    };
  }

  async purge(channel, queue) {
    const result = await channel.purgeQueue(queue);
    return { success: true, messageCount: result.messageCount, queue };
  }

  async getQueueInfo(channel, queue) {
    const info = await channel.checkQueue(queue);
    return {
      queue: info.queue,
      messageCount: info.messageCount,
      consumerCount: info.consumerCount,
    };
  }

  async deleteQueue(channel, queue) {
    const result = await channel.deleteQueue(queue);
    return { success: true, messageCount: result.messageCount, queue };
  }

  async subscribe(config, onEvent) {
    const exchange = config.exchange;
    const routingKey = config.routingKey || "#";
    const queueName = config.queue || "";
    const prefetch = config.prefetch || 10;

    if (!exchange) {
      throw new Error("Exchange is required for RabbitMQ listener");
    }

    Logger.log("info", {
      message: "rabbitmq:subscribe:start",
      params: { exchange, routingKey, queueName, datasourceID: this.config.datasourceID },
    });

    const connection = await amqp.connect(this.buildConnectionUrl());
    connection.on("error", (err) => {
      Logger.log("error", { message: "rabbitmq:connection:error", params: { error: err.message, datasourceID: this.config.datasourceID } });
    });

    const channel = await connection.createChannel();
    channel.on("error", (err) => {
      Logger.log("error", { message: "rabbitmq:channel:error", params: { error: err.message, datasourceID: this.config.datasourceID } });
    });
    
    await channel.prefetch(prefetch);
    
    // Using topic exchange by default to support wildcards like * and #, but allow override
    const exchangeType = config.exchangeType || "topic";
    await channel.assertExchange(exchange, exchangeType, { durable: true }); 

    const q = await channel.assertQueue(queueName, { 
      exclusive: !queueName // if no queue name provided, it's exclusive to this connection
    });
    
    await channel.bindQueue(q.queue, exchange, routingKey);

    const { consumerTag } = await channel.consume(q.queue, (msg) => {
      if (msg !== null) {
        let content;
        try {
          content = JSON.parse(msg.content.toString());
        } catch {
          content = msg.content.toString();
        }
        
        onEvent({
          exchange,
          routingKey: msg.fields.routingKey,
          payload: content,
        });
        
        channel.ack(msg);
      }
    });

    return { connection, channel, consumerTag };
  }

  async unsubscribe(handle) {
    if (!handle) return;
    
    Logger.log("info", {
      message: "rabbitmq:unsubscribe",
      params: { datasourceID: this.config.datasourceID },
    });

    try {
      if (handle.channel) {
        await handle.channel.cancel(handle.consumerTag);
        await handle.channel.close();
      }
      if (handle.connection) {
        await handle.connection.close();
      }
    } catch (e) {
      Logger.log("error", {
        message: "rabbitmq:unsubscribe:error",
        params: { error: e.message },
      });
    }
  }
}
