/**
 * JSON Schema / JSON Forms structural validator — pure, no network.
 * The backend uses Ajv + ajv-formats (strict:false, allErrors:true) at submit
 * time for dataCollection/approval. This catches the common authoring mistakes
 * before a workflow is built or a form is submitted.
 */
const JSON_TYPES = ['object', 'array', 'string', 'number', 'integer', 'boolean', 'null'];

function err(path, code, message, fix, suggestion) { return { path, code, message, fix, suggestion }; }
function warn(path, code, message, fix) { return { path, code, message, fix }; }
function isObject(v) { return v !== null && typeof v === 'object' && !Array.isArray(v); }

export function validateFormSchema({ schema, uischema } = {}) {
  const errors = [];
  const warnings = [];
  if (!isObject(schema)) {
    return { valid: false, errors: [err('schema', 'SCHEMA_REQUIRED', 'schema must be a JSON Schema object.', 'Use {type:"object",properties:{...},required:[...]}.', 'describe_node_type')], warnings, summary: null };
  }
  if (schema.type !== 'object') errors.push(err('schema.type', 'SCHEMA_TYPE', 'Form schema must have type "object".', 'Use {"type":"object"}.', 'describe_node_type'));
  if (!isObject(schema.properties) || Object.keys(schema.properties).length === 0) {
    errors.push(err('schema.properties', 'PROPERTIES_REQUIRED', 'Form schema needs a non-empty properties object.', 'Add {name:{type:"string"}}.', 'describe_node_type'));
  } else {
    for (const [key, prop] of Object.entries(schema.properties)) {
      const p = `schema.properties.${key}`;
      if (!isObject(prop)) { errors.push(err(p, 'PROPERTY_NOT_OBJECT', 'Property schema must be an object.', 'Use {type:"string"}.', 'describe_node_type')); continue; }
      if (prop.type === undefined && !prop.oneOf && !prop.anyOf && !prop.$ref) errors.push(err(p, 'PROPERTY_TYPE_MISSING', `${key} has no type.`, 'Add type:"string" (or number/integer/boolean/object/array).', 'describe_node_type'));
      else if (prop.type !== undefined && !JSON_TYPES.includes(prop.type)) errors.push(err(`${p}.type`, 'PROPERTY_TYPE_INVALID', `${key}.type ${JSON.stringify(prop.type)} is not a JSON Schema type.`, `Use one of: ${JSON_TYPES.join(', ')}.`, 'describe_node_type'));
      if (prop.enum !== undefined && (!Array.isArray(prop.enum) || prop.enum.length === 0)) errors.push(err(`${p}.enum`, 'ENUM_EMPTY', `${key}.enum must be a non-empty array.`, 'Add at least one value.', 'describe_node_type'));
      if (prop.type === 'array' && prop.items === undefined) warnings.push(warn(`${p}.items`, 'ARRAY_ITEMS_MISSING', `${key} is an array without items; arbitrary values will pass.`, 'Add items:{type:"string"}.'));
      if (prop.type === 'object' && prop.properties === undefined) warnings.push(warn(`${p}.properties`, 'OBJECT_PROPS_MISSING', `${key} is an object without properties; arbitrary values will pass.`, 'Add properties.'));
      if (prop.required !== undefined && schema.type === 'object' && false) { /* nested required handled below */ }
    }
  }
  if (schema.required !== undefined) {
    if (!Array.isArray(schema.required)) errors.push(err('schema.required', 'REQUIRED_NOT_ARRAY', 'required must be an array of property names.', 'Use ["name"].', 'describe_node_type'));
    else {
      for (const key of schema.required) {
        if (typeof key !== 'string') errors.push(err('schema.required', 'REQUIRED_NOT_STRING', 'required entries must be strings.', 'Use ["name"].', 'describe_node_type'));
        else if (!schema.properties || !(key in schema.properties)) errors.push(err(`schema.required`, 'REQUIRED_UNKNOWN_PROPERTY', `required lists "${key}" but it is not in properties.`, 'Add the property or remove it from required.', 'describe_node_type'));
      }
    }
  }
  if (schema.additionalProperties === false && schema.properties) warnings.push(warn('schema.additionalProperties', 'STRICT_SCHEMA', 'additionalProperties:false rejects any extra submitted field.', 'Consider true unless you want strict rejection.'));

  if (uischema !== undefined) validateUISchema(uischema, schema, errors, warnings);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    summary: {
      propertyCount: Object.keys(schema.properties || {}).length,
      requiredCount: Array.isArray(schema.required) ? schema.required.length : 0,
      hasUISchema: uischema !== undefined,
    },
  };
}

function validateUISchema(ui, schema, errors, warnings) {
  if (!isObject(ui)) { errors.push(err('uischema', 'UISCHEMA_NOT_OBJECT', 'uischema must be an object.', 'Use {type:"VerticalLayout",elements:[...]}.', 'describe_node_type')); return; }
  if (ui.type === 'Control' && typeof ui.scope === 'string') checkScope(ui.scope, schema, errors);
  if (ui.elements !== undefined && !Array.isArray(ui.elements)) errors.push(err('uischema.elements', 'UISCHEMA_ELEMENTS_INVALID', 'uischema.elements must be an array.', 'Use [].', 'describe_node_type'));
  for (const el of ui.elements || []) {
    if (!isObject(el)) { warnings.push(warn('uischema.elements', 'UISCHEMA_ELEMENT_INVALID', 'UISchema element is not an object.', 'Use {type:"Control",scope:"#/properties/x"}.')); continue; }
    if (el.type === 'Control') checkScope(el.scope, schema, errors);
    if (el.elements) validateUISchema(el, schema, errors, warnings);
  }
}

function checkScope(scope, schema, errors) {
  if (typeof scope !== 'string') { errors.push(err('uischema.scope', 'SCOPE_INVALID', 'Control scope must be a string.', 'Use "#/properties/name".', 'describe_node_type')); return; }
  const m = /^#\/properties\/([^/]+)$/.exec(scope);
  if (!m) { errors.push(err('uischema.scope', 'SCOPE_FORMAT', `Unsupported scope ${scope}.`, 'Use "#/properties/<key>".', 'describe_node_type')); return; }
  if (!schema.properties || !(m[1] in schema.properties)) errors.push(err('uischema.scope', 'SCOPE_UNKNOWN_PROPERTY', `Scope ${scope} references a property that does not exist.`, 'Add the property or fix the scope.', 'describe_node_type'));
}
