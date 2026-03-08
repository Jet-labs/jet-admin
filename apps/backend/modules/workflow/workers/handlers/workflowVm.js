const { VM } = require('vm2');

function createWorkflowVm({ sandbox = {}, timeoutMs = 5000 } = {}) {
  return new VM({
    timeout: timeoutMs,
    sandbox,
    eval: false,
    wasm: false,
  });
}

module.exports = {
  createWorkflowVm,
};