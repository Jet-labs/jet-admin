/**
 * D-020 regression: datasource-package logs must not contain credentials.
 * The package logger is separate from the backend logger, so it needs its own
 * redaction coverage.
 */
jest.resetModules();
const { redact, redactString } = require('@jet-admin/datasources-logic');

describe('datasource package log redaction', () => {
  test('redacts nested connection credentials', () => {
    const safe = redact({
      datasourceTitle: 'FIX_PG',
      datasourceOptions: {
        connectionOption: 'connectionDetails',
        connectionDetails: {
          host: 'postgres',
          database: 'qa_fix',
          user: 'postgres',
          password: 'super-secret-password',
        },
        connectionString: 'postgresql://postgres:super-secret-password@postgres:5432/qa_fix',
        bearerToken: 'abc123',
      },
    });
    const serialized = JSON.stringify(safe);
    expect(serialized).not.toContain('super-secret-password');
    expect(serialized).not.toContain('abc123');
    expect(safe.datasourceOptions.connectionDetails.password).toBe('[REDACTED]');
    expect(safe.datasourceOptions.connectionDetails.host).toBe('postgres');
  });

  test('redacts credentials embedded in free-form strings', () => {
    expect(redactString('postgresql://user:pw@db:5432/app')).toBe('postgresql://[REDACTED]@db:5432/app');
    expect(redactString('password=hunter2 token=abc')).not.toContain('hunter2');
  });
});
