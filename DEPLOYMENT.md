# Production Deployment Guide

This document provides comprehensive instructions for deploying the Society Registration System to production environments.

## Prerequisites

### Infrastructure Requirements

- **VPS/Cloud Server**: Ubuntu 20.04+ or CentOS 8+
- **Docker & Docker Compose**: Latest stable versions
- **Domain Name**: Configured with SSL certificate
- **Firewall**: Configured to allow ports 80, 443, 22
- **SSL Certificate**: Let's Encrypt or commercial certificate

### Resource Requirements

- **CPU**: 2+ cores
- **RAM**: 4GB+ 
- **Storage**: 50GB+ SSD
- **Network**: Stable internet connection

## Environment Setup

### 1. Server Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git unzip software-properties-common

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Nginx
sudo apt install -y nginx

# Install Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx
```

### 2. Clone Repository

```bash
# Clone the repository
git clone https://github.com/yourusername/society-registration-system.git
cd society-registration-system

# Checkout production branch
git checkout main
```

### 3. Environment Configuration

```bash
# Create production environment files
cp apps/backend/env.example apps/backend/.env
cp apps/frontend/env.example apps/frontend/.env

# Edit backend environment
nano apps/backend/.env
```

**Backend Environment Variables:**
```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/society_registration
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secure-jwt-secret-here
JWT_EXPIRES_IN=7d

# Firebase Admin
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# Razorpay
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-secret-key

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=your-minio-access-key
MINIO_SECRET_KEY=your-minio-secret-key

# Server
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
```

**Frontend Environment Variables:**
```env
VITE_API_URL=https://api.yourdomain.com
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
```

## Production Docker Compose

### 1. Create Production Docker Compose

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  postgres:
    image: postgres:15
    container_name: society_postgres_prod
    environment:
      POSTGRES_DB: society_registration
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init.sql:/docker-entrypoint-initdb.d/init.sql
    restart: unless-stopped
    networks:
      - society_network

  redis:
    image: redis:7-alpine
    container_name: society_redis_prod
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    restart: unless-stopped
    networks:
      - society_network

  minio:
    image: minio/minio:latest
    container_name: society_minio_prod
    environment:
      MINIO_ROOT_USER: ${MINIO_ACCESS_KEY}
      MINIO_ROOT_PASSWORD: ${MINIO_SECRET_KEY}
    command: server /data --console-address ":9001"
    volumes:
      - minio_data:/data
    restart: unless-stopped
    networks:
      - society_network

  backend:
    build:
      context: ./apps/backend
      dockerfile: Dockerfile.prod
    container_name: society_backend_prod
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/society_registration
      - REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379
      - MINIO_ENDPOINT=minio
      - MINIO_PORT=9000
      - MINIO_ACCESS_KEY=${MINIO_ACCESS_KEY}
      - MINIO_SECRET_KEY=${MINIO_SECRET_KEY}
      - JWT_SECRET=${JWT_SECRET}
      - FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID}
      - FIREBASE_PRIVATE_KEY=${FIREBASE_PRIVATE_KEY}
      - FIREBASE_CLIENT_EMAIL=${FIREBASE_CLIENT_EMAIL}
      - RAZORPAY_KEY_ID=${RAZORPAY_KEY_ID}
      - RAZORPAY_KEY_SECRET=${RAZORPAY_KEY_SECRET}
    ports:
      - "3001:3001"
    depends_on:
      - postgres
      - redis
      - minio
    restart: unless-stopped
    networks:
      - society_network

  frontend:
    build:
      context: ./apps/frontend
      dockerfile: Dockerfile.prod
    container_name: society_frontend_prod
    environment:
      - VITE_API_URL=https://api.yourdomain.com
      - VITE_FIREBASE_API_KEY=${VITE_FIREBASE_API_KEY}
      - VITE_FIREBASE_AUTH_DOMAIN=${VITE_FIREBASE_AUTH_DOMAIN}
      - VITE_FIREBASE_PROJECT_ID=${VITE_FIREBASE_PROJECT_ID}
    ports:
      - "3002:80"
    depends_on:
      - backend
    restart: unless-stopped
    networks:
      - society_network

  nginx:
    image: nginx:alpine
    container_name: society_nginx_prod
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
      - ./nginx/sites-available:/etc/nginx/sites-available
    depends_on:
      - backend
      - frontend
    restart: unless-stopped
    networks:
      - society_network

volumes:
  postgres_data:
  redis_data:
  minio_data:

networks:
  society_network:
    driver: bridge
```

### 2. Create Production Dockerfiles

**Backend Dockerfile:**
```dockerfile
# apps/backend/Dockerfile.prod
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine AS production

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3001
CMD ["npm", "run", "start:prod"]
```

**Frontend Dockerfile:**
```dockerfile
# apps/frontend/Dockerfile.prod
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Nginx Configuration

### 1. Create Nginx Configuration

```nginx
# nginx/nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:3001;
    }

    upstream frontend {
        server frontend:80;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=web:10m rate=30r/s;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    server {
        listen 80;
        server_name yourdomain.com www.yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name yourdomain.com www.yourdomain.com;

        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;

        # Frontend
        location / {
            limit_req zone=web burst=20 nodelay;
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Backend API
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://backend/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Webhooks (no rate limiting)
        location /webhooks/ {
            proxy_pass http://backend/webhooks/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

## SSL Certificate Setup

### 1. Let's Encrypt SSL

```bash
# Stop nginx temporarily
sudo systemctl stop nginx

# Get SSL certificate
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Copy certificates to nginx directory
sudo mkdir -p nginx/ssl
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/

# Set proper permissions
sudo chmod 600 nginx/ssl/*
```

### 2. Auto-renewal Setup

```bash
# Test renewal
sudo certbot renew --dry-run

# Add to crontab
sudo crontab -e

# Add this line for daily renewal check
0 12 * * * /usr/bin/certbot renew --quiet
```

## Database Setup

### 1. Initialize Database

```bash
# Create database initialization script
mkdir -p scripts
nano scripts/init.sql
```

**Database Initialization:**
```sql
-- scripts/init.sql
CREATE DATABASE IF NOT EXISTS society_registration;
CREATE USER IF NOT EXISTS society_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE society_registration TO society_user;

-- Create extensions
\c society_registration;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### 2. Run Migrations

```bash
# Generate Prisma client
cd apps/backend
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database
npm run db:seed
```

## Deployment Commands

### 1. Start Services

```bash
# Start all services
docker-compose -f docker-compose.prod.yml up -d

# Check service status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### 2. Update Services

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart services
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Run database migrations
cd apps/backend
npm run db:migrate
```

## Monitoring & Health Checks

### 1. Health Check Endpoints

```bash
# Backend health
curl https://api.yourdomain.com/health

# Frontend health
curl https://yourdomain.com/health

# Database connection
curl https://api.yourdomain.com/health/db
```

### 2. Log Monitoring

```bash
# View real-time logs
docker-compose -f docker-compose.prod.yml logs -f backend

# Check error logs
docker-compose -f docker-compose.prod.yml logs backend | grep ERROR

# Monitor resource usage
docker stats
```

## Backup Strategy

### 1. Database Backup

```bash
# Create backup script
nano scripts/backup.sh
```

**Backup Script:**
```bash
#!/bin/bash
# scripts/backup.sh

BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="society_registration"
DB_USER="society_user"
DB_PASSWORD="secure_password"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
docker exec society_postgres_prod pg_dump -U $DB_USER $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

# Backup MinIO data
docker exec society_minio_prod mc mirror /data $BACKUP_DIR/minio_backup_$DATE

# Compress backups
tar -czf $BACKUP_DIR/backup_$DATE.tar.gz $BACKUP_DIR/db_backup_$DATE.sql $BACKUP_DIR/minio_backup_$DATE

# Clean up old backups (keep last 7 days)
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +7 -delete

echo "Backup completed: backup_$DATE.tar.gz"
```

### 2. Automated Backups

```bash
# Make script executable
chmod +x scripts/backup.sh

# Add to crontab for daily backups
sudo crontab -e

# Add this line for daily backup at 2 AM
0 2 * * * /path/to/your/project/scripts/backup.sh
```

## Security Hardening

### 1. Firewall Configuration

```bash
# Configure UFW firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# Check status
sudo ufw status
```

### 2. Fail2ban Setup

```bash
# Install fail2ban
sudo apt install -y fail2ban

# Configure fail2ban
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo nano /etc/fail2ban/jail.local

# Restart fail2ban
sudo systemctl restart fail2ban
sudo systemctl enable fail2ban
```

## Performance Optimization

### 1. Nginx Optimization

```nginx
# Add to nginx.conf
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

# Enable caching
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 2. Database Optimization

```sql
-- Add indexes for better performance
CREATE INDEX idx_registrations_status ON registrations(status);
CREATE INDEX idx_registrations_funnel_stage ON registrations(funnel_stage);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check database container
   docker-compose -f docker-compose.prod.yml logs postgres
   
   # Test connection
   docker exec -it society_postgres_prod psql -U society_user -d society_registration
   ```

2. **MinIO Connection Issues**
   ```bash
   # Check MinIO container
   docker-compose -f docker-compose.prod.yml logs minio
   
   # Test MinIO connection
   docker exec -it society_minio_prod mc alias list
   ```

3. **SSL Certificate Issues**
   ```bash
   # Check certificate validity
   sudo certbot certificates
   
   # Renew certificate manually
   sudo certbot renew
   ```

### Emergency Procedures

1. **Service Recovery**
   ```bash
   # Restart specific service
   docker-compose -f docker-compose.prod.yml restart backend
   
   # Restart all services
   docker-compose -f docker-compose.prod.yml restart
   ```

2. **Database Recovery**
   ```bash
   # Restore from backup
   docker exec -i society_postgres_prod psql -U society_user -d society_registration < backup_file.sql
   ```

## Maintenance Schedule

### Daily
- Check service status
- Monitor error logs
- Verify backup completion

### Weekly
- Review security logs
- Check disk space
- Update system packages

### Monthly
- Review performance metrics
- Update SSL certificates
- Test backup restoration

## Support & Documentation

- **System Documentation**: README.md
- **API Documentation**: https://api.yourdomain.com/docs
- **Issue Tracking**: GitHub Issues
- **Monitoring**: Health check endpoints
- **Logs**: Docker container logs

## Next Steps

1. **Scaling**: Implement load balancing
2. **Monitoring**: Add Prometheus + Grafana
3. **CI/CD**: Automated deployment pipeline
4. **Backup**: Off-site backup storage
5. **Security**: Regular security audits
