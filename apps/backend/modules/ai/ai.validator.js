/**
 * AI Validation Schemas
 *
 * Note: The AI module currently only has a simple chat room ID generation endpoint.
 * This validator is here for future expansion.
 */

const { z } = require("../../utils/validation.utils");

// ============================================================
// Request Body Schemas (for future use)
// ============================================================

const aiPromptSchema = z.object({
  prompt: z.string().min(1, "prompt is required"),
  context: z.object({}).passthrough().optional(),
}).passthrough();

// ============================================================
// Exports
// ============================================================

module.exports = {
  aiPromptSchema,
};
