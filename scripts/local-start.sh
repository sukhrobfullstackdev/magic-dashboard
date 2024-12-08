#!/bin/bash

# Default values for HOSTNAME and PORT
HOSTNAME="localhost"
PORT="3015"
MAGIC_API_KEY=""

# Parse command-line arguments
while [[ $# -gt 0 ]]; do
    key="$1"
    case $key in
        --env=*)
            ENV="${key#*=}"
            ;;
        -H)
            HOSTNAME="$2"
            shift
            ;;
        -p)
            PORT="$2"
            shift
            ;;
        -k)
            MAGIC_API_KEY="$2"
            shift
            ;;
        *)
            # Unknown argument
            echo "Unknown argument: $key"
            exit 1
            ;;
    esac
    shift
done

# Check if --env argument is provided
if [ -z "$ENV" ]; then
    echo "Please provide an environment with --env=<environment>"
    exit 1
fi

# Export HOSTNAME if provided
if [ -n "$HOSTNAME" ]; then
    export HOSTNAME="$HOSTNAME"
fi

# Export PORT if provided
if [ -n "$PORT" ]; then
    export PORT="$PORT"
fi

if [ -n "$MAGIC_API_KEY" ]; then
    export NEXT_PUBLIC_MAGIC_API_KEY="$MAGIC_API_KEY"
fi

# Echo different message based on the environment
case $ENV in
    local)
        echo "💻 Running in local environment\n"

        if [ -z "$MAGIC_API_KEY" ]; then
            echo "Please specify magic api key. pnpm run local -- -k <MAGIC_API_KEY>"
            exit 1
        fi

        rimraf .next
        vercel env pull .env --environment=Development
        next dev -H $HOSTNAME
        ;;
    ip)
        echo "🦄 Running with IP configuration\n"

        if [ -z "$MAGIC_API_KEY" ]; then
            echo "Please specify magic api key. pnpm run local -- -k <MAGIC_API_KEY>"
            exit 1
        fi

        export HOSTNAME=$(ipconfig getifaddr en0);
        export BACKEND_URL=http://${HOSTNAME}:8080
        export NEXT_PUBLIC_APP_URL=http://${HOSTNAME}:${PORT}
        export NEXT_PUBLIC_BACKEND_URL=http://${HOSTNAME}:8080
        export NEXT_PUBLIC_MAGIC_AUTH_ENDPOINT=http://${HOSTNAME}:3014

        rimraf .next
        vercel env pull .env --environment=Development
        next dev -H $HOSTNAME
        ;;
    stage)
        echo "🔥 Running in staging environment\n"
        rimraf .next
        vercel env pull .env --environment=preview --git-branch=stagef
        next dev -H $HOSTNAME
        ;;
    prod)
        echo "🚀 Running in production environment\n"
        rimraf .next
        vercel env pull .env --environment=production
        next dev -H $HOSTNAME
        ;;
    *)
        echo "🚫 Invalid environment specified: $ENV\n"
        exit 1
        ;;
esac
