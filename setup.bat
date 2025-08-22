@echo off
echo 🚀 Setting up Assignment Monorepo...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install Docker first.
    pause
    exit /b 1
)

REM Check if Docker Compose is available
docker compose version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose is not available. Please ensure Docker Desktop is installed and running.
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed

REM Install root dependencies
echo 📦 Installing root dependencies...
npm install

REM Install backend dependencies
echo 🔧 Installing backend dependencies...
cd apps\backend
npm install
cd ..\..

REM Install frontend dependencies
echo 🎨 Installing frontend dependencies...
cd apps\frontend
npm install
cd ..\..

REM Start infrastructure services
echo 🐳 Starting infrastructure services...
npm run docker:up

REM Wait for services to be ready
echo ⏳ Waiting for services to be ready...
timeout /t 30 /nobreak >nul

REM Generate Prisma client
echo 🗄️ Generating Prisma client...
cd apps\backend
npm run db:generate
cd ..\..

REM Run database migrations
echo 🔄 Running database migrations...
cd apps\backend
npm run db:migrate
cd ..\..

REM Seed the database
echo 🌱 Seeding the database...
cd apps\backend
npm run db:seed
cd ..\..

echo.
echo 🎉 Setup completed successfully!
echo.
echo 📋 Next steps:
echo 1. Copy environment files:
echo    copy apps\backend\env.example apps\backend\.env
echo    copy apps\frontend\env.example apps\frontend\.env
echo.
echo 2. Start development servers:
echo    npm run dev
echo.
echo 3. Access your applications:
echo    Frontend: http://localhost:3000
echo    Backend: http://localhost:3001
echo    API Docs: http://localhost:3001/docs
echo    MinIO Console: http://localhost:9001
echo.
echo 4. Default users created:
echo    Support User: +1234567890 (Super Admin)
echo    Committee User: +1234567891 (Admin)
echo    Owner User: +1234567892 (Regular User)
echo.
echo    Note: These are placeholder Firebase UIDs. In production, use real Firebase UIDs.
echo.
echo 🔧 Available commands:
echo    npm run dev              - Start both backend and frontend
echo    npm run dev:backend      - Start only backend
echo    npm run dev:frontend     - Start only frontend
echo    npm run docker:up        - Start infrastructure services
echo    npm run docker:down      - Stop infrastructure services
echo    npm run db:seed          - Seed the database
echo    npm run test             - Run all tests
echo    npm run lint             - Lint all applications

pause
