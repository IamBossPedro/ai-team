#!/usr/bin/env bash
# pre-commit-review.sh
# A pre-commit hook that triggers a quick code review on staged changes.
# Install: Add to .claude/settings.json hooks or symlink to .git/hooks/pre-commit
#
# Usage:
#   As a git hook:  cp pre-commit-review.sh .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit
#   As a Claude Code hook: Configure in settings.json under "hooks.pre-commit"
#
# Exit codes:
#   0 - Review passed, no critical issues
#   1 - Review found critical issues (blocks commit)

set -euo pipefail

# Colors for terminal output
RED='\033[0;31m'
YELLOW='\033[0;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Configuration
MAX_DIFF_LINES="${MAX_DIFF_LINES:-500}"
SKIP_REVIEW="${SKIP_REVIEW:-false}"

# Allow skipping with environment variable
if [ "$SKIP_REVIEW" = "true" ]; then
    echo -e "${YELLOW}[pre-commit-review] Skipping review (SKIP_REVIEW=true)${NC}"
    exit 0
fi

# Get staged changes
STAGED_DIFF=$(git diff --cached --diff-filter=ACMR)

# If no staged changes, nothing to review
if [ -z "$STAGED_DIFF" ]; then
    echo -e "${GREEN}[pre-commit-review] No staged changes to review.${NC}"
    exit 0
fi

# Count diff lines to avoid reviewing massive commits
DIFF_LINES=$(echo "$STAGED_DIFF" | wc -l | tr -d ' ')
if [ "$DIFF_LINES" -gt "$MAX_DIFF_LINES" ]; then
    echo -e "${YELLOW}[pre-commit-review] Diff is ${DIFF_LINES} lines (limit: ${MAX_DIFF_LINES}).${NC}"
    echo -e "${YELLOW}[pre-commit-review] Skipping automated review for large commits.${NC}"
    echo -e "${YELLOW}[pre-commit-review] Run a full code review manually before merging.${NC}"
    exit 0
fi

# Get list of staged files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACMR)

echo -e "${GREEN}[pre-commit-review] Reviewing staged changes...${NC}"
echo ""

# ---- Quick checks that don't need AI ----

ISSUES_FOUND=0
WARNINGS_FOUND=0

# Check 1: Secrets detection
SECRETS_PATTERNS=(
    'API_KEY\s*=\s*["\x27][A-Za-z0-9]'
    'SECRET_KEY\s*=\s*["\x27][A-Za-z0-9]'
    'PRIVATE_KEY\s*=\s*["\x27][A-Za-z0-9]'
    'ACCESS_TOKEN\s*=\s*["\x27][A-Za-z0-9]'
    'password\s*=\s*["\x27][^"\x27]{8,}'
    '-----BEGIN (RSA |DSA |EC |OPENSSH )?PRIVATE KEY-----'
    'mongodb(\+srv)?://[^/\s]+:[^/\s]+@'
    'postgres(ql)?://[^/\s]+:[^/\s]+@'
    'mysql://[^/\s]+:[^/\s]+@'
)

for pattern in "${SECRETS_PATTERNS[@]}"; do
    MATCHES=$(echo "$STAGED_DIFF" | grep -nE "^\+" | grep -iE "$pattern" 2>/dev/null || true)
    if [ -n "$MATCHES" ]; then
        echo -e "${RED}[CRITICAL] Potential secret or credential detected:${NC}"
        echo "$MATCHES" | head -5
        echo ""
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
    fi
done

# Check 2: Debug statements left in code
DEBUG_PATTERNS=(
    'console\.log\('
    'debugger;'
    'binding\.pry'
    'import pdb; pdb\.set_trace'
    'breakpoint()'
    'print\(.*DEBUG'
    'TODO.*REMOVE'
    'FIXME.*HACK'
)

for pattern in "${DEBUG_PATTERNS[@]}"; do
    MATCHES=$(echo "$STAGED_DIFF" | grep -nE "^\+" | grep -E "$pattern" 2>/dev/null || true)
    if [ -n "$MATCHES" ]; then
        echo -e "${YELLOW}[WARNING] Debug statement or temporary code detected:${NC}"
        echo "$MATCHES" | head -3
        echo ""
        WARNINGS_FOUND=$((WARNINGS_FOUND + 1))
    fi
done

# Check 3: Large files
while IFS= read -r file; do
    if [ -f "$file" ]; then
        FILE_SIZE=$(wc -c < "$file" | tr -d ' ')
        if [ "$FILE_SIZE" -gt 1048576 ]; then
            echo -e "${YELLOW}[WARNING] Large file staged: ${file} ($(( FILE_SIZE / 1024 ))KB)${NC}"
            WARNINGS_FOUND=$((WARNINGS_FOUND + 1))
        fi
    fi
done <<< "$STAGED_FILES"

# Check 4: Sensitive file patterns
SENSITIVE_PATTERNS=('.env' '.pem' '.key' '.p12' '.pfx' 'credentials' 'id_rsa' 'id_ed25519')
while IFS= read -r file; do
    for pattern in "${SENSITIVE_PATTERNS[@]}"; do
        if echo "$file" | grep -qE "(^|/)${pattern}(\$|\.)" 2>/dev/null; then
            echo -e "${RED}[CRITICAL] Sensitive file staged for commit: ${file}${NC}"
            ISSUES_FOUND=$((ISSUES_FOUND + 1))
        fi
    done
done <<< "$STAGED_FILES"

# Check 5: Merge conflict markers
CONFLICT_MATCHES=$(echo "$STAGED_DIFF" | grep -nE '^\+.*(<<<<<<<|=======|>>>>>>>)' 2>/dev/null || true)
if [ -n "$CONFLICT_MATCHES" ]; then
    echo -e "${RED}[CRITICAL] Merge conflict markers found in staged changes:${NC}"
    echo "$CONFLICT_MATCHES" | head -5
    echo ""
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# ---- Summary ----

echo "---"
echo -e "[pre-commit-review] Review complete."
echo -e "  Critical issues: ${ISSUES_FOUND}"
echo -e "  Warnings: ${WARNINGS_FOUND}"
echo ""

if [ "$ISSUES_FOUND" -gt 0 ]; then
    echo -e "${RED}[pre-commit-review] BLOCKED: ${ISSUES_FOUND} critical issue(s) found.${NC}"
    echo -e "${RED}[pre-commit-review] Fix the issues above and try again.${NC}"
    echo -e "${RED}[pre-commit-review] To bypass: SKIP_REVIEW=true git commit ...${NC}"
    exit 1
fi

if [ "$WARNINGS_FOUND" -gt 0 ]; then
    echo -e "${YELLOW}[pre-commit-review] ${WARNINGS_FOUND} warning(s) found. Review before pushing.${NC}"
fi

echo -e "${GREEN}[pre-commit-review] No critical issues. Proceeding with commit.${NC}"
exit 0
