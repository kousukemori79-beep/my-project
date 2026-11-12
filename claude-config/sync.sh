#!/usr/bin/env bash
#
# Claude Code 設定を Git リポジトリ(dotclaude/) と ~/.claude の間で同期する (Mac / Linux)
#
# 使い方:
#   ./sync.sh push   # ~/.claude -> リポジトリ (このPCの設定を"正"としてリポジトリへ取り込む)
#   ./sync.sh pull   # リポジトリ -> ~/.claude (リポジトリの設定をこのPCへ反映する)
#
# 秘密情報を含む settings.local.json と、PC固有の ~/.claude.json は同期しません。

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_CLAUDE="$SCRIPT_DIR/dotclaude"
HOME_CLAUDE="$HOME/.claude"

# 同期対象ファイル (秘密情報を含む settings.local.json は意図的に除外)
FILES=("settings.json" "CLAUDE.md" "keybindings.json")

timestamp="$(date +%Y%m%d-%H%M%S)"

usage() {
  echo "Usage: $0 {push|pull}"
  echo "  push : ~/.claude -> repo (dotclaude/)"
  echo "  pull : repo (dotclaude/) -> ~/.claude"
  exit 1
}

[ $# -eq 1 ] || usage
cmd="$1"

backup() {
  local f="$1"
  if [ -f "$f" ]; then
    cp "$f" "$f.bak-$timestamp"
    echo "  backup: $f -> $(basename "$f").bak-$timestamp"
  fi
}

case "$cmd" in
  push)
    mkdir -p "$REPO_CLAUDE"
    for f in "${FILES[@]}"; do
      if [ -f "$HOME_CLAUDE/$f" ]; then
        backup "$REPO_CLAUDE/$f"
        cp "$HOME_CLAUDE/$f" "$REPO_CLAUDE/$f"
        echo "pushed: ~/.claude/$f -> dotclaude/$f"
      else
        echo "skip (not found): ~/.claude/$f"
      fi
    done
    echo ""
    echo "完了。次を実行してリポジトリへ反映してください:"
    echo "  git add claude-config/dotclaude && git commit -m \"Update Claude config\" && git push"
    ;;
  pull)
    mkdir -p "$HOME_CLAUDE"
    for f in "${FILES[@]}"; do
      if [ -f "$REPO_CLAUDE/$f" ]; then
        backup "$HOME_CLAUDE/$f"
        cp "$REPO_CLAUDE/$f" "$HOME_CLAUDE/$f"
        echo "pulled: dotclaude/$f -> ~/.claude/$f"
      else
        echo "skip (not in repo): dotclaude/$f"
      fi
    done
    echo ""
    echo "完了。Claude Code を再起動して設定を確認してください。"
    ;;
  *)
    usage
    ;;
esac
