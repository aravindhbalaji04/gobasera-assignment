# Payment Flow Implementation

## Overview

This document describes the complete payment flow implementation using Razorpay test mode, BullMQ for job processing, and webhook handling with HMAC verification.

## Architecture

```
Frontend → Backend → Razorpay → Webhook → BullMQ Queue → Job Processing → Database
```

## 1. Order Creation Flow

### Endpoint: `POST /api/v1/payments/orders`

**Request:**
```json
{
  "registrationId": "reg_123",
  "amount": 100000,
  "currency": "INR",
  "notes": "Registration fee"
}
```

**Response:**
```json
{
  "orderId": "order_abc123",
  "amount": 100000,
  "currency": "INR",
  "paymentId": "pay_123"
}
```

**Process:**
1. Verify user owns the registration
2. Check for existing payments
3. Create Razorpay order
4. Store payment record in database
5. Return order details for frontend

## 2. Frontend Integration

### Razorpay Checkout Integration

```javascript
// Frontend code example
const options = {
  key: 'rzp_test_your_key_id',
  amount: response.amount,
  currency: response.currency,
  order_id: response.orderId,
  name: 'Society Registration',
  description: 'Registration fee payment',
  handler: function (response) {
    // Don't trust this callback - wait for webhook
    console.log('Payment initiated:', response);
  },
  prefill: {
    name: user.name,
    email: user.email,
    contact: user.phone
  },
  theme: {
    color: '#3399cc'
  }
};

const rzp = new Razorpay(options);
rzp.open();
```

**Important:** Do not rely on the success callback. Always wait for the webhook to confirm payment status.

## 3. Webhook Processing

### Endpoint: `POST /webhooks/razorpay`

**Headers Required:**
- `x-razorpay-signature`: HMAC signature for verification

**Process:**
1. **HMAC Verification**: Verify webhook signature using `RAZORPAY_WEBHOOK_SECRET`
2. **Event Storage**: Store webhook payload in `WebhookEvent` table
3. **Job Queuing**: Add processing job to BullMQ queue
4. **Immediate Response**: Return 200 OK to Razorpay

## 4. Job Processing with BullMQ

### Queue Configuration
- **Queue Name**: `webhook-processing`
- **Concurrency**: 5 workers
- **Retry Attempts**: 3 with exponential backoff
- **Job ID**: `{orderId}:{paymentId}` for idempotency

### Job Handler Process
1. **Idempotency Check**: Verify webhook not already processed
2. **Database Transaction**: Ensure data consistency
3. **Payment Update**: Mark payment as completed
4. **Registration Update**: Advance funnel stage to `PAYMENT_COMPLETED`
5. **Audit Logging**: Record all actions
6. **Webhook Status**: Mark event as processed

## 5. Database Models

### Payment Model
```prisma
model Payment {
  id                  String        @id @default(cuid())
  registrationId      String
  razorpayOrderId     String        @unique
  razorpayPaymentId   String?       @unique
  status              PaymentStatus @default(PENDING)
  amount              Decimal       @db.Decimal(10, 2)
  currency            String        @default("INR")
  createdAt           DateTime      @default(now())
  paidAt              DateTime?
  updatedAt           DateTime      @updatedAt
}
```

### WebhookEvent Model
```prisma
model WebhookEvent {
  id          String           @id @default(cuid())
  provider    String
  eventId     String           @unique
  signature   String?
  payloadJson Json
  processedAt DateTime?
  status      WebhookStatus    @default(PENDING)
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt
}
```

## 6. Environment Configuration

### Required Environment Variables
```bash
# Razorpay Test Mode
RAZORPAY_KEY_ID=rzp_test_your_test_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Redis for BullMQ
REDIS_HOST=localhost
REDIS_PORT=6379
```

## 7. Security Features

### HMAC Signature Verification
- Uses `crypto.timingSafeEqual()` for constant-time comparison
- Prevents timing attacks
- Verifies webhook authenticity

### Idempotency
- Job ID based on `{orderId}:{paymentId}`
- Database-level duplicate prevention
- Prevents double processing

### Database Transactions
- Atomic operations for payment and registration updates
- Ensures data consistency
- Rollback on failures

## 8. Error Handling & Retry

### Retry Strategy
- **Exponential Backoff**: 2s, 4s, 8s delays
- **Max Attempts**: 3 retries
- **Dead Letter Queue**: Failed jobs after max retries

### Error Scenarios
- Invalid webhook signature
- Payment not found
- Database transaction failures
- Network timeouts

## 9. Testing

### Test Mode Features
- Use Razorpay test keys
- Test webhook endpoints
- Simulate payment flows
- Verify idempotency

### Webhook Testing
```bash
# Test webhook signature verification
curl -X POST http://localhost:3001/webhooks/razorpay \
  -H "Content-Type: application/json" \
  -H "x-razorpay-signature: test_signature" \
  -d '{"test": "payload"}'
```

## 10. Monitoring & Logging

### Queue Monitoring
- Job completion rates
- Failure rates and reasons
- Processing times
- Queue depths

### Audit Trail
- All payment actions logged
- Webhook processing history
- User action tracking
- System event recording

## 11. Production Considerations

### Security
- Use production Razorpay keys
- Secure webhook secret storage
- Rate limiting on webhook endpoints
- IP whitelisting for Razorpay

### Performance
- Redis clustering for high availability
- Queue monitoring and alerting
- Database connection pooling
- Caching strategies

### Monitoring
- Application performance monitoring
- Database query optimization
- Queue health checks
- Error alerting systems
