#!/usr/bin/env python3
"""
TTEC Executive Intelligence Briefing — Document Generator

Generates PowerPoint, Excel, and Word documents from YAML data files.

Usage:
    python generate.py           # Generate all documents
    python generate.py --pptx    # PowerPoint only
    python generate.py --xlsx    # Excel only
    python generate.py --docx    # Word only
"""

import argparse
import sys
from pathlib import Path

import yaml

# Project root
ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))


def load_config():
    """Load branding/config from config.yaml."""
    config_path = ROOT / "config.yaml"
    with open(config_path, "r") as f:
        return yaml.safe_load(f)


def load_all_data():
    """Load all YAML data files into a single dict keyed by filename stem."""
    data_dir = ROOT / "data"
    data = {}
    for yaml_file in sorted(data_dir.glob("*.yaml")):
        with open(yaml_file, "r") as f:
            data[yaml_file.stem] = yaml.safe_load(f)
    return data


def get_output_path(config, extension):
    """Build output file path from config template."""
    output_dir = ROOT / "output"
    output_dir.mkdir(exist_ok=True)

    quarter = config.get("quarter", "Q1")
    year = config.get("year", 2026)

    templates = config.get("output", {})
    if extension == "pptx":
        filename = templates.get("pptx_filename", "TTEC_Intelligence_Briefing_{quarter}_{year}.pptx")
    elif extension == "xlsx":
        filename = templates.get("xlsx_filename", "TTEC_Financial_Data_{quarter}_{year}.xlsx")
    elif extension == "docx":
        filename = templates.get("docx_filename", "TTEC_Detailed_Analysis_{quarter}_{year}.docx")
    else:
        filename = f"output.{extension}"

    filename = filename.replace("{quarter}", quarter).replace("{year}", str(year))
    return output_dir / filename


def main():
    parser = argparse.ArgumentParser(
        description="Generate TTEC Executive Intelligence Briefing documents"
    )
    parser.add_argument("--pptx", action="store_true", help="Generate PowerPoint only")
    parser.add_argument("--xlsx", action="store_true", help="Generate Excel only")
    parser.add_argument("--docx", action="store_true", help="Generate Word only")
    args = parser.parse_args()

    # If no specific flag, generate all
    generate_all = not (args.pptx or args.xlsx or args.docx)

    print("Loading configuration and data...")
    config = load_config()
    data = load_all_data()
    print(f"  Loaded {len(data)} data files")

    quarter = config.get("quarter", "Q1")
    year = config.get("year", 2026)
    print(f"  Reporting period: {quarter} {year}")
    print()

    if generate_all or args.pptx:
        print("Generating PowerPoint presentation...")
        from generators.pptx_generator import generate as gen_pptx
        gen_pptx(data, config, str(get_output_path(config, "pptx")))

    if generate_all or args.xlsx:
        print("Generating Excel workbook...")
        from generators.xlsx_generator import generate as gen_xlsx
        gen_xlsx(data, config, str(get_output_path(config, "xlsx")))

    if generate_all or args.docx:
        print("Generating Word document...")
        from generators.docx_generator import generate as gen_docx
        gen_docx(data, config, str(get_output_path(config, "docx")))

    print()
    print("Done! Output files are in the output/ directory.")


if __name__ == "__main__":
    main()
