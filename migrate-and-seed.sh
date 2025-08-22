#!/bin/bash

echo "🔄 Running database migrations and seeding..."

# Navigate to backend directory
cd apps/backend

# Generate Prisma client
echo "📦 Generating Prisma client..."
npm run db:generate

# Run database migrations
echo "🔄 Running database migrations..."
npm run db:migrate

# Seed the database
echo "🌱 Seeding the database..."
npm run db:seed

echo "✅ Database setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Copy environment files:"
echo "   cp env.example .env"
echo ""
echo "2. Update Firebase credentials in .env"
echo "3. Start the backend: npm run start:dev"
echo "4. Access API docs at: http://localhost:3001/docs"
