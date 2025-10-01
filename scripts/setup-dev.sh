#!/bin/bash

# Crowd Device Farm - Development Setup Script

set -e

echo "🚀 Setting up Crowd Device Farm development environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node --version)"
    exit 1
fi

echo "✅ Node.js $(node --version) detected"

# Check if PostgreSQL is available
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL client not found. You may need to install PostgreSQL or use Docker."
    echo "   You can start PostgreSQL with: docker-compose up postgres -d"
else
    echo "✅ PostgreSQL client detected"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build packages
echo "🔨 Building packages..."
npm run build

# Set up environment files
echo "⚙️  Setting up environment files..."

if [ ! -f packages/control-plane/.env ]; then
    cp packages/control-plane/env.example packages/control-plane/.env
    echo "✅ Created packages/control-plane/.env"
else
    echo "⚠️  packages/control-plane/.env already exists"
fi

if [ ! -f packages/node-agent/.env ]; then
    cp packages/node-agent/env.example packages/node-agent/.env
    echo "✅ Created packages/node-agent/.env"
else
    echo "⚠️  packages/node-agent/.env already exists"
fi

if [ ! -f .env ]; then
    cp env.example .env
    echo "✅ Created .env"
else
    echo "⚠️  .env already exists"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Start PostgreSQL: docker-compose up postgres -d"
echo "2. Run migrations: npm run db:migrate"
echo "3. Start development: npm run dev"
echo "4. Or use Docker: docker-compose up"
echo ""
echo "For more information, see the README.md file."

