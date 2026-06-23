import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

# Ensure data directory exists
db_path = settings.DATABASE_URL.replace("sqlite:///./", "")
db_dir = os.path.dirname(db_path)
if db_dir and not os.path.exists(db_dir):
    os.makedirs(db_dir, exist_ok=True)

engine = create_engine(
    settings.DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def seed_database():
    """Seed the database with default engineering college data if empty."""
    from app.models import College, Cutoff
    db = SessionLocal()
    try:
        # Check if database is already seeded
        if db.query(College).first() is not None:
            print("Database already seeded.")
            return

        print("Seeding database with engineering college data...")
        
        # Define colleges
        colleges_data = [
            # Maharashtra State (MHT-CET / JEE)
            {
                "name": "COEP Technological University, Pune",
                "city": "Pune",
                "state": "Maharashtra",
                "average_package": 11.5,
                "highest_package": 50.5,
                "fees": 140000,
                "nirf_rank": 73,
                "website": "https://www.coep.org.in",
                "description": "One of the oldest engineering colleges in Asia, known for its strong academic legacy and rich student activities (COEP MindSpark, Regatta).",
                "cutoffs": [
                    {"branch": "Computer Engineering", "exam_type": "MHT-CET", "category": "General", "cutoff_percentile": 99.8, "cutoff_rank": 150},
                    {"branch": "Computer Engineering", "exam_type": "MHT-CET", "category": "OBC", "cutoff_percentile": 99.5, "cutoff_rank": 350},
                    {"branch": "Computer Engineering", "exam_type": "MHT-CET", "category": "SC", "cutoff_percentile": 98.2, "cutoff_rank": 1200},
                    {"branch": "Computer Engineering", "exam_type": "MHT-CET", "category": "ST", "cutoff_percentile": 95.0, "cutoff_rank": 4000},
                    
                    {"branch": "Information Technology", "exam_type": "MHT-CET", "category": "General", "cutoff_percentile": 99.6, "cutoff_rank": 280},
                    {"branch": "Information Technology", "exam_type": "MHT-CET", "category": "OBC", "cutoff_percentile": 99.2, "cutoff_rank": 580},
                    {"branch": "Information Technology", "exam_type": "MHT-CET", "category": "SC", "cutoff_percentile": 97.8, "cutoff_rank": 1600},
                    
                    {"branch": "Electronics & Telecommunication", "exam_type": "MHT-CET", "category": "General", "cutoff_percentile": 99.2, "cutoff_rank": 550},
                    {"branch": "Electronics & Telecommunication", "exam_type": "MHT-CET", "category": "OBC", "cutoff_percentile": 98.7, "cutoff_rank": 950},
                    
                    {"branch": "Mechanical Engineering", "exam_type": "MHT-CET", "category": "General", "cutoff_percentile": 97.5, "cutoff_rank": 1800},
                    {"branch": "Mechanical Engineering", "exam_type": "MHT-CET", "category": "OBC", "cutoff_percentile": 96.0, "cutoff_rank": 3200},
                ]
            },
            {
                "name": "Veermata Jijabai Technological Institute (VJTI), Mumbai",
                "city": "Mumbai",
                "state": "Maharashtra",
                "average_package": 12.0,
                "highest_package": 62.0,
                "fees": 90000,
                "nirf_rank": 80,
                "website": "https://vjti.ac.in",
                "description": "Premier state-funded college in Mumbai, historically famous for excellent placements, strong alumni network, and coding culture.",
                "cutoffs": [
                    {"branch": "Computer Engineering", "exam_type": "MHT-CET", "category": "General", "cutoff_percentile": 99.9, "cutoff_rank": 95},
                    {"branch": "Computer Engineering", "exam_type": "MHT-CET", "category": "OBC", "cutoff_percentile": 99.7, "cutoff_rank": 220},
                    {"branch": "Computer Engineering", "exam_type": "MHT-CET", "category": "SC", "cutoff_percentile": 98.5, "cutoff_rank": 1000},
                    
                    {"branch": "Information Technology", "exam_type": "MHT-CET", "category": "General", "cutoff_percentile": 99.7, "cutoff_rank": 180},
                    {"branch": "Information Technology", "exam_type": "MHT-CET", "category": "OBC", "cutoff_percentile": 99.4, "cutoff_rank": 400},
                    
                    {"branch": "Electronics Engineering", "exam_type": "MHT-CET", "category": "General", "cutoff_percentile": 99.0, "cutoff_rank": 700},
                    {"branch": "Electronics Engineering", "exam_type": "MHT-CET", "category": "OBC", "cutoff_percentile": 98.5, "cutoff_rank": 1200},
                    
                    {"branch": "Mechanical Engineering", "exam_type": "MHT-CET", "category": "General", "cutoff_percentile": 97.0, "cutoff_rank": 2200},
                    {"branch": "Mechanical Engineering", "exam_type": "MHT-CET", "category": "OBC", "cutoff_percentile": 95.5, "cutoff_rank": 3800},
                ]
            },
            {
                "name": "Sardar Patel Institute of Technology (SPIT), Mumbai",
                "city": "Mumbai",
                "state": "Maharashtra",
                "average_package": 15.0,
                "highest_package": 42.0,
                "fees": 172000,
                "nirf_rank": 120,
                "website": "https://www.spit.ac.in",
                "description": "An autonomous research college located in Andheri, Mumbai, famed for its tech placements (particularly in finance and big tech) and modern syllabus.",
                "cutoffs": [
                    {"branch": "Computer Engineering", "exam_type": "MHT-CET", "category": "General", "cutoff_percentile": 99.6, "cutoff_rank": 260},
                    {"branch": "Computer Engineering", "exam_type": "MHT-CET", "category": "OBC", "cutoff_percentile": 99.1, "cutoff_rank": 620},
                    {"branch": "Computer Engineering", "exam_type": "MHT-CET", "category": "SC", "cutoff_percentile": 97.0, "cutoff_rank": 2100},
                    
                    {"branch": "Computer Science & Eng (AI/ML)", "exam_type": "MHT-CET", "category": "General", "cutoff_percentile": 99.4, "cutoff_rank": 390},
                    {"branch": "Computer Science & Eng (AI/ML)", "exam_type": "MHT-CET", "category": "OBC", "cutoff_percentile": 98.8, "cutoff_rank": 820},
                    
                    {"branch": "Electronics & Telecommunication", "exam_type": "MHT-CET", "category": "General", "cutoff_percentile": 98.2, "cutoff_rank": 1200},
                    {"branch": "Electronics & Telecommunication", "exam_type": "MHT-CET", "category": "OBC", "cutoff_percentile": 97.5, "cutoff_rank": 1900},
                ]
            },
            {
                "name": "Pune Institute of Computer Technology (PICT), Pune",
                "city": "Pune",
                "state": "Maharashtra",
                "average_package": 12.5,
                "highest_package": 43.0,
                "fees": 92000,
                "nirf_rank": 150,
                "website": "https://pict.edu",
                "description": "A top-tier institute in Pune specializing in CS, IT, and Electronics. Famed as the 'IT Academy of Pune' due to massive placements in tech roles.",
                "cutoffs": [
                    {"branch": "Computer Engineering", "exam_type": "MHT-CET", "category": "General", "cutoff_percentile": 99.5, "cutoff_rank": 310},
                    {"branch": "Computer Engineering", "exam_type": "MHT-CET", "category": "OBC", "cutoff_percentile": 99.0, "cutoff_rank": 700},
                    {"branch": "Computer Engineering", "exam_type": "MHT-CET", "category": "SC", "cutoff_percentile": 97.2, "cutoff_rank": 1900},
                    
                    {"branch": "Information Technology", "exam_type": "MHT-CET", "category": "General", "cutoff_percentile": 99.2, "cutoff_rank": 550},
                    {"branch": "Information Technology", "exam_type": "MHT-CET", "category": "OBC", "cutoff_percentile": 98.6, "cutoff_rank": 1100},
                    
                    {"branch": "Electronics & Telecommunication", "exam_type": "MHT-CET", "category": "General", "cutoff_percentile": 98.0, "cutoff_rank": 1400},
                    {"branch": "Electronics & Telecommunication", "exam_type": "MHT-CET", "category": "OBC", "cutoff_percentile": 97.2, "cutoff_rank": 2200},
                ]
            },
            {
                "name": "Dwarkadas J. Sanghvi College of Engineering (DJSCE), Mumbai",
                "city": "Mumbai",
                "state": "Maharashtra",
                "average_package": 9.8,
                "highest_package": 35.0,
                "fees": 200000,
                "nirf_rank": 180,
                "website": "https://www.djsce.ac.in",
                "description": "Located in Vile Parle, Mumbai, highly popular for its premium infrastructure, enthusiastic campus environment, and solid placements.",
                "cutoffs": [
                    {"branch": "Computer Engineering", "exam_type": "MHT-CET", "category": "General", "cutoff_percentile": 98.9, "cutoff_rank": 950},
                    {"branch": "Computer Engineering", "exam_type": "MHT-CET", "category": "OBC", "cutoff_percentile": 98.0, "cutoff_rank": 1800},
                    
                    {"branch": "Information Technology", "exam_type": "MHT-CET", "category": "General", "cutoff_percentile": 98.5, "cutoff_rank": 1300},
                    {"branch": "Information Technology", "exam_type": "MHT-CET", "category": "OBC", "cutoff_percentile": 97.5, "cutoff_rank": 2400},
                    
                    {"branch": "Mechanical Engineering", "exam_type": "MHT-CET", "category": "General", "cutoff_percentile": 93.0, "cutoff_rank": 5800},
                ]
            },
            
            # National Level (JEE Main / Advanced)
            {
                "name": "Indian Institute of Technology Bombay (IITB)",
                "city": "Mumbai",
                "state": "Maharashtra",
                "average_package": 23.5,
                "highest_package": 168.0,
                "fees": 220000,
                "nirf_rank": 3,
                "website": "https://www.iitb.ac.in",
                "description": "Ranked among the absolute top engineering schools in India, attracting the highest rankers of the JEE Advanced exam.",
                "cutoffs": [
                    {"branch": "Computer Science & Engineering", "exam_type": "JEE", "category": "General", "cutoff_percentile": 99.99, "cutoff_rank": 67},
                    {"branch": "Computer Science & Engineering", "exam_type": "JEE", "category": "OBC", "cutoff_percentile": 99.98, "cutoff_rank": 35},
                    {"branch": "Computer Science & Engineering", "exam_type": "JEE", "category": "SC", "cutoff_percentile": 99.9, "cutoff_rank": 15},
                    
                    {"branch": "Electrical Engineering", "exam_type": "JEE", "category": "General", "cutoff_percentile": 99.95, "cutoff_rank": 480},
                    {"branch": "Electrical Engineering", "exam_type": "JEE", "category": "OBC", "cutoff_percentile": 99.9, "cutoff_rank": 250},
                    
                    {"branch": "Mechanical Engineering", "exam_type": "JEE", "category": "General", "cutoff_percentile": 99.85, "cutoff_rank": 1400},
                    {"branch": "Mechanical Engineering", "exam_type": "JEE", "category": "OBC", "cutoff_percentile": 99.7, "cutoff_rank": 750},
                ]
            },
            {
                "name": "Indian Institute of Technology Madras (IITM)",
                "city": "Chennai",
                "state": "Tamil Nadu",
                "average_package": 21.0,
                "highest_package": 130.0,
                "fees": 215000,
                "nirf_rank": 1,
                "website": "https://www.iitm.ac.in",
                "description": "Frequently ranked #1 in NIRF Engineering category, known for its cutting-edge research park and entrepreneurship culture.",
                "cutoffs": [
                    {"branch": "Computer Science & Engineering", "exam_type": "JEE", "category": "General", "cutoff_percentile": 99.99, "cutoff_rank": 85},
                    {"branch": "Computer Science & Engineering", "exam_type": "JEE", "category": "OBC", "cutoff_percentile": 99.97, "cutoff_rank": 42},
                    {"branch": "Computer Science & Engineering", "exam_type": "JEE", "category": "SC", "cutoff_percentile": 99.9, "cutoff_rank": 20},
                    
                    {"branch": "Electrical Engineering", "exam_type": "JEE", "category": "General", "cutoff_percentile": 99.92, "cutoff_rank": 850},
                    {"branch": "Electrical Engineering", "exam_type": "JEE", "category": "OBC", "cutoff_percentile": 99.85, "cutoff_rank": 450},
                ]
            },
            {
                "name": "National Institute of Technology Trichy (NITT)",
                "city": "Tiruchirappalli",
                "state": "Tamil Nadu",
                "average_package": 16.0,
                "highest_package": 52.8,
                "fees": 145000,
                "nirf_rank": 9,
                "website": "https://www.nitt.edu",
                "description": "The premier National Institute of Technology, boasting outstanding placements, coding environment, and national diversity.",
                "cutoffs": [
                    {"branch": "Computer Science & Engineering", "exam_type": "JEE", "category": "General", "cutoff_percentile": 99.85, "cutoff_rank": 1500},
                    {"branch": "Computer Science & Engineering", "exam_type": "JEE", "category": "OBC", "cutoff_percentile": 99.7, "cutoff_rank": 800},
                    {"branch": "Computer Science & Engineering", "exam_type": "JEE", "category": "SC", "cutoff_percentile": 99.4, "cutoff_rank": 350},
                    
                    {"branch": "Electronics & Communication", "exam_type": "JEE", "category": "General", "cutoff_percentile": 99.6, "cutoff_rank": 4000},
                    {"branch": "Electronics & Communication", "exam_type": "JEE", "category": "OBC", "cutoff_percentile": 99.2, "cutoff_rank": 1500},
                ]
            },
            {
                "name": "Visvesvaraya National Institute of Technology (VNIT), Nagpur",
                "city": "Nagpur",
                "state": "Maharashtra",
                "average_package": 10.5,
                "highest_package": 40.0,
                "fees": 150000,
                "nirf_rank": 41,
                "website": "https://vnit.ac.in",
                "description": "Prominent NIT located in central India, known for an sprawling green campus and robust core engineering placements.",
                "cutoffs": [
                    {"branch": "Computer Science & Engineering", "exam_type": "JEE", "category": "General", "cutoff_percentile": 99.4, "cutoff_rank": 6500},
                    {"branch": "Computer Science & Engineering", "exam_type": "JEE", "category": "OBC", "cutoff_percentile": 99.0, "cutoff_rank": 2400},
                    {"branch": "Computer Science & Engineering", "exam_type": "JEE", "category": "SC", "cutoff_percentile": 98.2, "cutoff_rank": 1100},
                    
                    {"branch": "Electronics & Communication", "exam_type": "JEE", "category": "General", "cutoff_percentile": 98.8, "cutoff_rank": 12000},
                    {"branch": "Electronics & Communication", "exam_type": "JEE", "category": "OBC", "cutoff_percentile": 98.2, "cutoff_rank": 4000},
                    
                    {"branch": "Mechanical Engineering", "exam_type": "JEE", "category": "General", "cutoff_percentile": 97.8, "cutoff_rank": 25000},
                    {"branch": "Mechanical Engineering", "exam_type": "JEE", "category": "OBC", "cutoff_percentile": 96.5, "cutoff_rank": 8500},
                ]
            }
        ]

        # Insert colleges and cutoffs
        for col_data in colleges_data:
            col = College(
                name=col_data["name"],
                city=col_data["city"],
                state=col_data["state"],
                average_package=col_data["average_package"],
                highest_package=col_data["highest_package"],
                fees=col_data["fees"],
                nirf_rank=col_data["nirf_rank"],
                website=col_data["website"],
                description=col_data["description"]
            )
            db.add(col)
            db.flush()  # Populates col.id

            for cut_data in col_data["cutoffs"]:
                cut = Cutoff(
                    college_id=col.id,
                    branch=cut_data["branch"],
                    exam_type=cut_data["exam_type"],
                    category=cut_data["category"],
                    cutoff_percentile=cut_data["cutoff_percentile"],
                    cutoff_rank=cut_data["cutoff_rank"]
                )
                db.add(cut)
        
        db.commit()
        print("Database successfully seeded.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()
