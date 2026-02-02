"""
FastAPI backend for AI Code Reviewer.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import traceback

from github_service import GitHubService
from analyzer import analyze_code
from llm_reviewer import LLMReviewer
from report_generator import ReportGenerator
from analyzer.models import ReviewReport

# Initialize FastAPI app
app = FastAPI(
    title="AI Code Reviewer",
    description="Automated code review using static analysis and LLM reasoning",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
github_service = GitHubService()
llm_reviewer = LLMReviewer()


class ReviewRequest(BaseModel):
    """Request model for code review."""
    url: str


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    message: str


@app.get("/", response_model=HealthResponse)
async def root():
    """Root endpoint."""
    return HealthResponse(
        status="ok",
        message="AI Code Reviewer API is running"
    )


@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(
        status="ok",
        message="All systems operational"
    )


@app.post("/api/review", response_model=ReviewReport)
async def review_code(request: ReviewRequest):
    """
    Analyze a GitHub repository or pull request.
    
    Args:
        request: ReviewRequest with GitHub URL
        
    Returns:
        ReviewReport with findings and statistics
    """
    try:
        url = request.url.strip()
        
        # Step 1: Fetch code from GitHub
        print(f"Fetching code from: {url}")
        if github_service.is_pr_url(url):
            files = github_service.fetch_pr_diff(url)
        else:
            files = github_service.fetch_repository_files(url)
        
        if not files:
            raise HTTPException(
                status_code=404,
                detail="No Python files found in the repository/PR"
            )
        
        print(f"Found {len(files)} Python files")
        
        # Step 2: Run static analysis
        print("Running static analysis...")
        findings = analyze_code(files)
        print(f"Found {len(findings)} issues")
        
        if not findings:
            # Return empty report
            return ReviewReport(
                repo_url=url,
                total_issues=0,
                findings=[],
                stats={
                    'by_category': {'security': 0, 'performance': 0, 'code_quality': 0},
                    'by_severity': {'critical': 0, 'high': 0, 'medium': 0, 'low': 0, 'info': 0},
                    'by_file': {},
                    'total_files_analyzed': len(files)
                }
            )
        
        # Step 3: Enhance findings with LLM
        print("Enhancing findings with GPT-4...")
        enhanced_findings = llm_reviewer.enhance_findings(findings)
        print(f"Enhanced {len(enhanced_findings)} findings")
        
        # Step 4: Generate report
        print("Generating report...")
        report = ReportGenerator.generate_report(url, enhanced_findings)
        
        return report
        
    except ValueError as e:
        # URL parsing errors
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # Log the full traceback for debugging
        print(f"Error processing review: {e}")
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    import os
    
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
