#!/bin/bash
set -euo pipefail

PROJECT="eugenics-net"
CF_PROJECT="${CF_PAGES_PROJECT:-eugenics-net}"
PRODUCTION_BASE_URL="${PRODUCTION_BASE_URL:-https://eugenics.net}"
OPENCLAW_BIN="${OPENCLAW_BIN:-$HOME/.codex/bin/openclaw-ops}"
OPENCLAW_SSH_HOST="${OPENCLAW_SSH_HOST:-openclaw}"
OPENCLAW_WORKSPACE="${OPENCLAW_WORKSPACE:-/Users/openclaw/test-workspace/eugenics-net}"
OPENCLAW_PREVIEW_PORT="${OPENCLAW_PREVIEW_PORT:-3351}"
OPENCLAW_CHROME="${OPENCLAW_CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
SAFETY_CHECK="${SAFETY_CHECK:-$HOME/.codex/scripts/safety-check.py}"

OPENCLAW_ARGS=()
if [[ "${OPENCLAW_NO_RECEIPT:-1}" == "1" ]]; then
  OPENCLAW_ARGS+=(--no-receipt)
fi

usage() {
  cat <<'EOF'
Usage: bash ./deploy.sh <command>

Commands:
  preflight          Check local non-runtime state and current production URL.
  sync              Sync the SSD source tree to the OpenClaw workspace.
  validate          Run OpenClaw build, export-root, site checks, preview, and browser QA.
  readiness         Check Cloudflare auth, DNS, and current production-domain state.
  deploy-cf         Build on OpenClaw and deploy dist/ to Cloudflare Pages.
  deploy-closeout   Verify Cloudflare status plus local and OpenClaw production smoke.
  production-smoke  Check the production URL for content, parked redirects, and headers.
  cf-status         Show Cloudflare Pages account and recent deployment state from OpenClaw.

Local boundary:
  This script does not install dependencies, build, preview, or run browsers from the SSD project.
  Runtime work is delegated to OpenClaw.
EOF
}

run_local_preflight() {
  git status --short
  find . -maxdepth 1 \( -name node_modules -o -name dist -o -name .astro -o -name _astro -o -name .codex-results \) -print
  node scripts/content-quality-audit.mjs
  node scripts/site-integrity.mjs
  node scripts/cloudflare-readiness.mjs || true
  xmllint --noout sitemap.xml
  node scripts/production-smoke.mjs || true
}

sync_openclaw() {
  OPENCLAW_SSH_HOST="$OPENCLAW_SSH_HOST" bash scripts/sync-openclaw.sh
}

run_openclaw_exec() {
  "$OPENCLAW_BIN" "${OPENCLAW_ARGS[@]}" exec --project "$PROJECT" --cmd "$1"
}

kill_remote_pid() {
  local pid="$1"
  [[ -z "$pid" ]] && return 0
  python3 "$SAFETY_CHECK" --cmd "kill $pid" --cwd "$OPENCLAW_WORKSPACE" --target openclaw --json
  ssh "$OPENCLAW_SSH_HOST" "kill $pid"
}

run_openclaw_browser_qa() {
  local port="$OPENCLAW_PREVIEW_PORT"
  local artifact_dir="/Users/openclaw/artifacts/$PROJECT/browser-qa/$(date -u +%Y%m%d-%H%M%S)"
  local log_file="/tmp/$PROJECT-preview-$port.log"
  local existing_pids
  local preview_pid

  existing_pids="$(ssh "$OPENCLAW_SSH_HOST" "lsof -tiTCP:$port -sTCP:LISTEN || true")"
  for pid in $existing_pids; do
    kill_remote_pid "$pid"
  done

  preview_pid="$(ssh "$OPENCLAW_SSH_HOST" "cd '$OPENCLAW_WORKSPACE' && nohup npm run preview -- --host localhost --port '$port' > '$log_file' 2>&1 & echo \$!")"
  trap 'kill_remote_pid "$preview_pid" || true' EXIT

  for _ in {1..60}; do
    if ssh "$OPENCLAW_SSH_HOST" "curl -fsS 'http://localhost:$port/' >/dev/null"; then
      break
    fi
    sleep 1
  done

  ssh "$OPENCLAW_SSH_HOST" "curl -fsS 'http://localhost:$port/' >/dev/null"
  ssh "$OPENCLAW_SSH_HOST" "cd '$OPENCLAW_WORKSPACE' && OPENCLAW_QA_BASE_URL='http://localhost:$port' OPENCLAW_ARTIFACT_DIR='$artifact_dir' PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH='$OPENCLAW_CHROME' npm run qa:openclaw"
  echo "Browser QA artifacts: $artifact_dir"
  kill_remote_pid "$preview_pid"
  trap - EXIT
}

validate_openclaw() {
  sync_openclaw
  run_openclaw_exec 'npm ci'
  run_openclaw_exec 'npm run check:all'
  run_openclaw_browser_qa
}

deploy_cloudflare() {
  sync_openclaw
  python3 "$SAFETY_CHECK" --cmd "npm run deploy:cloudflare" --cwd "$OPENCLAW_WORKSPACE" --target openclaw --json
  run_openclaw_exec 'npm ci'
  ssh "$OPENCLAW_SSH_HOST" "cd '$OPENCLAW_WORKSPACE' && npm run check:cloudflare-readiness -- --require-auth"
  run_openclaw_exec 'npm run check:security'
  ssh "$OPENCLAW_SSH_HOST" "cd '$OPENCLAW_WORKSPACE' && CF_PAGES_PROJECT='$CF_PROJECT' npm run deploy:cloudflare"
}

cloudflare_status() {
  ssh "$OPENCLAW_SSH_HOST" "cd '$OPENCLAW_WORKSPACE' && npm run check:cloudflare-readiness -- --require-auth"
  ssh "$OPENCLAW_SSH_HOST" "cd '$OPENCLAW_WORKSPACE' && npm run cf:whoami && CF_PAGES_PROJECT='$CF_PROJECT' npm run cf:deployments"
}

production_closeout() {
  sync_openclaw
  cloudflare_status
  node scripts/cloudflare-readiness.mjs --require-production-domain
  PRODUCTION_BASE_URL="$PRODUCTION_BASE_URL" node scripts/production-smoke.mjs
  ssh "$OPENCLAW_SSH_HOST" "cd '$OPENCLAW_WORKSPACE' && PRODUCTION_BASE_URL='$PRODUCTION_BASE_URL' npm run check:cloudflare-readiness -- --require-auth --require-production-domain"
  ssh "$OPENCLAW_SSH_HOST" "cd '$OPENCLAW_WORKSPACE' && PRODUCTION_BASE_URL='$PRODUCTION_BASE_URL' npm run check:production"
  echo "Production closeout passed for $PRODUCTION_BASE_URL"
}

case "${1:-}" in
  preflight)
    run_local_preflight
    ;;
  sync)
    sync_openclaw
    ;;
  validate)
    validate_openclaw
    ;;
  readiness)
    node scripts/cloudflare-readiness.mjs
    ;;
  deploy-cf)
    deploy_cloudflare
    ;;
  deploy-closeout)
    production_closeout
    ;;
  production-smoke)
    PRODUCTION_BASE_URL="$PRODUCTION_BASE_URL" node scripts/production-smoke.mjs
    ;;
  cf-status)
    cloudflare_status
    ;;
  ""|help|--help|-h)
    usage
    ;;
  *)
    usage
    exit 2
    ;;
esac
