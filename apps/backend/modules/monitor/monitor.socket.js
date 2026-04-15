const { socketIO } = require("../../config/socket.io");
const { monitorBus } = require("../../config/queue.config");
const Logger = require("../../utils/logger");

/**
 * Initialize the Monitor Socket Namespace
 * Uses an in-memory EventEmitter instead of RabbitMQ exchange
 */
function initializeMonitorSocket() {
    const monitorNamespace = socketIO.of('/monitor');

    monitorNamespace.on('connection', async (socket) => {
        Logger.log('info', { message: 'monitor.socket: client connected', params: { id: socket.id } });

        // Subscribe to in-memory monitor bus
        const onLog = (data) => {
            socket.emit('log', {
                routingKey: data.routingKey,
                content: data.content,
                timestamp: data.timestamp,
            });
        };

        monitorBus.on('log', onLog);

        socket.on('disconnect', () => {
            Logger.log('info', { message: 'monitor.socket: client disconnected', params: { id: socket.id } });
            monitorBus.off('log', onLog);
        });
    });

    Logger.log('success', { message: 'monitor.socket: initialized' });
}

module.exports = {
    initializeMonitorSocket
};
