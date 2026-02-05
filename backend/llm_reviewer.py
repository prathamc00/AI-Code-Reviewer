"""
LLM reviewer using Google Gemini API.
"""

import os
import json
from typing import List
import google.generativeai as genai
from dotenv import load_dotenv
from analyzer.models import Finding, EnhancedFinding

load_dotenv()


class LLMReviewer:
    """Google Gemini for enhancing code findings."""
    
    def __init__(self):
        """Initialize Gemini client."""
        self.gemini_key = os.getenv("GEMINI_API_KEY")
        self.gemini_model = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
        
        if not self.gemini_key:
            raise ValueError("GEMINI_API_KEY not found. Set it in environment variables.")
        
        genai.configure(api_key=self.gemini_key)
        self.model = genai.GenerativeModel(self.gemini_model)
    
    def enhance_findings(self, findings: List[Finding]) -> List[EnhancedFinding]:
        """Enhance static analysis findings with LLM insights."""
        if not findings:
            return []
        
        enhanced = []
        batch_size = 5
        for i in range(0, len(findings), batch_size):
            batch = findings[i:i + batch_size]
            enhanced.extend(self._process_batch(batch))
        
        return enhanced
    
    def _process_batch(self, findings: List[Finding]) -> List[EnhancedFinding]:
        """Process a batch of findings."""
        enhanced = []
        for finding in findings:
            try:
                enhancement = self._enhance_single_finding(finding)
                enhanced.append(enhancement)
            except Exception as error:
                print(f"Warning: Failed to enhance finding: {error}")
                # Fallback: create enhanced finding with default values
                enhanced.append(self._create_fallback_enhancement(finding))
        
        return enhanced
    
    def _call_llm(self, prompt: str) -> str:
        """Call Gemini API."""
        system_prompt = "You are a senior software engineer conducting a code review. Provide clear, actionable feedback."
        full_prompt = f"{system_prompt}\n\n{prompt}"
        
        print(f"Using Gemini: {self.gemini_model}")
        response = self.model.generate_content(full_prompt)
        return response.text
    
    def _enhance_single_finding(self, finding: Finding) -> EnhancedFinding:
        """Enhance a single finding using LLM."""
        prompt = self._create_prompt(finding)
        content = self._call_llm(prompt)
        parsed = self._parse_llm_response(content)
        
        return EnhancedFinding(
            file=finding.file,
            line=finding.line,
            issue=finding.issue,
            category=finding.category,
            code_snippet=finding.code_snippet,
            context=finding.context,
            explanation=parsed['explanation'],
            suggested_fix=parsed['suggested_fix'],
            severity=parsed['severity']
        )
    
    def _create_prompt(self, finding: Finding) -> str:
        """Create structured prompt for LLM."""
        return f"""You are reviewing Python code. A static analysis tool detected the following issue:

**File:** {finding.file}
**Line:** {finding.line}
**Issue:** {finding.issue}
**Category:** {finding.category.value}

**Code Snippet:**
```python
{finding.code_snippet}
```

**Context:**
```python
{finding.context or 'No additional context'}
```

Please provide:
1. **Explanation:** Why is this a problem? What are the potential consequences?
2. **Suggested Fix:** Provide a specific code example showing how to fix this issue.
3. **Severity:** Rate the severity from 1-5 (1=minor, 5=critical)

Format your response as JSON:
```json
{{
  "explanation": "Your explanation here",
  "suggested_fix": "Your suggested fix code here",
  "severity": 3
}}
```"""
    
    def _parse_llm_response(self, content: str) -> dict:
        """Parse LLM response to extract structured data."""
        try:
            if "```json" in content:
                json_start = content.find("```json") + 7
                json_end = content.find("```", json_start)
                json_str = content[json_start:json_end].strip()
            elif "```" in content:
                json_start = content.find("```") + 3
                json_end = content.find("```", json_start)
                json_str = content[json_start:json_end].strip()
            else:
                json_str = content.strip()
            
            parsed = json.loads(json_str)
            return {
                'explanation': parsed.get('explanation', 'No explanation provided'),
                'suggested_fix': parsed.get('suggested_fix', 'No fix suggested'),
                'severity': max(1, min(5, int(parsed.get('severity', 3))))
            }
        except (json.JSONDecodeError, ValueError, KeyError) as error:
            print(f"Warning: Failed to parse LLM response: {error}")
            return {
                'explanation': content[:200] if len(content) > 200 else content,
                'suggested_fix': 'See explanation for details',
                'severity': 3
            }
    
    def _create_fallback_enhancement(self, finding: Finding) -> EnhancedFinding:
        """Create a basic enhancement when LLM fails."""
        severity_map = {'Security': 4, 'Performance': 3, 'Code Quality': 2}
        return EnhancedFinding(
            file=finding.file,
            line=finding.line,
            issue=finding.issue,
            category=finding.category,
            code_snippet=finding.code_snippet,
            context=finding.context,
            explanation=f"This {finding.category.value.lower()} issue was detected by static analysis.",
            suggested_fix="Please review the code and apply appropriate fixes.",
            severity=severity_map.get(finding.category.value, 3)
        )
