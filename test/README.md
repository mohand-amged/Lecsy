# Lecsy AI - Test Suite

This directory contains comprehensive tests for the Lecsy AI application, covering all critical functionality and ensuring production readiness.

## 📁 Test Structure

```
test/
├── components/           # Component tests
│   ├── ui/              # UI component tests
│   └── AuthForm.test.tsx
├── lib/                 # Library and utility tests
│   ├── auth/           # Authentication tests
│   └── utils.test.ts
├── api/                 # API endpoint tests
├── database/           # Database operation tests
├── integration/        # Integration tests
├── security/           # Security and validation tests
├── performance/        # Performance tests
├── utils/              # Test utilities and helpers
├── setup.ts            # Jest setup configuration
└── README.md           # This file
```

## 🧪 Test Categories

### 1. **Unit Tests** (`components/`, `lib/`)
- Test individual components and functions in isolation
- Mock external dependencies
- Focus on component behavior and edge cases
- **Coverage Target**: 90%+

### 2. **Integration Tests** (`integration/`)
- Test complete user flows and component interactions
- Test authentication flows end-to-end
- Verify data flow between components
- **Coverage Target**: 80%+

### 3. **API Tests** (`api/`)
- Test all API endpoints
- Verify request/response handling
- Test error scenarios and edge cases
- **Coverage Target**: 95%+

### 4. **Database Tests** (`database/`)
- Test database operations and queries
- Verify data integrity and relationships
- Test transaction handling
- **Coverage Target**: 85%+

### 5. **Security Tests** (`security/`)
- Input validation and sanitization
- Authentication and authorization
- Rate limiting and CORS
- File upload security
- **Coverage Target**: 100%+

### 6. **Performance Tests** (`performance/`)
- Component rendering performance
- API response times
- Database query performance
- Memory usage and leak detection
- **Target**: All operations under defined thresholds

## 🚀 Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests for CI/CD (no watch, with coverage)
npm run test:ci
```

### Specific Test Categories

```bash
# Run only component tests
npm test -- --testPathPattern=components

# Run only integration tests
npm test -- --testPathPattern=integration

# Run only security tests
npm test -- --testPathPattern=security

# Run only performance tests
npm test -- --testPathPattern=performance

# Run tests for a specific file
npm test -- AuthForm.test.tsx

# Run tests matching a pattern
npm test -- --testNamePattern="sign in"
```

### Debug Mode

```bash
# Run tests with verbose output
npm test -- --verbose

# Run tests with debugging
npm test -- --detectOpenHandles --forceExit

# Run a single test file in debug mode
npm test -- --testPathPattern=AuthForm --verbose
```

## 📊 Coverage Reports

After running `npm run test:coverage`, you'll find detailed coverage reports in:

- **HTML Report**: `coverage/lcov-report/index.html`
- **Text Summary**: Displayed in terminal
- **LCOV**: `coverage/lcov.info` (for CI tools)

### Coverage Targets

| Category | Target | Current |
|----------|--------|---------|
| Statements | 85% | - |
| Branches | 80% | - |
| Functions | 90% | - |
| Lines | 85% | - |

## 🔧 Test Configuration

### Jest Configuration (`jest.config.js`)
- Uses Next.js Jest configuration
- Includes custom test environment setup
- Configures module path mapping
- Sets up coverage collection

### Setup File (`test/setup.ts`)
- Configures testing library
- Mocks Next.js router and navigation
- Sets up localStorage mock
- Configures global test environment

### Test Utilities (`test/utils/test-utils.tsx`)
- Custom render function with providers
- Mock data generators
- Testing helper functions
- Performance measurement utilities

## 📝 Writing Tests

### Component Test Example

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MyComponent } from '@/components/MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })

  it('handles user interaction', async () => {
    const user = userEvent.setup()
    const mockHandler = jest.fn()
    
    render(<MyComponent onAction={mockHandler} />)
    
    await user.click(screen.getByRole('button'))
    expect(mockHandler).toHaveBeenCalled()
  })
})
```

### API Test Example

```typescript
import { createMocks } from 'node-mocks-http'
import handler from '@/pages/api/my-endpoint'

describe('/api/my-endpoint', () => {
  it('handles POST request', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { data: 'test' },
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    expect(JSON.parse(res._getData())).toEqual({ success: true })
  })
})
```

### Integration Test Example

```typescript
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider } from '@/lib/auth/AuthContext'
import { App } from '@/components/App'

describe('Authentication Flow', () => {
  it('completes sign up and login flow', async () => {
    const user = userEvent.setup()
    
    render(
      <AuthProvider>
        <App />
      </AuthProvider>
    )

    // Test complete user flow
    await user.click(screen.getByText('Sign Up'))
    // ... rest of the flow
  })
})
```

## 🎯 Testing Best Practices

### 1. **Test Structure**
- Use descriptive test names
- Group related tests with `describe` blocks
- Follow AAA pattern: Arrange, Act, Assert

### 2. **Mocking**
- Mock external dependencies
- Use `jest.mock()` for module mocks
- Create reusable mock factories

### 3. **Assertions**
- Use specific matchers (`toBeInTheDocument`, `toHaveClass`)
- Test behavior, not implementation
- Verify both positive and negative cases

### 4. **Async Testing**
- Use `waitFor` for async operations
- Avoid `act()` warnings with proper async handling
- Test loading and error states

### 5. **Accessibility**
- Use semantic queries (`getByRole`, `getByLabelText`)
- Test keyboard navigation
- Verify ARIA attributes

## 🚨 Common Issues and Solutions

### 1. **Act Warnings**
```typescript
// ❌ Bad
fireEvent.click(button)

// ✅ Good
await user.click(button)
```

### 2. **Async State Updates**
```typescript
// ❌ Bad
expect(screen.getByText('Loading...')).toBeInTheDocument()

// ✅ Good
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument()
})
```

### 3. **Mock Cleanup**
```typescript
// Always clean up mocks
afterEach(() => {
  jest.clearAllMocks()
})
```

### 4. **Environment Variables**
```typescript
// Set up test environment variables in setup.ts
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
```

## 📈 Continuous Integration

### GitHub Actions Integration

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm run test:ci
      - uses: codecov/codecov-action@v1
```

### Pre-commit Hooks

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run test:ci && npm run lint"
    }
  }
}
```

## 🔍 Debugging Tests

### VS Code Configuration

```json
// .vscode/launch.json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Jest Tests",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

### Common Debug Commands

```bash
# Debug specific test
node --inspect-brk node_modules/.bin/jest --runInBand AuthForm.test.tsx

# Run with additional logging
DEBUG=* npm test

# Check for memory leaks
npm test -- --detectLeaks
```

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/docs/)
- [Next.js Testing Guide](https://nextjs.org/docs/testing)
- [React Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## 🎯 Next Steps

1. **Run initial test suite**: `npm run test:coverage`
2. **Review coverage report**: Check `coverage/lcov-report/index.html`
3. **Add missing tests**: Focus on areas with low coverage
4. **Set up CI/CD**: Configure automated testing in your deployment pipeline
5. **Monitor performance**: Set up alerts for test performance degradation

---

**Remember**: Tests are living documentation. Keep them up-to-date as your application evolves!
