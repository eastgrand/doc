#!/bin/bash

# Project Configuration Manager - Local Development Setup
# This script starts the Next.js development server with the admin interface

echo "🚀 Starting Project Configuration Manager..."
echo "📍 Admin interface will be available at: http://localhost:3000/admin/project-config"
echo "🔒 Only accessible in development mode or on localhost"
echo ""

# Check if we're in the project root
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start development server
echo "🏃 Starting development server..."
npm run dev

echo ""
echo "✅ Project Configuration Manager is now running!"
echo "🌐 Open your browser to: http://localhost:3000/admin/project-config"
echo "🛑 Press Ctrl+C to stop the server" 