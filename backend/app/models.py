from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text, Table
from sqlalchemy.orm import relationship
import datetime
from app.database import Base

# Junction table for User saved colleges
saved_colleges = Table(
    'saved_colleges',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id', ondelete="CASCADE"), primary_key=True),
    Column('college_id', Integer, ForeignKey('colleges.id', ondelete="CASCADE"), primary_key=True)
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    exam_type = Column(String)  # JEE / MHT-CET
    percentile = Column(Float, nullable=True)
    rank = Column(Integer, nullable=True)
    category = Column(String, default="General")  # General, OBC, SC, ST, EWS
    preferred_cities = Column(String)  # Comma-separated, e.g. "Mumbai, Pune, Nagpur"
    interests = Column(String)  # Comma-separated, e.g. "AI/ML, Web Dev, Robotics"
    favorite_subjects = Column(String)  # Comma-separated, e.g. "Maths, Physics"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    saved_colleges = relationship("College", secondary=saved_colleges, backref="saved_by_users")
    search_histories = relationship("SearchHistory", back_populates="user", cascade="all, delete-orphan")

class College(Base):
    __tablename__ = "colleges"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    city = Column(String, index=True)
    state = Column(String)
    average_package = Column(Float)  # in LPA (Lakhs Per Annum)
    highest_package = Column(Float)  # in LPA
    fees = Column(Integer)  # in INR per year
    nirf_rank = Column(Integer, nullable=True)
    website = Column(String, nullable=True)
    description = Column(Text, nullable=True)

    # Relationships
    cutoffs = relationship("Cutoff", back_populates="college", cascade="all, delete-orphan")

class Cutoff(Base):
    __tablename__ = "cutoffs"

    id = Column(Integer, primary_key=True, index=True)
    college_id = Column(Integer, ForeignKey("colleges.id", ondelete="CASCADE"))
    branch = Column(String, index=True)  # e.g., "Computer Science", "Information Technology", "Mechanical"
    exam_type = Column(String)  # JEE / MHT-CET
    category = Column(String)  # General, OBC, SC, ST, EWS
    cutoff_percentile = Column(Float)  # e.g., 98.5
    cutoff_rank = Column(Integer, nullable=True)  # e.g., 4500

    # Relationships
    college = relationship("College", back_populates="cutoffs")

class SearchHistory(Base):
    __tablename__ = "search_histories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    query = Column(String)
    response = Column(Text, nullable=True)
    category = Column(String)  # predictor, career, research, general
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="search_histories")
