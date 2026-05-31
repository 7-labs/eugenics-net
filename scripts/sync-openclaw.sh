#!/usr/bin/env bash
set -euo pipefail

OPENCLAW_SSH_HOST="${OPENCLAW_SSH_HOST:-openclaw}"
OPENCLAW_WORKSPACE="${OPENCLAW_WORKSPACE:-/Users/openclaw/test-workspace/eugenics-net}"

ssh "$OPENCLAW_SSH_HOST" "mkdir -p '$OPENCLAW_WORKSPACE'"
rsync -az --delete \
  --exclude '.git/' \
  --exclude '.DS_Store' \
  --exclude '*.zip' \
  --exclude 'node_modules/' \
  --exclude 'dist/' \
  --exclude '.astro/' \
  --exclude '_astro/' \
  --exclude '.codex-results/' \
  ./ "$OPENCLAW_SSH_HOST:$OPENCLAW_WORKSPACE/"

echo "Synced project to $OPENCLAW_SSH_HOST:$OPENCLAW_WORKSPACE"
