const { dataSourceRegistry } = require('@jet-admin/datasources-logic');

describe('MongoDB filter parsing', () => {
  it('accepts an object filter instead of calling .trim on it', () => {
    const MongoDBDataSource = dataSourceRegistry.getDataSource('mongodb');
    const instance = new MongoDBDataSource({ datasourceID: 'ds-mongo' });
    expect(instance.parseJSON({ active: true })).toEqual({ active: true });
    expect(instance.parseJSON('{"active":true}')).toEqual({ active: true });
    expect(instance.parseJSON('')).toEqual({});
  });
});
