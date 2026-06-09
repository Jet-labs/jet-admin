import os
import re

def replace_in_file(filepath, replacements):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        new_content = content
        for old, new in replacements:
            new_content = new_content.replace(old, new)

        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated {filepath}")
    except Exception as e:
        print(f"Error processing {filepath}: {e}")

# Fix 1: Configurator Save Buttons
configurator_save_pattern_wrong = 'className="px-3 py-1.5 text-sm text-foreground bg-primary rounded-sm hover:bg-primary/90 focus:ring-4 focus:outline-none focus:ring-primary/30"'
configurator_save_pattern_correct = 'className="w-full"'

for node_file in [
    'packages/workflow-nodes/src/nodes/delayNode.jsx',
    'packages/workflow-nodes/src/nodes/endNode.jsx',
    'packages/workflow-nodes/src/nodes/loopNode.jsx'
]:
    replace_in_file(node_file, [(configurator_save_pattern_wrong, configurator_save_pattern_correct)])


# Fix 2: Text on Primary Background
# In StatusIndicator and similar places where text-background was incorrectly used on primary
for f in [
    'packages/workflow-nodes/src/StatusIndicator.jsx',
    'packages/workflow-nodes/src/nodes/startNode.jsx',
    'packages/workflow-nodes/src/nodes/endNode.jsx',
    'packages/workflow-nodes/src/nodes/dataQueryNode.jsx',
    'packages/workflow-nodes/src/nodes/loopNode.jsx',
    'packages/workflow-nodes/src/nodes/javascriptNode.jsx',
    'apps/backend/public/monitor.html'
]:
    replace_in_file(f, [('text-background', 'text-foreground')])

# Fix 3: Incomplete Token Replacements (blue colors)
# We missed text-blue-600, bg-blue-950, etc. Let's fix them in all relevant files.
blue_replacements = [
    ('text-blue-600', 'text-primary'),
    ('bg-blue-950', 'bg-primary/10'),
    ('border-blue-300', 'border-primary/30'),
]

def scan_and_replace(directory):
    for root, _, files in os.walk(directory):
        if 'node_modules' in root or '.git' in root or 'dist' in root:
            continue
        for file in files:
            if not file.endswith(('.jsx', '.js', '.tsx', '.ts', '.html')):
                continue
            filepath = os.path.join(root, file)
            replace_in_file(filepath, blue_replacements)

scan_and_replace('.')
