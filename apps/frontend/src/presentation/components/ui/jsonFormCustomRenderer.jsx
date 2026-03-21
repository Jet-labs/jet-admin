// Re-export from unified @jet-admin/json-forms-renderers package
// This file is kept for backward compatibility
// All custom JSON Forms renderers are now maintained in the shared package

export { jetFormsRenderers as customJSONFormRenderers } from '@jet-admin/json-forms-renderers';

// Re-export individual components if needed elsewhere
export {
  // Control Renderers
  CustomNumberInput,
  CustomTextInput,
  CustomSelectInput,
  CustomCheckboxInput,
  CustomCodePgsqlControl,
  CustomSuggestionInput,
  DynamicArgsControl,

  // Array Renderers
  CustomKeyValueArrayRenderer,
  CustomKeyValueTypeArrayRenderer,
  CustomKeyTypeArrayRenderer,

  // Layout Renderers
  CustomGroupLayout,
  CustomVerticalLayout,
  CustomTabRenderer,

  // HOC Wrapped Components
  JetNumberControl,
  JetTextControl,
  JetSelectControl,
  JetCheckboxControl,
  JetCodeEditorControl,
  JetSuggestionControl,
  JetDynamicArgsControl,
  JetKeyValueArrayControl,
  JetKeyValueTypeArrayControl,
  JetKeyTypeArrayControl,
  JetGroupLayout,
  JetVerticalLayout,
  JetTabLayout,

  // Testers
  numberInputTester,
  textInputTester,
  selectInputTester,
  checkboxTester,
  codePgsqlTester,
  suggestionInputTester,
  dynamicArgsTester,
  keyValueArrayTester,
  keyValueTypeArrayTester,
  keyTypeArrayTester,
  groupLayoutTester,
  verticalLayoutTester,
  tabRendererTester,

  // Full renderers array
  jetFormsRenderers,
  jetFormsBaseRenderers,
} from '@jet-admin/json-forms-renderers';

// Legacy aliases for backward compatibility with existing code
export {
  JetNumberControl as MyCustomNumberInput,
  JetTextControl as MyCustomTextInput,
  JetSelectControl as MyCustomSelectInput,
  JetCheckboxControl as MyCustomCheckboxInput,
  JetCodePgsqlControl as MyCustomCodePgsqlControl,
  JetGroupLayout as MyCustomGroupLayout,
  JetKeyValueArrayControl as MyCustomKeyValueArrayControl,
  JetKeyValueTypeArrayControl as MyCustomKeyValueTypeArrayControl,
  JetKeyTypeArrayControl as MyCustomKeyTypeArrayControl,
  JetTabLayout as MyCustomTabRenderer,
  JetSuggestionControl as MyCustomSuggestionInput,
} from '@jet-admin/json-forms-renderers';
