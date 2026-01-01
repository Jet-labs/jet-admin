import {
  JetNumberControl,
  JetTextControl,
  JetSelectControl,
  JetCheckboxControl,
  JetCodePgsqlControl,
  JetCodeJavascriptControl,
  JetSuggestionControl,
  JetDynamicArgsControl,
  JetKeyValueArrayControl,
  JetKeyValueTypeArrayControl,
  JetKeyTypeArrayControl,
  JetStringArrayControl,
  JetFieldOperatorValueArrayControl,
  JetGroupLayout,
  JetVerticalLayout,
  JetTabLayout,
  JetRadioControl,
} from './renderers/index.js';

import {
  numberInputTester,
  textInputTester,
  selectInputTester,
  checkboxTester,
  codePgsqlTester,
  codeJavascriptTester,
  suggestionInputTester,
  dynamicArgsTester,
  keyValueArrayTester,
  keyValueTypeArrayTester,
  keyTypeArrayTester,
  stringArrayTester,
  fieldOperatorValueArrayTester,
  groupLayoutTester,
  verticalLayoutTester,
  tabRendererTester,
  radioInputTester,
} from './testers.js';

/**
 * Base renderers array - common renderers used across the application
 * Does not include specialized renderers like DynamicArgs or CodePgsql
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
  { tester: groupLayoutTester, renderer: JetGroupLayout },
  { tester: verticalLayoutTester, renderer: JetVerticalLayout },
];

/**
 * Full renderers array - includes all custom renderers
 * Use this when you need all custom renderers including specialized ones
 */
export const jetFormsRenderers = [
  { tester: suggestionInputTester, renderer: JetSuggestionControl },
  { tester: codePgsqlTester, renderer: JetCodePgsqlControl },
  { tester: codeJavascriptTester, renderer: JetCodeJavascriptControl },
  { tester: dynamicArgsTester, renderer: JetDynamicArgsControl },
  ...jetFormsBaseRenderers,
];
