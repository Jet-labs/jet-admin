const vm = require('vm');

class ConditionHandler {
  async execute(nodeConfig, context) {
    const { condition } = nodeConfig.data;
    
    // Safety check
    if (!condition) return true;

    try {
      const sandbox = { 
        ctx: context, 
        console: console 
      };
      
      vm.createContext(sandbox);
      
      const scriptCode = `(function() { return ${condition}; })()`;
      const result = vm.runInContext(scriptCode, sandbox);
      
      return Boolean(result);
    } catch (err) {
      throw new Error(`Condition execution failed: ${err.message}`);
    }
  }
}

module.exports = new ConditionHandler();
