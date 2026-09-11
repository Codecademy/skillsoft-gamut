#!/usr/bin/env bash
# Read-only classification of origin/* branches.
# Output TSV: date, category, ahead, behind, author, branch
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

PROTECTED_FILE=".branch-audit/protected.txt"
OUT=".branch-audit/classified.tsv"
CUTOFF="${1:-2025-09-11}"

: > "$OUT"

while IFS=$'\t' read -r branch date author; do
  short="${branch#origin/}"

  read -r behind ahead < <(git rev-list --left-right --count "origin/main...$branch" 2>/dev/null | awk '{print $1, $2}')

  if grep -qxF "$short" "$PROTECTED_FILE"; then
    category="PROTECTED"
  elif [ "$ahead" -eq 0 ]; then
    category="CONTAINED"
  elif [[ "$date" > "$CUTOFF" ]]; then
    category="RECENT"
  else
    category="STALE"
  fi

  printf '%s\t%s\t%s\t%s\t%s\t%s\n' "$date" "$category" "$ahead" "$behind" "$author" "$short" >> "$OUT"
done < <(git for-each-ref --format='%(refname:short)%09%(committerdate:short)%09%(authoremail)' \
           --exclude=refs/remotes/origin/HEAD \
           refs/remotes/origin --sort=-committerdate)

echo "=== cutoff: $CUTOFF ==="
awk -F'\t' '{print $2}' "$OUT" | sort | uniq -c
