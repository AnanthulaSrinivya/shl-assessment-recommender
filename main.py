from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
     CORSMiddleware,
     allow_origins=["*"], 
     allow_credentials=True,
     allow_methods=["*"],
     allow_headers=["*"],
 )
# Updated catalog with additional real SHL assessments
catalog = pd.DataFrame([
    {
        "url": "https://www.shl.com/solutions/products/product-catalog/view/python-new/",
        "adaptive_support": "No",
        "description": "Multi-choice test that measures the knowledge of Python programming, databases, modules and library. For Mid-Prof",
        "duration": 11,
        "remote_support": "Yes",
        "test_type": ["Knowledge & Skills"],
        "tags": ["python", "programming", "databases", "modules", "library"],
        "suitable_for": ["Mid"],
        "use_case": ["Hiring"]
    },
    {
        "url": "https://www.shl.com/solutions/products/product-catalog/view/technology-professional-8-0-job-focused-assessment/",
        "adaptive_support": "No",
        "description": "The Technology Job Focused Assessment assesses key behavioral attributes required for success in fast-paced, rapid environments",
        "duration": 16,
        "remote_support": "Yes",
        "test_type": ["Competencies", "Personality & Behaviour"],
        "tags": ["technology", "behavior", "fast-paced", "adaptability"],
        "suitable_for": ["Entry", "Mid", "Senior"],
        "use_case": ["Hiring"]
    },
    {
        "url": "https://www.shl.com/solutions/products/product-catalog/view/occupational-personality-questionnaire-opq/",
        "adaptive_support": "No",
        "description": "Assesses personality traits to predict job fit and performance using a forced-choice format",
        "duration": 20,
        "remote_support": "Yes",
        "test_type": ["Personality & Behaviour"],
        "tags": ["personality", "leadership", "teamwork", "motivation"],
        "suitable_for": ["Mid", "Senior"],
        "use_case": ["Hiring", "Development"]
    },
    {
        "url": "https://www.shl.com/solutions/products/product-catalog/view/verify-g-plus/",
        "adaptive_support": "Yes",
        "description": "Measures general cognitive ability through numerical, inductive, and deductive reasoning tasks",
        "duration": 36,
        "remote_support": "Yes",
        "test_type": ["Ability & Aptitude"],
        "tags": ["reasoning", "problem-solving", "numerical", "logical"],
        "suitable_for": ["Entry", "Mid", "Senior"],
        "use_case": ["Hiring"]
    },
    {
        "url": "https://www.shl.com/solutions/products/product-catalog/view/numerical-reasoning-test/",
        "adaptive_support": "No",
        "description": "Evaluates ability to interpret and analyze numerical data from graphs and tables",
        "duration": 20,
        "remote_support": "Yes",
        "test_type": ["Ability & Aptitude"],
        "tags": ["numerical", "data-analysis", "statistics"],
        "suitable_for": ["Entry", "Mid"],
        "use_case": ["Hiring"]
    },
    {
        "url": "https://www.shl.com/solutions/products/product-catalog/view/situational-judgement-test/",
        "adaptive_support": "No",
        "description": "Presents workplace scenarios to assess decision-making and judgement skills",
        "duration": 25,
        "remote_support": "Yes",
        "test_type": ["Biodata & Situational Judgement"],
        "tags": ["decision-making", "problem-solving", "interpersonal"],
        "suitable_for": ["Entry", "Mid", "Senior"],
        "use_case": ["Hiring"]
    },
    {
        "url": "https://www.shl.com/solutions/products/product-catalog/view/mechanical-comprehension-test/",
        "adaptive_support": "No",
        "description": "Tests understanding of mechanical principles like gears, pulleys, and levers",
        "duration": 25,
        "remote_support": "Yes",
        "test_type": ["Knowledge & Skills"],
        "tags": ["mechanical", "engineering", "technical"],
        "suitable_for": ["Entry", "Mid"],
        "use_case": ["Hiring"]
    }
])

# Pydantic model for request body
class JobInput(BaseModel):
    job_title: str
    level: str
    use_case: str
    key_skills: List[str]

@app.get("/health")
def health_check():
    return {"status": "healthy"}

# Matching logic function
def recommend_assessments(input_job: Dict, catalog: pd.DataFrame):
    results = []

    for _, row in catalog.iterrows():
        score = 0

        # Check if the level matches
        if input_job["level"] in row["suitable_for"]:
            score += 1

        # Check if the use case matches
        if input_job["use_case"] in row["use_case"]:
            score += 1

        # Calculate skill matches
        skill_matches = len(set(input_job["key_skills"]) & set(row["tags"]))
        score += skill_matches

        if score > 0:
            # Return the full assessment details with score and reason
            result = {
                "url": row["url"],
                "adaptive_support": row["adaptive_support"],
                "description": row["description"],
                "duration": row["duration"],
                "remote_support": row["remote_support"],
                "test_type": row["test_type"],
                "score": score,
                "reason": f"Matched {skill_matches} skills + level/use_case compatibility"
            }
            results.append(result)

    # Sort results by score in descending order
    sorted_results = sorted(results, key=lambda x: x["score"], reverse=True)
    return sorted_results

# API endpoint
@app.post("/recommend")
def get_recommendations(job: JobInput):
    job_dict = job.dict()
    recommendations = recommend_assessments(job_dict, catalog)
    return {"recommendations": recommendations}

# Example usage: run with `uvicorn filename:app --reload`
