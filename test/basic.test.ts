// Basic test to verify Jest setup
describe('Basic Test Suite', () => {
  it('should pass basic assertion', () => {
    expect(1 + 1).toBe(2)
  })

  it('should handle async operations', async () => {
    const result = await Promise.resolve('test')
    expect(result).toBe('test')
  })

  it('should work with objects', () => {
    const user = { name: 'Test User', email: 'test@example.com' }
    expect(user).toHaveProperty('name', 'Test User')
    expect(user).toHaveProperty('email', 'test@example.com')
  })

  it('should handle arrays', () => {
    const numbers = [1, 2, 3, 4, 5]
    expect(numbers).toHaveLength(5)
    expect(numbers).toContain(3)
  })

  it('should work with strings', () => {
    const message = 'Hello, Lecsy AI!'
    expect(message).toContain('Lecsy')
    expect(message).toMatch(/AI/)
  })
})
