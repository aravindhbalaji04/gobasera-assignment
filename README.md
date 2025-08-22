# Society Registration System

A comprehensive monorepo containing a NestJS backend and React frontend application for managing society registrations, payments, and support operations.

## 🏗️ Architecture

- **Backend**: NestJS + TypeScript + Prisma + PostgreSQL + Redis + BullMQ
- **Frontend**: React + TypeScript + Vite + Tailwind CSS + Playwright
- **Services**: PostgreSQL, Redis, MinIO (S3-compatible)
- **Infrastructure**: Docker Compose + GitHub Actions CI/CD
- **Authentication**: Firebase Phone Auth + JWT
- **Payment**: Razorpay Integration
- **Testing**: Jest + Supertest + Playwright E2E

## 🚀 One-Command Setup

### Prerequisites

- **Node.js 18+** and **npm 9+**
- **Docker Desktop** (includes Docker Compose)
- **Git**

### Quick Start

```bash
# 1. Clone the repository
git clone <repository-url>
cd assignment

# 2. Install dependencies
npm install

# 3. Start all services (PostgreSQL, Redis, MinIO)
npm run docker:up

# 4. Setup database and seed data
npm run db:setup

# 5. Start development servers
npm run dev
```

**That's it!** 🎉 Your application will be running at:
- **Frontend**: http://localhost:3002
- **Backend**: http://localhost:3001
- **API Docs**: http://localhost:3001/docs
- **MinIO Console**: http://localhost:9001 (minioadmin/minioadmin123)

## 📁 Project Structure

```
assignment/
├── apps/
│   ├── backend/          # NestJS API with Prisma ORM
│   │   ├── src/
│   │   │   ├── auth/     # Firebase + JWT authentication
│   │   │   ├── support/  # Support dashboard APIs
│   │   │   ├── webhooks/ # Razorpay webhook handling
│   │   │   └── ...       # Other modules
│   │   ├── prisma/       # Database schema & migrations
│   │   └── tests/        # Unit & integration tests
│   └── frontend/         # React SPA with multi-step wizard
│       ├── src/
│       │   ├── pages/    # Application pages
│       │   ├── components/# Reusable components
│       │   └── tests/    # E2E tests with Playwright
│       └── ...
├── scripts/               # Database & utility scripts
├── docker-compose.yml     # Infrastructure services
├── .github/workflows/     # CI/CD pipeline
└── README.md             # This file
```

## 🔧 Environment Configuration

### Backend Environment

Copy and configure the backend environment:

```bash
cp apps/backend/env.example apps/backend/.env
```

**Required Variables:**
```env
# Database
DATABASE_URL="postgresql://assignment_user:assignment_password@localhost:5432/assignment_db?schema=public"

# JWT (generate a secure random string)
JWT_SECRET=your-super-secure-jwt-secret-key-here

# Firebase (required for phone authentication)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# Razorpay (test mode credentials)
RAZORPAY_KEY_ID=rzp_test_your_test_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

### Frontend Environment

Copy and configure the frontend environment:

```bash
cp apps/frontend/env.example apps/frontend/.env
```

**Required Variables:**
```env
# Backend API URL
VITE_API_URL=http://localhost:3001/api/v1

# Firebase Configuration
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
```

## 🗄️ Database Setup

### Automatic Setup (Recommended)

```bash
# This will run migrations and seed the database
npm run db:setup
```

### Manual Setup

```bash
# 1. Generate Prisma client
npm run db:generate

# 2. Run database migrations
npm run db:migrate

# 3. Seed the database with test data
npm run db:seed
```

## 👥 Test Users

After seeding, the following test users are available:

| Role | Phone | Firebase UID | Purpose |
|------|-------|--------------|---------|
| **Support** | +1234567890 | `support_firebase_uid_123` | Super admin, can approve/reject registrations |
| **Committee** | +1234567891 | `committee_firebase_uid_456` | Society admin, can manage society details |
| **Owner** | +1234567892 | `owner_firebase_uid_789` | Regular user, can register societies |

**Note**: These are placeholder Firebase UIDs. In production, use real Firebase UIDs from your Firebase project.

## 🎬 Demo Script

### 1. Support Dashboard Flow

```bash
# 1. Login as Support user
# Navigate to: http://localhost:3002/dev-login
# Select: SUPPORT role
# Click: Login

# 2. Access Support Dashboard
# Navigate to: http://localhost:3002/support/review
# View: Pending registrations table
# Navigate to: http://localhost:3002/support/analytics
# View: Funnel analytics and conversion rates
```

### 2. Society Registration Flow

```bash
# 1. Login as Owner user
# Navigate to: http://localhost:3002/dev-login
# Select: OWNER role
# Click: Login

# 2. Complete Registration Wizard
# Step 1: Society Details (name, address, city, state, pincode)
# Step 2: Committee Details (chairman, secretary, treasurer)
# Step 3: Document Upload (PAN, registration cert, address proof)
# Step 4: Payment Processing (Razorpay integration)
# Step 5: Review & Submit

# 3. Support Review Process
# Login as Support user
# Navigate to: /support/review
# Click on registration row to view details
# Click: Approve or Reject with reason
```

### 3. API Testing

```bash
# 1. Access Swagger Documentation
# Navigate to: http://localhost:3001/docs

# 2. Test Authentication
# Use the /auth/test-token endpoint to get JWT tokens

# 3. Test Protected Endpoints
# Include Authorization: Bearer <token> header
```

## 📚 API Documentation

### OpenAPI/Swagger

- **URL**: http://localhost:3001/docs
- **Features**: Interactive API documentation, request/response examples
- **Authentication**: Bearer token support

### Postman Collection

A Postman collection is automatically generated and available at:
- **Path**: `apps/backend/postman-collection.json`
- **Import**: Use the "Import" button in Postman

## 🧪 Testing

### Backend Tests

```bash
# Run all tests
npm run test:backend

# Run with coverage
npm run test:backend:cov

# Run specific test file
npm run test:backend -- webhook-signature.validator.spec.ts
```

### Frontend Tests

```bash
# Run E2E tests
npm run test:frontend

# Run with UI
npm run test:frontend:ui

# Run in headed mode
npm run test:frontend:headed
```

### Test Coverage

- **Backend**: Jest + Supertest, >80% coverage target
- **Frontend**: Playwright E2E tests, full user flow coverage
- **CI/CD**: Automated testing on every push/PR

## 🚀 Production Deployment

### 1. Environment Variables

Update all environment variables for production:
- Use strong, unique secrets for JWT, sessions, cookies
- Configure production Firebase project
- Use production Razorpay credentials
- Set appropriate CORS origins

### 2. Database

```bash
# Production database setup
npm run db:migrate:deploy
npm run db:generate
```

### 3. Build & Deploy

```bash
# Build applications
npm run build

# Deploy backend
# Deploy frontend
# Configure reverse proxy (nginx)
```

## 🔒 Security Features

- **Helmet.js**: Security headers
- **Rate Limiting**: API abuse prevention
- **CORS**: Cross-origin resource sharing
- **JWT**: Secure authentication
- **Input Validation**: Class-validator with DTOs
- **Webhook Security**: HMAC signature verification
- **SQL Injection Protection**: Prisma ORM
- **XSS Protection**: Content Security Policy

## 📊 Monitoring & Logging

- **Audit Logs**: All state changes are logged
- **Webhook Tracking**: Idempotency and retry mechanisms
- **Error Handling**: Comprehensive error responses
- **Performance**: Database query optimization

## 🚧 Known Limitations

### Current Limitations

1. **Firebase Phone Auth**: Requires Blaze (pay-as-you-go) plan for production
2. **File Upload**: MinIO buckets are public (configure private buckets for production)
3. **Payment Processing**: Currently in test mode (Razorpay test credentials)
4. **Email Notifications**: Not implemented (use webhooks or queue workers)
5. **Multi-tenancy**: Single database instance (consider database per tenant for large scale)

### Next Steps

1. **Production Hardening**
   - Implement private MinIO buckets
   - Add email notifications
   - Configure production Firebase project
   - Set up production Razorpay account

2. **Scalability Improvements**
   - Database connection pooling
   - Redis clustering
   - Load balancer configuration
   - Horizontal scaling

3. **Additional Features**
   - Email verification
   - SMS notifications
   - Advanced analytics dashboard
   - Bulk operations
   - API rate limiting per user

4. **Monitoring & Observability**
   - Application performance monitoring (APM)
   - Centralized logging (ELK stack)
   - Metrics collection (Prometheus + Grafana)
   - Health checks and alerting

## 🛠️ Development Commands

```bash
# Development
npm run dev                    # Start both frontend and backend
npm run dev:backend           # Start only backend
npm run dev:frontend          # Start only frontend

# Building
npm run build                 # Build both applications
npm run build:backend         # Build only backend
npm run build:frontend        # Build only frontend

# Testing
npm test                      # Run all tests
npm run test:backend          # Run backend tests
npm run test:frontend         # Run frontend tests

# Database
npm run db:setup              # Setup database (migrate + seed)
npm run db:migrate            # Run migrations
npm run db:seed               # Seed database
npm run db:studio             # Open Prisma Studio

# Docker
npm run docker:up             # Start infrastructure services
npm run docker:down           # Stop infrastructure services
npm run docker:logs           # View service logs

# Linting & Type Checking
npm run lint                  # Run ESLint
npm run type-check            # Run TypeScript compiler
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check this README and API docs
- **Issues**: Create GitHub issues for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions

## 🙏 Acknowledgments

- **NestJS** for the robust backend framework
- **Prisma** for the excellent ORM
- **React** for the frontend framework
- **Tailwind CSS** for the utility-first CSS framework
- **Playwright** for the E2E testing framework

---
