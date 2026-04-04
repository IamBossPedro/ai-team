#!/usr/bin/env bash
# pre-tool-guard.sh
# Boundary enforcement hook that checks if a tool call violates role boundaries.
#
# This hook is invoked by Claude Code before executing tool calls. It reads the
# current role from the environment or a role file and validates that the requested
# tool operation is allowed for that role.
#
# Environment variables:
#   AI_TEAM_ROLE       - Current active role (e.g., "backend-developer", "qa-engineer")
#   AI_TEAM_ROLE_FILE  - Path to a file containing the current role (alternative to env var)
#   TOOL_NAME          - The tool being invoked (e.g., "Bash", "Write", "Edit")
#   TOOL_INPUT         - JSON string of the tool's input parameters
#
# Exit codes:
#   0 - Tool call is allowed
#   1 - Tool call is blocked (role boundary violation)

set -euo pipefail

RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m'

# ---- Resolve current role ----

ROLE="${AI_TEAM_ROLE:-}"

if [ -z "$ROLE" ] && [ -n "${AI_TEAM_ROLE_FILE:-}" ] && [ -f "${AI_TEAM_ROLE_FILE}" ]; then
    ROLE=$(cat "$AI_TEAM_ROLE_FILE" | tr -d '[:space:]')
fi

# If no role is set, allow everything (guard is inactive)
if [ -z "$ROLE" ]; then
    exit 0
fi

TOOL="${TOOL_NAME:-}"
INPUT="${TOOL_INPUT:-}"

# If no tool info provided, allow (nothing to guard)
if [ -z "$TOOL" ]; then
    exit 0
fi

# ---- Extract file path from tool input ----

get_file_path() {
    local input="$1"
    # Try to extract file_path or path from JSON input
    echo "$input" | grep -oE '"(file_path|path)"\s*:\s*"[^"]*"' | head -1 | grep -oE '"[^"]*"$' | tr -d '"' || true
}

FILE_PATH=$(get_file_path "$INPUT")

# ---- Extract command from Bash tool input ----

get_bash_command() {
    local input="$1"
    echo "$input" | grep -oE '"command"\s*:\s*"[^"]*"' | head -1 | grep -oE '"[^"]*"$' | tr -d '"' || true
}

BASH_CMD=$(get_bash_command "$INPUT")

# ---- Role boundary definitions ----
# Each role defines:
#   ALLOWED_WRITE_PATTERNS  - File patterns the role can write to
#   BLOCKED_WRITE_PATTERNS  - File patterns the role must not write to
#   ALLOWED_COMMANDS        - Bash command prefixes allowed
#   BLOCKED_COMMANDS        - Bash command prefixes blocked

block_tool() {
    local reason="$1"
    echo -e "${RED}[role-guard] BLOCKED: ${reason}${NC}" >&2
    echo -e "${RED}[role-guard] Current role: ${ROLE}${NC}" >&2
    echo -e "${RED}[role-guard] Tool: ${TOOL}${NC}" >&2
    if [ -n "$FILE_PATH" ]; then
        echo -e "${RED}[role-guard] File: ${FILE_PATH}${NC}" >&2
    fi
    echo -e "${YELLOW}[role-guard] Switch to an appropriate role or ask the user for permission.${NC}" >&2
    exit 1
}

# Check if a file path matches any pattern in a list
matches_pattern() {
    local path="$1"
    shift
    local patterns=("$@")
    for pattern in "${patterns[@]}"; do
        if echo "$path" | grep -qE "$pattern" 2>/dev/null; then
            return 0
        fi
    done
    return 1
}

# Check if a command starts with any blocked prefix
matches_command() {
    local cmd="$1"
    shift
    local prefixes=("$@")
    for prefix in "${prefixes[@]}"; do
        if echo "$cmd" | grep -qE "^\\s*${prefix}" 2>/dev/null; then
            return 0
        fi
    done
    return 1
}

# ---- Per-role enforcement ----

case "$ROLE" in

    backend-developer)
        # Can write to backend source, tests, and config
        # Cannot write to frontend, infra, or migrations
        if [ "$TOOL" = "Write" ] || [ "$TOOL" = "Edit" ]; then
            if [ -n "$FILE_PATH" ]; then
                BLOCKED=(
                    'src/components/'
                    'src/pages/.*\.(tsx|jsx|css|scss)$'
                    'src/styles/'
                    'public/'
                    'migrations/'
                    'terraform/'
                    'infra/'
                    'k8s/'
                    'helm/'
                    '\.github/workflows/'
                    'Dockerfile'
                    'docker-compose'
                )
                if matches_pattern "$FILE_PATH" "${BLOCKED[@]}"; then
                    block_tool "backend-developer role cannot modify frontend, infrastructure, or migration files."
                fi
            fi
        fi
        ;;

    frontend-developer)
        if [ "$TOOL" = "Write" ] || [ "$TOOL" = "Edit" ]; then
            if [ -n "$FILE_PATH" ]; then
                BLOCKED=(
                    'src/(server|api|controllers|services|middleware)/'
                    'migrations/'
                    'db/'
                    'prisma/'
                    'terraform/'
                    'infra/'
                    'k8s/'
                    '\.github/workflows/'
                    'Dockerfile'
                )
                if matches_pattern "$FILE_PATH" "${BLOCKED[@]}"; then
                    block_tool "frontend-developer role cannot modify backend, database, or infrastructure files."
                fi
            fi
        fi
        ;;

    dba)
        if [ "$TOOL" = "Write" ] || [ "$TOOL" = "Edit" ]; then
            if [ -n "$FILE_PATH" ]; then
                ALLOWED=(
                    'migrations/'
                    'db/'
                    'prisma/'
                    'drizzle/'
                    'sql/'
                    'seeds/'
                    'schema\.'
                    '\.md$'
                )
                if ! matches_pattern "$FILE_PATH" "${ALLOWED[@]}"; then
                    block_tool "dba role can only modify migration, database, schema, and documentation files."
                fi
            fi
        fi
        # Block destructive database commands without confirmation
        if [ "$TOOL" = "Bash" ] && [ -n "$BASH_CMD" ]; then
            DANGEROUS_DB=(
                'DROP\s+(TABLE|DATABASE|SCHEMA)'
                'TRUNCATE\s+TABLE'
                'DELETE\s+FROM\s+\S+\s*;?\s*$'
                'rm\s+-rf'
            )
            if matches_command "$BASH_CMD" "${DANGEROUS_DB[@]}"; then
                block_tool "Destructive database operation detected. Requires explicit user confirmation."
            fi
        fi
        ;;

    devops-engineer)
        if [ "$TOOL" = "Write" ] || [ "$TOOL" = "Edit" ]; then
            if [ -n "$FILE_PATH" ]; then
                BLOCKED=(
                    'src/(components|pages|views|hooks)/'
                    'src/(server|api|controllers|services)/'
                    'migrations/'
                )
                if matches_pattern "$FILE_PATH" "${BLOCKED[@]}"; then
                    block_tool "devops-engineer role cannot modify application source code or migrations."
                fi
            fi
        fi
        ;;

    qa-engineer)
        if [ "$TOOL" = "Write" ] || [ "$TOOL" = "Edit" ]; then
            if [ -n "$FILE_PATH" ]; then
                ALLOWED=(
                    'test/'
                    'tests/'
                    '__tests__/'
                    'e2e/'
                    'cypress/'
                    'playwright/'
                    '\.test\.'
                    '\.spec\.'
                    'fixtures/'
                    'factories/'
                    '\.md$'
                    'jest\.config'
                    'vitest\.config'
                    'playwright\.config'
                    'cypress\.config'
                )
                if ! matches_pattern "$FILE_PATH" "${ALLOWED[@]}"; then
                    block_tool "qa-engineer role can only modify test files, test configs, and documentation."
                fi
            fi
        fi
        ;;

    security-analyst)
        # Read-only role: block all write tools except documentation
        if [ "$TOOL" = "Write" ] || [ "$TOOL" = "Edit" ]; then
            if [ -n "$FILE_PATH" ]; then
                ALLOWED=(
                    '\.md$'
                    'docs/'
                    'security/'
                    'package-lock\.json$'
                    'yarn\.lock$'
                    'pnpm-lock\.yaml$'
                )
                if ! matches_pattern "$FILE_PATH" "${ALLOWED[@]}"; then
                    block_tool "security-analyst role has read-only access. Can only write documentation and update lock files."
                fi
            fi
        fi
        ;;

    project-manager)
        # Read-only role: block all write tools except docs and planning
        if [ "$TOOL" = "Write" ] || [ "$TOOL" = "Edit" ]; then
            if [ -n "$FILE_PATH" ]; then
                ALLOWED=(
                    '\.md$'
                    'docs/'
                    'planning/'
                    'sprints/'
                    '\.todo'
                    'CHANGELOG'
                )
                if ! matches_pattern "$FILE_PATH" "${ALLOWED[@]}"; then
                    block_tool "project-manager role can only write to documentation and planning files."
                fi
            fi
        fi
        # Block all bash commands except read-only operations
        if [ "$TOOL" = "Bash" ] && [ -n "$BASH_CMD" ]; then
            ALLOWED_CMDS=(
                'git\s+(log|status|diff|show|branch)'
                'ls'
                'cat'
                'head'
                'tail'
                'wc'
                'find'
                'grep'
            )
            is_allowed=false
            for pattern in "${ALLOWED_CMDS[@]}"; do
                if echo "$BASH_CMD" | grep -qE "^\\s*${pattern}" 2>/dev/null; then
                    is_allowed=true
                    break
                fi
            done
            if [ "$is_allowed" = false ]; then
                block_tool "project-manager role can only run read-only commands (git log, ls, cat, grep, etc.)."
            fi
        fi
        ;;

    technical-writer)
        if [ "$TOOL" = "Write" ] || [ "$TOOL" = "Edit" ]; then
            if [ -n "$FILE_PATH" ]; then
                ALLOWED=(
                    '\.md$'
                    'docs/'
                    'README'
                    'CHANGELOG'
                    'LICENSE'
                    'CONTRIBUTING'
                    '\.txt$'
                    '\.rst$'
                )
                if ! matches_pattern "$FILE_PATH" "${ALLOWED[@]}"; then
                    block_tool "technical-writer role can only modify documentation files (.md, docs/, README, etc.)."
                fi
            fi
        fi
        ;;

    tech-lead)
        # Tech lead has broad read access but limited write
        if [ "$TOOL" = "Write" ] || [ "$TOOL" = "Edit" ]; then
            if [ -n "$FILE_PATH" ]; then
                ALLOWED=(
                    '\.md$'
                    'docs/'
                    'adr/'
                    '\.config\.'
                    'tsconfig'
                    'eslint'
                    'prettier'
                    '\.json$'
                    '\.yaml$'
                    '\.yml$'
                    '\.toml$'
                )
                if ! matches_pattern "$FILE_PATH" "${ALLOWED[@]}"; then
                    block_tool "tech-lead role should not write implementation code directly. Can modify docs, configs, and ADRs."
                fi
            fi
        fi
        ;;

    *)
        # Unknown role: log a warning but allow
        echo -e "${YELLOW}[role-guard] Unknown role '${ROLE}'. No boundaries enforced.${NC}" >&2
        ;;
esac

exit 0
