# Next Steps Guide

## Immediate Actions Required

Before you can run the application, you need to set up your API credentials:

### 1. Create `.env` File

Navigate to the `backend` folder and create a `.env` file:

```bash
cd backend
copy .env.example .env
```

Then edit the `.env` file and add your credentials:

```env
# Get from: https://github.com/settings/tokens
GITHUB_TOKEN=ghp_your_actual_token_here

# Get from: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-your_actual_key_here

# Model to use (optional, defaults to gpt-4-turbo-preview)
OPENAI_MODEL=gpt-4-turbo-preview

# Server port (optional, defaults to 8000)
PORT=8000
```

### 2. Get GitHub Personal Access Token

1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Give it a name: "AI Code Reviewer"
4. Select scope: **repo** (full control of private repositories)
5. Click "Generate token"
6. **Copy the token immediately** (you won't see it again!)
7. Paste it in your `.env` file as `GITHUB_TOKEN`

### 3. Get OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Sign up or log in
3. Click "Create new secret key"
4. Give it a name: "Code Reviewer"
5. Copy the key
6. Paste it in your `.env` file as `OPENAI_API_KEY`

> **Note:** You'll need API credits in your OpenAI account. GPT-4 costs approximately $0.01-0.03 per review depending on the size of the code.

---

## Running the Application

### Backend

```bash
cd backend
.\venv\Scripts\activate
python main.py
```

You should see:
```
INFO:     Started server process
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Frontend

Open a **new terminal**:

```bash
cd frontend
npm run dev
```

You should see:
```
VITE v7.3.1  ready in 561 ms
➜  Local:   http://localhost:5173/
```

### Access the Application

Open your browser and go to: **http://localhost:5173**

---

## Testing the Application

### Option 1: Test with Sample File (No API Keys Needed)

```bash
cd backend
.\venv\Scripts\activate
python test_analyzers.py
```

This will analyze `test_sample.py` and show you 25 detected issues.

### Option 2: Test with Real GitHub Repo (Requires API Keys)

1. Start both backend and frontend servers
2. Open http://localhost:5173
3. Enter a GitHub repository URL, for example:
   - `https://github.com/pallets/flask` (popular Python framework)
   - `https://github.com/django/django` (large project, may take longer)
   - Your own repository

4. Click "Analyze Code"
5. Wait for analysis (usually 30-60 seconds)
6. View the report!

---

## Troubleshooting

### "GITHUB_TOKEN not found" Error
- Make sure you created `.env` file in the `backend` folder
- Check that the token starts with `ghp_` or `github_pat_`
- Ensure there are no spaces or quotes around the token

### "OPENAI_API_KEY not found" Error
- Make sure you created `.env` file
- Check that the key starts with `sk-`
- Ensure you have API credits in your OpenAI account

### "No Python files found" Error
- The repository you're analyzing has no Python (`.py`) files
- Try a different repository with Python code

### Frontend can't connect to backend
- Make sure backend is running on port 8000
- Check `frontend/src/services/api.js` - the URL should be `http://localhost:8000`

### Module not found errors
- Activate the virtual environment: `.\venv\Scripts\activate`
- Reinstall dependencies: `pip install -r requirements.txt`

---

## What to Show Recruiters

### 1. Live Demo
- Run the application
- Analyze a popular GitHub repo (e.g., Flask, Django)
- Show the premium UI
- Demonstrate filters
- Explain the two-stage architecture

### 2. Code Walkthrough
Show them:
- `backend/analyzer/security_rules.py` - Pattern matching and AST analysis
- `backend/llm_reviewer.py` - GPT-4 integration with structured prompts
- `frontend/src/pages/Report.jsx` - Clean React component structure
- `frontend/src/index.css` - Premium dark theme

### 3. Test Results
Run `python test_analyzers.py` and show:
- 25 issues detected across 3 categories
- Accurate line numbers
- Proper categorization

### 4. Architecture Diagram
Explain from README.md:
```
GitHub → Static Analysis → Structured JSON → LLM Enhancement → Report
```

---

## Deployment (Optional for Resume)

### Deploy Backend (Railway/Render/Heroku)

1. Add `Procfile`:
```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

2. Set environment variables on the platform
3. Deploy!

### Deploy Frontend (Vercel/Netlify)

1. Update `frontend/src/services/api.js` with your backend URL
2. Build: `npm run build`
3. Deploy the `dist` folder

---

## Resume Line

```
Built an AI-powered code reviewer that analyzes GitHub repositories 
and pull requests using static analysis and LLM reasoning to detect 
security, performance, and code-quality issues.

Implemented a two-stage analysis pipeline with custom Python static 
analyzer (AST parsing + regex) and OpenAI GPT-4 enhancement. 
Architected FastAPI backend with GitHub API integration and premium 
React frontend. Detects 15+ issue types including SQL injection, 
hardcoded secrets, nested loops, and missing docstrings.
```

---

## Project Highlights for Interviews

**Question: "Tell me about this project"**

> "I built an AI code reviewer that helps developers find bugs before they ship. It works in two stages: first, I wrote custom static analyzers in Python that scan code using AST parsing to detect security issues like SQL injection and hardcoded API keys, performance problems like nested loops, and code quality issues like missing documentation. Then, I send those findings to GPT-4, which explains each issue in plain English and suggests how to fix it. The frontend is a React app with a modern glassmorphism design. The key innovation is the two-stage architecture—it's faster and cheaper than having GPT-4 analyze raw code, plus it's more reliable because the static analysis is deterministic."

**Question: "What was the biggest challenge?"**

> "Designing the static analysis rules to minimize false positives while catching real issues. For example, detecting SQL injection required understanding when string concatenation is dangerous versus safe. I used Python's AST module to analyze the code structure rather than just regex patterns. Also, prompt engineering for GPT-4 was tricky—I had to structure the input so it consistently returns parseable JSON with explanations, fixes, and severity ratings."

**Question: "How does it scale?"**

> "The static analysis is very fast—it can scan hundreds of files in seconds. The bottleneck is the LLM calls, so I batch findings and only send detected issues to GPT-4, not every line of code. For a typical small repo with 10-20 files, the whole process takes 30-60 seconds. For production, I'd add caching of LLM responses and async processing."

---

## Future Improvements to Mention

- Add support for JavaScript, TypeScript, Java
- Create a GitHub App that automatically comments on PRs
- Build a scoring system (0-100) based on issue count and severity
- Add custom rule configuration via YAML files
- Implement caching to avoid re-analyzing unchanged code

---

Good luck with your portfolio! This project demonstrates full-stack skills, AI integration, API design, and modern UI development.
