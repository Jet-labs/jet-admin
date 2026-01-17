const { socketIO } = require('../../config/socket.io');
const rabbitmq = require('../../config/rabbitmq.config');
const Logger = require('../../utils/logger');

/**
 * Initialize the Monitor Socket Namespace
 */
function initializeMonitorSocket() {
    const monitorNamespace = socketIO.of('/monitor');

    monitorNamespace.on('connection', async (socket) => {
        Logger.log('info', { message: 'monitor.socket: client connected', params: { id: socket.id } });

        let channel = null;
        let consumerTag = null;

        try {
            // Get existing connection
            const connection = rabbitmq.getConnection();
            if (!connection) {
                socket.emit('error', { message: 'RabbitMQ not connected' });
                return;
            }

            // Create a dedicated channel for this client (or shared? dedicated is safer for exclusive queues)
            channel = await connection.createChannel();
            
            // Create an exclusive, transient queue
            const q = await channel.assertQueue('', { exclusive: true, autoDelete: true });
            
            // Bind to the monitor exchange
            // We bind to '#' to get ALL messages by default
            const MONITOR_EXCHANGE = 'monitor.exchange'; // Hardcoded or imported if exported
            
            // Ensure exchange exists (should be done by config, but good for safety)
            await channel.assertExchange(MONITOR_EXCHANGE, 'topic', { durable: false });
            
            await channel.bindQueue(q.queue, MONITOR_EXCHANGE, '#');

            // Consume
            const consumer = await channel.consume(q.queue, (msg) => {
                if (msg) {
                    try {
                        const content = JSON.parse(msg.content.toString());
                        const routingKey = msg.fields.routingKey;
                        const timestamp = Date.now(); // or parsed from msg content if available

                        socket.emit('log', {
                            routingKey,
                            content,
                            timestamp
                        });
                    } catch (e) {
                         Logger.log('error', { message: 'monitor.socket: parse error', params: { error: e.message } });
                    }
                }
            }, { noAck: true });
            
            consumerTag = consumer.consumerTag;

            socket.on('disconnect', async () => {
                Logger.log('info', { message: 'monitor.socket: client disconnected', params: { id: socket.id } });
                if (channel) {
                    try {
                        await channel.close();
                    } catch (e) {
                        // ignore
                    }
                }
            });

        } catch (error) {
            Logger.log('error', { message: 'monitor.socket: error initializing', params: { error: error.message } });
            socket.emit('error', { message: 'Internal Server Error' });
        }
    });

    Logger.log('success', { message: 'monitor.socket: initialized' });
}

module.exports = {
    initializeMonitorSocket
};
