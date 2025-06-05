#!/bin/bash

# Load environment variables from .env file
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Run the flowcore backfill command with the environment variable
flowcore scenario local \
  -f flowcore.yaml \
  -f flowcore.local.yaml \
  -f flowcore.local.development.yaml \
  -z 5 \
  -e http://localhost:3000/api/transformer \
  -H "X-Secret: $FLOWCORE_TRANSFORMER_SECRET" 