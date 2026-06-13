// Custom Tab Renderer (Categorization)
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { JsonFormsDispatch } from '@jsonforms/react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@jet-admin/ui';

export const CustomTabRenderer = (props) => {
  const { uischema, schema, path, enabled, renderers, cells } = props;
  const categories = uischema.elements || [];

  const [activeTab, setActiveTab] = useState("0");

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <div className="custom-tabs-container bg-background  !rounded-md">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col">
        {/* Tab Headers */}
        <TabsList className="h-auto">
          {categories.map((category, index) => (
            <TabsTrigger
              key={category.label || `tab-${index}`}
              value={String(index)}
            >
              {category.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Tab Content */}
        <div className="p-2 rounded-md bg-background">
          {categories.map((category, index) => (
            <TabsContent
              key={category.label || `tab-content-${index}`}
              value={String(index)}
              className="mt-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none flex flex-col space-y-2"
            >
              {category.elements.map((element, i) => (
                <JsonFormsDispatch
                  key={`${category.label}-${i}`}
                  uischema={element}
                  schema={schema}
                  path={path}
                  enabled={enabled}
                  renderers={renderers}
                  cells={cells}
                />
              ))}
            </TabsContent>
          ))}
        </div>
      </Tabs>
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
