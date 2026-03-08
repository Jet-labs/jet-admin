const {
  BLOCKED_PATH_SEGMENTS,
  getValueByPath,
  tokenizeObjectPath,
} = require('../../../utils/objectPath.util');

describe('objectPath.util', () => {
  it('tokenizes dot and bracket notation paths', () => {
    expect(
      tokenizeObjectPath('ctx.items[0]["user-name"]', { allowedRoots: ['ctx'] })
    ).toEqual(['items', 0, 'user-name']);
  });

  it('reads nested values with optional root prefixes', () => {
    const value = getValueByPath(
      {
        items: [{ profile: { name: 'Ada' } }],
      },
      'ctx.items[0].profile.name',
      { allowedRoots: ['ctx'] }
    );

    expect(value).toBe('Ada');
  });

  it('returns undefined for malformed expressions instead of evaluating them', () => {
    const value = getValueByPath({}, 'constructor.constructor("return process")()');

    expect(value).toBeUndefined();
  });

  it('blocks access to unsafe path segments', () => {
    for (const segment of BLOCKED_PATH_SEGMENTS) {
      expect(getValueByPath({ [segment]: 'nope' }, segment)).toBeUndefined();
    }
  });
});