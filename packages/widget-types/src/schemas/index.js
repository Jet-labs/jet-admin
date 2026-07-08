/**
 * Widget Config Schemas
 *
 * Authoritative JSON Schema definitions for each widget type's widgetConfig.
 * These are the exact schemas used by the form builder (jsonforms) and
 * exposed to the AI agent via the MCP schema tools.
 *
 * Keyed by widgetType value (e.g. 'table', 'vega-lite').
 */

import vegaLiteSchema from './vega-lite.schema.json' assert { type: 'json' };
import vegaSchema from './vega.schema.json' assert { type: 'json' };
import tableSchema from './table.schema.json' assert { type: 'json' };
import buttonSchema from './button.schema.json' assert { type: 'json' };
import textSchema from './text.schema.json' assert { type: 'json' };
import statSchema from './stat.schema.json' assert { type: 'json' };
import alertSchema from './alert.schema.json' assert { type: 'json' };
import formSchema from './form.schema.json' assert { type: 'json' };
import imageSchema from './image.schema.json' assert { type: 'json' };
import iframeSchema from './iframe.schema.json' assert { type: 'json' };
import datePickerSchema from './date-picker.schema.json' assert { type: 'json' };
import dateRangePickerSchema from './date-range-picker.schema.json' assert { type: 'json' };
import htmlSchema from './html.schema.json' assert { type: 'json' };

/**
 * Map of widgetType → full schema descriptor.
 * Each entry has: widgetType, description, schema (JSON Schema), events (supported event names).
 *
 * @type {Record<string, { widgetType: string, description: string, schema: object, events: string[] }>}
 */
export const WIDGET_CONFIG_SCHEMAS = {
  'vega-lite': vegaLiteSchema,
  'vega': vegaSchema,
  'table': tableSchema,
  'button': buttonSchema,
  'text': textSchema,
  'stat': statSchema,
  'alert': alertSchema,
  'form': formSchema,
  'image': imageSchema,
  'iframe': iframeSchema,
  'date-picker': datePickerSchema,
  'date-range-picker': dateRangePickerSchema,
  'html': htmlSchema,
};
