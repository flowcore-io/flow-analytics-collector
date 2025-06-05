#!/bin/bash

# Load environment variables from .env file
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "❌ .env file not found! Please create one based on env.example"
    exit 1
fi

# Validate required environment variables
if [ -z "$FLOWCORE_TRANSFORMER_SECRET" ]; then
    echo "❌ FLOWCORE_TRANSFORMER_SECRET is not set in .env file"
    exit 1
fi

if [ -z "$FLOWCORE_TENANT" ]; then
    echo "❌ FLOWCORE_TENANT is not set in .env file"
    exit 1
fi

echo "🚀 Starting Flowcore local proxy with backfill (5 time buckets)..."
echo "📡 Tenant: $FLOWCORE_TENANT"
echo "🔐 Secret: ${FLOWCORE_TRANSFORMER_SECRET:0:8}..."
echo "🌐 Endpoint: http://localhost:3000/api/transformer"

flowcore scenario local \
    -f flowcore.yaml \
    -f flowcore.local.yaml \
    -f flowcore.local.development.yaml \
    -z 5 \
    -e http://localhost:3000/api/transformer \
    -H "X-Secret: $FLOWCORE_TRANSFORMER_SECRET" 