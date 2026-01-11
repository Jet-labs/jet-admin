const https = require('https');
const fs = require('fs');

// Load API key from environment
const apiKey = process.env.GEMINI_API_KEY || require('./apps/backend/environment').GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      const models = response.models || [];
      
      let output = 'Available Gemini Models:\n';
      output += '='.repeat(80) + '\n';
      
      // Filter to show mainly text generation models
      const textModels = models.filter(m => 
        m.supportedGenerationMethods?.includes('generateContent')
      );
      
      textModels.forEach(m => {
        output += `\nModel: ${m.name}\n`;
        output += `  Display Name: ${m.displayName}\n`;
        output += `  Supported Methods: ${(m.supportedGenerationMethods || []).join(', ')}\n`;
        output += `  Input Token Limit: ${m.inputTokenLimit || 'N/A'}\n`;
        output += `  Output Token Limit: ${m.outputTokenLimit || 'N/A'}\n`;
      });
      
      output += '\n' + '='.repeat(80) + '\n';
      output += `Total text generation models: ${textModels.length}\n`;
      
      fs.writeFileSync('available-models.txt', output);
      console.log('Output saved to available-models.txt');
      console.log(`Found ${textModels.length} text generation models`);
      
      // Print first few models to console
      console.log('\nSample models with generateContent support:');
      textModels.slice(0, 10).forEach(m => {
        console.log(`- ${m.name} (${m.displayName})`);
      });
      
    } catch (e) {
      console.error('Error parsing response:', e.message);
      console.log('Raw response:', data.substring(0, 500));
    }
  });
}).on('error', e => console.error('Request error:', e.message));
