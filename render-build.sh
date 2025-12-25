#!/usr/bin/env bash
# exit on error
set -o errexit

# Install root dependencies (skipped - no root package.json)
# npm install

# Build Client
echo "Building Client..."
cd client
npm install
npm run build
cd ..

# Build Server
echo "Building Server..."
cd server
npm install
npx prisma generate
npm run build

# Prepare Public Folder
echo "Copying frontend build to server..."
mkdir -p public
cp -r ../client/dist/* public/
