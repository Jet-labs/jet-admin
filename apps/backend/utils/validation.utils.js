/**
 * Zod Validation Utilities
 *
 * Provides reusable validation schemas and middleware for Express routes.
 * Replaces express-validator with Zod for type-safe validation.
 */

const { z } = require("zod");
const { expressUtils } = require("./express.utils");

// ============================================================
// Common Validation Schemas
// ============================================================

/**
 * UUID validation schema
 */
const uuidSchema = z.string().uuid("Must be a valid UUID");

/**
 * Email validation schema
 */
const emailSchema = z.string().email("Must be a valid email address");

/**
 * Pagination query parameters schema
 */
const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

/**
 * Date string schema (ISO 8601 format)
 */
const dateStringSchema = z.string().datetime().or(z.string().date());

/**
 * Non-empty string schema
 */
const nonEmptyStringSchema = z.string().min(1, "This field is required");

/**
 * Optional string schema
 */
const optionalStringSchema = z.string().optional();

/**
 * Boolean schema with coercion from string
 */
const booleanSchema = z.coerce.boolean();

/**
 * Optional boolean schema
 */
const optionalBooleanSchema = z.coerce.boolean().optional();

/**
 * Positive integer schema
 */
const positiveIntSchema = z.coerce.number().int().positive();

/**
 * Non-negative integer schema
 */
const nonNegativeIntSchema = z.coerce.number().int().nonnegative();

/**
 * Cron schedule validation regex
 * Matches standard 5-part cron expressions: minute hour day month weekday
 */
const CRON_REGEX =
  /^(\*|([0-9]|[1-5][0-9])|\*\/([0-9]|[1-5][0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|[12][0-9]|3[01])|\*\/([1-9]|[12][0-9]|3[01])) (\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec) (\*|[0-6]|\*\/[0-6]|sun|mon|tue|wed|thu|fri|sat)$/i;

/**
 * Cron schedule schema
 */
const cronScheduleSchema = z
  .string()
  .regex(CRON_REGEX, 'Must be a valid cron expression (e.g., "*/5 * * * *")');

// ============================================================
// Validation Middleware Factory
// ============================================================

/**
 * Creates Express middleware that validates request data against a Zod schema.
 *
 * @param {z.ZodSchema} schema - Zod schema to validate against
 * @param {'body' | 'params' | 'query'} source - Request property to validate
 * @returns {import('express').RequestHandler} Express middleware function
 *
 * @example
 * // Validate request body
 * router.post('/', validate(createWidgetSchema, 'body'), controller.create);
 *
 * // Validate URL params
 * router.get('/:id', validate(idParamSchema, 'params'), controller.getById);
 *
 * // Validate query string
 * router.get('/', validate(paginationSchema, 'query'), controller.list);
 */
const validate = (schema, source = "body") => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        path: issue.path.join(".") || source,
        message: issue.message,
        type: issue.code,
      }));

      return expressUtils.sendError(res, 400, errors);
    }

    // Store validated and transformed data
    if (!req.validated) {
      req.validated = {};
    }
    req.validated[source] = result.data;

    // Also update the original source for backward compatibility
    if (source === "body") {
      req.body = result.data;
    } else if (source === "params") {
      req.params = { ...req.params, ...result.data };
    } else if (source === "query") {
      req.query = result.data;
    }

    next();
  };
};

/**
 * Creates middleware that validates multiple sources at once.
 *
 * @param {Object} schemas - Object with schemas for each source
 * @param {z.ZodSchema} [schemas.body] - Schema for request body
 * @param {z.ZodSchema} [schemas.params] - Schema for URL params
 * @param {z.ZodSchema} [schemas.query] - Schema for query string
 * @returns {import('express').RequestHandler} Express middleware function
 *
 * @example
 * router.patch('/:id',
 *   validateAll({
 *     params: idParamSchema,
 *     body: updateWidgetSchema,
 *   }),
 *   controller.update
 * );
 */
const validateAll = (schemas) => {
  return (req, res, next) => {
    const allErrors = [];

    if (!req.validated) {
      req.validated = {};
    }

    for (const [source, schema] of Object.entries(schemas)) {
      if (!schema) continue;

      const result = schema.safeParse(req[source]);

      if (!result.success) {
        const errors = result.error.issues.map((issue) => ({
          path: issue.path.length ? `${source}.${issue.path.join(".")}` : source,
          message: issue.message,
          type: issue.code,
        }));
        allErrors.push(...errors);
      } else {
        req.validated[source] = result.data;

        // Update original source for backward compatibility
        if (source === "body") {
          req.body = result.data;
        } else if (source === "params") {
          req.params = { ...req.params, ...result.data };
        } else if (source === "query") {
          req.query = result.data;
        }
      }
    }

    if (allErrors.length > 0) {
      return expressUtils.sendError(res, 400, allErrors);
    }

    next();
  };
};

// ============================================================
// Common Param Schemas
// ============================================================

/**
 * Tenant ID param schema (used in most routes)
 */
const tenantIdParamSchema = z.object({
  tenantID: uuidSchema,
});

// ============================================================
// Exports
// ============================================================

const schemas = {
  uuidSchema,
  emailSchema,
  paginationSchema,
  dateStringSchema,
  nonEmptyStringSchema,
  optionalStringSchema,
  booleanSchema,
  optionalBooleanSchema,
  positiveIntSchema,
  nonNegativeIntSchema,
  cronScheduleSchema,
  tenantIdParamSchema,
};

module.exports = {
  schemas,
  validate,
  validateAll,
  // Re-export z for convenience
  z,
};
