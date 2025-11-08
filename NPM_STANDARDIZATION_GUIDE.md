# NPM Standardization Guide

## Issue
Your project has conflicting lockfiles which is causing package manager confusion.

## Resolution Steps

1. **Remove conflicting lockfiles** (already done):
   - Deleted `supersim/examples/contests/pnpm-lock.yaml`
   - Deleted `supersim/examples/tictactoe/pnpm-lock.yaml`

2. **Next steps to complete standardization**:

   Run these commands in your terminal:

   ```bash
   # Navigate to project root
   cd /Users/cryptojoker710/Desktop/Zentix Protocol

   # Remove any existing package-lock.json files
   find . -name "package-lock.json" -type f -delete

   # Install dependencies with npm in each directory
   npm install

   # Frontend directory
   cd frontend
   npm install
   cd ..

   # Supersim examples directories
   cd supersim/examples/contests
   npm install
   cd ../../..

   cd supersim/examples/tictactoe
   npm install
   cd ../../..

   # Update VS Code settings to use npm
   echo '{"npm.packageManager": "npm"}' > .vscode/settings.json
   ```

3. **Verify the resolution**:
   - Restart VS Code
   - The package manager conflict warning should no longer appear

This will standardize your project on npm and resolve the conflicting lockfiles issue.