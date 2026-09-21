const queue = require('../config/queue.config');

async function run() {
    try {
        console.log('Initializing queue (memory driver)...');
        await queue.initializeQueue();
        console.log('Healthy:', queue.isConnectionHealthy());

        // Register a dummy listener-event worker for testing
        queue.registerListenerEventWorker(async (job) => {
            console.log('Listener worker received:', JSON.stringify(job, null, 2));
        });

        console.log('Sending test listener event...');
        await queue.addListenerEvent({
            listenerID: 'test-listener-' + Date.now(),
            tenantID: 'test-tenant',
            rawEvent: { hello: 'world' },
            actions: [],
        });

        console.log('Event sent.');
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
