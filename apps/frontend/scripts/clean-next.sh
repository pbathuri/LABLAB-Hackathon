#!/usr/bin/env sh
# Remove .next when plain `rm -rf` fails (root-owned files, Docker, macOS xattrs).
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT" || exit 1
[ -d .next ] || exit 0

chmod -R u+w .next 2>/dev/null || true
if command -v xattr >/dev/null 2>&1; then
  xattr -cr .next 2>/dev/null || true
fi

rm -rf .next 2>/dev/null && exit 0

if command -v npx >/dev/null 2>&1; then
  npx --yes rimraf@5 .next && exit 0
fi

echo ""
echo "Could not remove .next (permission denied)."
echo "Fix ownership, then delete the folder:"
echo "  cd \"$ROOT\""
echo "  sudo chown -R \"\$(whoami)\" .next"
echo "  rm -rf .next"
echo ""
exit 1
