#!/bin/bash

# Flutter Dev Assistant - Kiro Installation Script
#
# Two installation modes:
#   GLOBAL (once):   Installs MCP server, assistants, steering files system-wide
#   PROJECT (optional): Adds skills, hooks, and workspace config to a Flutter project
#
# Usage:
#   ./plugins/kiro/install.sh                         Global install only
#   ./plugins/kiro/install.sh --project [path]        Global + project setup
#   ./plugins/kiro/install.sh --project-only [path]   Project setup only (server already installed)
#   ./plugins/kiro/install.sh --uninstall             Remove global installation
#   ./plugins/kiro/install.sh --uninstall-project [path]  Remove project files only
#   ./plugins/kiro/install.sh --help                  Show usage

set -euo pipefail

trap '_on_error' ERR
_on_error() {
    log_error "Installation failed! Check logs above."
    exit 1
}

# ─── Colors & Logging ───────────────────────────────────────────────────────

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'

log_info()    { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[✓]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[⚠]${NC} $1"; }
log_error()   { echo -e "${RED}[✗]${NC} $1"; }

# ─── Path Resolution ─────────────────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
MCP_SERVER_DIR="$PLUGIN_ROOT/mcp-server"

# Counters
SKILLS_INSTALLED=0
ASSISTANTS_INSTALLED=0
HOOKS_INSTALLED=0
MCP_INSTALLED=0

# ─── Validation ──────────────────────────────────────────────────────────────

if [ ! -f "$MCP_SERVER_DIR/index.js" ]; then
    log_error "MCP server non trovato in: $MCP_SERVER_DIR"
    log_error "Assicurati di eseguire lo script dalla Plugin_Root corretta"
    exit 1
fi

# ─── Usage ───────────────────────────────────────────────────────────────────

print_usage() {
    cat << 'USAGE'
Usage: install.sh [MODE] [OPTIONS]

Modes:
  (no flags)                    Global install (MCP server + assistants + steering)
  --project [path]              Global install + project setup
  --project-only [path]         Project setup only (assumes global already done)
  --uninstall                   Remove global installation
  --uninstall-project [path]    Remove project-local files only
  --help                        Show this help

The global install is done once and works across all Flutter projects.
Project setup adds skills, hooks, and workspace config to a specific project.

Examples:
  ./plugins/kiro/install.sh                              # Install globally
  ./plugins/kiro/install.sh --project ~/my-flutter-app   # Global + project setup
  ./plugins/kiro/install.sh --project-only               # Project setup in current dir
  ./plugins/kiro/install.sh --uninstall                  # Remove everything
USAGE
}

print_header() {
    echo ""
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║  Flutter Dev Assistant - Kiro Installation                ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
}

# ─── JSON Validation ─────────────────────────────────────────────────────────

validate_json() {
    local file="$1"
    if command -v jq &> /dev/null; then
        jq . "$file" > /dev/null 2>&1 && return 0
    elif command -v python3 &> /dev/null; then
        python3 -c "import json; json.load(open('$file'))" 2>/dev/null && return 0
    fi
    log_error "Invalid JSON in $file"
    return 1
}

# ═══════════════════════════════════════════════════════════════════════════════
# GLOBAL INSTALLATION (once, system-wide)
# ═══════════════════════════════════════════════════════════════════════════════

install_global() {
    log_info "── Global Installation ──"
    echo ""

    install_mcp_server
    install_assistants
    install_steering_files

    echo ""
    log_success "Global installation complete!"
    log_info "MCP server and assistants are available across all projects."
    log_info "Restart Kiro to activate."
    echo ""
    log_info "To add project-specific skills and hooks to a Flutter project:"
    echo "  ./plugins/kiro/install.sh --project /path/to/flutter/project"
    echo ""
}

install_mcp_server() {
    log_info "Installing MCP server..."

    if ! command -v node &> /dev/null; then
        log_warning "Node.js not found - MCP server will not be installed"
        log_warning "Install Node.js 18+ from: https://nodejs.org"
        return 1
    fi

    local node_version
    node_version=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$node_version" -lt 18 ]; then
        log_warning "Node.js $node_version is too old (need 18+)"
        return 1
    fi

    log_success "Node.js $(node --version) detected"

    local user_powers="$HOME/.kiro/powers/installed/flutter-dev-assistant"
    mkdir -p "$user_powers"

    log_info "Copying MCP server files..."
    cp -r "$MCP_SERVER_DIR"/* "$user_powers/"

    log_info "Installing dependencies..."
    if ! (cd "$user_powers" && npm install --silent > /dev/null 2>&1); then
        log_error "npm install failed. Try manually: cd $user_powers && npm install"
        return 1
    fi

    _register_mcp_global
    MCP_INSTALLED=1
    log_success "MCP server installed to: $user_powers"
}

install_assistants() {
    log_info "Installing assistants to ~/.kiro/steering/ ..."

    local global_steering="$HOME/.kiro/steering"
    mkdir -p "$global_steering"

    for assistant_file in "$PLUGIN_ROOT/plugins/kiro/steering"/*.md; do
        [ -f "$assistant_file" ] || continue
        local filename
        filename=$(basename "$assistant_file")
        local temp_file
        temp_file=$(mktemp)

        cat > "$temp_file" << 'EOF'
---
inclusion: manual
---

EOF
        cat "$assistant_file" >> "$temp_file"
        cp "$temp_file" "$global_steering/$filename"
        rm "$temp_file"

        log_success "Installed: $filename"
        ((ASSISTANTS_INSTALLED++))
    done
}

install_steering_files() {
    log_info "Installing steering workflow guides..."

    local steering_src="$SCRIPT_DIR/steering"
    [ -d "$steering_src" ] || { log_warning "No steering dir - skipping"; return 0; }

    local global_steering="$HOME/.kiro/steering"
    mkdir -p "$global_steering"

    for steering_file in "$steering_src"/*.md; do
        [ -f "$steering_file" ] || continue
        local filename
        filename=$(basename "$steering_file")
        cp "$steering_file" "$global_steering/$filename"
        log_success "Installed: $filename"
    done
}

# ─── MCP Registration (global mcp.json) ─────────────────────────────────────

_register_mcp_global() {
    log_info "Registering in ~/.kiro/settings/mcp.json ..."

    local config="$HOME/.kiro/settings/mcp.json"
    local power_path="$HOME/.kiro/powers/installed/flutter-dev-assistant/index.js"
    mkdir -p "$HOME/.kiro/settings"

    [ -f "$config" ] && cp "$config" "$config.backup"

    if command -v jq &> /dev/null; then
        [ -f "$config" ] || echo '{"mcpServers":{},"powers":{"mcpServers":{}}}' > "$config"
        jq --arg path "$power_path" \
           '.powers.mcpServers["power-flutter-dev-assistant"] = {
              "command": "node",
              "args": [$path],
              "disabled": false,
              "autoApprove": [
                "flutter-verify","flutter-security","flutter-plan",
                "flutter-checkpoint","flutter-orchestrate","flutter-learn"
              ]
            }' "$config" > "$config.tmp" && mv "$config.tmp" "$config"
    elif command -v python3 &> /dev/null; then
        python3 << PYEOF
import json
config_file = "$config"
power_path = "$power_path"
try:
    with open(config_file, 'r') as f:
        config = json.load(f)
except (FileNotFoundError, json.JSONDecodeError):
    config = {"mcpServers": {}, "powers": {"mcpServers": {}}}
config.setdefault("powers", {}).setdefault("mcpServers", {})
config["powers"]["mcpServers"]["power-flutter-dev-assistant"] = {
    "command": "node", "args": [power_path], "disabled": False,
    "autoApprove": ["flutter-verify","flutter-security","flutter-plan",
                    "flutter-checkpoint","flutter-orchestrate","flutter-learn"]
}
with open(config_file, 'w') as f:
    json.dump(config, f, indent=2)
PYEOF
    else
        log_error "Neither jq nor python3 found. Add manually to $config"
        return 1
    fi

    if ! validate_json "$config"; then
        [ -f "$config.backup" ] && cp "$config.backup" "$config"
        return 1
    fi

    log_success "MCP server registered globally"
}

# ═══════════════════════════════════════════════════════════════════════════════
# PROJECT SETUP (per-project, optional)
# ═══════════════════════════════════════════════════════════════════════════════

setup_project() {
    local project_root="$1"
    local project_kiro="$project_root/.kiro"

    log_info "── Project Setup: $project_root ──"
    echo ""

    # Validate Flutter project
    if [ ! -f "$project_root/pubspec.yaml" ]; then
        log_error "Not a Flutter project (no pubspec.yaml in $project_root)"
        exit 1
    fi
    log_success "Flutter project detected"

    # Create directories
    mkdir -p "$project_kiro"/{skills,hooks,patterns,checkpoints,settings}

    # Detect FVM
    if [ -d "$project_root/.fvm" ] || [ -f "$project_root/.fvmrc" ]; then
        echo "fvm flutter" > "$project_kiro/.flutter_command"
        log_success "FVM detected"
    else
        echo "flutter" > "$project_kiro/.flutter_command"
        log_success "Standard Flutter detected"
    fi

    # Install skills
    for skill_file in "$SCRIPT_DIR/skills"/*.md; do
        [ -f "$skill_file" ] || continue
        local filename
        filename=$(basename "$skill_file")
        cp "$skill_file" "$project_kiro/skills/$filename"
        ((SKILLS_INSTALLED++))
    done
    log_success "Installed $SKILLS_INSTALLED skills"

    # Install hooks
    for hook_file in "$SCRIPT_DIR/hooks"/*.kiro.hook; do
        [ -f "$hook_file" ] || continue
        local filename
        filename=$(basename "$hook_file")
        cp "$hook_file" "$project_kiro/hooks/$filename"
        ((HOOKS_INSTALLED++))
    done
    log_success "Installed $HOOKS_INSTALLED hooks"

    # Install templates
    if [ -d "$PLUGIN_ROOT/templates" ]; then
        mkdir -p "$project_root/flutter-dev-assistant/templates"
        cp "$PLUGIN_ROOT/templates"/* "$project_root/flutter-dev-assistant/templates/" 2>/dev/null || true
    fi

    # Create project MCP config with portable ${workspaceFolder}
    _create_project_mcp_config "$project_kiro"

    echo ""
    log_success "Project setup complete for: $project_root"
}

_create_project_mcp_config() {
    local project_kiro="$1"
    local power_path="$HOME/.kiro/powers/installed/flutter-dev-assistant/index.js"

    mkdir -p "$project_kiro/settings"

    cat > "$project_kiro/settings/mcp.json" << EOF
{
  "mcpServers": {
    "flutter-dev-assistant": {
      "command": "node",
      "args": [
        "$power_path"
      ],
      "disabled": false,
      "autoApprove": [
        "flutter-verify",
        "flutter-security",
        "flutter-plan",
        "flutter-checkpoint",
        "flutter-orchestrate",
        "flutter-learn"
      ],
      "env": {
        "KIRO_WORKSPACE_DIR": "\${workspaceFolder}"
      }
    }
  }
}
EOF

    if validate_json "$project_kiro/settings/mcp.json"; then
        log_success "Project MCP config created (portable \${workspaceFolder})"
    else
        log_error "Failed to create valid project MCP config"
    fi
}

# ═══════════════════════════════════════════════════════════════════════════════
# UNINSTALL
# ═══════════════════════════════════════════════════════════════════════════════

do_uninstall_global() {
    print_header
    log_info "Removing global installation..."
    echo ""

    # Remove MCP server
    local user_powers="$HOME/.kiro/powers/installed/flutter-dev-assistant"
    if [ -d "$user_powers" ]; then
        rm -rf "$user_powers"
        log_success "Removed MCP server"
    fi

    # Remove from global mcp.json
    local config="$HOME/.kiro/settings/mcp.json"
    if [ -f "$config" ]; then
        if command -v jq &> /dev/null; then
            jq 'del(.powers.mcpServers["power-flutter-dev-assistant"])' \
                "$config" > "$config.tmp" && mv "$config.tmp" "$config"
            log_success "Removed from mcp.json"
        elif command -v python3 &> /dev/null; then
            python3 -c "
import json
with open('$config','r') as f: c=json.load(f)
c.get('powers',{}).get('mcpServers',{}).pop('power-flutter-dev-assistant',None)
with open('$config','w') as f: json.dump(c,f,indent=2)
"
            log_success "Removed from mcp.json"
        else
            log_warning "Remove 'power-flutter-dev-assistant' from $config manually"
        fi
    fi

    # Remove steering files (only ours — installed from plugins/kiro/steering/)
    local global_steering="$HOME/.kiro/steering"
    local removed=0
    for src_dir in "$SCRIPT_DIR/steering"; do
        [ -d "$src_dir" ] || continue
        for f in "$src_dir"/*.md; do
            [ -f "$f" ] || continue
            local name
            name=$(basename "$f")
            if [ -f "$global_steering/$name" ]; then
                rm "$global_steering/$name"
                ((removed++))
            fi
        done
    done
    log_success "Removed $removed steering files"

    echo ""
    log_success "Global uninstall complete. Restart Kiro to apply."
}

do_uninstall_project() {
    local project_root="$1"
    local project_kiro="$project_root/.kiro"

    log_info "Removing project files from $project_root ..."

    rm -rf "$project_kiro/skills" 2>/dev/null || true
    rm -rf "$project_kiro/hooks" 2>/dev/null || true
    rm -f "$project_kiro/.flutter_command" 2>/dev/null || true
    rm -f "$project_kiro/settings/mcp.json" 2>/dev/null || true

    log_success "Project files removed from $project_kiro"
}

# ═══════════════════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════════════════

main() {
    local mode="global"
    local project_path=""

    while [ $# -gt 0 ]; do
        case "$1" in
            --help|-h)
                print_usage; exit 0 ;;
            --project)
                mode="global+project"
                project_path="${2:-$(pwd)}"
                [ "${2:-}" ] && shift
                ;;
            --project-only)
                mode="project-only"
                project_path="${2:-$(pwd)}"
                [ "${2:-}" ] && shift
                ;;
            --uninstall)
                mode="uninstall-global" ;;
            --uninstall-project)
                mode="uninstall-project"
                project_path="${2:-$(pwd)}"
                [ "${2:-}" ] && shift
                ;;
            -*)
                log_error "Unknown option: $1"; print_usage; exit 1 ;;
            *)
                project_path="$1" ;;
        esac
        shift
    done

    # Resolve project path to absolute if provided
    if [ -n "$project_path" ]; then
        project_path="$(cd "$project_path" 2>/dev/null && pwd)" || {
            log_error "Directory not found: $project_path"
            exit 1
        }
    fi

    case "$mode" in
        global)
            print_header
            install_global
            ;;
        global+project)
            print_header
            install_global
            setup_project "$project_path"
            ;;
        project-only)
            print_header
            log_info "Project-only setup (assuming global install already done)"
            echo ""
            # Verify global install exists
            if [ ! -d "$HOME/.kiro/powers/installed/flutter-dev-assistant" ]; then
                log_warning "Global MCP server not found. Run without --project-only first."
            fi
            setup_project "$project_path"
            ;;
        uninstall-global)
            do_uninstall_global
            ;;
        uninstall-project)
            do_uninstall_project "$project_path"
            ;;
    esac
}

main "$@"
