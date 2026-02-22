#!/usr/bin/env python3
"""
Script to convert HTML citations to JSON format citations in History Tracers language files.

HTML format: <a href="#" onclick="htCleanSources(); htFillReferenceSource('UUID'); return false;">Text</a>
JSON format: <htciteX> where X is a number starting from 0

Usage:
    python3 convert_citations.py [filename] [--analyze-only]

Arguments:
    filename: Path to specific JSON file to process (relative to lang/ directory)
    --analyze-only: Only analyze without modifying the file (default behavior)

Examples:
    python3 convert_citations.py pt-BR/main.json
    python3 convert_citations.py en-US/main.json --analyze-only
"""

import json
import re
import os
import sys
import argparse
from pathlib import Path
from typing import Dict, List, Tuple, Any, Optional

def find_html_citations(text: str) -> List[Tuple[str, str, int]]:
    """
    Find HTML citations in text and return list of (UUID, display_text, source_type) tuples.
    Source types: 0=primary, 1=reference, 2=holy, 3=social_media
    
    Args:
        text: String containing HTML citations
        
    Returns:
        List of tuples containing (UUID, display_text, source_type), in order of appearance
    """
    results = []
    
    # Source type mapping
    source_type_map = {
        'htFillPrimarySource': 0,
        'htFillReferenceSource': 1,
        'htFillHolySource': 2,
        'htFillSMSource': 3
    }
    
    # Single pattern to find all types, preserving order in text
    pattern = r"<a\s+href=\"#\"\s+onclick=\"htCleanSources\(\);\s*(htFill\w+)\('([^']+)'\);\s*return\s*false;\"[^>]*>(.*?)</a>"
    
    for match in re.finditer(pattern, text, re.DOTALL):
        func_name = match.group(1)
        uuid = match.group(2)
        display_text = match.group(3)
        source_type = source_type_map.get(func_name, 0)
        results.append((uuid, display_text, source_type))
    
    return results

def find_json_citations(text: str) -> List[str]:
    """
    Find existing JSON citations in text.
    
    Args:
        text: String containing JSON citations
        
    Returns:
        List of citation numbers found
    """
    pattern = r"<htcite(\d+)>"
    matches = re.findall(pattern, text)
    return matches

def find_htdate_tags(text: str) -> List[str]:
    """
    Find HTDate tags in text.
    
    Args:
        text: String containing HTDate tags
        
    Returns:
        List of date tag numbers found
    """
    pattern = r"<htdate(\d+)>"
    matches = re.findall(pattern, text)
    return matches

def process_source_text(display_text: str) -> Tuple[str, str]:
    """
    Process display text: remove htdate tags and split by comma.
    
    Args:
        display_text: The raw display text from HTML citation
        
    Returns:
        Tuple of (processed_text, page)
    """
    # Remove htdateX tags first
    text = re.sub(r'<htdate\d+>', '', display_text)
    
    # Check if "pp." is present - if so, page should contain "pp. " and all text after it
    page = ""
    pp_match = re.search(r'(pp\.\s*.+)', text)
    if pp_match:
        page = pp_match.group(1).strip()
        text = text[:pp_match.start()].strip()
    elif ',' in text:
        last_comma_idx = text.rfind(',')
        page = text[last_comma_idx + 1:].strip().replace(',', '')
        text = text[:last_comma_idx].strip()
    
    # Ensure text never ends with comma
    if text.endswith(','):
        text = text[:-1].strip()
    
    return text, page

def convert_text_citations(text: str, citation_mapping: Dict[str, int]) -> str:
    """
    Convert HTML citations in text to JSON format using a mapping.
    
    Args:
        text: String containing HTML citations
        citation_mapping: Dictionary mapping UUID to citation number
        
    Returns:
        Text with HTML citations replaced by JSON format
    """
    def replace_citation(match):
        uuid = match.group(2)
        display_text = match.group(3)
        
        if uuid in citation_mapping:
            citation_num = citation_mapping[uuid]
            return f"<htcite{citation_num}>"
        else:
            # If UUID not found in mapping, keep original
            return match.group(0)
    
    # Match all source types, preserving order in text
    pattern = r"<a\s+href=\"#\"\s+onclick=\"htCleanSources\(\);\s*(htFill\w+)\('([^']+)'\);\s*return\s*false;\"[^>]*>(.*?)</a>"
    return re.sub(pattern, replace_citation, text, flags=re.DOTALL)

def load_source_mapping() -> Dict[str, Dict[str, Any]]:
    """
    Load mapping of UUIDs to source information from source files.
    
    Returns:
        Dictionary mapping UUID to source information
    """
    source_mapping = {}
    sources_dir = Path("lang/sources")
    
    if not sources_dir.exists():
        print(f"Warning: Sources directory '{sources_dir}' not found")
        return source_mapping
    
    # Process each JSON source file
    for source_file in sources_dir.glob("*.json"):
        try:
            with open(source_file, 'r', encoding='utf-8') as f:
                source_data = json.load(f)
            
            # Process all source categories
            categories = [
                ("primary_sources", source_data.get("primary_sources", [])),
                ("reference_sources", source_data.get("reference_sources", [])),
                ("religious_sources", source_data.get("religious_sources", [])),
                ("social_media_sources", source_data.get("social_media_sources", []))
            ]
            
            for category_name, sources in categories:
                if sources:
                    for source in sources:
                        if isinstance(source, dict) and 'id' in source:
                            source_mapping[source['id']] = {
                                'citation': source.get('citation', ''),
                                'date_time': source.get('date_time', ''),
                                'published': source.get('published', ''),
                                'url': source.get('url', ''),
                                'category': category_name
                            }
            
        except Exception as e:
            print(f"Warning: Error processing source file {source_file}: {e}")
    
    print(f"Loaded {len(source_mapping)} source mappings from {len(list(sources_dir.glob('*.json')))} source files")
    return source_mapping

def process_json_content(obj: Any, path: str = "") -> List[Dict[str, Any]]:
    """
    Recursively process JSON content to find citations.
    
    Args:
        obj: JSON object to process
        path: Current path in the JSON structure
        
    Returns:
        List of dictionaries with citation information
    """
    results = []
    
    if isinstance(obj, dict):
        for key, value in obj.items():
            current_path = f"{path}.{key}" if path else key
            # Check if this is an HTText object with 'text' and 'source' fields
            if isinstance(value, str) and key == 'text':
                html_citations = find_html_citations(value)
                json_citations = find_json_citations(value)
                
                if html_citations:
                    results.append({
                        'path': current_path,
                        'parent_path': path,
                        'html_citations': html_citations,
                        'json_citations': json_citations,
                        'original_text': value,
                        'is_httext': True
                    })
            elif isinstance(value, (dict, list)):
                results.extend(process_json_content(value, current_path))
    
    elif isinstance(obj, list):
        for i, item in enumerate(obj):
            current_path = f"{path}[{i}]" if path else f"[{i}]"
            if isinstance(item, str):
                html_citations = find_html_citations(item)
                json_citations = find_json_citations(item)
                
                if html_citations:
                    results.append({
                        'path': current_path,
                        'parent_path': path,
                        'html_citations': html_citations,
                        'json_citations': json_citations,
                        'original_text': item,
                        'is_httext': False
                    })
            elif isinstance(item, dict):
                # Check if this is an HTText object
                if 'text' in item and 'source' in item:
                    text_value = item['text']
                    html_citations = find_html_citations(text_value)
                    json_citations = find_json_citations(text_value)
                    
                    if html_citations:
                        results.append({
                            'path': f"{current_path}.text",
                            'parent_path': current_path,
                            'html_citations': html_citations,
                            'json_citations': json_citations,
                            'original_text': text_value,
                            'is_httext': True,
                            'httext_obj': item
                        })
                else:
                    results.extend(process_json_content(item, current_path))
            elif isinstance(item, list):
                results.extend(process_json_content(item, current_path))
    
    return results

def analyze_file(filepath: str, source_mapping: Optional[Dict[str, Dict[str, Any]]] = None) -> Dict[str, Any]:
    """
    Analyze a single JSON file for HTML and JSON citations.
    
    Args:
        filepath: Path to the JSON file
        source_mapping: Mapping of UUID to source information
        
    Returns:
        Dictionary containing analysis results
    """
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        citations_found = process_json_content(data)
        
        # Collect all unique UUIDs and assign numbers
        all_uuids = set()
        for citation_info in citations_found:
            for uuid, _, _ in citation_info['html_citations']:
                all_uuids.add(uuid)
        
        # Create mapping: UUID -> citation number
        citation_mapping = {uuid: i for i, uuid in enumerate(sorted(all_uuids))}
        
        # Create HTSource objects for each UUID
        # Collect display text and source type from HTML citations
        uuid_to_display_text = {}
        uuid_to_source_type = {}
        for citation_info in citations_found:
            for uuid, display_text, source_type in citation_info['html_citations']:
                if uuid not in uuid_to_display_text:
                    uuid_to_display_text[uuid] = display_text
                    uuid_to_source_type[uuid] = source_type
        
        sources_to_add = []
        for uuid in sorted(all_uuids):
            if source_mapping and uuid in source_mapping:
                source_info = source_mapping[uuid]
                # Parse date if available, otherwise use default
                date_time_value = source_info.get('date_time', '')
                date_time_obj = {
                    "type": "gregory",
                    "year": "-1",
                    "month": "-1", 
                    "day": "-1"
                }
                
                # Try to parse date_time string (format: YYYY-MM-DD or YYYY)
                if date_time_value and date_time_value.strip():
                    date_parts = date_time_value.strip().split('-')
                    if len(date_parts) >= 1 and date_parts[0].isdigit():
                        date_time_obj["year"] = date_parts[0]
                    if len(date_parts) >= 2 and date_parts[1].isdigit():
                        date_time_obj["month"] = date_parts[1]
                    if len(date_parts) >= 3 and date_parts[2].isdigit():
                        date_time_obj["day"] = date_parts[2]
                
                # Use display text from HTML citation, not from source file
                # Process: remove htdate tags and split by comma
                display_text = uuid_to_display_text.get(uuid, f"Source {uuid[:8]}...")
                processed_text, page_value = process_source_text(display_text)
                source_type = uuid_to_source_type.get(uuid, 0)
                ht_source = {
                    "type": source_type,
                    "uuid": uuid,
                    "text": processed_text,
                    "page": page_value,
                    "date_time": date_time_obj
                }
                sources_to_add.append(ht_source)
            else:
                # Create minimal HTSource for unknown UUID
                display_text = uuid_to_display_text.get(uuid, f"Unknown source {uuid[:8]}...")
                processed_text, page_value = process_source_text(display_text)
                source_type = uuid_to_source_type.get(uuid, 0)
                ht_source = {
                    "type": source_type,
                    "uuid": uuid,
                    "text": processed_text,
                    "page": page_value,
                    "date_time": {
                        "type": "gregory",
                        "year": "-1",
                        "month": "-1",
                        "day": "-1"
                    }
                }
                sources_to_add.append(ht_source)
        
        # Show what conversion would look like
        conversion_examples = []
        for citation_info in citations_found:
            converted_text = convert_text_citations(citation_info['original_text'], citation_mapping)
            if converted_text != citation_info['original_text']:
                conversion_examples.append({
                    'path': citation_info['path'],
                    'original': citation_info['original_text'][:200] + "..." if len(citation_info['original_text']) > 200 else citation_info['original_text'],
                    'converted': converted_text[:200] + "..." if len(converted_text) > 200 else converted_text,
                    'html_citations': citation_info['html_citations']
                })
        
        return {
            'file': filepath,
            'total_html_citations': sum(len(c['html_citations']) for c in citations_found),
            'total_json_citations': sum(len(c['json_citations']) for c in citations_found),
            'unique_uuids': len(all_uuids),
            'uuid_mapping': citation_mapping,
            'sources_to_add': sources_to_add,
            'conversions': conversion_examples,
            'all_citation_data': citations_found
        }
        
    except Exception as e:
        return {
            'file': filepath,
            'error': str(e)
        }

def modify_file(filepath: str, analyze_only: bool = False) -> bool:
    """
    Modify a specific file to convert HTML citations to JSON format.
    
    Args:
        filepath: Path to JSON file to modify
        analyze_only: If True, only analyze without modifying
        
    Returns:
        True if successful, False otherwise
    """
    print(f"Processing: {filepath}")
    print('=' * (len(filepath) + 4))
    
    # Check if file exists
    if not Path(filepath).exists():
        print(f"Error: File '{filepath}' not found")
        return False
    
    # Load source mapping
    source_mapping = load_source_mapping()
    
    # Analyze the file first
    analysis = analyze_file(filepath, source_mapping)
    
    if 'error' in analysis:
        print(f"Error analyzing file: {analysis['error']}")
        return False
    
    if analysis['total_html_citations'] == 0:
        print("No HTML citations found in this file. No modifications needed.")
        return True
    
    print(f"HTML citations found: {analysis['total_html_citations']}")
    print(f"JSON citations found: {analysis['total_json_citations']}")
    print(f"Unique UUIDs: {analysis['unique_uuids']}")
    
    if analyze_only:
        print("\n--- ANALYSIS ONLY MODE (no modifications) ---")
        if analysis['unique_uuids'] > 0:
            print(f"\nUUID to citation number mapping:")
            for uuid, num in sorted(analysis['uuid_mapping'].items()):
                print(f"  {uuid} -> <htcite{num}>")
        
        if analysis['conversions']:
            print(f"\nConversion examples (showing first {min(3, len(analysis['conversions']))}):")
            for i, example in enumerate(analysis['conversions'][:3]):
                print(f"\nExample {i+1} - Path: {example['path']}")
                print(f"Original: {example['original']}")
                print(f"Converted: {example['converted']}")
                
                if len(example['html_citations']) > 0:
                    print("Citations found:")
                    for uuid, _, _ in example['html_citations']:
                        citation_num = analysis['uuid_mapping'][uuid]
                        print(f"  {uuid[:12]}... -> <htcite{citation_num}>")
        
        # Show sources that would be added
        if 'sources_to_add' in analysis and analysis['sources_to_add']:
            print(f"\nSources that would be added ({len(analysis['sources_to_add'])}):")
            for i, source in enumerate(analysis['sources_to_add']):
                print(f"  <htcite{i}> UUID: {source['uuid'][:12]}... Text: {source['text'][:50]}...")
        return True
    
    # Load the file for modification
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"Error loading file: {e}")
        return False
    
    # Create backup
    backup_path = filepath + '.backup'
    try:
        with open(backup_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=3, ensure_ascii=False)
        print(f"Created backup: {backup_path}")
    except Exception as e:
        print(f"Error creating backup: {e}")
        return False
    
    # Perform the conversion
    modified_data = json.loads(json.dumps(data))  # Deep copy
    
    def convert_text_and_add_sources(obj):
        if isinstance(obj, dict):
            for key, value in obj.items():
                if isinstance(value, (dict, list)):
                    convert_text_and_add_sources(value)
        elif isinstance(obj, list):
            for i, item in enumerate(obj):
                if isinstance(item, dict):
                    # Check if this is an HTText object
                    if 'text' in item and 'source' in item:
                        text_value = item['text']
                        html_citations = find_html_citations(text_value)
                        
                        if html_citations:
                            # Create local mapping for this HTText object only (starts from 0)
                            uuids_in_text = [uuid for uuid, _, _ in html_citations]
                            local_mapping = {uuid: i for i, uuid in enumerate(uuids_in_text)}
                            
                            # Convert the text with local mapping
                            item['text'] = convert_text_citations(text_value, local_mapping)
                            
                            # Add sources to this HTText object
                            existing_sources = item.get('source', [])
                            if existing_sources is None:
                                existing_sources = []
                            
                            # Collect unique sources needed for this text
                            text_sources = []
                            seen_uuids = set(source.get('uuid', '') for source in existing_sources)
                            
                            for uuid, _, _ in html_citations:
                                if uuid in local_mapping and uuid not in seen_uuids:
                                    citation_num = local_mapping[uuid]
                                    # Get source from sources_by_uuid using global mapping
                                    global_citation_num = analysis['uuid_mapping'].get(uuid)
                                    if global_citation_num is not None and global_citation_num in sources_by_uuid:
                                        source_obj = sources_by_uuid[global_citation_num]
                                        # Update the source with local citation number
                                        source_obj = dict(source_obj)
                                        source_obj['citation_num'] = citation_num
                                        text_sources.append(source_obj)
                                        seen_uuids.add(uuid)
                            
                            # Combine existing and new sources, avoiding duplicates
                            combined_sources = existing_sources + text_sources
                            
                            # Remove duplicates while preserving order
                            seen_uuids = set()
                            unique_sources = []
                            for source in combined_sources:
                                if isinstance(source, dict) and 'uuid' in source:
                                    uuid = source['uuid']
                                    if uuid not in seen_uuids:
                                        unique_sources.append(source)
                                        seen_uuids.add(uuid)
                                else:
                                    # Keep non-standard sources as-is
                                    unique_sources.append(source)
                            
                            item['source'] = unique_sources
                    else:
                        convert_text_and_add_sources(item)
                elif isinstance(item, list):
                    convert_text_and_add_sources(item)
    
    # Prepare sources array indexed by citation number
    sources_by_uuid = {}
    if 'sources_to_add' in analysis:
        for source in analysis['sources_to_add']:
            if source['uuid'] in analysis['uuid_mapping']:
                citation_num = analysis['uuid_mapping'][source['uuid']]
                sources_by_uuid[citation_num] = source
    
    # Apply conversions
    convert_text_and_add_sources(modified_data)
    
    print(f"\n--- CONVERSION SUMMARY ---")
    print(f"UUIDs converted: {len(analysis['uuid_mapping'])}")
    
    # Count how many HTText objects were updated
    updated_httexts = 0
    for citation_info in analysis['all_citation_data']:
        if 'is_httext' in citation_info and citation_info['is_httext']:
            updated_httexts += 1
    
    if updated_httexts > 0:
        print(f"HTText objects updated: {updated_httexts}")
        print(f"Total HTSource objects added: {len(analysis['sources_to_add'])}")
        
        # Show first few sources for verification
        print("Sample sources:")
        for i, source in enumerate(analysis['sources_to_add'][:3]):
            print(f"  [{i}] UUID: {source['uuid'][:12]}... Text: {source['text'][:50]}...")
    else:
        print("No HTText objects needed source updates")
    
    # Save modified file
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(modified_data, f, indent=3, ensure_ascii=False)
        print(f"Successfully modified: {filepath}")
        return True
    except Exception as e:
        print(f"Error saving modified file: {e}")
        # Try to restore from backup
        try:
            with open(backup_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=3, ensure_ascii=False)
            print("Restored original file from backup")
        except:
            print("Failed to restore original file")
        return False

def main():
    """Main function to handle command line arguments and process files."""
    parser = argparse.ArgumentParser(
        description='Convert HTML citations to JSON format in History Tracers language files',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python3 convert_citations.py pt-BR/main.json              # Convert specific file
  python3 convert_citations.py en-US/main.json --analyze-only  # Analyze only
  python3 convert_citations.py --analyze-all                   # Analyze all files (original behavior)
        """
    )
    
    parser.add_argument(
        'filename', 
        nargs='?',
        help='Specific JSON file to process (e.g., pt-BR/main.json)'
    )
    
    parser.add_argument(
        '--analyze-only',
        action='store_true',
        help='Only analyze without modifying the file'
    )
    
    parser.add_argument(
        '--analyze-all',
        action='store_true',
        help='Analyze all JSON files (original behavior)'
    )
    
    args = parser.parse_args()
    
    print("History Tracers Citation Converter")
    print("=" * 50)
    
    if args.analyze_all:
        # Original behavior - analyze all files
        print("Analyzing all language files...")
        print("=" * 50)
        
        # Load source mapping first
        source_mapping = load_source_mapping()
        
        lang_dir = Path("lang")
        json_files = list(lang_dir.rglob("*.json"))
        
        if not json_files:
            print("No JSON files found in lang/ directory")
            return
        
        print(f"Found {len(json_files)} JSON files to analyze...\n")
        
        for filepath in sorted(json_files):
            relative_path = str(filepath)
            print(f"\n{'='*60}")
            print(f"Analyzing: {relative_path}")
            print('='*60)
            
            analysis = analyze_file(relative_path, source_mapping)
            
            if 'error' in analysis:
                print(f"Error: {analysis['error']}")
                continue
            
            print(f"HTML citations found: {analysis['total_html_citations']}")
            print(f"JSON citations found: {analysis['total_json_citations']}")
            print(f"Unique UUIDs: {analysis['unique_uuids']}")
            
            if analysis['unique_uuids'] > 0:
                print(f"\nUUID to citation number mapping:")
                for uuid, num in sorted(analysis['uuid_mapping'].items()):
                    print(f"  {uuid} -> <htcite{num}>")
                
                # Show sources that would be added
                if 'sources_to_add' in analysis and analysis['sources_to_add']:
                    print(f"\nSources that would be added ({len(analysis['sources_to_add'])}):")
                    for i, source in enumerate(analysis['sources_to_add'][:3]):
                        print(f"  <htcite{i}> UUID: {source['uuid'][:12]}... Text: {source['text'][:50]}...")
                    if len(analysis['sources_to_add']) > 3:
                        print(f"  ... and {len(analysis['sources_to_add']) - 3} more")
            
            if analysis['conversions']:
                print(f"\nConversion examples (showing first {min(3, len(analysis['conversions']))}):")
                for i, example in enumerate(analysis['conversions'][:3]):
                    print(f"\nExample {i+1} - Path: {example['path']}")
                    print(f"Original: {example['original']}")
                    print(f"Converted: {example['converted']}")
                    
                    if len(example['html_citations']) > 0:
                        print("Citations found:")
                        for uuid, _, _ in example['html_citations']:
                            citation_num = analysis['uuid_mapping'][uuid]
                            print(f"  {uuid[:12]}... -> <htcite{citation_num}>")
            
            if analysis['total_html_citations'] == 0:
                print("No HTML citations found in this file.")
        
        print(f"\n{'='*60}")
        print("Analysis complete!")
        print("="*60)
        print("\nTo perform actual conversion, use:")
        print("python3 convert_citations.py <filename>")
        
    elif args.filename:
        # Process specific file
        filepath = args.filename
        if not filepath.startswith('lang/'):
            filepath = f"lang/{filepath}"
        
        if not filepath.endswith('.json'):
            filepath += '.json'
        
        success = modify_file(filepath, args.analyze_only)
        if success:
            print("\nOperation completed successfully!")
        else:
            print("\nOperation failed!")
            sys.exit(1)
    
    else:
        parser.print_help()
        print("\nPlease specify a filename or use --analyze-all to process all files.")

if __name__ == "__main__":
    main()