// Custom Tab Renderer (Categorization)
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { JsonFormsDispatch } from '@jsonforms/react';

export const CustomTabRenderer = (props) => {
  const { uischema, schema, path, enabled, renderers, cells } = props;
  const categories = uischema.elements || [];

  const [activeTab, setActiveTab] = useState(0);

  if (!categories || categories.length === 0) {
    return null;
  }

  const activeCategory = categories[activeTab];

  return (
    <div className="custom-tabs-container">
      {/* Tab Headers */}
      <div className="flex border-slate-300">
        {categories.map((category, index) => (
          <button
            key={category.label || `tab-${index}`}
            className={`px-4 mr-2 py-2 text-sm font-medium rounded ${
              index === activeTab
                ? "text-[#646cff] border-slate-200"
                : "text-slate-700"
            } focus:outline-none bg-white`}
            onClick={() => setActiveTab(index)}
            type="button"
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-3 border mt-3 border-slate-200 rounded bg-white flex flex-col gap-2">
        {activeCategory?.elements.map((element, i) => (
          <JsonFormsDispatch
            key={i}
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

CustomTabRenderer.propTypes = {
  uischema: PropTypes.shape({
    type: PropTypes.string.isRequired,
    elements: PropTypes.arrayOf(PropTypes.object).isRequired,
  }).isRequired,
  schema: PropTypes.object.isRequired,
  path: PropTypes.string.isRequired,
  enabled: PropTypes.bool.isRequired,
  renderers: PropTypes.arrayOf(PropTypes.object).isRequired,
  cells: PropTypes.arrayOf(PropTypes.object),
};
