const { PgBoss } = require('pg-boss');
const environment = require('../environment');

async function testQueue() {
  console.log('Original DATABASE_URL:', environment.DATABASE_URL);
  
  // Try to connect with pg-boss
  const boss = new PgBoss({
    connectionString: environment.DATABASE_URL,
    schema: 'pgboss',
  });

  boss.on('error', error => console.error('pg-boss error:', error));

  try {
    console.log('Starting pg-boss...');
    await boss.start();
    console.log('pg-boss started successfully.');

    const queueName = 'test-queue-' + Date.now();
    console.log(`Creating test queue: ${queueName}`);
    await boss.createQueue(queueName);

    console.log('Sending test job...');
    const jobId = await boss.send(queueName, { hello: 'world' });
    console.log('Job sent. ID:', jobId);

    console.log('Retrieving job...');
    // We'll use fetch() to see if we can get it manually
    const job = await boss.fetch(queueName);
    
    if (job) {
      console.log('Job retrieved successfully:', job.data);
      await boss.complete(job.id);
      console.log('Job completed.');
    } else {
      console.log('No job retrieved. This might indicate polling/locking issues with the pooler.');
    }

    await boss.stop();
    console.log('pg-boss stopped.');
  } catch (err) {
    console.error('Diagnostic failed:', err);
    if (err.message.includes('advisory lock')) {
        console.error('HINT: Advisory locks are often incompatible with connection poolers in Transaction Mode.');
    }
  }
}

testQueue();
