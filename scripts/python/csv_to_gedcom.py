#!/usr/bin/env python3
"""
Batch-convert CSV -> GED using local gramps CLI.
Tries to detect which CLI flags your gramps accepts (best-effort),
and writes output files with the .ged extension (e.g. foo.csv -> foo.ged).
"""

from pathlib import Path
import subprocess
import shlex
import sys
import tempfile

CSV_DIR = Path("csv")

# Fallback importer/exporter ids
FALLBACK_IMPORT = "csv"
FALLBACK_EXPORT = "gedcom"

def run(cmd):
    """Run command, return (rc, stdout, stderr)."""
    print("RUN:", cmd)
    p = subprocess.run(shlex.split(cmd), capture_output=True, text=True)
    return p.returncode, p.stdout, p.stderr

def main():
    if not CSV_DIR.exists():
        sys.exit(f"❌ Directory not found: {CSV_DIR.resolve()}")

    # Ensure the gramps binary is found. You can replace this with full path if needed.
    gramps_path = "python3 /usr/bin/gramps"

    csv_files = sorted(CSV_DIR.glob("*.csv"))
    if not csv_files:
        print("No CSV files found in", CSV_DIR.resolve())
        return

    print(f"Found {len(csv_files)} CSV files. Beginning conversion attempts...")

    for csv_path in csv_files:
        ged_path = "gedcom/" + csv_path.with_suffix(".ged").name
        print("\n=== Processing:", csv_path.name, "=>", ged_path)
        cmd =  "python3 /usr/bin/gramps --import "+ str(csv_path)+ " --format csv --export " + str(ged_path) + " --options format=gedcom"
        run(cmd)

if __name__ == "__main__":
    main()

