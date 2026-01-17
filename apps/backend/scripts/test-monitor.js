const rabbitmq = require('../config/rabbitmq.config');
const Logger = require('../utils/logger');

async function run() {
    try {
        console.log('Connecting...');
        await rabbitmq.initializeRabbitMQ();
        
        console.log('Sending test message...');
        await rabbitmq.addNodeJob({
            instanceID: 'test-instance-' + Date.now(),
            nodeID: 'test-node',
            nodeType: 'TEST_NODE',
            nodeConfig: { foo: 'bar' },
            context: {}
        });
        
        console.log('Message sent. Check monitor.');
        setTimeout(async () => {
             await rabbitmq.closeRabbitMQ();
             process.exit(0);
        }, 1000);
        
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

run();
