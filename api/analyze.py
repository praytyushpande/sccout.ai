import os
import json
import requests
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from bs4 import BeautifulSoup
from tavily import TavilyClient
from google import genai

# Load environment variables
load_dotenv()

# Configure Gemini client
gemini_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
GEMINI_MODEL = "gemini-2.0-flash"

# Initialize Tavily client
tavily_client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))

# FastAPI app
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Models ───────────────────────────────────────────────────────────

class JobDescriptionRequest(BaseModel):
    description: str


class Candidate(BaseModel):
    title: str
    url: str = None
    skills: str = None
    confidence: str = None
    skill_score: str = None
    exp_relevance: str = None
    signal_strength: str = None
    match_percentage: str = None
    reason: str = None
    image: str = None


class AnalysisResponse(BaseModel):
    analysis_report: str
    candidates: list[Candidate]
    stdout_log: str = ""


# ─── Agent Logic (inlined) ────────────────────────────────────────────

def _call_gemini(prompt: str) -> str:
    """Helper to call Gemini and return text response."""
    response = gemini_client.models.generate_content(
        model=GEMINI_MODEL,
        contents=prompt
    )
    return response.text


def search_job_candidates(query: str) -> list[dict]:
    """Search for potential job candidates using Tavily, then score with Gemini."""
    print(f"Searching for candidates with query: {query}")

    search_query = (
        f"site:linkedin.com/in {query} "
        "-intitle:'job description' -intitle:'career' -intitle:'company' "
        "-intitle:'blog' -intitle:'article' -intitle:'jobs'"
    )

    response = tavily_client.search(
        query=search_query,
        max_results=10,
        search_depth="advanced",
        include_answer=False,
        include_raw_content=True,
        include_images=True
    )

    candidates_to_score = []
    for result in response['results']:
        url_lower = result.get('url', '').lower()
        if 'linkedin.com/in/' in url_lower:
            candidates_to_score.append({
                "title": result.get('title'),
                "url": result.get('url'),
                "content": result.get('content'),
                "image": None
            })

    if not candidates_to_score:
        print("No candidates found to score.")
        return []

    # Batch score with Gemini
    print(f"Scoring {len(candidates_to_score)} candidates with Gemini...")

    scoring_prompt = f"""
    You are an expert recruiter. I will provide a job query and a list of candidates found.
    Your task is to evaluate how well each candidate matches the query.
    
    Query: {query}
    
    Candidates:
    {json.dumps(candidates_to_score, indent=2)}
    
    For each candidate, provide:
    1. A match score (0-100)
    2. A brief 1-sentence reason.
    3. A confidence level (High, Medium, Low).
    4. Top 3 matched skills found in snippet.
    
    Return a JSON list of objects with keys: "url", "score", "reason", "confidence", "skills".
    Return ONLY valid JSON, no markdown code blocks.
    """

    results = []
    try:
        text_response = _call_gemini(scoring_prompt)
        text_response = text_response.replace("```json", "").replace("```", "").strip()
        scored_data = json.loads(text_response)

        scored_map = {item['url']: item for item in scored_data}

        for cand in candidates_to_score:
            score_info = scored_map.get(cand['url'], {})
            score = score_info.get('score', 0)
            reason = score_info.get('reason', 'Analysis pending')
            confidence = score_info.get('confidence', 'Low')
            skills = score_info.get('skills', [])
            if isinstance(skills, list):
                skills = ", ".join(skills)

            results.append({
                "title": cand['title'],
                "url": cand['url'],
                "content": cand['content'],
                "score": score / 100.0,
                "match_percentage": score,
                "primary_skills": skills,
                "confidence_level": confidence,
                "match_type": "candidate_profile",
                "skill_match_score": score,
                "experience_relevance": score,
                "public_signal_strength": score,
                "reason": reason,
                "image": cand.get('image')
            })

    except Exception as e:
        print(f"Error during AI scoring: {e}")
        for cand in candidates_to_score:
            results.append({
                "title": cand['title'],
                "url": cand['url'],
                "content": cand['content'],
                "score": 0.5,
                "match_percentage": 50,
                "primary_skills": "Analysis Failed",
                "confidence_level": "Low"
            })

    results.sort(key=lambda x: x["score"], reverse=True)
    return results


def generate_analysis_report(job_desc: str, candidates: list[dict]) -> str:
    """Generate a comprehensive analysis report ranking candidates by suitability."""
    print("Generating ranked analysis report...")

    ranked_candidates = sorted(candidates, key=lambda x: x.get('score', 0), reverse=True)

    prompt = f"""
    Job Description: {job_desc}
    
    Ranked Candidates (by relevance score):
    {json.dumps(ranked_candidates[:10], indent=2)}
    
    Please provide a professional recruitment analysis report that:
    1. RANKS the candidates from best to worst match (1-10)
    2. Shows each candidate's match percentage/score
    3. Highlights key qualifications and experience
    4. Identifies any skill gaps or concerns
    5. Provides clear recommendations for next steps
    6. Uses professional recruitment terminology
    
    Format as:
    # RECRUITMENT ANALYSIS REPORT
    
    ## Job Requirements Summary
    [Brief summary of requirements]
    
    ## Ranked Candidate Matches
    1. [Candidate Name] - [Match Score]% - [Key Qualifications]
    2. [Candidate Name] - [Match Score]% - [Key Qualifications]
    ...
    
    ## Detailed Analysis
    [Detailed breakdown of top 3 candidates]
    
    ## Recommendations
    [Actionable next steps for recruitment team]
    """

    try:
        return _call_gemini(prompt)
    except Exception as e:
        # Fallback report
        fallback = f"# RECRUITMENT ANALYSIS REPORT\n\n## Job Requirements Summary\n{job_desc}\n\n## Ranked Candidate Matches\n"
        for i, candidate in enumerate(ranked_candidates[:10], 1):
            score_percent = int(candidate.get('score', 0) * 100)
            fallback += f"{i}. {candidate.get('title', 'Unknown')} - {score_percent}% match\n"
            fallback += f"   URL: {candidate.get('url', 'N/A')}\n\n"

        fallback += "\n## Recommendations\n1. Contact top 3 candidates for initial screening\n"
        fallback += "2. Verify employment eligibility and availability\n"
        fallback += "3. Schedule technical interviews for qualified candidates\n"
        return fallback


async def run_recruitment_agent(job_description: str) -> dict:
    """
    Main orchestrator — search → score → generate report.
    """
    # Step 1: Search and score candidates
    search_results = search_job_candidates(job_description)

    # Step 2: Generate analysis report
    if search_results:
        analysis_report = generate_analysis_report(job_description, search_results)
    else:
        analysis_report = "No matching candidates were found for this job description."

    return {
        "search_results": search_results,
        "analysis_report": analysis_report
    }


# ─── API Endpoint ─────────────────────────────────────────────────────

@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze_job(request: JobDescriptionRequest):
    try:
        job_desc = request.description
        if not job_desc:
            raise HTTPException(status_code=400, detail="Job description is required")

        result = await run_recruitment_agent(job_desc)

        candidates_data = []
        search_results = result.get("search_results", [])

        for res in search_results:
            candidates_data.append(Candidate(
                title=res.get('title', 'Unknown Candidate'),
                url=res.get('url', ''),
                skills=res.get('primary_skills', ''),
                confidence=res.get('confidence_level', 'Medium'),
                skill_score=str(res.get('skill_match_score', '0')),
                exp_relevance=str(res.get('experience_relevance', '0')),
                signal_strength=str(res.get('public_signal_strength', '0')),
                match_percentage=str(res.get('match_percentage', 0)),
                reason=res.get('reason', 'Analysis pending'),
                image=res.get('image') or ''
            ))

        return AnalysisResponse(
            analysis_report=result.get("analysis_report", "No report generated."),
            candidates=candidates_data,
            stdout_log="Analysis complete."
        )

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
