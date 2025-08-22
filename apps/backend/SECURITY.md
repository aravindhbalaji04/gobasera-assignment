# Security Documentation

## Overview
This document outlines the security measures implemented in the Society Registration API backend.

## Security Features

### 1. Helmet.js Security Headers
- **Content Security Policy (CSP)**: Prevents XSS attacks
- **X-Content-Type-Options**: Prevents MIME type sniffing
- **X-Frame-Options**: Prevents clickjacking
- **X-XSS-Protection**: Additional XSS protection
- **Referrer-Policy**: Controls referrer information
- **Permissions-Policy**: Restricts browser features

### 2. Rate Limiting
- **Public Routes**: 100 requests per 15 minutes per IP
- **Authenticated Routes**: Exempt from rate limiting
- **Exponential Backoff**: For failed webhook retries
- **Configurable Limits**: Via environment variables

### 3. CORS Configuration
- **Origin Validation**: Whitelist-based approach
- **Method Restrictions**: Only allowed HTTP methods
- **Header Restrictions**: Only allowed headers
- **Credentials Support**: For authenticated requests

### 4. Input Validation
- **Class-Validator**: Comprehensive DTO validation
- **Type Safety**: TypeScript interfaces
- **Sanitization**: Automatic input cleaning
- **Length Limits**: Prevents buffer overflow attacks

### 5. Webhook Idempotency
- **Event Tracking**: WebhookEvent table
- **Duplicate Prevention**: Event ID uniqueness
- **Retry Logic**: Exponential backoff
- **Status Tracking**: PENDING → PROCESSING → COMPLETED/FAILED

### 6. Database Transactions
- **Atomic Operations**: Payment + registration updates
- **Rollback Support**: Automatic on failure
- **Timeout Protection**: 10-second maximum
- **Deadlock Prevention**: Proper ordering

### 7. Environment Security
- **Secret Management**: All secrets in .env
- **Validation**: Environment variable validation
- **Type Safety**: Configuration service
- **No Hardcoding**: Secrets never committed

### 8. Authentication & Authorization
- **JWT Tokens**: Secure session management
- **Role-Based Access**: SUPPORT, COMMITTEE, OWNER
- **Token Validation**: Firebase ID verification
- **Route Protection**: Guard-based access control

## Environment Variables

### Required Security Variables
```bash
# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret
JWT_EXPIRES_IN=7d

# Security Configuration
BCRYPT_ROUNDS=12
SESSION_SECRET=your-super-secure-session-secret
COOKIE_SECRET=your-super-secure-cookie-secret

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
ALLOWED_ORIGINS=https://yourdomain.com
ALLOWED_METHODS=GET,POST,PUT,PATCH,DELETE
ALLOWED_HEADERS=Content-Type,Authorization,X-Requested-With

# Webhook Security
WEBHOOK_TIMEOUT_MS=30000
WEBHOOK_MAX_RETRIES=3
WEBHOOK_RETRY_DELAY_MS=5000
```

## API Security

### Public Endpoints
- `POST /auth/verify` - Firebase token verification
- `POST /auth/test-token` - Development token generation
- `POST /auth/test-support-token` - Support token generation

### Protected Endpoints
- All other endpoints require valid JWT token
- Role-based access control enforced
- Rate limiting applied appropriately

### Webhook Security
- HMAC signature verification (Razorpay)
- Idempotency via event tracking
- Retry logic with exponential backoff
- Timeout protection

## Database Security

### Transaction Safety
```typescript
// Example: Payment + Registration update
await this.transactionService.executePaymentTransaction(
  paymentId,
  registrationId,
  {
    paymentStatus: 'COMPLETED',
    registrationFunnelStage: 'PAYMENT_COMPLETED',
    auditLog: { /* audit details */ }
  }
);
```

### Audit Logging
- All state changes logged
- User actions tracked
- Timestamp and actor information
- JSON data for flexibility

## Monitoring & Logging

### Security Events
- Suspicious request detection
- Rate limit violations
- Authentication failures
- Webhook processing errors

### Log Levels
- **ERROR**: Security violations, failures
- **WARN**: Suspicious activity, retries
- **INFO**: Normal operations
- **DEBUG**: Detailed debugging (development only)

## Best Practices

### 1. Never Commit Secrets
- Use .env files for local development
- Use environment variables in production
- Rotate secrets regularly

### 2. Input Validation
- Validate all DTOs with class-validator
- Use TypeScript interfaces
- Sanitize user inputs

### 3. Error Handling
- Don't expose internal errors
- Log security events
- Use appropriate HTTP status codes

### 4. Rate Limiting
- Apply to public endpoints
- Exempt authenticated routes
- Monitor for abuse

### 5. Webhook Security
- Verify signatures
- Implement idempotency
- Use retry logic
- Set timeouts

## Security Checklist

- [x] Helmet.js security headers
- [x] Rate limiting implementation
- [x] CORS configuration
- [x] Input validation with class-validator
- [x] Environment variable validation
- [x] Webhook idempotency
- [x] Database transactions
- [x] Audit logging
- [x] JWT authentication
- [x] Role-based authorization
- [x] Security middleware
- [x] Suspicious request detection
- [x] Comprehensive logging
- [x] Postman collection export
- [x] OpenAPI/Swagger documentation

## Incident Response

### Security Breach
1. **Immediate**: Stop affected services
2. **Investigation**: Review logs and audit trails
3. **Containment**: Isolate affected systems
4. **Recovery**: Restore from secure backups
5. **Post-mortem**: Document lessons learned

### Contact Information
- **Security Team**: security@yourdomain.com
- **Emergency**: +1-XXX-XXX-XXXX
- **Bug Reports**: security-reports@yourdomain.com

## Updates & Maintenance

### Regular Tasks
- [ ] Update dependencies monthly
- [ ] Review security logs weekly
- [ ] Rotate secrets quarterly
- [ ] Security audit annually
- [ ] Penetration testing biannually

### Security Updates
- Monitor security advisories
- Apply patches promptly
- Test in staging environment
- Document all changes
