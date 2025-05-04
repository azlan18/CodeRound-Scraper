
**Overview**
Created a job scraper full stack application to automate job discovery by scraping multiple listings from Indian startups like Ola, Zepto, Zomato etc. The backend is built in flask and uses Selenium and chrome webdriver for scraping, and Groq API for parsing html content into structured json output. Created a react frontend to run the scraper and deployed the backend on render and frontend on vercel. Also included a health check to start up the server in case it has spun down

**Hosted URL**
https://code-round-scraper.vercel.app

**Tech Choices and Architecture**
FRONTEND:

React + ReactRouterDOM
Shadcn/UI, Tailwind CSS: Responsive UI components.
Framer Motion: Animations for hero and job cards.
Vercel: Serverless hosting for fast deployment.
Architecture: Two pages—Landing.tsx and ScrapePage.tsx


BACKEND:

Flask 2.3.3: Lightweight API server.
Selenium 4.31.0: Scrapes dynamic Naukri.com pages.
Groq 0.23.1: Parses HTML into JSON with meta-llama/llama-4-maverick-17b-128e-instruct.
Flask-CORS: Enables cross-origin requests.
Gunicorn 21.2.0: Production WSGI server.
Docker (Python 3.12-slim): Packages Chrome and dependencies for Render.
Render: Hosts Dockerized backend with endpoints /health, /scrape, /test-chrome.
Architecture: /scrape uses asyncio.gather for simultaneous scraping of Ola and Zepto. fetch_html extracts job <div>s or page source; parse_jobs_with_llm processes HTML with Groq. /health to check up on server, and spin it up if needed
Deployment:
Render: Dockerized backend with Chrome installed via Dockerfile.
Vercel: Serverless frontend with environment variables for backend URL.


**Local Setup and Run Instructions**
1) Clone Repository:
git clone https://github.com/azlan18/CodeRound-Scraper.git

2) Backend:
Navigate: cd python-server
Install dependencies: pip install -r requirements.txt
Install Chromedriver: Ensure it’s in your PATH (e.g., brew install chromedriver on macOS or download from https://chromedriver.chromium.org/downloads)
Set Groq API key: export GROQ_API_KEY="your_key"
Run: python app.py
Access: http://127.0.0.1:5000/health, http://127.0.0.1:5000/scrape

3) Frontend:
Navigate: cd frontend
Install dependencies: npm install
Update API base URL: In .env.local, set NEXT_PUBLIC_API_URL="http://127.0.0.1:5000"
Run: npm run dev
Access: http://localhost:5173


**My Notes on Improvements**

1)Dynamic Selectors: Auto-detect job selectors to adapt to naukri.com DOM changes.
2)Database: Cache jobs in PostgreSQL for faster retrieval.
3)Retry Logic: Implement scrolling and retries in fetch_html to handle timeouts.
4)More Sites: Expand to additional job boards or companies.

