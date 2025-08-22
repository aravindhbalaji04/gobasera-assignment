# Testing Documentation

## Overview
This document outlines the comprehensive testing strategy implemented for the Society Registration application, covering backend unit tests, integration tests, and frontend e2e tests.

## Testing Strategy

### 1. Backend Testing (Jest + Supertest)

#### Unit Tests
- **Webhook Signature Verification**: Tests HMAC signature validation for security
- **DTO Validation**: Tests input validation using class-validator
- **Webhook Idempotency**: Tests duplicate webhook handling
- **Service Layer**: Tests business logic in isolation

#### Integration Tests
- **Webhook Endpoints**: Tests complete webhook processing flow
- **API Endpoints**: Tests HTTP request/response handling
- **Database Operations**: Tests with real database connections

#### Test Coverage
- **Target**: >80% code coverage
- **Focus Areas**: Security, business logic, error handling
- **Mock Strategy**: External services (Firebase, Razorpay, MinIO)

### 2. Frontend Testing (Playwright)

#### E2E Tests
- **Full Registration Flow**: Complete wizard from login to submission
- **Error Handling**: Validation errors, network failures
- **Auto-save**: Data persistence across navigation
- **Payment Simulation**: Payment success/failure scenarios

#### Test Scenarios
- Happy path through all 5 wizard steps
- Form validation and error messages
- Document upload with various file types
- Payment processing and status updates
- Responsive design across devices

## Running Tests

### Backend Tests

```bash
# Navigate to backend directory
cd apps/backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run specific test file
npm test -- webhook-signature.validator.spec.ts

# Run tests matching pattern
npm test -- --testNamePattern="webhook"
```

### Frontend Tests

```bash
# Navigate to frontend directory
cd apps/frontend

# Run all e2e tests
npm test

# Run tests with UI
npm run test:ui

# Run tests in headed mode (visible browser)
npm run test:headed

# Run specific test file
npx playwright test registration-wizard.spec.ts

# Run tests in specific browser
npx playwright test --project=chromium
```

### CI/CD Pipeline

The GitHub Actions workflow automatically runs:
1. **Backend Tests**: Unit tests, integration tests, coverage
2. **Frontend Tests**: E2E tests with Playwright
3. **Security Scan**: Dependency audit, secret detection
4. **Build Verification**: Production build validation

## Test Structure

### Backend Test Files

```
apps/backend/src/
├── test/
│   ├── setup.ts                 # Global test configuration
│   └── test-utils.ts            # Common test utilities
├── webhooks/
│   ├── webhook-signature.validator.spec.ts
│   ├── webhook-idempotency.service.spec.ts
│   └── webhooks.controller.spec.ts
└── registrations/
    └── dto/create-registration.dto.spec.ts
```

### Frontend Test Files

```
apps/frontend/tests/
└── e2e/
    └── registration-wizard.spec.ts  # Main e2e test suite
```

## Test Data and Fixtures

### Backend Test Data
- **Mock Users**: Test users with different roles
- **Mock Registrations**: Sample registration data
- **Mock Payments**: Payment scenarios for testing
- **Mock Webhooks**: Razorpay webhook payloads

### Frontend Test Data
- **Test Files**: Sample PDFs for document upload
- **Form Data**: Valid and invalid input combinations
- **Payment States**: Success, failure, pending scenarios

## Security Testing

### Webhook Security
- **Signature Verification**: HMAC validation testing
- **Idempotency**: Duplicate webhook prevention
- **Rate Limiting**: API abuse prevention
- **Input Validation**: Malicious payload detection

### Authentication Testing
- **JWT Validation**: Token verification
- **Role-Based Access**: Permission enforcement
- **Session Management**: Secure session handling

## Performance Testing

### Backend Performance
- **Database Queries**: Query optimization testing
- **API Response Times**: Endpoint performance
- **Memory Usage**: Memory leak detection
- **Concurrent Requests**: Load testing

### Frontend Performance
- **Page Load Times**: Core Web Vitals
- **Bundle Size**: JavaScript bundle optimization
- **Image Optimization**: Asset loading performance
- **Network Requests**: API call efficiency

## Debugging Tests

### Backend Test Debugging
```bash
# Run tests with debug output
npm run test:debug

# Run specific test with verbose output
npm test -- --verbose --testNamePattern="webhook"

# Debug with Node.js inspector
npm run test:debug
```

### Frontend Test Debugging
```bash
# Run tests with UI for debugging
npm run test:ui

# Run tests in headed mode
npm run test:headed

# Generate trace files
npx playwright test --trace=on
```

## Coverage Reports

### Backend Coverage
- **HTML Report**: `apps/backend/coverage/index.html`
- **LCOV Report**: `apps/backend/coverage/lcov.info`
- **Coverage Targets**: >80% overall, >90% critical paths

### Frontend Coverage
- **Playwright Report**: `apps/frontend/playwright-report/`
- **Screenshots**: Failed test screenshots
- **Videos**: Test execution recordings
- **Traces**: Step-by-step execution traces

## Continuous Integration

### GitHub Actions Workflow
1. **Trigger**: Push to main/develop, Pull Requests
2. **Matrix Testing**: Multiple Node.js versions
3. **Service Containers**: PostgreSQL, Redis for testing
4. **Artifact Upload**: Test reports, build artifacts
5. **Security Scanning**: Dependency vulnerabilities

### Pre-commit Hooks
- **Linting**: ESLint + Prettier
- **Type Checking**: TypeScript compilation
- **Unit Tests**: Fast test suite execution
- **Formatting**: Code style consistency

## Best Practices

### Test Writing
- **Arrange-Act-Assert**: Clear test structure
- **Descriptive Names**: Self-documenting test names
- **Isolation**: Tests should not depend on each other
- **Mocking**: External dependencies properly mocked

### Test Maintenance
- **Regular Updates**: Keep tests in sync with code
- **Refactoring**: Update tests when code changes
- **Documentation**: Clear test purpose and setup
- **Performance**: Fast test execution

## Troubleshooting

### Common Issues

#### Backend Tests
- **Database Connection**: Check PostgreSQL service
- **Environment Variables**: Verify test configuration
- **Mock Services**: Ensure proper service mocking
- **Async Operations**: Handle promises correctly

#### Frontend Tests
- **Browser Installation**: Install Playwright browsers
- **Port Conflicts**: Ensure no other services on test ports
- **File Uploads**: Check test file paths and formats
- **Network Issues**: Verify API endpoint availability

### Debug Commands
```bash
# Backend test debugging
npm test -- --verbose --detectOpenHandles

# Frontend test debugging
npx playwright test --debug

# Check test environment
npm run test:env
```

## Future Enhancements

### Planned Testing Features
- **Visual Regression**: Screenshot comparison testing
- **Load Testing**: API performance under stress
- **Accessibility Testing**: WCAG compliance validation
- **Cross-browser Testing**: Multiple browser support
- **Mobile Testing**: Responsive design validation

### Test Automation
- **Scheduled Runs**: Daily test execution
- **Performance Monitoring**: Continuous performance tracking
- **Security Scanning**: Automated vulnerability detection
- **Deployment Gates**: Test-based deployment approval
