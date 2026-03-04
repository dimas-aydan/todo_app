# Stop script execution on error
$ErrorActionPreference = "Stop"

Write-Host "Starting development environment for todo_app..." -ForegroundColor Green

Write-Host "Checking dependencies..." -ForegroundColor Cyan
if (-not (Test-Path "node_modules")) {
    Write-Host "node_modules not found. Installing dependencies..." -ForegroundColor Yellow
    npm install
} else {
    Write-Host "Dependencies already installed." -ForegroundColor Green
}

Write-Host "Setting up database..." -ForegroundColor Cyan
if (Test-Path "prisma") {
    Write-Host "Generating Prisma client..." -ForegroundColor Cyan
    npx prisma generate

    Write-Host "Pushing database schema..." -ForegroundColor Cyan
    npx prisma db push
}

Write-Host "Starting Next.js development server..." -ForegroundColor Green
npm run dev
