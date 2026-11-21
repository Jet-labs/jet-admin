import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { CodeEditor } from '../../../packages/ui/src/components/code-editor';

const mockViews = [];
jest.mock('@codemirror/state', () => ({
  Compartment: class { of(value) { return value; } reconfigure(value) { return value; } },
  EditorState: { readOnly: { of: () => ({}) }, create: options => ({ ...options, doc: { toString: () => options.doc } }) },
}));
jest.mock('@codemirror/view', () => {
  class EditorView {
    static updateListener = { of: callback => ({ listener: callback }) };
    static theme = () => ({});
    constructor({ state }) { this.state = state; mockViews.push(this); }
    dispatch() {}
    destroy() {}
  }
  return { EditorView, keymap: { of: () => ({}) }, lineNumbers: () => ({}) };
});
jest.mock('@codemirror/commands', () => ({ defaultKeymap: [], historyKeymap: [], history: () => ({}) }));
jest.mock('@codemirror/autocomplete', () => ({ closeBracketsKeymap: [], closeBrackets: () => ({}), autocompletion: () => ({}) }));
jest.mock('@codemirror/language', () => ({ foldKeymap: [], foldGutter: () => ({}) }));
jest.mock('@codemirror/lang-javascript', () => ({ javascript: () => ({}) }));
jest.mock('@codemirror/lang-sql', () => ({ sql: () => ({}) }));
jest.mock('@codemirror/lang-json', () => ({ json: () => ({}) }));
jest.mock('@codemirror/lang-html', () => ({ html: () => ({}) }));
jest.mock('@codemirror/lang-css', () => ({ css: () => ({}) }));
jest.mock('@codemirror/theme-one-dark', () => ({ oneDark: {} }));
jest.mock('@jet-admin/expression-engine', () => ({ getCompletions: () => [], MODES: { JS_TEMPLATE: 'js', SAFE_PATH: 'safe' } }));
jest.mock('lucide-react', () => ({ Maximize2: 'icon', Minimize2: 'icon', AlertTriangle: 'icon', CheckCircle2: 'icon', Code: 'icon' }));
global.IS_REACT_ACT_ENVIRONMENT = true;
beforeEach(() => { global.document = { addEventListener: jest.fn(), removeEventListener: jest.fn() }; });
afterEach(() => { delete global.document; });

test('the mounted CodeMirror listener uses the latest callback after sibling form edits', async () => {
  const stale = jest.fn(), current = jest.fn();
  let renderer;
  await act(async () => {
    renderer = TestRenderer.create(React.createElement(CodeEditor, { value: 'original', onChange: stale }), {
      createNodeMock: () => ({ innerHTML: '' }),
    });
  });
  await act(async () => renderer.update(React.createElement(CodeEditor, { value: 'original', onChange: current })));
  const view = mockViews.at(-1);
  const listener = view.state.extensions.find(extension => extension.listener).listener;
  await act(async () => listener({ docChanged: true, state: { doc: { toString: () => 'edited' } } }));
  expect(stale).not.toHaveBeenCalled();
  expect(current).toHaveBeenCalledWith('edited');
  await act(async () => renderer.unmount());
});
