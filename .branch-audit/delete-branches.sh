#!/usr/bin/env bash
# Deletes remote branches by category from .branch-audit/classified.tsv.
# Dry-run unless --execute is passed. Refuses to touch main or any protected branch.
#
#   ./delete-branches.sh CONTAINED            # preview
#   ./delete-branches.sh CONTAINED --execute  # delete
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

CATEGORY="${1:?usage: delete-branches.sh <CONTAINED|STALE> [--execute]}"
EXECUTE="${2:-}"

CLASSIFIED=".branch-audit/classified.tsv"
PROTECTED_FILE=".branch-audit/protected.txt"
MANIFEST=".branch-audit/restore-manifest.tsv"

# Names that must never be deleted regardless of classification.
NEVER_DELETE=(main master origin HEAD "")

case "$CATEGORY" in
  CONTAINED|STALE) ;;
  *) echo "refusing: category must be CONTAINED or STALE, got '$CATEGORY'" >&2; exit 1 ;;
esac

for required in "$CLASSIFIED" "$PROTECTED_FILE" "$MANIFEST"; do
  [ -s "$required" ] || { echo "refusing: missing or empty $required" >&2; exit 1; }
done

targets=()
while IFS=$'\t' read -r date category ahead behind author branch; do
  [ "$category" = "$CATEGORY" ] || continue

  for forbidden in "${NEVER_DELETE[@]}"; do
    if [ "$branch" = "$forbidden" ]; then
      echo "refusing: classification contained protected name '$branch' -- aborting" >&2
      exit 1
    fi
  done

  if grep -qxF "$branch" "$PROTECTED_FILE"; then
    echo "skip (protected): $branch"
    continue
  fi

  cut -f1 "$MANIFEST" | grep -qxF "$branch" || {
    echo "refusing: '$branch' missing from restore manifest -- aborting" >&2
    exit 1
  }

  targets+=("$branch")
done < "$CLASSIFIED"

echo "category=$CATEGORY  branches=${#targets[@]}"

if [ "${#targets[@]}" -eq 0 ]; then
  echo "nothing to do"
  exit 0
fi

if [ "$EXECUTE" != "--execute" ]; then
  printf '%s\n' "${targets[@]}"
  echo
  echo "DRY RUN -- nothing deleted. Re-run with --execute to apply."
  exit 0
fi

# Delete in batches so a failure does not leave an ambiguous partial state.
batch=()
for branch in "${targets[@]}"; do
  batch+=("$branch")
  if [ "${#batch[@]}" -ge 25 ]; then
    git push origin --delete "${batch[@]}"
    batch=()
  fi
done
[ "${#batch[@]}" -gt 0 ] && git push origin --delete "${batch[@]}"

echo "deleted ${#targets[@]} branches. Restore any one with:"
echo "  sha=\$(awk -F'\\t' -v b=BRANCH '\$1==b{print \$2}' $MANIFEST)"
echo "  git push origin \$sha:refs/heads/BRANCH"
