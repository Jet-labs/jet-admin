try {
  const pkg = require('react-icons/package.json');
  console.log('react-icons version:', pkg.version);
} catch (e) {
  console.log('Could not read package.json version');
}

const si = require('react-icons/si');
const keys = Object.keys(si);
console.log('SiM* icons:', keys.filter(k => k.startsWith('SiM')));
console.log('SiA* icons:', keys.filter(k => k.startsWith('SiA'))); // for Airtable, Amazon
console.log('SiE* icons:', keys.filter(k => k.startsWith('SiE'))); // for Elasticsearch
console.log('SiS* icons:', keys.filter(k => k.startsWith('SiS'))); // for Stripe, Supabase
console.log('SiO* icons:', keys.filter(k => k.startsWith('SiO'))); // for Oracle
console.log('SiC* icons:', keys.filter(k => k.startsWith('SiC'))); // for Cockroach
console.log('SiN* icons:', keys.filter(k => k.startsWith('SiN'))); // for Neo4j, Notion
console.log('SiT* icons:', keys.filter(k => k.startsWith('SiT'))); // for Twilio
console.log('SiG* icons:', keys.filter(k => k.startsWith('SiG'))); // for Google
