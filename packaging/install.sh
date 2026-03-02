#!/bin/bash
set -euo pipefail

# Founder CLI installer
# Usage: curl -fsSL https://raw.githubusercontent.com/TasteDotDev/founder-cli/main/cli/packaging/install.sh | sh

REPO="TasteDotDev/founder-cli"
VERSION="0.1.0"
INSTALL_DIR="/usr/local/bin"

detect_platform() {
  local os arch
  os="$(uname -s | tr '[:upper:]' '[:lower:]')"
  arch="$(uname -m)"

  case "$os" in
    linux)  os="linux" ;;
    darwin) os="darwin" ;;
    *)      echo "Unsupported OS: $os"; exit 1 ;;
  esac

  case "$arch" in
    x86_64|amd64)  arch="x64" ;;
    arm64|aarch64) arch="arm64" ;;
    *)             echo "Unsupported architecture: $arch"; exit 1 ;;
  esac

  echo "${os}-${arch}"
}

main() {
  local platform binary_name url

  platform="$(detect_platform)"
  binary_name="founder-${platform}"
  url="https://github.com/${REPO}/releases/download/cli-v${VERSION}/${binary_name}"

  echo "Installing founder CLI v${VERSION} (${platform})..."

  # Download
  local tmp
  tmp="$(mktemp)"
  if command -v curl >/dev/null 2>&1; then
    curl -fsSL "$url" -o "$tmp"
  elif command -v wget >/dev/null 2>&1; then
    wget -qO "$tmp" "$url"
  else
    echo "Error: curl or wget required"
    exit 1
  fi

  chmod +x "$tmp"

  # Install
  if [ -w "$INSTALL_DIR" ]; then
    mv "$tmp" "${INSTALL_DIR}/founder"
  else
    echo "Installing to ${INSTALL_DIR} (requires sudo)..."
    sudo mv "$tmp" "${INSTALL_DIR}/founder"
  fi

  echo "Installed founder to ${INSTALL_DIR}/founder"
  echo ""
  echo "Get started:"
  echo "  founder \"describe your business problem\""
  echo "  founder list"
  echo "  founder config setup"
}

main
