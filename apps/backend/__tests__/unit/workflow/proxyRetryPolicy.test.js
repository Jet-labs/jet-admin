const fs = require('fs');
const path = require('path');

// @temporalio/common rejects maximumAttempts <= 0 in proxyActivities options.
// This must be caught statically: an invalid policy only throws when the
// workflow sandbox schedules its first activity, which no unit graph test
// exercises (the graph helper stubs the Temporal API).
describe('Temporal proxy retry policies', () => {
  const workflowDir = path.resolve(__dirname, '../../../modules/workflow/temporal');
  const files = [];
  (function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.js')) files.push(full);
    }
  })(workflowDir);

  test('every maximumAttempts option is a positive integer', () => {
    const invalid = [];
    for (const file of files) {
      const source = fs.readFileSync(file, 'utf8');
      for (const match of source.matchAll(/maximumAttempts\s*:\s*(-?\d+(?:\.\d+)?)/g)) {
        if (Number(match[1]) <= 0) invalid.push(`${path.relative(workflowDir, file)}: ${match[0]}`);
      }
    }
    expect(invalid).toEqual([]);
  });
});
