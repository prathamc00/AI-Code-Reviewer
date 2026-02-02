"""
Quick test script to verify static analyzers work correctly.
Run this to test the analyzers without needing GitHub or LLM integration.
"""

from analyzer import analyze_code

# Read test file
with open('test_sample.py', 'r') as f:
    code = f.read()

# Run analyzers
findings = analyze_code({'test_sample.py': code})

print(f"Found {len(findings)} issues:\n")

for i, finding in enumerate(findings, 1):
    print(f"{i}. [{finding.category.value}] Line {finding.line}")
    print(f"   Issue: {finding.issue}")
    print(f"   Snippet: {finding.code_snippet}")
    print()

print(f"\nBreakdown:")
categories = {}
for finding in findings:
    cat = finding.category.value
    categories[cat] = categories.get(cat, 0) + 1

for cat, count in categories.items():
    print(f"  {cat}: {count}")
