#!/usr/bin/env python
"""Test Gemini extraction logic"""
import os
os.environ['GEMINI_API_KEY'] = 'test-key'
os.environ['GEMINI_MODEL'] = 'gemini-2.5-flash'

from pipeline.extractor import _parse_gemini_response

# Test cases
test_cases = [
    # Valid JSON
    ('{"findings": ["f1", "f2", "f3"], "gaps": ["g1", "g2"], "field_tags": ["t1"]}', (["f1", "f2", "f3"], ["g1", "g2"], ["t1"])),
    
    # Empty arrays
    ('{"findings": [], "gaps": [], "field_tags": []}', ([], [], [])),
    
    # Partial data
    ('{"findings": ["a"]}', (["a"], [], [])),
    
    # JSON with markdown wrapping (should extract)
    ('```json\n{"findings": ["x"], "gaps": ["y"], "field_tags": ["z"]}\n```', (["x"], ["y"], ["z"])),
]

print("Testing Gemini response parsing...\n")
passed = 0
failed = 0

for content, expected in test_cases:
    try:
        result = _parse_gemini_response(content)
        if result == expected:
            print(f"✓ PASS: {content[:60]}")
            passed += 1
        else:
            print(f"✗ FAIL: {content[:60]}")
            print(f"  Expected: {expected}")
            print(f"  Got: {result}")
            failed += 1
    except Exception as e:
        print(f"✗ ERROR: {content[:60]}")
        print(f"  Error: {e}")
        failed += 1

print(f"\nResults: {passed} passed, {failed} failed")
