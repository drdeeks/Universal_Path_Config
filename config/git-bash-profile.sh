#!/bin/bash
# Universal Development Environment - Git Bash Profile
# Auto-generated configuration for Git Bash

# Environment Variables
export PROJECTS="$USERPROFILE/Projects"
export EDITOR="code"
export DEV_HOME="$PROJECTS"

# Ensure Projects directory exists and set as default
if [ ! -d "/c/Users/$USERNAME/Projects" ]; then
    mkdir -p "/c/Users/$USERNAME/Projects"
fi

# Default to projects directory on Git Bash start
cd "/c/Users/$USERNAME/Projects" 2>/dev/null || cd "$USERPROFILE"

# Enhanced aliases for navigation
alias cdprojects='cd "/c/Users/$USERNAME/Projects"'
alias cdwin='cd "$USERPROFILE"'
alias cdh='cd ~'

# Windows integration
alias explorer='explorer.exe'
alias notepad='notepad.exe'
alias code-here='code .'
alias code-projects='code "/c/Users/$USERNAME/Projects"'

# Enhanced Git aliases
alias gs='git status'
alias ga='git add'
alias gc='git commit'
alias gp='git push'
alias gl='git pull'
alias gb='git branch'
alias gco='git checkout'

# Development shortcuts
alias ll='ls -la'
alias la='ls -A'
alias l='ls -CF'
alias grep='grep --color=auto'

# Enhanced prompt with git branch and current path
parse_git_branch() {
    git branch 2> /dev/null | sed -e '/^[^*]/d' -e 's/* \(.*\)/ (\1)/'
}

export PS1='\[\033[01;32m\]\u@\h\[\033[00m\]:\[\033[01;34m\]\w\[\033[33m\]$(parse_git_branch)\[\033[00m\]\$ '

# Node/NPM shortcuts
alias npm-global='npm list -g --depth=0'
alias npm-update='npm update -g'

# Development environment status
dev-status() {
    echo "🔍 Git Bash Development Environment Status:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Current location
    echo "📁 Current: $(pwd)"
    
    # Git status
    if command -v git &> /dev/null; then
        echo "✅ Git: $(git --version)"
        if [ -d .git ]; then
            echo "🌿 Git repo: $(git symbolic-ref --short HEAD 2>/dev/null || echo 'detached')"
        fi
    else
        echo "❌ Git: Not available"
    fi
    
    # Node/NPM status
    if command -v node &> /dev/null; then
        echo "✅ Node: $(node --version)"
    else
        echo "❌ Node: Not available"
    fi
    
    if command -v npm &> /dev/null; then
        echo "✅ NPM: v$(npm --version)"
    else
        echo "❌ NPM: Not available"
    fi
    
    # VS Code status
    if command -v code &> /dev/null; then
        echo "✅ VS Code: Available"
    else
        echo "❌ VS Code: Not available"
    fi
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# Quick project creation
new-project() {
    local project_name="$1"
    
    if [ -z "$project_name" ]; then
        read -p "Enter project name: " project_name
    fi
    
    local project_path="/c/Users/$USERNAME/Projects/$project_name"
    
    if [ -d "$project_path" ]; then
        echo "❌ Project '$project_name' already exists!"
        return 1
    fi
    
    mkdir -p "$project_path"
    cd "$project_path"
    
    # Initialize git repo
    if command -v git &> /dev/null; then
        git init
        echo "✅ Initialized Git repository"
    fi
    
    # Create basic project structure
    echo "# $project_name" > README.md
    echo "" >> README.md
    echo "Project description here." >> README.md
    
    cat > .gitignore << EOL
node_modules/
.env
*.log
.DS_Store
Thumbs.db
EOL
    
    echo "🚀 Created project '$project_name' at: $project_path"
    echo "📁 Opening in VS Code..."
    
    if command -v code &> /dev/null; then
        code .
    fi
}

# Welcome message
echo "⚡ Git Bash Development Environment"
echo "📁 Current: $(pwd)"
echo "💡 Quick commands: cdprojects, dev-status, new-project" 