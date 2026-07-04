const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.models) {
      console.log('Available models from Google AI Studio:');
      data.models.forEach((m) => {
        if (m.name.includes('gemma') || m.name.includes('gemini')) {
          console.log(`- ${m.name.replace('models/', '')} (${m.displayName || ''})`);
        }
      });
    } else {
      console.log('Error/Response:', JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

listModels();
