#!/bin/sh
set -e
root="$(cd "$(dirname "$0")/.." && pwd)"
hooks_dir="$root/.git/hooks"
src="$root/scripts/git-hooks/commit-msg"

if [ ! -d "$root/.git" ]; then
  echo "Skipping git hooks install: not a git repository"
  exit 0
fi

mkdir -p "$hooks_dir"
cp "$src" "$hooks_dir/commit-msg"
chmod +x "$hooks_dir/commit-msg"
echo "Installed commit-msg hook (strips Cursor co-author trailers)"
