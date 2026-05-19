#!/usr/bin/env python3
"""Start all Namakkal Medical College Hostel services."""

from __future__ import annotations

import os
import signal
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent
SERVICES = [
    ("api", ["npm", "run", "server"]),
    ("web", ["npm", "run", "client"]),
]


def ensure_dependencies() -> None:
    if not (ROOT / "node_modules").exists():
        print("node_modules not found. Run `npm install` before starting services.", file=sys.stderr)
        sys.exit(1)


def start_service(name: str, command: list[str]) -> subprocess.Popen:
    print(f"Starting {name}: {' '.join(command)}")
    return subprocess.Popen(
        command,
        cwd=ROOT,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        bufsize=1,
        preexec_fn=os.setsid if os.name != "nt" else None,
    )


def stop_service(process: subprocess.Popen) -> None:
    if process.poll() is not None:
        return

    if os.name == "nt":
        process.terminate()
    else:
        os.killpg(os.getpgid(process.pid), signal.SIGTERM)


def main() -> int:
    ensure_dependencies()
    processes = [(name, start_service(name, command)) for name, command in SERVICES]

    print("\nServices are starting:")
    print("  Frontend: http://localhost:5173/")
    print("  Backend:  http://localhost:4000/api/health")
    print("Press Ctrl+C to stop all services.\n")

    try:
        while processes:
            for name, process in list(processes):
                if process.stdout:
                    line = process.stdout.readline()
                    if line:
                        print(f"[{name}] {line}", end="")

                exit_code = process.poll()
                if exit_code is not None:
                    print(f"\n{name} exited with code {exit_code}")
                    processes.remove((name, process))
                    if exit_code != 0:
                        raise RuntimeError(f"{name} failed")
    except KeyboardInterrupt:
        print("\nStopping services...")
    except RuntimeError as error:
        print(error, file=sys.stderr)
        return 1
    finally:
        for _, process in processes:
            stop_service(process)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
