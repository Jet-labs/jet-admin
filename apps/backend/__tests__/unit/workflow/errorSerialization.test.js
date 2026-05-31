const { serializeError } = require('../../../modules/workflow/handlers/constants');

describe('serializeError helper', () => {
  it('serializes standard error properties including message and stack', () => {
    const error = new Error('Test message');
    const result = serializeError(error);
    expect(result.message).toBe('Test message');
    expect(result.name).toBe('Error');
    expect(result.stack).toBeDefined();
  });

  it('preserves Axios response properties if present', () => {
    const error = new Error('Request failed');
    error.response = {
      status: 400,
      statusText: 'Bad Request',
      data: { error_message: 'Detailed error response' },
    };
    error.config = { url: 'http://test.url', method: 'get' };
    
    const result = serializeError(error);
    expect(result.response.status).toBe(400);
    expect(result.response.data.error_message).toBe('Detailed error response');
  });

  it('preserves Axios request properties if present', () => {
    const error = new Error('Request failed');
    error.request = {
      _currentUrl: 'http://test.url',
      method: 'GET',
    };
    error.config = { url: 'http://test.url', method: 'GET' };
    
    const result = serializeError(error);
    expect(result.request.url).toBe('http://test.url');
    expect(result.request.method).toBe('GET');
  });

  it('preserves custom fields and GraphQL error details', () => {
    const error = new Error('GraphQL errors: Something went wrong');
    error.errors = [
      { message: 'Something went wrong', locations: [], path: ['user'] }
    ];
    
    const result = serializeError(error);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].message).toBe('Something went wrong');
  });
});
