FROM mcr.microsoft.com/devcontainers/base:ubuntu-24.04

# ============================================================================
# GLOBAL LAYER — stack-agnostic. Every project gets this.
# Project-specific packages go in the marked section at the bottom, added by
# Claude during /setup (followed by a one-time container rebuild).
# ============================================================================

# ---------- System packages ----------
# - build-essential, python3: needed by many native npm modules and tooling
# - ripgrep, fd-find, jq, fzf: CLI tools Claude Code uses well
RUN apt-get update \
 && export DEBIAN_FRONTEND=noninteractive \
 && apt-get install -y --no-install-recommends \
      curl \
      git \
      build-essential \
      python3 \
      python3-pip \
      python3-venv \
      pipx \
      unzip \
      zip \
      ca-certificates \
      fzf \
      jq \
      ripgrep \
      fd-find \
 && apt-get clean -y && rm -rf /var/lib/apt/lists/*

# ---------- Node.js 22 LTS ----------
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
 && apt-get install -y nodejs \
 && apt-get clean -y && rm -rf /var/lib/apt/lists/*

# ---------- Persistent shell history (mounted as a volume in devcontainer.json) ----------
RUN mkdir -p /commandhistory \
 && touch /commandhistory/.zsh_history \
 && chown -R vscode:vscode /commandhistory \
 && echo 'export HISTFILE=/commandhistory/.zsh_history' >> /home/vscode/.zshrc

# ---------- npm global prefix in user dir (no sudo for global installs) ----------
USER vscode
ENV NPM_CONFIG_PREFIX=/home/vscode/.npm-global
ENV PATH=/home/vscode/.npm-global/bin:$PATH
RUN mkdir -p /home/vscode/.npm-global \
 && echo 'export NPM_CONFIG_PREFIX=/home/vscode/.npm-global' >> /home/vscode/.zshrc \
 && echo 'export PATH=/home/vscode/.npm-global/bin:$PATH'    >> /home/vscode/.zshrc \
 && echo 'export NPM_CONFIG_PREFIX=/home/vscode/.npm-global' >> /home/vscode/.bashrc \
 && echo 'export PATH=/home/vscode/.npm-global/bin:$PATH'    >> /home/vscode/.bashrc

# ---------- Pre-installed JS toolchain (global for all projects) ----------
# typescript      — TS compiler
# pnpm, yarn      — alternate package managers (npm is the default)
# task-master-ai  — task management CLI + MCP server
RUN npm install -g \
      typescript \
      pnpm \
      yarn \
      task-master-ai

# ============================================================================
# PROJECT-SPECIFIC LAYER — edited by Claude during /setup.
#
# Examples of what belongs here:
#   Expo/React Native:  apt: watchman, openjdk-17-jdk   npm -g: eas-cli
#   Native/embedded:    apt: cmake, ninja-build
#   Data/ML:            apt/pip: handled via project venv instead where possible
#
# After editing, the user must rebuild the container
# (Command Palette -> "Dev Containers: Rebuild Container").
# ============================================================================
# <<PROJECT-DEPS-START>>
# Foundry: a real browser so Claude can test extensions and web products itself and
# take store screenshots; ffmpeg for frames/GIFs from the owner's recordings; adb to
# drive an Android emulator or phone running on the host.
USER root
RUN apt-get update \
 && export DEBIAN_FRONTEND=noninteractive \
 && apt-get install -y --no-install-recommends ffmpeg xvfb android-tools-adb \
 && apt-get clean -y && rm -rf /var/lib/apt/lists/*
# Playwright's Chromium + its OS deps, installed system-wide so every session has it.
ENV PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers
RUN npx --yes playwright@1.58.1 install --with-deps chromium \
 && chown -R vscode:vscode /opt/pw-browsers
USER vscode
# <<PROJECT-DEPS-END>>

WORKDIR /workspaces
