import sys
import os

# Add the project root to sys.path so we can import our modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from recruitment_agent_gemini import run_recruitment_agent
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
