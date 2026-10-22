from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from ..database import get_db
from ..models import User, Resume, ResumeVersion
from ..schemas import UserCreate, UserLogin, UserResponse, Token
from ..auth import verify_password, get_password_hash, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/register", response_model=Token)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )
    
    hashed = get_password_hash(user_in.password)
    user = User(
        email=user_in.email,
        full_name=user_in.full_name or user_in.email.split("@")[0].capitalize(),
        hashed_password=hashed,
        is_demo=False
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.id})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/login", response_model=Token)
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )
    token = create_access_token({"sub": user.id})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/token")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    token = create_access_token({"sub": user.id})
    return {"access_token": token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/demo", response_model=Token)
def get_demo_account(db: Session = Depends(get_db)):
    """
    Creates or returns a pre-configured demo account populated with early-career sample data.
    """
    demo_email = "demo.student@fitcheck.dev"
    user = db.query(User).filter(User.email == demo_email).first()
    if not user:
        user = User(
            email=demo_email,
            full_name="Alex Chen (Demo)",
            hashed_password=get_password_hash("DemoFitCheck2026!"),
            is_demo=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        # Seed sample early-career resume for demo user
        sample_resume = Resume(
            user_id=user.id,
            title="Alex Chen - Software Engineer (ATS Optimized)",
            contact_info={
                "name": "Alex Chen",
                "email": "alex.chen@university.edu",
                "phone": "(555) 234-5678",
                "location": "San Francisco, CA",
                "linkedin": "https://linkedin.com/in/alexchen-dev",
                "github": "https://github.com/alexchen-code",
                "portfolio": "https://alexchen.dev"
            },
            summary="Motivated Computer Science graduate with hands-on experience in full-stack web development, RESTful APIs, and relational databases. Proven track record building responsive web applications and deploying scalable containerized microservices.",
            education=[
                {
                    "id": "edu-demo-1",
                    "institution": "California State University",
                    "degree": "Bachelor of Science",
                    "field": "Computer Science",
                    "location": "San Francisco, CA",
                    "start_date": "Aug 2022",
                    "end_date": "May 2026",
                    "gpa": "3.82 / 4.0",
                    "highlights": [
                        "Dean's Honor List (All Semesters)",
                        "Relevant Coursework: Data Structures & Algorithms, Database Management Systems, Cloud Computing, Web Architecture"
                    ]
                }
            ],
            experience=[
                {
                    "id": "exp-demo-1",
                    "company": "Nexus Web Solutions",
                    "title": "Software Engineering Intern",
                    "location": "Remote",
                    "start_date": "Jun 2025",
                    "end_date": "Aug 2025",
                    "is_current": False,
                    "bullets": [
                        "Engineered 12+ RESTful API endpoints using FastAPI and PostgreSQL, reducing endpoint response times by 28%.",
                        "Implemented reusable React and TypeScript components, improving Lighthouse accessibility scores from 74 to 98.",
                        "Configured Docker containers and automated GitHub Actions CI/CD workflows for staging deployments."
                    ]
                }
            ],
            projects=[
                {
                    "id": "proj-demo-1",
                    "name": "TaskFlow - Realtime Collaboration Board",
                    "role": "Lead Full-Stack Developer",
                    "link": "https://github.com/alexchen-code/taskflow",
                    "start_date": "Jan 2025",
                    "end_date": "May 2025",
                    "technologies": ["Next.js", "TypeScript", "Tailwind CSS", "PostgreSQL", "Docker"],
                    "bullets": [
                        "Architected a Kanban web application supporting drag-and-drop tasks, real-time board updates, and role-based permissions.",
                        "Optimized SQL queries and database indexes, reducing query latency across 50,000 synthetic records by 42%.",
                        "Authored 30+ end-to-end and unit tests with 88% overall code coverage."
                    ]
                }
            ],
            skills={
                "technical": ["FastAPI", "React", "Next.js", "Node.js", "REST APIs", "Data Structures", "Algorithms", "Object-Oriented Programming"],
                "tools_frameworks": ["PostgreSQL", "Docker", "Git", "GitHub Actions", "Linux", "Tailwind CSS"],
                "soft_skills": ["Teamwork", "Problem Solving", "Agile / Scrum", "Code Review", "Adaptability"],
                "languages": ["Python", "TypeScript", "JavaScript", "SQL", "HTML5", "CSS3"]
            },
            certifications=[
                {
                    "id": "cert-demo-1",
                    "name": "AWS Certified Cloud Practitioner",
                    "issuer": "Amazon Web Services",
                    "date": "2025",
                    "url": "https://aws.amazon.com"
                }
            ],
            template="classic-ats"
        )
        db.add(sample_resume)
        db.commit()
        db.refresh(sample_resume)

        version = ResumeVersion(
            resume_id=sample_resume.id,
            version_num=1,
            snapshot={
                "contact_info": sample_resume.contact_info,
                "summary": sample_resume.summary,
                "education": sample_resume.education,
                "experience": sample_resume.experience,
                "projects": sample_resume.projects,
                "skills": sample_resume.skills,
                "certifications": sample_resume.certifications,
                "template": sample_resume.template
            },
            note="Initial demo snapshot"
        )
        db.add(version)
        db.commit()

    token = create_access_token({"sub": user.id})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }
