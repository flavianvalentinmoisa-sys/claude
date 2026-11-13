#!/usr/bin/env sh
# Pornește Caiet local pe http://localhost:8080
cd "$(dirname "$0")" && python3 -m http.server "${1:-8080}"
