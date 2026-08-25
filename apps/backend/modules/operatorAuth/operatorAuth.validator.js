/**
 * OperatorAuth Validation Schemas
 */

const { z } = require("../../utils/validation.utils");

// ============================================================
// Request Body Schemas
// ============================================================

const operatorLoginSchema = z.object({
  email: z.string().min(1, "email is required").max(255),
  password: z.string().min(1, "password is required").max(255),
}).passthrough();

// ============================================================
// Exports
// ============================================================

module.exports = {
  operatorLoginSchema,
};
