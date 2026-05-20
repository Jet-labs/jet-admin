// Custom Horizontal Layout Renderer
import React from 'react';
import PropTypes from 'prop-types';
import { JsonFormsDispatch } from '@jsonforms/react';

export const CustomHorizontalLayout = (props) => {
  const { uischema, schema, path, visible, enabled, renderers, cells } = props;
  const elements = uischema.elements || [];

  if (!visible) {
    return null;
  }

  return (
    <div className="flex flex-row gap-2">
      {elements.map((element, index) => (
        <div key={index} className="flex-1 min-w-0">
          <JsonFormsDispatch
            uischema={element}
            schema={schema}
            path={path}
            enabled={enabled}
            renderers={renderers}
            cells={cells}
          />
        </div>
      ))}
    </div>
  );
};

CustomHorizontalLayout.propTypes = {
  uischema: PropTypes.object.isRequired,
  schema: PropTypes.object.isRequired,
  path: PropTypes.string.isRequired,
  visible: PropTypes.bool.isRequired,
  enabled: PropTypes.bool.isRequired,
  renderers: PropTypes.arrayOf(PropTypes.object).isRequired,
  cells: PropTypes.arrayOf(PropTypes.object),
};
