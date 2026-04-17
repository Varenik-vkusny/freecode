# FreeCode

FreeCode is an agentic coding assistant with a native, fast, and responsive user interface powered by Tauri and Next.js, backed by a Python sidecar server.

## Quick Start

It requires **Node.js** and **Python 3**. All other dependencies (like virtual environments and module installations) are handled automatically.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/gitbannedme/freecode.git
   cd freecode
   ```

2. **Launch the application:**
   - **Windows:**
     ```cmd
     start.bat
     ```
   - **Linux / macOS:**
     ```bash
     bash start.sh
     ```

*Note: The script automatically detects your environment. If you have Rust and the MSVC C++ Build Tools installed, it will launch seamlessly via Tauri for peak performance. If you don't, it will automatically fall back to the built-in Pywebview wrapper without requiring any extra setup.*