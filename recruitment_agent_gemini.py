import os
from dotenv import load_dotenv
import google.generativeai as genai
from langchain_core.tools import tool
from langgraph.graph import StateGraph
from langgraph.prebuilt import ToolNode
from langchain_core.messages import BaseMessage, HumanMessage, SystemMessage
from typing import TypedDict, Annotated, List, Dict
import json
import asyncio
import requests
from bs4 import BeautifulSoup
from tavily import TavilyClient

# Load environment variables
load_dotenv()

# Configure and initialize Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
gemini_model = genai.GenerativeModel('gemini-flash-latest')

# Initialize Tavily client
tavily_client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))

# Define state structure
class AgentState(TypedDict):
    job_description: str
    search_results: List[Dict]
    candidate_profiles: List[Dict]
    analysis_report: str
    messages: Annotated[List[BaseMessage], lambda x, y: x + y]

# Define tools for the agent

@tool
def search_job_candidates(query: str) -> List[Dict]:
    """Search for potential job candidates who are actively seeking roles or open to opportunities."""
    print(f"Searching for candidates with query: {query}")
    
    # Targeted search for actual candidate profiles
    search_query = f"site:linkedin.com/in {query} -intitle:'job description' -intitle:'career' -intitle:'company' -intitle:'blog' -intitle:'article' -intitle:'jobs'"
    
    # Use Tavily to search for potential candidates
    response = tavily_client.search(
        query=search_query,
        max_results=10,
        search_depth="advanced",
        include_answer=False,
        include_raw_content=True,
        include_images=True 
    )
    
    candidates_to_score = []
    
    results = []
    
    # Pre-filter for likely profile pages
    for result in response['results']:
        title_lower = result.get('title', '').lower()
        url_lower = result.get('url', '').lower()
        
        # Basic filtering to ensure it looks like a profile
        if 'linkedin.com/in/' in url_lower:
            candidates_to_score.append({
                "title": result.get('title'),
                "url": result.get('url'),
                "content": result.get('content'),
                # Try to find an image if Tavily attached one close to this result, or leave None
                "image": None 
            })

    if not candidates_to_score:
        print("No candidates found to score.")
        return []

    # Batch score with Gemini for accuracy
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
    """
    
    try:
        scoring_response = gemini_model.generate_content(scoring_prompt)
        # Clean up code blocks if present
        text_response = scoring_response.text.replace("```json", "").replace("```", "").strip()
        scored_data = json.loads(text_response)
        
        # Merge scores back
        scored_map = {item['url']: item for item in scored_data}
        
        for cand in candidates_to_score:
            score_info = scored_map.get(cand['url'], {})
            
            score = score_info.get('score', 0)
            reason = score_info.get('reason', 'Analysis pending')
            confidence = score_info.get('confidence', 'Low')
            skills = score_info.get('skills', [])
            if isinstance(skills, list):
                skills = ", ".join(skills)
            
            # Populate result object
            results.append({
                "title": cand['title'],
                "url": cand['url'],
                "content": cand['content'],
                "score": score / 100.0, # Normalize to 0-1 float for consistency
                "match_percentage": score,
                "primary_skills": skills,
                "confidence_level": confidence,
                "match_type": "candidate_profile",
                "skill_match_score": score, # Use the accurate score
                "experience_relevance": score, # Simplify
                "public_signal_strength": score,
                "reason": reason,
                "image": cand.get('image')
            })
            
    except Exception as e:
        print(f"Error during AI scoring: {e}")
        # Fallback to simple scoring
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

    # Sort by score
    results.sort(key=lambda x: x["score"], reverse=True)
    
    return results

@tool
def analyze_candidate_profile(profile_url: str) -> Dict:
    """Analyze a candidate's LinkedIn profile or similar platform."""
    print(f"Analyzing profile: {profile_url}")
    
    try:
        # Fetch the profile page
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        response = requests.get(profile_url, headers=headers)
        
        if response.status_code == 200:
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extract relevant information
            title_element = soup.find('title')
            title = title_element.text if title_element else "Title not found"
            
            # Extract OG Image
            image_url = None
            og_image = soup.find('meta', property='og:image')
            if og_image:
                image_url = og_image.get('content')
            
            return {
                "url": profile_url,
                "title": title,
                "image_url": image_url,
                "summary": f"Profile analysis for {title}."
            }
        else:
            return {
                "url": profile_url,
                "error": f"Failed to fetch profile. Status code: {response.status_code}"
            }
    except Exception as e:
        return {
            "url": profile_url,
            "error": f"Error analyzing profile: {str(e)}"
        }

@tool
def generate_analysis_report(job_desc: str, candidates: List[Dict]) -> str:
    """Generate a comprehensive analysis report ranking candidates by suitability."""
    print("Generating ranked analysis report...")
    
    # Sort candidates by score if available
    ranked_candidates = sorted(candidates, key=lambda x: x.get('score', 0), reverse=True)
    
    # Prepare prompt for Gemini with ranking focus
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
        response = gemini_model.generate_content(prompt)
        return response.text
    except Exception as e:
        # Fallback report if Gemini fails
        fallback_report = f"""
# RECRUITMENT ANALYSIS REPORT

## Job Requirements Summary
{job_desc}

## Ranked Candidate Matches
"""
        
        for i, candidate in enumerate(ranked_candidates[:10], 1):
            score_percent = int(candidate.get('score', 0) * 100)
            fallback_report += f"{i}. {candidate.get('title', 'Unknown Candidate')} - {score_percent}% match\n"
            fallback_report += f"   URL: {candidate.get('url', 'N/A')}\n"
            fallback_report += f"   Source: {candidate.get('match_type', 'candidate_profile')}\n\n"
        
        fallback_report += """
## Recommendations
1. Contact top 3 candidates for initial screening
2. Verify employment eligibility and availability
3. Schedule technical interviews for qualified candidates
4. Cross-reference with internal databases
"""
        
        return fallback_report

# Define the tools
tools = [search_job_candidates, analyze_candidate_profile, generate_analysis_report]
tool_node = ToolNode(tools)

# Define the function that determines whether to continue or not
def should_continue(state):
    messages = state["messages"]
    last_message = messages[-1] if messages else None
    
    # If the last message had tool calls, continue
    if hasattr(last_message, "tool_calls") and last_message.tool_calls:
        return "continue"
    else:
        return "end"

# Define the function that calls the model
def call_model(state):
    messages = state["messages"]
    
    # Convert messages to Gemini format
    gemini_messages = []
    for msg in messages:
        if hasattr(msg, 'content'):
            gemini_messages.append({"role": "user", "parts": [msg.content]})
    
    # Add instruction for tool calling
    if not gemini_messages:
        gemini_messages.append({
            "role": "user", 
            "parts": [f"Find suitable candidates for this job: {state['job_description']}"]
        })
    
    try:
        # For this demo, we'll simulate tool calling behavior
        # In a production implementation, you'd use Gemini's function calling capabilities
        response_text = f"I'll search for candidates based on: {state['job_description']}"
        
        # Create a mock response that triggers tool calls
        mock_response = HumanMessage(content=response_text)
        mock_response.tool_calls = [{
            "name": "search_job_candidates",
            "args": {"query": state["job_description"]},
            "id": "call_123"
        }]
        
        return {"messages": [mock_response]}
    except Exception as e:
        error_msg = HumanMessage(content=f"Error calling model: {str(e)}")
        return {"messages": [error_msg]}

# Define a function to execute tools
def call_tools(state):
    messages = state["messages"]
    last_message = messages[-1]
    
    # Get the tool calls
    tool_calls = getattr(last_message, 'tool_calls', [])
    
    # Execute the tool calls
    responses = []
    for tool_call in tool_calls:
        tool_name = tool_call["name"]
        tool_args = tool_call["args"]
        # Find the tool and execute it
        tool_obj = None
        for t in tools:
            if t.name == tool_name:
                tool_obj = t
                break
        if tool_obj:
            # Call the tool using its .invoke() method
            result = tool_obj.invoke(tool_args)
            responses.append(result)
    
    # Convert responses to ToolMessage format
    tool_messages = []
    for i, tool_call in enumerate(tool_calls):
        tool_message = HumanMessage(
            content=str(responses[i]),
            name=tool_call["name"],
            tool_call_id=tool_call["id"]
        )
        tool_messages.append(tool_message)
    
    # Update search results in state if applicable
    for i, tool_call in enumerate(tool_calls):
        if tool_call["name"] == "search_job_candidates":
            state["search_results"] = responses[i]
        elif tool_call["name"] == "generate_analysis_report":
            state["analysis_report"] = responses[i]
    
    return {"messages": tool_messages, "search_results": state["search_results"], "analysis_report": state["analysis_report"]}

# Create the workflow
workflow = StateGraph(AgentState)

# Add the call_model node
workflow.add_node("agent", call_model)

# Add the execute_tools node
workflow.add_node("action", call_tools)

# Add edges
workflow.add_edge("agent", "action")
workflow.add_conditional_edges(
    "action",
    should_continue
)

# Set the entry point
workflow.set_entry_point("agent")

# Compile the graph
recruitment_agent_gemini = workflow.compile()