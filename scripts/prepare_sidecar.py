import os
import subprocess
import sys
import shutil
from pathlib import Path

def main():
    root = Path(__file__).parent.parent.resolve()
    backend_dir = root / "backend"
    src_tauri_bin = root / "src-tauri" / "bin"
    
    # Name for the sidecar
    # Tauri expects: name-target_triple.exe
    # We'll just build it as 'server' first
    
    print("--- Preparing Sidecar ---")
    
    if not shutil.which("pyinstaller"):
        print("Installing pyinstaller...")
        subprocess.run([sys.executable, "-m", "pip", "install", "pyinstaller"], check=True)
        
    print(f"Building backend binary from {backend_dir / 'server.py'}...")
    
    os.chdir(backend_dir)
    
    # Build with PyInstaller
    # --onefile: bundle everything into one exe
    # --name server: core name
    # --noconsole: hide the black terminal window (optional, Tauri can also 'hide' it)
    subprocess.run([
        "pyinstaller",
        "--onefile",
        "--name", "server",
        "--clean",
        "server.py"
    ], check=True)
    
    # Move to src-tauri/bin
    if not src_tauri_bin.exists():
        src_tauri_bin.mkdir(parents=True)
        
    dist_file = backend_dir / "dist" / "server.exe"
    if os.name != "nt":
        dist_file = backend_dir / "dist" / "server"
        
    # Get target triple for Tauri
    # Example: x86_64-pc-windows-msvc
    # We can use 'npx tauri info' to find out or just guess for this OS
    import platform
    machine = platform.machine().lower()
    if machine == "amd64": machine = "x86_64"
    
    system = platform.system().lower()
    if system == "windows":
        triple = f"{machine}-pc-windows-msvc"
    elif system == "darwin":
        triple = f"{machine}-apple-darwin"
    else:
        triple = f"{machine}-unknown-linux-gnu"
        
    target_bin = src_tauri_bin / f"server-{triple}{'.exe' if os.name == 'nt' else ''}"
    
    print(f"Moving binary to {target_bin}")
    if target_bin.exists():
        target_bin.unlink()
    shutil.move(str(dist_file), str(target_bin))
    
    print("\nSuccess! Sidecar binary is ready.")
    print("You can now run 'npm run tauri dev' from the root.")

if __name__ == "__main__":
    main()
