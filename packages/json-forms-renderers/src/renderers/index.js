// Renderers Index - Export all renderers and HOC wrapped components
import {
  withJsonFormsControlProps,
  withJsonFormsLayoutProps,
} from '@jsonforms/react';

// Import all raw renderers
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
import { CustomFileUploadInput } from './CustomFileUploadInput.jsx';
import { CustomGoogleOAuthButtonControl } from './CustomGoogleOAuthButtonControl.jsx';
import { CustomSearchSelectInput } from './CustomSearchSelectInput.jsx';

// Export raw renderers
export {
  CustomNumberInput,
  CustomTextInput,
  CustomSelectInput,
  CustomCheckboxInput,
  CustomCodeEditorControl,
  CustomSuggestionInput,
  CustomDynamicKeyValueInputRenderer,
  CustomKeyValueArrayRenderer,
  CustomKeyValueTypeArrayRenderer,
  CustomKeyTypeArrayRenderer,
  CustomStringArrayRenderer,
  CustomFieldOperatorValueArrayRenderer,
  CustomGenericObjectArrayRenderer,
  CustomGroupLayout,
  CustomRadioInput,
  CustomVerticalLayout,
  CustomTabRenderer,
  CustomHorizontalLayout,
  CustomFileUploadInput,
  CustomGoogleOAuthButtonControl,
  CustomSearchSelectInput,
};

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
export const JetFileUploadControl = withJsonFormsControlProps(CustomFileUploadInput);
export const JetSearchSelectControl = withJsonFormsControlProps(CustomSearchSelectInput);

// Note: CustomGoogleOAuthButtonControl is already wired to OAuthContext internally,
// but we wrap it in withJsonFormsControlProps here to seamlessly integrate into
// the JsonForms rendering pipeline, receiving uischema, schema, and path props.
export const JetGoogleOAuthControl = withJsonFormsControlProps(CustomGoogleOAuthButtonControl);


