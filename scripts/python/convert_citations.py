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
    # Note: </a> is optional (some citations lack the closing tag)
    pattern = r"<a\s+href=\"#\"\s+onclick=\"htCleanSources\(\);\s*(htFill\w+)\('([^']+)'\);\s*return\s*false;\"[^>]*>(.*?)(?:</a>|$)"
    
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
    
    # Remove all HTML tags
    text = re.sub(r'<[^>]+>', '', text)
    
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

def convert_text_citations(text: str, offset: int = 0) -> str:
    """
    Convert HTML citations in text to JSON format.
    Each citation gets a sequential number starting from `offset`.
    
    Args:
        text: String containing HTML citations
        offset: Starting number for citations (to avoid collision with existing tags)
        
    Returns:
        Text with HTML citations replaced by JSON format
    """
    counter = [offset]  # Use list to allow modification in nested function
    
    def replace_citation(match):
        citation_num = counter[0]
        counter[0] += 1
        return f"<htcite{citation_num}>"
    
    # Match all source types, preserving order in text
    # Note: </a> is optional (some citations lack the closing tag)
    pattern = r"<a\s+href=\"#\"\s+onclick=\"htCleanSources\(\);\s*(htFill\w+)\('([^']+)'\);\s*return\s*false;\"[^>]*>(.*?)(?:</a>|$)"
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

def strip_html_tags(text: str) -> str:
    """Remove all HTML tags from a string."""
    return re.sub(r'<[^>]+>', '', text)

def normalize_sources(obj: Any) -> int:
    """
    Recursively normalize all source entries in the JSON object:
    - Add citation_num sequential by position if missing
    - Strip HTML from text and page fields
    - Add uuid if missing (empty string)
    - Fix date_time empty month/day strings to "-1"
    
    Returns count of source entries modified.
    """
    modified = 0
    
    def walk(node):
        nonlocal modified
        if isinstance(node, dict):
            if 'source' in node and isinstance(node['source'], list):
                sources = node['source']
                for i, src in enumerate(sources):
                    if isinstance(src, dict):
                        # Add citation_num if missing
                        if 'citation_num' not in src:
                            src['citation_num'] = i
                            modified += 1
                        
                        # Strip HTML from text
                        if 'text' in src and isinstance(src['text'], str):
                            stripped = strip_html_tags(src['text'])
                            if stripped != src['text']:
                                src['text'] = stripped
                                modified += 1
                        
                        # Strip HTML from page
                        if 'page' in src and isinstance(src['page'], str):
                            stripped = strip_html_tags(src['page'])
                            if stripped != src['page']:
                                src['page'] = stripped
                                modified += 1
                        
                        # Add uuid if missing
                        if 'uuid' not in src:
                            src['uuid'] = ""
                            modified += 1
                        
                        # Fix date_time empty month/day
                        if 'date_time' in src and isinstance(src['date_time'], dict):
                            dt = src['date_time']
                            for field in ('month', 'day'):
                                if field in dt and dt[field] == '':
                                    dt[field] = '-1'
                                    modified += 1
            
            for value in node.values():
                walk(value)
        elif isinstance(node, list):
            for item in node:
                walk(item)
    
    walk(obj)
    return modified


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
            converted_text = convert_text_citations(citation_info['original_text'])
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
    
    # Load the file for modification (needed for exercise_v2 scan)
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"Error loading file: {e}")
        return False
    
    # Also scan exercise_v2 items for HTML citations before early return
    exercise_html_count = 0
    def count_exercise_html(obj):
        nonlocal exercise_html_count
        if isinstance(obj, dict):
            for key, value in obj.items():
                if isinstance(value, (dict, list)):
                    count_exercise_html(value)
        elif isinstance(obj, list):
            for item in obj:
                if isinstance(item, dict):
                    count_exercise_html(item)
                    for field in ('additionalInfo', 'question'):
                        if field in item and isinstance(item[field], str):
                            hc = find_html_citations(item[field])
                            if hc:
                                exercise_html_count += len(hc)
    
    count_exercise_html(data)
    
    total_html = analysis['total_html_citations'] + exercise_html_count
    
    if total_html == 0:
        print("No HTML citations found in this file. No modifications needed.")
        # Normalize existing source entries
        src_modified = normalize_sources(data)
        if src_modified > 0:
            print(f"  (Normalized {src_modified} pre-existing source entries)")
            with open(filepath, 'w', encoding='utf-8', newline='\n') as f:
                json.dump(data, f, indent=3, ensure_ascii=False)
            print(f"  (Saved normalized file)")
        # Normalize to LF-only line endings even if no modifications needed
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        if '\r\n' in content:
            content = content.replace('\r\n', '\n')
            with open(filepath, 'w', encoding='utf-8', newline='\n') as f:
                f.write(content)
            print("  (Normalized line endings to LF)")
        return True
    
    print(f"HTML citations found: {total_html}")
    print(f"  - HTText objects: {analysis['total_html_citations']}")
    if exercise_html_count > 0:
        print(f"  - exercise_v2 items: {exercise_html_count}")
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
    
    # Perform the conversion
    modified_data = json.loads(json.dumps(data))  # Deep copy
    
    fields_converted = 0
    total_sources_added = 0
    def convert_text_and_add_sources(obj, parent_dict=None):
        nonlocal fields_converted, total_sources_added
        if isinstance(obj, dict):
            # Check all string fields in this dict for HTML citations
            for key, value in list(obj.items()):
                if isinstance(value, str):
                    html_citations = find_html_citations(value)
                    if html_citations:
                        # Compute offset based on existing citations in THIS field only
                        existing_nums = find_json_citations(value)
                        cite_offset = 0
                        if existing_nums:
                            cite_offset = max(int(n) for n in existing_nums) + 1
                        existing_srcs = obj.get('source')
                        if existing_srcs is not None:
                            for s in existing_srcs:
                                cn = s.get('citation_num')
                                if cn is not None:
                                    cite_offset = max(cite_offset, cn + 1)
                        
                        # Convert the text
                        obj[key] = convert_text_citations(value, offset=cite_offset)
                        fields_converted += 1
                        
                        # Build new source entries
                        new_sources = []
                        for i, (uuid, display_text, source_type) in enumerate(html_citations, start=cite_offset):
                            processed_text, page_value = process_source_text(display_text)
                            date_time_obj = {
                                "type": "gregory",
                                "year": "-1",
                                "month": "-1",
                                "day": "-1"
                            }
                            if source_mapping and uuid in source_mapping:
                                source_info = source_mapping[uuid]
                                date_time_value = source_info.get('date_time', '')
                                if date_time_value and date_time_value.strip():
                                    date_parts = date_time_value.strip().split('-')
                                    if len(date_parts) >= 1 and date_parts[0].isdigit():
                                        date_time_obj["year"] = date_parts[0]
                                    if len(date_parts) >= 2 and date_parts[1].isdigit():
                                        date_time_obj["month"] = date_parts[1]
                                    if len(date_parts) >= 3 and date_parts[2].isdigit():
                                        date_time_obj["day"] = date_parts[2]
                            new_source = {
                                "type": source_type,
                                "uuid": uuid,
                                "text": processed_text,
                                "page": page_value,
                                "date_time": date_time_obj,
                                "citation_num": i
                            }
                            new_sources.append(new_source)
                        
                        # Add sources to the dict
                        if existing_srcs is not None:
                            obj['source'] = existing_srcs + new_sources
                        else:
                            obj['source'] = new_sources
                        total_sources_added += len(new_sources)
                
                elif isinstance(value, list):
                    # Check for string items with HTML citations in this list
                    string_citations_found = False
                    for idx, item in enumerate(value):
                        if isinstance(item, str):
                            hc = find_html_citations(item)
                            if hc:
                                if not string_citations_found:
                                    # Compute offset once
                                    cite_offset = 0
                                    existing_srcs = obj.get('source')
                                    if existing_srcs is not None:
                                        for s in existing_srcs:
                                            cn = s.get('citation_num')
                                            if cn is not None:
                                                cite_offset = max(cite_offset, cn + 1)
                                    string_citations_found = True
                                    existing_for_list = existing_srcs
                                
                                value[idx] = convert_text_citations(item, offset=cite_offset)
                                fields_converted += 1
                                
                                new_sources = []
                                for i, (uuid, display_text, source_type) in enumerate(hc, start=cite_offset):
                                    processed_text, page_value = process_source_text(display_text)
                                    date_time_obj = {
                                        "type": "gregory",
                                        "year": "-1",
                                        "month": "-1",
                                        "day": "-1"
                                    }
                                    if source_mapping and uuid in source_mapping:
                                        source_info = source_mapping[uuid]
                                        date_time_value = source_info.get('date_time', '')
                                        if date_time_value and date_time_value.strip():
                                            date_parts = date_time_value.strip().split('-')
                                            if len(date_parts) >= 1 and date_parts[0].isdigit():
                                                date_time_obj["year"] = date_parts[0]
                                            if len(date_parts) >= 2 and date_parts[1].isdigit():
                                                date_time_obj["month"] = date_parts[1]
                                            if len(date_parts) >= 3 and date_parts[2].isdigit():
                                                date_time_obj["day"] = date_parts[2]
                                    new_source = {
                                        "type": source_type,
                                        "uuid": uuid,
                                        "text": processed_text,
                                        "page": page_value,
                                        "date_time": date_time_obj,
                                        "citation_num": i
                                    }
                                    new_sources.append(new_source)
                                
                                if existing_for_list is not None:
                                    obj['source'] = existing_for_list + new_sources
                                else:
                                    obj['source'] = new_sources
                                total_sources_added += len(new_sources)
                                cite_offset += len(hc)
                    
                    # Recurse into sub-objects in the list
                    for item in value:
                        if isinstance(item, (dict, list)):
                            convert_text_and_add_sources(item)
            
            # Recurse into remaining dict sub-objects
            for value in obj.values():
                if isinstance(value, dict):
                    convert_text_and_add_sources(value)
        
        elif isinstance(obj, list):
            for item in obj:
                if isinstance(item, (dict, list)):
                    convert_text_and_add_sources(item)
    
    # Apply conversions
    convert_text_and_add_sources(modified_data)
    
    # Normalize pre-existing source entries
    src_modified = normalize_sources(modified_data)
    if src_modified > 0:
        print(f"Pre-existing source entries normalized: {src_modified}")
    
    print(f"\n--- CONVERSION SUMMARY ---")
    print(f"UUIDs converted: {len(analysis['uuid_mapping'])}")
    
    if fields_converted > 0:
        print(f"String fields updated: {fields_converted}")
        print(f"Total HTSource objects added: {total_sources_added}")
        
        # Show first few sources for verification
        if 'sources_to_add' in analysis and analysis['sources_to_add']:
            print("Sample sources:")
            for i, source in enumerate(analysis['sources_to_add'][:3]):
                print(f"  [{i}] UUID: {source['uuid'][:12]}... Text: {source['text'][:50]}...")
    else:
        print("No string fields needed source updates")
    
    # Save modified file
    try:
        with open(filepath, 'w', encoding='utf-8', newline='\n') as f:
            json.dump(modified_data, f, indent=3, ensure_ascii=False)
        print(f"Successfully modified: {filepath}")
        return True
    except Exception as e:
        print(f"Error saving modified file: {e}")
        return False

def run_audit():
	"""Walk all JSON files in lang/ and report any remaining HTML citations."""
	source_mapping = load_source_mapping()
	lang_dir = Path("lang")
	json_files = sorted(lang_dir.rglob("*.json"))
	total_html = 0
	files_with_html = []
	for fp in json_files:
		analysis = analyze_file(str(fp), source_mapping)
		if 'error' in analysis:
			continue
		if analysis['total_html_citations'] > 0:
			total_html += analysis['total_html_citations']
			files_with_html.append((str(fp), analysis['total_html_citations']))
	print(f"\nScanned {len(json_files)} files.")
	print(f"Files with HTML citations: {len(files_with_html)}")
	print(f"Total unconverted HTML citations: {total_html}")
	if files_with_html:
		for f, n in files_with_html:
			print(f"  {f}: {n} citations")
	return len(files_with_html) == 0

def run_status():
	"""Per-language summary of conversion state."""
	lang_dir = Path("lang")
	langs = sorted([d.name for d in lang_dir.iterdir() if d.is_dir() and '-' in d.name])
	for lang in langs:
		uuids = set()
		lang_path = lang_dir / lang
		for fp in lang_path.glob("*.json"):
			if fp.name != "index.json":
				uuids.add(fp.stem)
		only_cite = 0
		only_fill = 0
		both = 0
		neither = 0
		for uid in uuids:
			fpath = lang_path / f"{uid}.json"
			try:
				raw = fpath.read_text(encoding='utf-8')
			except Exception:
				continue
			hc = 'htcite' in raw
			hf = 'htFill' in raw
			if hc and not hf:
				only_cite += 1
			elif hf and not hc:
				only_fill += 1
			elif hc and hf:
				both += 1
			else:
				neither += 1
		print(f"{lang}: total={len(uuids)}, only_cite={only_cite}, only_fill={only_fill}, both={both}, neither={neither}")

def run_inspect(uuid: str, lang: str = "en-US"):
	"""Show source structure for a specific UUID."""
	fpath = Path("lang") / lang / f"{uuid}.json"
	if not fpath.exists():
		print(f"File not found: {fpath}")
		return False
	with open(fpath, encoding='utf-8') as f:
		data = json.load(f)
	found = False
	def walk(obj, depth=0):
		nonlocal found
		if isinstance(obj, dict):
			if 'source' in obj and isinstance(obj['source'], list) and obj['source']:
				found = True
				indent = "  " * depth
				print(f"{indent}Sources at depth {depth}:")
				for s in obj['source']:
					txt = s.get('text', '')
					pg = s.get('page', '')
					dt = s.get('date_time', {})
					cn = s.get('citation_num', '?')
					print(f"{indent}  [#{cn}] uuid={s.get('uuid','')[:20]}... type={s.get('type')}")
					print(f"{indent}       text=\"{txt}\"")
					print(f"{indent}       page=\"{pg}\"")
					print(f"{indent}       date_time={dt}")
			for v in obj.values():
				walk(v, depth)
		elif isinstance(obj, list):
			for item in obj:
				walk(item, depth)
	walk(data)
	if not found:
		print(f"No source arrays found in {fpath}")
	return True

def run_verify():
	"""Validate all source objects across all files in lang/."""
	lang_dir = Path("lang")
	json_files = sorted(lang_dir.rglob("*.json"))
	issues = []
	total_sources = 0
	for fp in json_files:
		try:
			with open(fp, encoding='utf-8') as f:
				data = json.load(f)
		except Exception as e:
			issues.append(f"{fp}: failed to parse ({e})")
			continue
		def find_sources(obj):
			sources = []
			if isinstance(obj, dict):
				if 'source' in obj and isinstance(obj['source'], list):
					sources.extend(obj['source'])
				for v in obj.values():
					sources.extend(find_sources(v))
			elif isinstance(obj, list):
				for item in obj:
					sources.extend(find_sources(item))
			return sources
		sources = find_sources(data)
		total_sources += len(sources)
		for s in sources:
			for field in ['type', 'uuid', 'text', 'page', 'date_time']:
				if field not in s:
					issues.append(f"{fp}: missing field \"{field}\" in source")
			text = s.get('text', '')
			if 'htFill' in text:
				issues.append(f"{fp}: text contains htFill")
			if '<' in text and '>' in text:
				issues.append(f"{fp}: text contains HTML tags")
			dt = s.get('date_time', {})
			if isinstance(dt, dict):
				for field in ['type', 'year', 'month', 'day']:
					if field not in dt:
						issues.append(f"{fp}: missing date_time.{field}")
	print(f"Total source objects verified: {total_sources}")
	if issues:
		print(f"\nIssues found ({len(issues)}):")
		for issue in issues:
			print(f"  {issue}")
	else:
		print("All source objects have correct format (type, uuid, text, page, date_time)")
	return len(issues) == 0

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
  python3 convert_citations.py --audit                         # Find remaining HTML citations
  python3 convert_citations.py --status                        # Per-language conversion status
  python3 convert_citations.py --inspect <uuid>                # Inspect sources for a UUID
  python3 convert_citations.py --verify                        # Validate all source objects
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
	
	parser.add_argument(
		'--audit',
		action='store_true',
		help='Scan all files for remaining HTML citations'
	)
	
	parser.add_argument(
		'--status',
		action='store_true',
		help='Show per-language conversion status'
	)
	
	parser.add_argument(
		'--inspect',
		type=str,
		nargs='?',
		const=None,
		help='Inspect source structure for a specific UUID (e.g., --inspect <uuid>)'
	)
	
	parser.add_argument(
		'--verify',
		action='store_true',
		help='Validate all source objects across all files'
	)
	
	args = parser.parse_args()
	
	print("History Tracers Citation Converter")
	print("=" * 50)
	
	if args.audit:
		print("Scanning for remaining HTML citations...")
		if run_audit():
			print("No HTML citations found -- all files are clean.")
		return
	
	if args.status:
		print("Per-language conversion status:")
		run_status()
		return
	
	if args.inspect is not None:
		uuid = args.inspect
		if not uuid:
			uuid = input("Enter UUID to inspect: ").strip()
		lang = input(f"Language (default en-US): ").strip() or "en-US"
		run_inspect(uuid, lang)
		return
	
	if args.verify:
		print("Validating all source objects...")
		run_verify()
		return
	
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