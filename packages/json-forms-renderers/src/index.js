// Unified JSON Forms Custom Renderers for Jet Admin
// This package provides consistent styling across the entire application

// Export all renderers
export {
  // Control Renderers
  CustomNumberInput,
  CustomTextInput,
  CustomSelectInput,
  CustomCheckboxInput,
  CustomCodeEditorControl,
  CustomCodeEditorControl as CustomCodePgsqlControl,
  CustomCodeEditorControl as CustomCodeJavascriptControl,
  CustomSuggestionInput,
  DynamicArgsControl,
  CustomRadioInput,
  
  // Array Renderers
  CustomKeyValueArrayRenderer,
  CustomKeyValueTypeArrayRenderer,
  CustomKeyTypeArrayRenderer,
  CustomStringArrayRenderer,
  CustomFieldOperatorValueArrayRenderer,
  CustomGenericObjectArrayRenderer,
  
  // Layout Renderers
  CustomGroupLayout,
  CustomVerticalLayout,
  CustomTabRenderer,
} from './renderers/index.js';

// Export HOC wrapped components
export {
  // Control Components
  JetNumberControl,
  JetTextControl,
  JetSelectControl,
  JetCheckboxControl,
  JetCodeEditorControl,
  JetCodeEditorControl as JetCodePgsqlControl,
  JetCodeEditorControl as JetCodeJavascriptControl,
  JetSuggestionControl,
  JetDynamicArgsControl,
  JetRadioControl,
  
  // Array Components
  JetKeyValueArrayControl,
  JetKeyValueTypeArrayControl,
  JetKeyTypeArrayControl,
  JetStringArrayControl,
  JetFieldOperatorValueArrayControl,
  JetGenericObjectArrayControl,
  
  // Layout Components
  JetGroupLayout,
  JetVerticalLayout,
  JetTabLayout,
} from './renderers/index.js';

// Export testers
export {
  numberInputTester,
  textInputTester,
  selectInputTester,
  checkboxTester,
  codeEditorTester,
  codeEditorTester as codePgsqlTester,
  codeEditorTester as codeJavascriptTester,
  suggestionInputTester,
  dynamicArgsTester,
  radioInputTester,
  keyValueArrayTester,
  keyValueTypeArrayTester,
  keyTypeArrayTester,
  stringArrayTester,
  fieldOperatorValueArrayTester,
  genericObjectArrayTester,
  groupLayoutTester,
  verticalLayoutTester,
  tabRendererTester,
} from './testers.js';

// Export the complete renderers array
export { jetFormsRenderers, jetFormsBaseRenderers } from './jetFormsRenderers.js';
