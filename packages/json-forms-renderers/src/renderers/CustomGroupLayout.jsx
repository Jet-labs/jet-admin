// Custom Group Layout Renderer
import React from 'react';
import PropTypes from 'prop-types';
import { JsonFormsDispatch } from '@jsonforms/react';

export const CustomGroupLayout = (props) => {
  const { uischema, schema, path, visible, enabled, renderers, cells } = props;
  const elements = uischema.elements || [];

  const customClass = uischema.options?.customClass || "";

  if (!visible) {
    return null;
  }

  return (
    <div className={`rounded p-2 bg-background ${customClass}`}>
      {uischema.label && (
        <h3 className="text-xs font-medium text-muted-foreground mb-2">
          {uischema.label}
        </h3>
      )}
      <div className="flex flex-col gap-2">
        {elements.map((element, index) => (
          <JsonFormsDispatch
            key={element.scope || index}
            uischema={element}
            schema={schema}
            path={path}
            enabled={enabled}
            renderers={renderers}
            cells={cells}
          />
        ))}
      </div>
    </div>
  );
};

CustomGroupLayout.propTypes = {
  uischema: PropTypes.object.isRequired,
  schema: PropTypes.object.isRequired,
  path: PropTypes.string.isRequired,
  visible: PropTypes.bool.isRequired,
  enabled: PropTypes.bool.isRequired,
  renderers: PropTypes.arrayOf(PropTypes.object).isRequired,
  cells: PropTypes.arrayOf(PropTypes.object),
};
