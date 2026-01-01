const si = require('react-icons/si');
const available = Object.keys(si);

const searchTerms = [
  'microsoft', 'sql', 'neo4j', 'cockroach', 'amazon', 's3', 'google', 'bigquery', 'stripe', 'supabase', 'airtable', 'elastic', 'oracle', 'sqlite', 'twilio', 'sendgrid', 'slack', 'notion', 'jira', 'analytics'
];

searchTerms.forEach(term => {
  const matches = available.filter(k => k.toLowerCase().includes(term));
  console.log(`Matches for "${term}":`, matches.slice(0, 5)); // Limit to first 5 matches to avoid truncation
});
