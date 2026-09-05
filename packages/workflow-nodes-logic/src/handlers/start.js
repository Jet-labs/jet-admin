import { NEXT_HANDLE } from '../constants.js';

export async function executeStart(nodeConfig, context) {
  return {
    output: { started: true, inputReceived: context.input || {} },
    nextHandle: NEXT_HANDLE.OUTPUT,
  };
}
