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
export { CustomCodeEditorControl } from './CustomCodeEditorControl.jsx';
export { CustomSuggestionInput } from './CustomSuggestionInput.jsx';
export { CustomDynamicKeyValueInputRenderer } from './CustomDynamicKeyValueInputRenderer.jsx';
export { CustomKeyValueArrayRenderer } from './CustomKeyValueArrayRenderer.jsx';
export { CustomKeyValueTypeArrayRenderer } from './CustomKeyValueTypeArrayRenderer.jsx';
export { CustomKeyTypeArrayRenderer } from './CustomKeyTypeArrayRenderer.jsx';
export { CustomStringArrayRenderer } from './CustomStringArrayRenderer.jsx';
export { CustomFieldOperatorValueArrayRenderer } from './CustomFieldOperatorValueArrayRenderer.jsx';
export { CustomGenericObjectArrayRenderer } from './CustomGenericObjectArrayRenderer.jsx';
export { CustomGroupLayout } from './CustomGroupLayout.jsx';
export { CustomRadioInput } from './CustomRadioInput.jsx';
export { CustomVerticalLayout } from './CustomVerticalLayout.jsx';
export { CustomTabRenderer } from './CustomTabRenderer.jsx';
export { CustomHorizontalLayout } from './CustomHorizontalLayout.jsx';

// Import for HOC wrapping
import { CustomNumberInput } from './CustomNumberInput.jsx';
import { CustomTextInput } from './CustomTextInput.jsx';
import { CustomSelectInput } from './CustomSelectInput.jsx';
import { CustomCheckboxInput } from './CustomCheckboxInput.jsx';
import { CustomCodeEditorControl } from './CustomCodeEditorControl.jsx';
import { CustomSuggestionInput } from './CustomSuggestionInput.jsx';
import { CustomDynamicKeyValueInputRenderer } from './CustomDynamicKeyValueInputRenderer.jsx';
import { CustomKeyValueArrayRenderer } from './CustomKeyValueArrayRenderer.jsx';
import { CustomKeyValueTypeArrayRenderer } from './CustomKeyValueTypeArrayRenderer.jsx';
import { CustomKeyTypeArrayRenderer } from './CustomKeyTypeArrayRenderer.jsx';
import { CustomStringArrayRenderer } from './CustomStringArrayRenderer.jsx';
import { CustomFieldOperatorValueArrayRenderer } from './CustomFieldOperatorValueArrayRenderer.jsx';
import { CustomGenericObjectArrayRenderer } from './CustomGenericObjectArrayRenderer.jsx';
import { CustomGroupLayout } from './CustomGroupLayout.jsx';
import { CustomRadioInput } from './CustomRadioInput.jsx';
import { CustomVerticalLayout } from './CustomVerticalLayout.jsx';
import { CustomTabRenderer } from './CustomTabRenderer.jsx';
import { CustomHorizontalLayout } from './CustomHorizontalLayout.jsx';

// Export HOC wrapped components with Jet prefix for uniformity
export const JetNumberControl = withJsonFormsControlProps(CustomNumberInput);
export const JetTextControl = withJsonFormsControlProps(CustomTextInput);
export const JetSelectControl = withJsonFormsControlProps(CustomSelectInput);
export const JetCheckboxControl = withJsonFormsControlProps(CustomCheckboxInput);
export const JetCodeEditorControl = withJsonFormsControlProps(CustomCodeEditorControl);
export const JetSuggestionControl = withJsonFormsControlProps(CustomSuggestionInput);
export const JetCustomDynamicKeyValueInputRenderer = withJsonFormsControlProps(CustomDynamicKeyValueInputRenderer);
export const JetKeyValueArrayControl = withJsonFormsControlProps(CustomKeyValueArrayRenderer);
export const JetKeyValueTypeArrayControl = withJsonFormsControlProps(CustomKeyValueTypeArrayRenderer);
export const JetKeyTypeArrayControl = withJsonFormsControlProps(CustomKeyTypeArrayRenderer);
export const JetStringArrayControl = withJsonFormsControlProps(CustomStringArrayRenderer);
export const JetFieldOperatorValueArrayControl = withJsonFormsControlProps(CustomFieldOperatorValueArrayRenderer);
export const JetGenericObjectArrayControl = withJsonFormsControlProps(CustomGenericObjectArrayRenderer);
export const JetGroupLayout = withJsonFormsLayoutProps(CustomGroupLayout);
export const JetRadioControl = withJsonFormsControlProps(CustomRadioInput);
export const JetVerticalLayout = withJsonFormsLayoutProps(CustomVerticalLayout);
export const JetTabLayout = withJsonFormsLayoutProps(CustomTabRenderer);
export const JetHorizontalLayout = withJsonFormsLayoutProps(CustomHorizontalLayout);
