import {
  JetNumberControl,
  JetTextControl,
  JetSelectControl,
  JetCheckboxControl,
  JetCodeEditorControl,
  JetSuggestionControl,
  JetCustomDynamicKeyValueInputRenderer,
  JetKeyValueArrayControl,
  JetKeyValueTypeArrayControl,
  JetKeyTypeArrayControl,
  JetStringArrayControl,
  JetFieldOperatorValueArrayControl,
  JetGenericObjectArrayControl,
  JetGroupLayout,
  JetVerticalLayout,
  JetTabLayout,
  JetRadioControl,
  JetHorizontalLayout,
} from './renderers/index.js';

import {
  numberInputTester,
  textInputTester,
  selectInputTester,
  checkboxTester,
  codeEditorTester,
  suggestionInputTester,
  dynamicKeyValueInputTester,
  keyValueArrayTester,
  keyValueTypeArrayTester,
  keyTypeArrayTester,
  stringArrayTester,
  fieldOperatorValueArrayTester,
  genericObjectArrayTester,
  groupLayoutTester,
  verticalLayoutTester,
  tabRendererTester,
  radioInputTester,
  horizontalLayoutTester,
} from './testers.js';

/**
 * Base renderers array - common renderers used across the application
 * Does not include specialized renderers like DynamicInputs or CodePgsql
 */
export const jetFormsBaseRenderers = [
  { tester: tabRendererTester, renderer: JetTabLayout },
  { tester: numberInputTester, renderer: JetNumberControl },
  { tester: textInputTester, renderer: JetTextControl },
  { tester: selectInputTester, renderer: JetSelectControl },
  { tester: radioInputTester, renderer: JetRadioControl },
  { tester: checkboxTester, renderer: JetCheckboxControl },
  { tester: keyValueArrayTester, renderer: JetKeyValueArrayControl },
  { tester: keyValueTypeArrayTester, renderer: JetKeyValueTypeArrayControl },
  { tester: keyTypeArrayTester, renderer: JetKeyTypeArrayControl },
  { tester: stringArrayTester, renderer: JetStringArrayControl },
  { tester: fieldOperatorValueArrayTester, renderer: JetFieldOperatorValueArrayControl },
  { tester: genericObjectArrayTester, renderer: JetGenericObjectArrayControl },
  { tester: groupLayoutTester, renderer: JetGroupLayout },
  { tester: verticalLayoutTester, renderer: JetVerticalLayout },
  { tester: horizontalLayoutTester, renderer: JetHorizontalLayout },
];

/**
 * Full renderers array - includes all custom renderers
 * Use this when you need all custom renderers including specialized ones
 */
export const jetFormsRenderers = [
  { tester: suggestionInputTester, renderer: JetSuggestionControl },
  { tester: codeEditorTester, renderer: JetCodeEditorControl },
  { tester: dynamicKeyValueInputTester, renderer: JetCustomDynamicKeyValueInputRenderer },
  ...jetFormsBaseRenderers,
];
