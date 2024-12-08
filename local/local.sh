#!/bin/sh

[[ -z "$MAGIC_AUTH_PUBLIC_KEY" ]] && { echo "MAGIC_AUTH_PUBLIC_KEY needs value"; exit 1; }

API_KEY=$MAGIC_AUTH_PUBLIC_KEY

ENV_FILE=$(grep "[[:graph:]]=" .env.example) # uses DIR from Makefile call

[[ -z "$ENV_FILE" ]] && { echo "ENV_FILE needs value"; exit 1; }

ENV_FILE=$(echo $ENV_FILE | sed "s/pk_live..../${API_KEY}/g")

BUILD_ARGS=$(for i in $ENV_FILE; do out+="--build-arg $i " ; done; echo $out;out="")

[[ -z "$BUILD_ARGS" ]] && { echo "BUILD_ARGS needs value"; exit 1; }

docker build -t magic_dashboard:latest --build-arg NPM_TOKEN=$NPM_TOKEN $BUILD_ARGS -f deploy/Dockerfile --target builder-base .
docker run -d -p 3015:3015 -ti -e magic_dashboard:latest sh -c "NEXT_PUBLIC_MAGIC_API_KEY=$API_KEY pnpm dev"
