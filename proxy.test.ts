/**
 * Unit tests for proxy function export
 * 
 * These tests verify that the proxy function is correctly exported
 * and can be imported by other modules.
 */

describe('proxy function export', () => {
  test('proxy function is exported as default export', async () => {
    // Dynamic import to test the default export
    const proxyModule = await import('./proxy');
    
    // Verify that the default export exists
    expect(proxyModule.default).toBeDefined();
    
    // Verify that the default export is a function
    expect(typeof proxyModule.default).toBe('function');
  });

  test('proxy function can be imported using default import syntax', async () => {
    // This test verifies the import works using dynamic import
    // In actual usage, it would be: import proxy from './proxy'
    const { default: proxy } = await import('./proxy');
    
    // Verify the imported function exists and is callable
    expect(proxy).toBeDefined();
    expect(typeof proxy).toBe('function');
    expect(proxy.name).toBe('proxy');
  });

  test('proxy function has correct async signature', async () => {
    const { default: proxy } = await import('./proxy');
    
    // Verify the function is async (constructor name should be AsyncFunction)
    expect(proxy.constructor.name).toBe('AsyncFunction');
  });

  test('config is exported as named export', async () => {
    const proxyModule = await import('./proxy');
    
    // Verify that config is exported
    expect(proxyModule.config).toBeDefined();
    expect(typeof proxyModule.config).toBe('object');
    expect(proxyModule.config.matcher).toBeDefined();
    expect(Array.isArray(proxyModule.config.matcher)).toBe(true);
  });
});
