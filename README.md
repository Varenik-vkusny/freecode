# FreeCode

FreeCode is an agentic coding assistant with a native desktop interface powered by **Tauri v2**, **Next.js**, and a **Python** sidecar server.

##  Download
You can download the latest pre-built installers from the **[Releases](https://github.com/gitbannedme/freecode/releases)** page:
- **Windows**: `.msi` (Installable)
- **Linux**: `.AppImage` (Portable) or `.deb` (Debian/Ubuntu)

## Features
- **Native UI**: Built with Tauri v2 for speed and low resource usage.
- **Agentic Engine**: Python backend handles filesystem, shell, and AI reasoning.
- **Clean Interface**: Redesigned sidebar, search, and session management.
- **Auto-Setup**: Detects Rust/MSVC for Tauri mode, or falls back to pywebview automatically.

## Requirements (for building from source)
- **Node.js**
- **Python 3**
- (Optional) **Rust & MSVC Build Tools** for native performance.

## Getting Started (for developers)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/gitbannedme/freecode.git
   cd freecode
   ```

2. **Run the application:**
   - **Windows:** `start.bat`
   - **Linux/macOS:** `start.sh`

The script will automatically handle virtual environment creation and dependency installation.