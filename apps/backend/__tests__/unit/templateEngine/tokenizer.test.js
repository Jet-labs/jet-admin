const {
  BLOCKED_PATH_SEGMENTS,
  getValueByPath,
  tokenizeObjectPath,
} = require('../../../utils/templateEngine/tokenizer');

describe('templateEngine tokenizer', () => {
  it('tokenizes dot and bracket notation paths', () => {
    expect(
      tokenizeObjectPath('ctx.items[0]["user-name"]', { allowedRoots: ['ctx'] })
    ).toEqual(['items', 0, 'user-name']);
  });

  it('reads nested values when the required root prefix is provided', () => {
    const value = getValueByPath(
      {
        items: [{ profile: { name: 'Ada' } }],
      },
      'ctx.items[0].profile.name',
      { allowedRoots: ['ctx'] }
    );

    expect(value).toBe('Ada');
  });

  it('requires an allowed root prefix when allowedRoots is configured', () => {
    const tokens = tokenizeObjectPath('items[0].profile.name', { allowedRoots: ['ctx'] });
    const value = getValueByPath(
      {
        items: [{ profile: { name: 'Ada' } }],
      },
      'items[0].profile.name',
      { allowedRoots: ['ctx'] }
    );

    expect(tokens).toBeNull();
    expect(value).toBeUndefined();
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