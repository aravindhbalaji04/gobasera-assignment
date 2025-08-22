#!/bin/bash

# Society Registration System - One-Command Setup Script
# This script sets up the entire development environment

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if port is available
port_available() {
    ! nc -z localhost $1 2>/dev/null
}

# Function to wait for service to be ready
wait_for_service() {
    local service=$1
    local port=$2
    local max_attempts=30
    local attempt=1
    
    print_status "Waiting for $service to be ready on port $port..."
    
    while [ $attempt -le $max_attempts ]; do
        if nc -z localhost $port 2>/dev/null; then
            print_success "$service is ready!"
            return 0
        fi
        
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_error "$service failed to start within $((max_attempts * 2)) seconds"
    return 1
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Node.js
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js 18+ and try again."
        exit 1
    fi
    
    local node_version=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$node_version" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node --version)"
        exit 1
    fi
    
    print_success "Node.js $(node --version) ✓"
    
    # Check npm
    if ! command_exists npm; then
        print_error "npm is not installed. Please install npm 9+ and try again."
        exit 1
    fi
    
    local npm_version=$(npm --version | cut -d'.' -f1)
    if [ "$npm_version" -lt 9 ]; then
        print_error "npm version 9+ is required. Current version: $(npm --version)"
        exit 1
    fi
    
    print_success "npm $(npm --version) ✓"
    
    # Check Docker
    if ! command_exists docker; then
        print_error "Docker is not installed. Please install Docker Desktop and try again."
        exit 1
    fi
    
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker Desktop and try again."
        exit 1
    fi
    
    print_success "Docker $(docker --version) ✓"
    
    # Check Docker Compose
    if ! command_exists docker-compose && ! docker compose version >/dev/null 2>&1; then
        print_error "Docker Compose is not available. Please install Docker Compose and try again."
        exit 1
    fi
    
    print_success "Docker Compose ✓"
    
    # Check Git
    if ! command_exists git; then
        print_error "Git is not installed. Please install Git and try again."
        exit 1
    fi
    
    print_success "Git $(git --version | cut -d' ' -f3) ✓"
}

# Function to check port availability
check_ports() {
    print_status "Checking port availability..."
    
    local ports=(3001 3002 5432 6379 9000 9001)
    local ports_in_use=()
    
    for port in "${ports[@]}"; do
        if ! port_available $port; then
            ports_in_use+=($port)
        fi
    done
    
    if [ ${#ports_in_use[@]} -gt 0 ]; then
        print_warning "The following ports are already in use: ${ports_in_use[*]}"
        print_warning "This might cause conflicts. Please stop any services using these ports."
        read -p "Do you want to continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_status "Setup cancelled by user."
            exit 0
        fi
    fi
    
    print_success "Port availability check passed ✓"
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    if [ ! -d "node_modules" ]; then
        npm install
        print_success "Dependencies installed ✓"
    else
        print_status "Dependencies already installed, skipping..."
    fi
}

# Function to start infrastructure services
start_infrastructure() {
    print_status "Starting infrastructure services (PostgreSQL, Redis, MinIO)..."
    
    # Stop any existing services
    docker-compose down 2>/dev/null || true
    
    # Start services
    docker-compose up -d
    
    # Wait for services to be ready
    wait_for_service "PostgreSQL" 5432
    wait_for_service "Redis" 6379
    wait_for_service "MinIO" 9000
    
    print_success "Infrastructure services started ✓"
}

# Function to setup database
setup_database() {
    print_status "Setting up database..."
    
    # Wait a bit more for services to be fully ready
    sleep 5
    
    # Generate Prisma client
    print_status "Generating Prisma client..."
    cd apps/backend
    npm run db:generate
    
    # Run migrations
    print_status "Running database migrations..."
    npm run db:migrate
    
    # Seed database
    print_status "Seeding database with test data..."
    npm run db:seed
    
    cd ../..
    
    print_success "Database setup completed ✓"
}

# Function to create environment files
create_env_files() {
    print_status "Setting up environment files..."
    
    # Backend environment
    if [ ! -f "apps/backend/.env" ]; then
        if [ -f "apps/backend/env.example" ]; then
            cp apps/backend/env.example apps/backend/.env
            print_success "Backend .env file created from example ✓"
            print_warning "Please update apps/backend/.env with your Firebase and Razorpay credentials"
        else
            print_warning "Backend env.example not found, please create .env manually"
        fi
    else
        print_status "Backend .env file already exists ✓"
    fi
    
    # Frontend environment
    if [ ! -f "apps/frontend/.env" ]; then
        if [ -f "apps/frontend/env.example" ]; then
            cp apps/frontend/env.example apps/frontend/.env
            print_success "Frontend .env file created from example ✓"
            print_warning "Please update apps/frontend/.env with your Firebase credentials"
        else
            print_warning "Frontend env.example not found, please create .env manually"
        fi
    else
        print_status "Frontend .env file already exists ✓"
    fi
}

# Function to display setup summary
display_summary() {
    echo
    echo "🎉 Setup completed successfully!"
    echo
    echo "📋 What's been set up:"
    echo "  ✓ Infrastructure services (PostgreSQL, Redis, MinIO)"
    echo "  ✓ Database with migrations and seed data"
    echo "  ✓ Environment files (please configure with your credentials)"
    echo "  ✓ Dependencies installed"
    echo
    echo "🚀 Next steps:"
    echo "  1. Configure environment variables in .env files"
    echo "  2. Start development servers: npm run dev"
    echo "  3. Access the application:"
    echo "     - Frontend: http://localhost:3002"
    echo "     - Backend: http://localhost:3001"
    echo "     - API Docs: http://localhost:3001/docs"
    echo "     - MinIO Console: http://localhost:9001 (minioadmin/minioadmin123)"
    echo
    echo "👥 Test users (after seeding):"
    echo "  - Support: +1234567890 (Super Admin)"
    echo "  - Committee: +1234567891 (Admin)"
    echo "  - Owner: +1234567892 (Regular User)"
    echo
    echo "📚 Documentation:"
    echo "  - README.md: Complete setup and usage guide"
    echo "  - DEMO.md: Demo script for walkthrough"
    echo "  - TESTING.md: Testing strategy and commands"
    echo
    echo "🔧 Useful commands:"
    echo "  - npm run dev: Start development servers"
    echo "  - npm run docker:up: Start infrastructure services"
    echo "  - npm run docker:down: Stop infrastructure services"
    echo "  - npm run test: Run all tests"
    echo "  - npm run build: Build for production"
    echo
}

# Function to check if setup is already complete
check_setup_status() {
    if [ -d "node_modules" ] && [ -f "apps/backend/.env" ] && [ -f "apps/frontend/.env" ]; then
        print_status "Setup appears to be already complete."
        read -p "Do you want to run setup again? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_status "Setup cancelled by user."
            exit 0
        fi
    fi
}

# Main setup function
main() {
    echo "🚀 Society Registration System - One-Command Setup"
    echo "=================================================="
    echo
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ] || [ ! -f "docker-compose.yml" ]; then
        print_error "Please run this script from the project root directory."
        exit 1
    fi
    
    # Check setup status
    check_setup_status
    
    # Run setup steps
    check_prerequisites
    check_ports
    install_dependencies
    start_infrastructure
    create_env_files
    setup_database
    
    # Display summary
    display_summary
}

# Run main function
main "$@"
