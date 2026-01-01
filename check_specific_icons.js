const si = require('react-icons/si');
const targetIcons = [
  'SiMicrosoftsqlserver',
  'SiSupabase',
  'SiGooglebigquery',
  'SiAirtable',
  'SiAmazons3',
  'SiElasticsearch',
  'SiStripe',
  'SiOracle',
  'SiSqlite',
  'SiCockroachlabs',
  'SiNeo4j',
  'SiTwilio',
  'SiSendgrid',
  'SiSlack',
  'SiNotion',
  'SiJira',
  'SiGoogleanalytics'
];

const available = Object.keys(si);
const missing = targetIcons.filter(icon => !available.includes(icon));
const found = targetIcons.filter(icon => available.includes(icon));

console.log('Missing icons:', missing);
console.log('Found icons:', found);

// suggestions for missing
missing.forEach(missingIcon => {
  const core = missingIcon.replace(/^Si/, '').toLowerCase();
  const suggestions = available.filter(k => k.toLowerCase().includes(core));
  console.log(`Suggestions for ${missingIcon}:`, suggestions);
});
