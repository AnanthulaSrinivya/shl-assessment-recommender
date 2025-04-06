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
# Sample SHL product catalog
catalog = pd.DataFrame([
    {
        "name": "Verify G+",
        "category": "Cognitive Ability",
        "tags": ["aptitude", "reasoning", "problem-solving"],
        "suitable_for": ["Entry", "Mid", "Senior"],
        "use_case": ["Hiring"]
    },
    {
        "name": "OPQ32",
        "category": "Personality",
        "tags": ["leadership", "teamwork", "motivation"],
        "suitable_for": ["Mid", "Senior"],
        "use_case": ["Hiring", "Development"]
    },
    {
        "name": "Sales Simulation",
        "category": "Simulation",
        "tags": ["sales", "persuasion", "customer service"],
        "suitable_for": ["Entry", "Mid"],
        "use_case": ["Hiring"]
    },
    {
        "name": "Excel Test",
        "category": "Skills",
        "tags": ["excel", "office", "data"],
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

# Matching logic function
def recommend_assessments(input_job: Dict, catalog: pd.DataFrame):
    results = []

    for _, row in catalog.iterrows():
        score = 0

        if input_job["level"] in row["suitable_for"]:
            score += 1

        if input_job["use_case"] in row["use_case"]:
            score += 1

        skill_matches = len(set(input_job["key_skills"]) & set(row["tags"]))
        score += skill_matches

        if score > 0:
            results.append({
                "name": row["name"],
                "category": row["category"],
                "score": score,
                "reason": f"Matched {skill_matches} skills + level/use_case"
            })

    sorted_results = sorted(results, key=lambda x: x["score"], reverse=True)
    return sorted_results

# API endpoint
@app.post("/recommend")
def get_recommendations(job: JobInput):
    job_dict = job.dict()
    recommendations = recommend_assessments(job_dict, catalog)
    return {"recommendations": recommendations}
