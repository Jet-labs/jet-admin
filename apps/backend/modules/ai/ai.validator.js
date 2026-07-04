const { z } = require('../../utils/validation.utils');

// AI SDK useChat sends { messages: UIMessage[] } where each message has
// role + content at minimum. We accept a passthrough schema so extra
// fields (id, parts, toolInvocations) are ignored, not rejected.
const streamChatBodySchema = z.object({
  messages: z.array(z.any()).min(1, 'messages array cannot be empty'),
}).passthrough();

module.exports = { streamChatBodySchema };
