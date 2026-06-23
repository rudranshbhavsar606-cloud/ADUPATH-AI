from sqlalchemy.orm import Session
from app import models, schemas
from typing import List, Optional

# User Profile CRUD
def get_user(db: Session, user_id: int) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_users(db: Session) -> List[models.User]:
    return db.query(models.User).all()

def create_user(db: Session, user_schema: schemas.UserCreate) -> models.User:
    db_user = models.User(
        name=user_schema.name,
        exam_type=user_schema.exam_type,
        percentile=user_schema.percentile,
        rank=user_schema.rank,
        category=user_schema.category,
        preferred_cities=user_schema.preferred_cities,
        interests=user_schema.interests,
        favorite_subjects=user_schema.favorite_subjects
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, user_schema: schemas.UserCreate) -> Optional[models.User]:
    db_user = get_user(db, user_id)
    if not db_user:
        return None
    db_user.name = user_schema.name
    db_user.exam_type = user_schema.exam_type
    db_user.percentile = user_schema.percentile
    db_user.rank = user_schema.rank
    db_user.category = user_schema.category
    db_user.preferred_cities = user_schema.preferred_cities
    db_user.interests = user_schema.interests
    db_user.favorite_subjects = user_schema.favorite_subjects
    
    db.commit()
    db.refresh(db_user)
    return db_user

# College CRUD
def get_colleges(db: Session) -> List[models.College]:
    return db.query(models.College).all()

def get_college_by_id(db: Session, college_id: int) -> Optional[models.College]:
    return db.query(models.College).filter(models.College.id == college_id).first()

def get_college_by_name(db: Session, name: str) -> Optional[models.College]:
    return db.query(models.College).filter(models.College.name.ilike(f"%{name}%")).first()

# Predictor logic
def get_predictions(
    db: Session,
    exam_type: str,
    percentile: Optional[float],
    rank: Optional[int],
    category: str,
    preferred_cities: str
) -> List[dict]:
    # Parse preferred cities
    cities = [c.strip().lower() for c in preferred_cities.split(",") if c.strip()]
    filter_cities = len(cities) > 0 and "all" not in [c.lower() for c in cities]

    # Query all cutoffs matching the exam type and category
    query = db.query(models.Cutoff).join(models.College).filter(
        models.Cutoff.exam_type == exam_type,
        models.Cutoff.category == category
    )
    
    cutoffs = query.all()
    predictions = []
    
    for cutoff in cutoffs:
        college = cutoff.college
        
        # City Filter
        if filter_cities and college.city.lower() not in cities:
            continue
            
        admission_prob = "Low"
        chance_pct = 10
        
        if exam_type == "MHT-CET":
            if percentile is None:
                continue
            diff = percentile - cutoff.cutoff_percentile
            if diff >= 0.5:
                admission_prob = "High"
                chance_pct = min(99, int(85 + (diff * 10)))
            elif diff >= -1.0:
                admission_prob = "Medium"
                chance_pct = int(50 + (diff * 30))
            elif diff >= -3.0:
                admission_prob = "Low"
                chance_pct = int(20 + (diff + 3.0) * 10)
            else:
                continue  # Score too low
        else:  # JEE (Rank based, lower rank is better)
            if rank is None:
                continue
            cutoff_rank = cutoff.cutoff_rank or 100000
            ratio = rank / cutoff_rank
            if ratio <= 0.9:
                admission_prob = "High"
                chance_pct = min(99, int(95 - (ratio * 15)))
            elif ratio <= 1.15:
                admission_prob = "Medium"
                chance_pct = int(75 - (ratio - 0.9) * 100)
            elif ratio <= 1.4:
                admission_prob = "Low"
                chance_pct = max(15, int(45 - (ratio - 1.15) * 80))
            else:
                continue  # Rank too high (worse)

        predictions.append({
            "college": college,
            "branch": cutoff.branch,
            "cutoff_percentile": cutoff.cutoff_percentile,
            "cutoff_rank": cutoff.cutoff_rank,
            "admission_probability": admission_prob,
            "chance_percentage": chance_pct
        })
    
    # Sort predictions by chance percentage descending
    predictions.sort(key=lambda x: x["chance_percentage"], reverse=True)
    return predictions

# Saved Colleges CRUD
def save_college(db: Session, user_id: int, college_id: int) -> bool:
    db_user = get_user(db, user_id)
    db_college = get_college_by_id(db, college_id)
    if db_user and db_college:
        if db_college not in db_user.saved_colleges:
            db_user.saved_colleges.append(db_college)
            db.commit()
            return True
    return False

def unsave_college(db: Session, user_id: int, college_id: int) -> bool:
    db_user = get_user(db, user_id)
    db_college = get_college_by_id(db, college_id)
    if db_user and db_college:
        if db_college in db_user.saved_colleges:
            db_user.saved_colleges.remove(db_college)
            db.commit()
            return True
    return False

def get_saved_colleges(db: Session, user_id: int) -> List[models.College]:
    db_user = get_user(db, user_id)
    if db_user:
        return db_user.saved_colleges
    return []

# Search History CRUD
def add_search_history(
    db: Session, user_id: int, query: str, response: str, category: str
) -> models.SearchHistory:
    db_history = models.SearchHistory(
        user_id=user_id,
        query=query,
        response=response,
        category=category
    )
    db.add(db_history)
    db.commit()
    db.refresh(db_history)
    return db_history

def get_search_history(db: Session, user_id: int, limit: int = 5) -> List[models.SearchHistory]:
    return db.query(models.SearchHistory).filter(
        models.SearchHistory.user_id == user_id
    ).order_by(models.SearchHistory.timestamp.desc()).limit(limit).all()
