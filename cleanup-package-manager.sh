#!/bin/bash

echo "Starting package manager cleanup..."

# Remove pnpm lockfiles
echo "Removing pnpm lockfiles..."
find . -name "pnpm-lock.yaml" -type f -delete

# Remove any existing package-lock.json files that might be outdated
echo "Removing existing package-lock.json files..."
find . -name "package-lock.json" -type f -delete

# Run npm install in each directory with package.json
echo "Installing dependencies with npm..."

# Root directory
echo "Installing root dependencies..."
npm install

# Frontend directory
echo "Installing frontend dependencies..."
cd frontend && npm install && cd ..

# Supersim examples directories
echo "Installing supersim/examples/contests dependencies..."
cd supersim/examples/contests && npm install && cd ../../..

echo "Installing supersim/examples/tictactoe dependencies..."
cd supersim/examples/tictactoe && npm install && cd ../../..

echo "Package manager cleanup complete. All dependencies are now managed with npm."