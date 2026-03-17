const { Client } = require('pg');
const environment = require('../environment');

async function checkDb() {
  console.log('Connecting to:', environment.DATABASE_URL.replace(/:[^:]+@/, ':****@'));
  const client = new Client({
    connectionString: environment.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database.');

    const schemas = await client.query("SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'pgboss'");
    if (schemas.rows.length > 0) {
      console.log("Schema 'pgboss' exists.");
      
      const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'pgboss'");
      console.log('Tables in pgboss schema:', tables.rows.map(r => r.table_name).join(', '));
      
      const queues = await client.query("SELECT name FROM pgboss.queue");
      console.log('Queues registered in pgboss.queue:', queues.rows.map(r => r.name).join(', '));
    } else {
      console.log("Schema 'pgboss' DOES NOT exist.");
    }

    await client.end();
  } catch (err) {
    console.error('Database check failed:', err);
  }
}

checkDb();
