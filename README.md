# Recruitment AI Agent

This AI agent helps with screening and sourcing candidates for recruitment by analyzing job requirements and searching the internet for suitable candidates. It leverages LangChain and LangGraph technologies to create an intelligent recruitment assistant.

## Features

- Analyzes job descriptions provided by users
- Searches the internet for potential candidates
- Analyzes candidate profiles and LinkedIn information
- Generates comprehensive analysis reports comparing candidates to job requirements
- Provides recommendations for next steps in the recruitment process

## Prerequisites

Before running the agent, you'll need:

1. **Python 3.8+**
2. **OpenAI API Key** - Get one from [OpenAI Platform](https://platform.openai.com/api-keys)
3. **Tavily API Key** - Get one from [Tavily API](https://app.tavily.com/api-keys)

## Installation

1. Clone or download this repository
2. Navigate to the project directory:

```bash
cd langgraph-ai-agent
```

3. Activate the virtual environment:

```bash
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

4. Install the required dependencies:

```bash
pip install -r requirements.txt
```

## Setup

1. Copy the `.env.example` file to `.env`:

```bash
cp .env .env
```

2. Edit the `.env` file with your API keys:

```env
OPENAI_API_KEY=your_openai_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here
LINKEDIN_USERNAME=your_linkedin_username  # Optional
LINKEDIN_PASSWORD=your_linkedin_password  # Optional
```

## Usage

Run the recruitment agent:

```bash
python main.py
```

The agent will prompt you to enter a job description or requirements. After entering the job description, the agent will:

1. Search the internet for potential candidates
2. Analyze candidate profiles
3. Generate a comprehensive analysis report
4. Provide recommendations based on the job requirements

## How It Works

The recruitment AI agent uses a LangGraph workflow with the following components:

1. **State Management**: Maintains state with job description, search results, candidate profiles, and analysis reports
2. **Tools**:
   - `search_job_candidates`: Uses Tavily to search for potential candidates based on job requirements
   - `analyze_candidate_profile`: Analyzes candidate LinkedIn profiles or similar platforms
   - `generate_analysis_report`: Creates a comprehensive analysis comparing candidates to job requirements
3. **LangChain Integration**: Uses OpenAI's GPT-4o model to process information and generate responses
4. **Workflow Logic**: Orchestrates the process of searching, analyzing, and reporting

## Example Use Cases

- **Technical Roles**: Find software engineers, data scientists, or other technical professionals
- **Executive Positions**: Source executives and leadership roles
- **Specialized Skills**: Identify candidates with specific skills or experience
- **Market Research**: Understand the talent landscape for specific roles

## Important Notes

- Be sure to comply with websites' terms of service when scraping data
- Respect rate limits for API calls to avoid being blocked
- Consider privacy and data protection regulations when handling candidate information
- The agent works best with clear, detailed job descriptions

## Troubleshooting

If you encounter issues:

1. Ensure all required API keys are correctly set in the `.env` file
2. Check that you have a stable internet connection
3. Verify that your API keys have sufficient quota
4. Make sure you're using Python 3.8 or higher

## License

This project is for educational purposes. Be sure to review and comply with the terms of service for all APIs and services used.