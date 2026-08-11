#!/bin/sh
set -e

# Fly attaches the volume as an empty root-owned filesystem. Make it writable
# by the unprivileged user, then drop out of root before starting the server.
mkdir -p /data
chown -R node:node /data

exec gosu node "$@"
