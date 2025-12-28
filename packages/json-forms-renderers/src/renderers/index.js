// Renderers Index - Export all renderers and HOC wrapped components
import {
  withJsonFormsControlProps,
  withJsonFormsLayoutProps,
} from '@jsonforms/react';

// Import all raw renderers
export { CustomNumberInput } from './CustomNumberInput.jsx';
export { CustomTextInput } from './CustomTextInput.jsx';
export { CustomSelectInput } from './CustomSelectInput.jsx';
export { CustomCheckboxInput } from './CustomCheckboxInput.jsx';
export { CustomCodePgsqlControl } from './CustomCodePgsqlControl.jsx';
export { CustomCodeJavascriptControl } from './CustomCodeJavascriptControl.jsx';
export { CustomSuggestionInput } from './CustomSuggestionInput.jsx';
export { DynamicArgsControl } from './DynamicArgsControl.jsx';
export { CustomKeyValueArrayRenderer } from './CustomKeyValueArrayRenderer.jsx';
export { CustomKeyValueTypeArrayRenderer } from './CustomKeyValueTypeArrayRenderer.jsx';
export { CustomKeyTypeArrayRenderer } from './CustomKeyTypeArrayRenderer.jsx';
export { CustomGroupLayout } from './CustomGroupLayout.jsx';
export { CustomVerticalLayout } from './CustomVerticalLayout.jsx';
export { CustomTabRenderer } from './CustomTabRenderer.jsx';

// Import for HOC wrapping
import { CustomNumberInput } from './CustomNumberInput.jsx';
import { CustomTextInput } from './CustomTextInput.jsx';
import { CustomSelectInput } from './CustomSelectInput.jsx';
import { CustomCheckboxInput } from './CustomCheckboxInput.jsx';
import { CustomCodePgsqlControl } from './CustomCodePgsqlControl.jsx';
import { CustomCodeJavascriptControl } from './CustomCodeJavascriptControl.jsx';
import { CustomSuggestionInput } from './CustomSuggestionInput.jsx';
import { DynamicArgsControl } from './DynamicArgsControl.jsx';
import { CustomKeyValueArrayRenderer } from './CustomKeyValueArrayRenderer.jsx';
import { CustomKeyValueTypeArrayRenderer } from './CustomKeyValueTypeArrayRenderer.jsx';
import { CustomKeyTypeArrayRenderer } from './CustomKeyTypeArrayRenderer.jsx';
import { CustomGroupLayout } from './CustomGroupLayout.jsx';
import { CustomVerticalLayout } from './CustomVerticalLayout.jsx';
import { CustomTabRenderer } from './CustomTabRenderer.jsx';

// Export HOC wrapped components with Jet prefix for uniformity
export const JetNumberControl = withJsonFormsControlProps(CustomNumberInput);
export const JetTextControl = withJsonFormsControlProps(CustomTextInput);
export const JetSelectControl = withJsonFormsControlProps(CustomSelectInput);
export const JetCheckboxControl = withJsonFormsControlProps(CustomCheckboxInput);
export const JetCodePgsqlControl = withJsonFormsControlProps(CustomCodePgsqlControl);
export const JetCodeJavascriptControl = withJsonFormsControlProps(CustomCodeJavascriptControl);
export const JetSuggestionControl = withJsonFormsControlProps(CustomSuggestionInput);
export const JetDynamicArgsControl = withJsonFormsControlProps(DynamicArgsControl);
export const JetKeyValueArrayControl = withJsonFormsControlProps(CustomKeyValueArrayRenderer);
export const JetKeyValueTypeArrayControl = withJsonFormsControlProps(CustomKeyValueTypeArrayRenderer);
export const JetKeyTypeArrayControl = withJsonFormsControlProps(CustomKeyTypeArrayRenderer);
export const JetGroupLayout = withJsonFormsLayoutProps(CustomGroupLayout);
export const JetVerticalLayout = withJsonFormsLayoutProps(CustomVerticalLayout);
export const JetTabLayout = withJsonFormsLayoutProps(CustomTabRenderer);
