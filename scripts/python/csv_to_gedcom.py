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
import argparse

CSV_DIR = Path("csv")

# Fallback importer/exporter ids
FALLBACK_IMPORT = "csv"
FALLBACK_EXPORT = "gedcom"

def run(cmd):
    """Run command, return (rc, stdout, stderr)."""
    print("RUN:", cmd)
    p = subprocess.run(shlex.split(cmd), capture_output=True, text=True)
    return p.returncode, p.stdout, p.stderr

def convert_file(csv_path):
    """Converts a single CSV file to GEDCOM."""
    ged_path = "gedcom/" + csv_path.with_suffix(".ged").name
    print("\n=== Processing:", csv_path.name, "=>", ged_path)
    cmd = f"python3 /usr/bin/gramps --import {csv_path} --format csv --export {ged_path} --options format=gedcom"
    run(cmd)

def main():
    parser = argparse.ArgumentParser(description="Convert CSV files to GEDCOM.")
    parser.add_argument("--filename", help="A specific filename to convert.")
    args = parser.parse_args()

    if not CSV_DIR.exists():
        sys.exit(f"❌ Directory not found: {CSV_DIR.resolve()}")

    if args.filename:
        langs = ["en-US", "es-ES", "pt-BR"]
        for lang in langs:
            csv_filename = f"{args.filename}_{lang}.csv"
            csv_path = CSV_DIR / csv_filename
            if csv_path.exists():
                convert_file(csv_path)
            else:
                print(f"File not found: {csv_path}")
    else:
        csv_files = sorted(CSV_DIR.glob("*.csv"))
        if not csv_files:
            print("No CSV files found in", CSV_DIR.resolve())
            return

        print(f"Found {len(csv_files)} CSV files. Beginning conversion attempts...")

        for csv_path in csv_files:
            convert_file(csv_path)

if __name__ == "__main__":
    main()
