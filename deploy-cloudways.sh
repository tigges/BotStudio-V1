#!/usr/bin/env bash
# BotStudio → Cloudways deploy script
# Requires: CLOUDWAYS_MASTER_IP, CLOUDWAYS_SSH_USER, CLOUDWAYS_APP_PATH
# Auth: either CLOUDWAYS_SSH_PASS (password) or ~/.ssh/cloudways_deploy_key (key)
# ──────────────────────────────────────────────────────────────────────────────

set -euo pipefail

HOST="${CLOUDWAYS_MASTER_IP:?CLOUDWAYS_MASTER_IP secret is required}"
USER="${CLOUDWAYS_SSH_USER:-master}"
APP_PATH="${CLOUDWAYS_APP_PATH:-/var/www/html}"
SRC_FILE="$(dirname "$0")/botstudio.html"
KEY_FILE="$(dirname "$0")/.cloudways_deploy_key"

echo "▶ Deploying BotStudio to $USER@$HOST:$APP_PATH"

SFTP_CMDS="
put $SRC_FILE $APP_PATH/botstudio.html
put $SRC_FILE $APP_PATH/index.html
chmod 644 $APP_PATH/botstudio.html
chmod 644 $APP_PATH/index.html
bye
"

if [ -n "${CLOUDWAYS_SSH_PASS:-}" ]; then
  echo "  Auth: password"
  sshpass -p "$CLOUDWAYS_SSH_PASS" sftp \
    -o StrictHostKeyChecking=no \
    "$USER@$HOST" <<< "$SFTP_CMDS"
elif [ -f "$KEY_FILE" ]; then
  echo "  Auth: SSH key ($KEY_FILE)"
  sftp -i "$KEY_FILE" \
    -o StrictHostKeyChecking=no \
    -o BatchMode=yes \
    "$USER@$HOST" <<< "$SFTP_CMDS"
else
  echo "✗ No credentials available." >&2
  echo "  Add one of these Cursor secrets:" >&2
  echo "    CLOUDWAYS_SSH_PASS  — your Cloudways master password" >&2
  echo "    (or add the public key below to Cloudways → SSH Keys)" >&2
  cat "$(dirname "$0")/.cloudways_deploy_key.pub" 2>/dev/null || true
  exit 1
fi

echo "✓ Deployed successfully."
echo "  Live at: https://wordpress-1344959-6399007.cloudwaysapps.com/botstudio.html"
