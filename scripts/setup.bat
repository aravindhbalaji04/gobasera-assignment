@echo off
REM Society Registration System - One-Command Setup Script (Windows)
REM This script sets up the entire development environment

setlocal enabledelayedexpansion

echo 🚀 Society Registration System - One-Command Setup
echo ==================================================
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo [ERROR] Please run this script from the project root directory.
    pause
    exit /b 1
)

if not exist "docker-compose.yml" (
    echo [ERROR] Please run this script from the project root directory.
    pause
    exit /b 1
)

echo [INFO] Checking prerequisites...

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+ and try again.
    pause
    exit /b 1
)

for /f "tokens=1,2 delims=." %%a in ('node --version') do set NODE_VERSION=%%a
set NODE_VERSION=%NODE_VERSION:~1%
if %NODE_VERSION% LSS 18 (
    echo [ERROR] Node.js version 18+ is required. Current version: 
    node --version
    pause
    exit /b 1
)

echo [SUCCESS] Node.js 
node --version
echo ✓

REM Check npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm is not installed. Please install npm 9+ and try again.
    pause
    exit /b 1
)

echo [SUCCESS] npm 
npm --version
echo ✓

REM Check Docker
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not installed. Please install Docker Desktop and try again.
    pause
    exit /b 1
)

docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running. Please start Docker Desktop and try again.
    pause
    exit /b 1
)

echo [SUCCESS] Docker 
docker --version
echo ✓

REM Check Docker Compose
docker-compose --version >nul 2>&1
if errorlevel 1 (
    docker compose version >nul 2>&1
    if errorlevel 1 (
        echo [ERROR] Docker Compose is not available. Please install Docker Compose and try again.
        pause
        exit /b 1
    )
)

echo [SUCCESS] Docker Compose ✓

REM Check Git
git --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Git is not installed. Please install Git and try again.
    pause
    exit /b 1
)

echo [SUCCESS] Git 
git --version
echo ✓

echo.
echo [INFO] Installing dependencies...

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    npm install
    echo [SUCCESS] Dependencies installed ✓
) else (
    echo [INFO] Dependencies already installed, skipping...
)

echo.
echo [INFO] Starting infrastructure services (PostgreSQL, Redis, MinIO)...

REM Stop any existing services
docker-compose down >nul 2>&1

REM Start services
docker-compose up -d

echo [INFO] Waiting for services to be ready...
timeout /t 10 /nobreak >nul

echo [SUCCESS] Infrastructure services started ✓

echo.
echo [INFO] Setting up environment files...

REM Backend environment
if not exist "apps\backend\.env" (
    if exist "apps\backend\env.example" (
        copy "apps\backend\env.example" "apps\backend\.env" >nul
        echo [SUCCESS] Backend .env file created from example ✓
        echo [WARNING] Please update apps\backend\.env with your Firebase and Razorpay credentials
    ) else (
        echo [WARNING] Backend env.example not found, please create .env manually
    )
) else (
    echo [INFO] Backend .env file already exists ✓
)

REM Frontend environment
if not exist "apps\frontend\.env" (
    if exist "apps\frontend\env.example" (
        copy "apps\frontend\env.example" "apps\frontend\.env" >nul
        echo [SUCCESS] Frontend .env file created from example ✓
        echo [WARNING] Please update apps\frontend\.env with your Firebase credentials
    ) else (
        echo [WARNING] Frontend env.example not found, please create .env manually
    )
) else (
    echo [INFO] Frontend .env file already exists ✓
)

echo.
echo [INFO] Setting up database...

REM Wait a bit more for services to be fully ready
timeout /t 5 /nobreak >nul

REM Generate Prisma client
echo [INFO] Generating Prisma client...
cd apps\backend
npm run db:generate

REM Run migrations
echo [INFO] Running database migrations...
npm run db:migrate

REM Seed database
echo [INFO] Seeding database with test data...
npm run db:seed

cd ..\..

echo [SUCCESS] Database setup completed ✓

echo.
echo 🎉 Setup completed successfully!
echo.
echo 📋 What's been set up:
echo   ✓ Infrastructure services (PostgreSQL, Redis, MinIO)
echo   ✓ Database with migrations and seed data
echo   ✓ Environment files (please configure with your credentials)
echo   ✓ Dependencies installed
echo.
echo 🚀 Next steps:
echo   1. Configure environment variables in .env files
echo   2. Start development servers: npm run dev
echo   3. Access the application:
echo      - Frontend: http://localhost:3002
echo      - Backend: http://localhost:3001
echo      - API Docs: http://localhost:3001/docs
echo      - MinIO Console: http://localhost:9001 (minioadmin/minioadmin123)
echo.
echo 👥 Test users (after seeding):
echo   - Support: +1234567890 (Super Admin)
echo   - Committee: +1234567891 (Admin)
echo   - Owner: +1234567892 (Regular User)
echo.
echo 📚 Documentation:
echo   - README.md: Complete setup and usage guide
echo   - DEMO.md: Demo script for walkthrough
echo   - TESTING.md: Testing strategy and commands
echo.
echo 🔧 Useful commands:
echo   - npm run dev: Start development servers
echo   - npm run docker:up: Start infrastructure services
echo   - npm run docker:down: Stop infrastructure services
echo   - npm run test: Run all tests
echo   - npm run build: Build for production
echo.

pause
