from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# Profile schemas
class UserBase(BaseModel):
    name: str
    exam_type: str  # JEE / MHT-CET
    percentile: Optional[float] = None
    rank: Optional[int] = None
    category: str = "General"
    preferred_cities: str  # Comma-separated
    interests: str  # Comma-separated
    favorite_subjects: str  # Comma-separated

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# College & Cutoff schemas
class CutoffResponse(BaseModel):
    id: int
    branch: str
    exam_type: str
    category: str
    cutoff_percentile: float
    cutoff_rank: Optional[int] = None

    class Config:
        from_attributes = True

class CollegeResponse(BaseModel):
    id: int
    name: str
    city: str
    state: str
    average_package: float
    highest_package: float
    fees: int
    nirf_rank: Optional[int] = None
    website: Optional[str] = None
    description: Optional[str] = None

    class Config:
        from_attributes = True

class CollegeWithCutoffs(CollegeResponse):
    cutoffs: List[CutoffResponse] = []

# Predictor schemas
class PredictedCollege(BaseModel):
    college: CollegeResponse
    branch: str
    cutoff_percentile: float
    cutoff_rank: Optional[int] = None
    admission_probability: str  # "High" (score > cutoff + 1), "Medium" (cutoff <= score <= cutoff + 1), "Low" (score < cutoff but close)
    chance_percentage: int

class CollegePredictorResponse(BaseModel):
    predictions: List[PredictedCollege]

# Branch Recommendation schemas
class BranchRecommendation(BaseModel):
    branch: str
    match_percentage: int
    reason: str
    avg_starting_salary: str  # e.g., "8-12 LPA"
    future_scope: str
    skills_required: List[str]

class BranchRecommendationResponse(BaseModel):
    recommendations: List[BranchRecommendation]

# Placement Dashboard schemas
class RecruiterStat(BaseModel):
    name: str
    frequency: str  # e.g. "Core Recruiter", "Dream Recruiter"

class CollegePlacementResponse(BaseModel):
    college_id: int
    college_name: str
    average_package: float
    highest_package: float
    fees: int
    placement_ratio: str  # Mocked e.g. "92%"
    top_recruiters: List[str]

# Roadmap schemas
class RoadmapStep(BaseModel):
    title: str
    description: str
    skills: List[str]
    courses: List[str]
    projects: List[str]
    certifications: List[str]

class RoadmapResponse(BaseModel):
    branch: str
    year_1: RoadmapStep
    year_2: RoadmapStep
    year_3: RoadmapStep
    year_4: RoadmapStep

# PDF Tutor schemas
class PDFUploadResponse(BaseModel):
    filename: str
    summary: str
    key_points: List[str]
    revision_notes: List[str]

class PDFQueryRequest(BaseModel):
    question: str

class PDFQueryResponse(BaseModel):
    answer: str

class MCQOption(BaseModel):
    text: str
    option_id: str  # "A", "B", "C", "D"

class QuizQuestion(BaseModel):
    id: int
    question: str
    options: List[MCQOption]
    correct_option: str  # "A", "B", etc.
    explanation: str

class PDFQuizResponse(BaseModel):
    quiz: List[QuizQuestion]

# Chat schemas
class ChatRequest(BaseModel):
    user_id: int
    message: str

class ChatResponse(BaseModel):
    response: str
    agent_type: str  # "manager", "predictor", "career", "research", "study_planner", "pdf_tutor"
