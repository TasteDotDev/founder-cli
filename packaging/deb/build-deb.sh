#!/bin/bash
set -euo pipefail

VERSION="${1:-0.1.0}"
ARCH="${2:-amd64}"  # amd64 or arm64
BINARY="${3:-founder-linux-x64}"

PKG_DIR="founder_${VERSION}_${ARCH}"
rm -rf "$PKG_DIR"

# Create package structure
mkdir -p "$PKG_DIR/DEBIAN"
mkdir -p "$PKG_DIR/usr/bin"

# Copy binary
cp "$BINARY" "$PKG_DIR/usr/bin/founder"
chmod 755 "$PKG_DIR/usr/bin/founder"

# Create control file
cat > "$PKG_DIR/DEBIAN/control" <<EOF
Package: founder
Version: ${VERSION}
Section: utils
Priority: optional
Architecture: ${ARCH}
Maintainer: taste.dev <hello@taste.dev>
Description: Business consultant in your terminal — 568 frameworks, any LLM
 Founder CLI gives you access to 568 business frameworks across 16 categories.
 Works with Anthropic Claude, OpenAI, Google Gemini, OpenRouter, or any
 OpenAI-compatible endpoint.
Homepage: https://github.com/TasteDotDev/founder-cli
EOF

# Build .deb
dpkg-deb --build "$PKG_DIR"
echo "Built ${PKG_DIR}.deb"
