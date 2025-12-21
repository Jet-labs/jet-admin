/**
 * JavascriptHandler
 * Executes snippets of JavaScript in a sandboxed environment.
 */
const vm = require("vm");
const Logger = require("../../../../utils/logger");

class JavascriptHandler {
  async execute(config, context) {
    const { code } = config;
    
    // 1. Prepare Sandbox
    // We expose limited globals and the context
    const sandbox = {
      ctx: context, // { results: { ... }, ... }
      console: { log: (...args) => {} }, // Mute console or redirect to logger
      // Helper libs can be added here (e.g., _ for lodash)
    };
    
    vm.createContext(sandbox);

    try {
      // 2. Execute
      // We wrap code in a function to allow 'return' statements
      const wrappedCode = `(function() { ${code} })()`;
      const result = vm.runInContext(wrappedCode, sandbox, { timeout: 1000 }); // 1s timeout to prevent infinite loops

      return result;

    } catch (error) {
      Logger.log("error", { message: "JavascriptHandler:execute:error", params: { error: error.message } });
      throw new Error(`Script execution failed: ${error.message}`);
    }
  }
}

module.exports = new JavascriptHandler();
