#!/bin/bash

# Unified Build Script for Zentix Protocol
# This script handles both frontend and backend builds in a consistent manner

set -e  # Exit on any error

echo "🚀 Starting unified build process for Zentix Protocol"

# Configuration
NODE_ENV=${NODE_ENV:-production}
BUILD_DIR="dist"
FRONTEND_BUILD_DIR="frontend/dist"
BACKEND_BUILD_DIR="dist"

# Function to print status messages
print_status() {
    echo "📋 $1"
}

print_success() {
    echo "✅ $1"
}

print_error() {
    echo "❌ $1"
    exit 1
}

# Function to check if required tools are installed
check_requirements() {
    print_status "Checking build requirements..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
    fi
    
    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        print_error "package.json not found in current directory"
    fi
    
    # Check if frontend package.json exists
    if [ ! -f "frontend/package.json" ]; then
        print_error "frontend/package.json not found"
    fi
    
    print_success "All requirements met"
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing root dependencies..."
    npm ci --only=production
    
    print_status "Installing frontend dependencies..."
    cd frontend && npm ci --only=production && cd ..
    
    print_success "Dependencies installed"
}

# Function to run type checking
type_check() {
    print_status "Running TypeScript type checking..."
    npm run type-check
    
    print_status "Running frontend type checking..."
    cd frontend && npm run type-check && cd ..
    
    print_success "Type checking passed"
}

# Function to run linting
lint() {
    print_status "Running ESLint..."
    npm run lint:fix
    
    print_status "Running frontend ESLint..."
    cd frontend && npm run lint && cd ..
    
    print_success "Linting passed"
}

# Function to run tests
run_tests() {
    print_status "Running unit tests..."
    npm run test:run
    
    # Only run integration tests if we're not in a CI environment
    if [ "$CI" != "true" ]; then
        print_status "Running integration tests..."
        npm run test:integration || print_error "Integration tests failed"
    fi
    
    print_success "All tests passed"
}

# Function to build backend
build_backend() {
    print_status "Building backend..."
    npm run build:backend
    
    # Verify build output
    if [ ! -d "$BACKEND_BUILD_DIR" ]; then
        print_error "Backend build failed - $BACKEND_BUILD_DIR not found"
    fi
    
    print_success "Backend built successfully"
}

# Function to build frontend
build_frontend() {
    print_status "Building frontend..."
    cd frontend && npm run build && cd ..
    
    # Verify build output
    if [ ! -d "$FRONTEND_BUILD_DIR" ]; then
        print_error "Frontend build failed - $FRONTEND_BUILD_DIR not found"
    fi
    
    print_success "Frontend built successfully"
}

# Function to run security audit
security_audit() {
    print_status "Running security audit..."
    npm audit --audit-level high
    
    print_success "Security audit passed"
}

# Function to create deployment artifacts
create_artifacts() {
    print_status "Creating deployment artifacts..."
    
    # Create deployment info
    cat > deployment-info.json << EOF
{
  "buildTimestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "nodeVersion": "$(node --version)",
  "npmVersion": "$(npm --version)",
  "gitCommit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
  "gitBranch": "$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'unknown')",
  "environment": "$NODE_ENV"
}
EOF
    
    # Copy deployment info to both build directories
    cp deployment-info.json "$BACKEND_BUILD_DIR/"
    cp deployment-info.json "$FRONTEND_BUILD_DIR/"
    
    print_success "Deployment artifacts created"
}

# Function to cleanup build artifacts
cleanup() {
    print_status "Cleaning up temporary files..."
    rm -f deployment-info.json
    
    # Clean up any temporary build files
    find . -name "*.tmp" -delete 2>/dev/null || true
    find . -name "*.log" -delete 2>/dev/null || true
    
    print_success "Cleanup completed"
}

# Function to generate build report
generate_report() {
    print_status "Generating build report..."
    
    # Calculate build statistics
    local backend_size=$(du -sh "$BACKEND_BUILD_DIR" 2>/dev/null | cut -f1 || echo "unknown")
    local frontend_size=$(du -sh "$FRONTEND_BUILD_DIR" 2>/dev/null | cut -f1 || echo "unknown")
    local total_backend_files=$(find "$BACKEND_BUILD_DIR" -type f 2>/dev/null | wc -l || echo "0")
    local total_frontend_files=$(find "$FRONTEND_BUILD_DIR" -type f 2>/dev/null | wc -l || echo "0")
    
    cat > build-report.txt << EOF
Zentix Protocol Build Report
============================
Build completed: $(date)
Node version: $(node --version)
Environment: $NODE_ENV

Backend Build:
- Directory: $BACKEND_BUILD_DIR
- Size: $backend_size
- Files: $total_backend_files

Frontend Build:
- Directory: $FRONTEND_BUILD_DIR
- Size: $frontend_size
- Files: $total_frontend_files

Build Status: SUCCESS
EOF
    
    print_success "Build report generated: build-report.txt"
}

# Main build process
main() {
    echo "🎯 Environment: $NODE_ENV"
    echo "📁 Working directory: $(pwd)"
    echo ""
    
    # Check if this is a clean build or partial build
    CLEAN_BUILD=true
    
    if [ "$1" == "--skip-deps" ]; then
        print_status "Skipping dependency installation..."
        CLEAN_BUILD=false
    fi
    
    if [ "$1" == "--skip-tests" ]; then
        print_status "Skipping tests..."
        SKIP_TESTS=true
    fi
    
    # Execute build steps
    check_requirements
    
    if [ "$CLEAN_BUILD" = true ]; then
        install_dependencies
    fi
    
    lint
    type_check
    
    if [ "$SKIP_TESTS" != true ]; then
        run_tests
    fi
    
    security_audit
    build_backend
    build_frontend
    create_artifacts
    generate_report
    cleanup
    
    print_success "🎉 Build completed successfully!"
    echo ""
    echo "📦 Build outputs:"
    echo "   Backend: $BACKEND_BUILD_DIR ($(du -sh "$BACKEND_BUILD_DIR" 2>/dev/null | cut -f1 || echo 'unknown'))"
    echo "   Frontend: $FRONTEND_BUILD_DIR ($(du -sh "$FRONTEND_BUILD_DIR" 2>/dev/null | cut -f1 || echo 'unknown'))"
    echo ""
    echo "🚀 Ready for deployment!"
}

# Handle command line arguments
case "$1" in
    --help|-h)
        echo "Unified Build Script for Zentix Protocol"
        echo ""
        echo "Usage: $0 [options]"
        echo ""
        echo "Options:"
        echo "  --skip-deps    Skip dependency installation"
        echo "  --skip-tests   Skip running tests"
        echo "  --help         Show this help message"
        echo ""
        echo "Environment variables:"
        echo "  NODE_ENV       Set to 'production' for production builds (default: production)"
        echo "  CI             Set to 'true' to skip integration tests in CI"
        echo ""
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac