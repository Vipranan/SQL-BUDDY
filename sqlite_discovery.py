import os
from pathlib import Path

SEARCH_EXTS = (".db", ".sqlite", ".sqlite3")

# Resolve relative to this file's directory, not the working directory
PROJECT_DIR = Path(__file__).resolve().parent

def discover_sqlite_dbs(base_dir="databases"):
    base = PROJECT_DIR / base_dir
    results = []

    if not base.exists():
        return results

    for item in base.iterdir():
        if item.is_file() and item.suffix.lower() in SEARCH_EXTS:
            results.append({
                "name": item.stem,
                "path": str(item.resolve()),
                "url": f"sqlite:///{item.resolve()}"
            })
    return results