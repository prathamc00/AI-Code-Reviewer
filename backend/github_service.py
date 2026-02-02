"""
GitHub service for fetching repository and pull request data.
"""

import os
import re
from typing import Dict, List, Optional, Tuple
from github import Github, GithubException
from dotenv import load_dotenv

load_dotenv()


class GitHubService:
    """Service for interacting with GitHub API."""
    
    def __init__(self):
        """Initialize GitHub client with personal access token."""
        token = os.getenv("GITHUB_TOKEN")
        if not token:
            raise ValueError("GITHUB_TOKEN not found in environment variables")
        self.client = Github(token)
        
    def parse_repo_url(self, url: str) -> Tuple[str, str]:
        """
        Parse GitHub repository URL to extract owner and repo name.
        
        Args:
            url: GitHub repo URL (e.g., https://github.com/owner/repo)
            
        Returns:
            Tuple of (owner, repo_name)
            
        Raises:
            ValueError: If URL format is invalid
        """
        # Match: https://github.com/owner/repo or github.com/owner/repo
        pattern = r'github\.com/([^/]+)/([^/]+?)(?:\.git)?/?$'
        match = re.search(pattern, url)
        
        if not match:
            raise ValueError(f"Invalid GitHub repository URL: {url}")
            
        owner, repo = match.groups()
        return owner, repo
    
    def parse_pr_url(self, url: str) -> Tuple[str, str, int]:
        """
        Parse GitHub pull request URL.
        
        Args:
            url: GitHub PR URL (e.g., https://github.com/owner/repo/pull/123)
            
        Returns:
            Tuple of (owner, repo_name, pr_number)
            
        Raises:
            ValueError: If URL format is invalid
        """
        pattern = r'github\.com/([^/]+)/([^/]+)/pull/(\d+)'
        match = re.search(pattern, url)
        
        if not match:
            raise ValueError(f"Invalid GitHub pull request URL: {url}")
            
        owner, repo, pr_number = match.groups()
        return owner, repo, int(pr_number)
    
    def fetch_repository_files(self, url: str) -> Dict[str, str]:
        """
        Fetch all Python files from a repository.
        
        Args:
            url: GitHub repository URL
            
        Returns:
            Dictionary mapping file paths to file contents
        """
        owner, repo_name = self.parse_repo_url(url)
        
        try:
            repo = self.client.get_repo(f"{owner}/{repo_name}")
            files = {}
            
            # Get default branch
            default_branch = repo.default_branch
            
            # Recursively fetch Python files
            contents = repo.get_contents("", ref=default_branch)
            
            while contents:
                file_content = contents.pop(0)
                
                if file_content.type == "dir":
                    # Add directory contents to stack
                    contents.extend(repo.get_contents(file_content.path, ref=default_branch))
                elif file_content.path.endswith('.py'):
                    # Fetch Python file content
                    try:
                        content = file_content.decoded_content.decode('utf-8')
                        files[file_content.path] = content
                    except Exception as e:
                        print(f"Warning: Could not decode {file_content.path}: {e}")
                        
            return files
            
        except GithubException as e:
            raise Exception(f"GitHub API error: {e.data.get('message', str(e))}")
    
    def fetch_pr_diff(self, url: str) -> Dict[str, str]:
        """
        Fetch changed files from a pull request.
        
        Args:
            url: GitHub pull request URL
            
        Returns:
            Dictionary mapping file paths to file contents (only changed Python files)
        """
        owner, repo_name, pr_number = self.parse_pr_url(url)
        
        try:
            repo = self.client.get_repo(f"{owner}/{repo_name}")
            pr = repo.get_pull(pr_number)
            
            files = {}
            
            # Get all changed files
            for file in pr.get_files():
                # Only process Python files
                if file.filename.endswith('.py'):
                    # Fetch the file content from the PR head
                    try:
                        content_file = repo.get_contents(file.filename, ref=pr.head.sha)
                        content = content_file.decoded_content.decode('utf-8')
                        files[file.filename] = content
                    except Exception as e:
                        print(f"Warning: Could not fetch {file.filename}: {e}")
                        
            return files
            
        except GithubException as e:
            raise Exception(f"GitHub API error: {e.data.get('message', str(e))}")
    
    def is_pr_url(self, url: str) -> bool:
        """Check if URL is a pull request URL."""
        return '/pull/' in url
