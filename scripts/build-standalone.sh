#!/bin/bash

set -e

yarn build:standalone
hash=$(git rev-parse --short HEAD)
zip -9 -r -q "build-$hash.zip" ./dist/
