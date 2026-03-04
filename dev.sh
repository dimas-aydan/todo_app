#!/bin/bash

# Ensure we exit on any error
set -e

echo "Starting development environment for todo_app..."

echo "Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "node_modules not found. Installing dependencies..."
    npm install
else
    echo "Dependencies already installed."
fi

echo "Setting up database..."
if [ -d "prisma" ]; then
    echo "Generating Prisma client..."
    npx prisma generate
    
    echo "Pushing database schema..."
    npx prisma db push
fi

echo "Starting Next.js development server..."
npm run dev
