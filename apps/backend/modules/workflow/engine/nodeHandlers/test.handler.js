/**
 * TestNodeHandler
 * Simple handler for testing purposes.
 */
class TestNodeHandler {
  async execute(config, context) {
    const duration = config.duration || 100;
    const name = config.name || "TestNode";
    
    console.log(`[TestHandler] Executing ${name} for ${duration}ms...`);
    
    // Simulate Async Work
    await new Promise(resolve => setTimeout(resolve, duration));

    console.log(`[TestHandler] Finished ${name}`);
    
    return { 
      message: `Hello from ${name}`, 
      processedAt: Date.now() 
    };
  }
}

module.exports = new TestNodeHandler();
