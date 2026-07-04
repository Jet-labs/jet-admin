const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function testGemma() {
  console.log(`\n================ Testing gemma-4-31b-it ================`);
  const [aiMod, googleMod] = await Promise.all([
    import('ai'),
    import('@ai-sdk/google'),
  ]);

  const { streamText, tool } = aiMod;
  const { createGoogle } = googleMod;
  const { z } = require('zod');

  const google = createGoogle({ apiKey: process.env.GEMINI_API_KEY });
  const model = google('gemma-4-31b-it');

  try {
    const result = await streamText({
      model,
      system: 'You are a helpful assistant embedded in Jet Admin.',
      messages: [{ role: 'user', content: 'List all datasources' }],
      tools: {
        get_tenant_resource_summary: tool({
          description: 'Get summary of all datasources and resources',
          parameters: z.object({}),
          execute: async () => {
            console.log('--- TOOL EXECUTED ---');
            return { datasources: ['PostgreSQL', 'GoogleSheets', 'Firestore'] };
          },
        }),
      },
      maxSteps: 5,
      stopWhen: (step) => step.finishReason === 'stop' || step.finishReason === 'length',
      onStepFinish: (step) => {
        console.log('[Step Finished] finishReason:', step.finishReason, 'text:', step.text);
      },
      onFinish: (res) => {
        console.log('[All Steps Finished] finishReason:', res.finishReason, 'full text:', res.text);
      },
    });

    for await (const chunk of result.textStream) {
      process.stdout.write(chunk);
    }
    console.log();
  } catch (err) {
    console.error('Error with gemma-4-31b-it:', err);
  }
}

testGemma().catch(console.error);
