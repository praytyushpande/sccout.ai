from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
import asyncio
from dotenv import load_dotenv
from recruitment_agent_gemini import recruitment_agent_gemini
from langchain_core.messages import HumanMessage
from fastapi.middleware.cors import CORSMiddleware
import os

load_dotenv()

app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for dev; specify in prod
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

        initial_state = {
            "job_description": job_desc,
            "search_results": [],
            "candidate_profiles": [],
            "analysis_report": "",
            "messages": [HumanMessage(content=f"Find suitable candidates for this job: {job_desc}")]
        }

        result = await recruitment_agent_gemini.ainvoke(initial_state)

        # Process results to match frontend expectations
        # Note: The original generic agent structure stores logic in stdout parsing for some reason in Streamlit app.
        # But here we have direct access to 'result' state.
        
        # Let's extract candidates from search_results if available
        candidates_data = []
        search_results = result.get("search_results", [])
        
        for res in search_results:
            # Normalize keys
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

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
