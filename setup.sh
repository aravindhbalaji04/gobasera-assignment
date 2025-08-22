#!/bin/bash

echo "🚀 Setting up Assignment Monorepo..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is available
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not available. Please ensure Docker Desktop is installed and running."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install backend dependencies
echo "🔧 Installing backend dependencies..."
cd apps/backend
npm install
cd ../..

# Install frontend dependencies
echo "🎨 Installing frontend dependencies..."
cd apps/frontend
npm install
cd ../..

# Start infrastructure services
echo "🐳 Starting infrastructure services..."
npm run docker:up

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Generate Prisma client
echo "🗄️ Generating Prisma client..."
cd apps/backend
npm run db:generate
cd ../..

# Run database migrations
echo "🔄 Running database migrations..."
cd apps/backend
npm run db:migrate
cd ../..

# Seed the database
echo "🌱 Seeding the database..."
cd apps/backend
npm run db:seed
cd ../..

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Copy environment files:"
echo "   cp apps/backend/env.example apps/backend/.env"
echo "   cp apps/frontend/env.example apps/frontend/.env"
echo ""
echo "2. Start development servers:"
echo "   npm run dev"
echo ""
echo "3. Access your applications:"
echo "   Frontend: http://localhost:3000"
echo "   Backend: http://localhost:3001"
echo "   API Docs: http://localhost:3001/docs"
echo "   MinIO Console: http://localhost:9001"
echo ""
echo "4. Default users created:"
echo "   Support User: +1234567890 (Super Admin)"
echo "   Committee User: +1234567891 (Admin)"
echo "   Owner User: +1234567892 (Regular User)"
echo ""
echo "   Note: These are placeholder Firebase UIDs. In production, use real Firebase UIDs."
echo ""
echo "🔧 Available commands:"
echo "   npm run dev              - Start both backend and frontend"
echo "   npm run dev:backend      - Start only backend"
echo "   npm run dev:frontend     - Start only frontend"
echo "   npm run docker:up        - Start infrastructure services"
echo "   npm run docker:down      - Stop infrastructure services"
echo "   npm run db:seed          - Seed the database"
echo "   npm run test             - Run all tests"
echo "   npm run lint             - Lint all applications"
