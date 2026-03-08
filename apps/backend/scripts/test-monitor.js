const queue = require('../config/queue.config');
const Logger = require('../utils/logger');

async function run() {
    try {
        console.log('Initializing in-memory queue...');
        await queue.initializeQueue();

        // Register a dummy task worker for testing
        queue.registerTaskWorker(async (job) => {
            console.log('Task worker received:', JSON.stringify(job, null, 2));
        });

        console.log('Sending test message...');
        await queue.addNodeJob({
            instanceID: 'test-instance-' + Date.now(),
            nodeID: 'test-node',
            nodeType: 'TEST_NODE',
            nodeConfig: { foo: 'bar' },
            context: {}
        });

        console.log('Message sent. Check monitor.');
        setTimeout(async () => {
            await queue.closeQueue();
             process.exit(0);
        }, 1000);

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

run();
