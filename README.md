# AI Code Reviewer

An AI-powered code review tool that analyzes GitHub repositories and pull requests using static analysis combined with GPT-4 intelligence to detect security vulnerabilities, performance issues, and code quality problems.

## Features

### Static Analysis Engine
- **Security Analysis**: Detects hardcoded secrets, SQL injection vulnerabilities, dangerous functions (eval, exec), and command injection risks
- **Performance Review**: Identifies nested loops, blocking I/O in async contexts, and inefficient list operations
- **Code Quality**: Checks for missing docstrings, long functions, poor variable naming, and high cyclomatic complexity

### AI Enhancement
- Uses OpenAI GPT-4 to provide detailed explanations for each issue
- Generates actionable fix suggestions
- Assigns severity ratings (1-5 scale) to prioritize fixes


## Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│   GitHub    │────▶│  Static Analysis │────▶│     LLM     │
│  Repository │     │     Engine       │     │ Enhancement │
└─────────────┘     └──────────────────┘     └─────────────┘
                            │                        │
                            ▼                        ▼
                    ┌────────────────────────────────────┐
                    │      Structured Findings JSON      │
                    │  { file, line, issue, category }   │
                    └────────────────────────────────────┘
                                    │
                                    ▼
                    ┌────────────────────────────────────┐
                    │         Report Generator           │
                    │      (Statistics + UI Display)     │
                    └────────────────────────────────────┘
```

**Two-Stage Pipeline**:
1. **Static Analysis** - Detects issues and outputs structured findings JSON
2. **LLM Enhancement** - GPT-4 adds explanations, severity ratings, and suggested fixes

This architecture is faster, more cost-effective, and more deterministic than raw code analysis.

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Backend | FastAPI |
| GitHub Integration | PyGithub API |
| Static Analysis | Python AST + Regex |
| LLM | OpenAI GPT-4 |
| Frontend | React 18 + Vite |
| Styling | Vanilla CSS (Dark Theme) |
| HTTP Client | Axios |

## Setup Instructions

### Prerequisites
- Python 3.9 or higher
- Node.js 18 or higher
- GitHub Personal Access Token
- OpenAI API Key

### Backend Setup

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd codeRE
```

2. **Set up Python environment**
```bash
cd backend
python -m venv venv

# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Configure environment variables**

Create a `.env` file in the `backend` directory:
```bash
cp .env.example .env
```

Edit `.env` and add your credentials:
```env
GITHUB_TOKEN=your_github_personal_access_token
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4-turbo-preview
PORT=8000
```

**How to get a GitHub Personal Access Token:**
1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a name (e.g., "AI Code Reviewer")
4. Select scopes: `repo` (to read repositories/PRs)
5. Click "Generate token" and copy the token
6. Paste it in your `.env` file

**How to get an OpenAI API Key:**
1. Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Click "Create new secret key"
3. Copy the key and paste it in your `.env` file

5. **Run the backend**
```bash
python main.py
```

The backend will start on `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the development server**
```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

## Usage

1. **Open the application** at `http://localhost:5173`

2. **Enter a GitHub URL**:
   - Full repository: `https://github.com/owner/repo`
   - Pull request: `https://github.com/owner/repo/pull/123`

3. **Click "Analyze Code"**

4. **View the report** with:
   - Statistics overview
   - Filterable issue list
   - Detailed explanations and fixes for each issue

## API Documentation

### Endpoints

#### `POST /api/review`
Analyze a GitHub repository or pull request

**Request Body**:
```json
{
  "url": "https://github.com/owner/repo"
}
```

**Response**:
```json
{
  "repo_url": "https://github.com/owner/repo",
  "total_issues": 15,
  "findings": [
    {
      "file": "auth.py",
      "line": 42,
      "issue": "Use of eval() detected",
      "category": "Security",
      "code_snippet": "eval(user_input)",
      "context": "...",
      "explanation": "...",
      "suggested_fix": "...",
      "severity": 5
    }
  ],
  "stats": {
    "by_category": {...},
    "by_severity": {...},
    "by_file": {...}
  }
}
```

#### `GET /api/health`
Check API health status

## Project Structure

```
codeRE/
├── backend/
│   ├── analyzer/
│   │   ├── __init__.py
│   │   ├── models.py              # Data models
│   │   ├── static_rules.py        # Base analyzer
│   │   ├── security_rules.py      # Security checks
│   │   ├── performance_rules.py   # Performance checks
│   │   └── code_quality_rules.py  # Quality checks
│   ├── github_service.py          # GitHub API integration
│   ├── llm_reviewer.py            # OpenAI GPT-4 integration
│   ├── report_generator.py        # Report creation
│   ├── main.py                    # FastAPI app
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── IssueCard.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── SeverityBadge.jsx
│   │   │   └── StatsOverview.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   └── Report.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── index.css
│   ├── package.json
│   └── index.html
└── README.md
```

## Resume-Worthy Description

> **Built an AI-powered code reviewer that analyzes GitHub repositories and pull requests using static analysis and LLM reasoning to detect security, performance, and code-quality issues.**
> 
> Implemented a two-stage analysis pipeline: (1) custom Python static analyzer detecting vulnerabilities via AST parsing and regex patterns, (2) OpenAI GPT-4 enhancement providing explanations, severity ratings, and fix suggestions. Architected FastAPI backend with GitHub API integration and premium React frontend with glassmorphism UI. Detects 15+ issue types including SQL injection, hardcoded secrets, nested loops, and missing docstrings.

## Future Enhancements (Phase 2)

- [ ] GitHub PR comment bot integration
- [ ] Downloadable PDF/Markdown reports
- [ ] Code scoring system (0-100)
- [ ] Support for additional languages (JavaScript, Java, etc.)
- [ ] Custom rule configuration
- [ ] CI/CD integration
- [ ] User authentication and saved reports

## License

MIT License - feel free to use this project for your portfolio!

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

---

Built with using FastAPI, React, and GPT-4
