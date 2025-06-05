#!/bin/bash

# Load environment variables from .env file
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "❌ .env file not found! Please create one based on env.example"
    exit 1
fi

# Validate required environment variables
if [ -z "$FLOWCORE_TENANT" ]; then
    echo "❌ FLOWCORE_TENANT is not set in .env file"
    exit 1
fi

if [ -z "$FLOWCORE_API_KEY" ]; then
    echo "❌ FLOWCORE_API_KEY is not set in .env file"
    exit 1
fi

echo "🚀 Applying Flowcore data core..."
echo "📡 Tenant: $FLOWCORE_TENANT"
echo "🔑 API Key: ${FLOWCORE_API_KEY:0:8}..."

flowcore data-core apply -f flowcore.yaml -f flowcore.local.yaml 