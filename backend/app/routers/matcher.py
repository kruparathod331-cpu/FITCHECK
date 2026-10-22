from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Resume, MatchReport, User
from ..schemas import MatchRequest, MatchResponse
from ..auth import get_current_user_optional
from ..matcher import analyze_job_match

router = APIRouter(prefix="/api/matcher", tags=["matcher"])

SAMPLE_JOBS = [
    {
        "id": "job-sample-swe",
        "title": "Junior Full-Stack Software Engineer",
        "company": "CloudSphere Technologies",
        "location": "San Francisco, CA / Remote",
        "description": """About CloudSphere Technologies:
We are building the next generation of cloud developer tools and collaborative workspace software.

Responsibilities:
- Collaborate with agile cross-functional teams to design, build, and deploy full-stack web applications.
- Develop clean, maintainable backend APIs and integrate them with responsive frontend user interfaces.
- Participate in code reviews, write unit tests, and support continuous integration (CI/CD) pipelines.
- Investigate and troubleshoot software defects, improving overall application performance.

Basic Qualifications (Required):
- Bachelor's degree in Computer Science, Software Engineering, or related STEM field (or equivalent practical experience).
- Strong proficiency in Python or TypeScript/JavaScript.
- Hands-on experience developing RESTful APIs and working with relational databases like PostgreSQL or MySQL.
- Familiarity with version control using Git and GitHub.
- Understanding of core data structures, algorithms, and object-oriented programming principles.
- Effective written and verbal communication and teamwork skills.

Preferred Qualifications (Bonus):
- Experience with modern frontend frameworks such as React, Next.js, or Tailwind CSS.
- Familiarity with containerization technologies like Docker.
- Exposure to cloud platforms (AWS, GCP, or Azure).
- Knowledge of automated testing frameworks (pytest, Jest) and CI/CD pipelines.
"""
    },
    {
        "id": "job-sample-data",
        "title": "Junior Data Analyst / Business Intelligence",
        "company": "DataVibe Analytics",
        "location": "New York, NY / Hybrid",
        "description": """About DataVibe:
DataVibe empowers fast-growing enterprises to transform raw operational data into actionable strategic insights.

Responsibilities:
- Write and optimize complex SQL queries to extract, transform, and analyze large datasets from relational databases.
- Develop clear analytical dashboards and KPI reports using Python, Pandas, and visualization tools.
- Partner with product managers and business stakeholders to identify key metrics and deliver analytical summaries.
- Conduct exploratory data analysis to discover trends, anomalies, and optimization opportunities.

Basic Qualifications (Required):
- Degree in Computer Science, Data Science, Statistics, Mathematics, or Economics.
- Advanced proficiency in SQL (joins, aggregations, window functions, data modeling).
- Hands-on experience with Python for data analysis using libraries such as Pandas and NumPy.
- Demonstrated problem-solving capabilities and analytical thinking.
- Strong attention to detail and ability to communicate findings to non-technical stakeholders.

Preferred Qualifications (Bonus):
- Experience with BI visualization platforms like Tableau, Power BI, or Looker.
- Familiarity with ETL pipelines, data warehouses, or PostgreSQL.
- Foundational understanding of statistical testing and machine learning concepts.
"""
    },
    {
        "id": "job-sample-devops",
        "title": "Associate Cloud & DevOps Engineer",
        "company": "OrbitScale Infrastructure",
        "location": "Austin, TX / Remote",
        "description": """About OrbitScale:
OrbitScale delivers enterprise-grade infrastructure automation and cloud scalability solutions.

Responsibilities:
- Support maintenance and monitoring of Linux-based cloud infrastructure and containerized microservices.
- Write scripts to automate repetitive system tasks using Python or Bash/Shell.
- Help maintain GitHub Actions CI/CD deployment pipelines and automated test runners.
- Collaborate with software engineers to diagnose production bottlenecks and enhance system reliability.

Basic Qualifications (Required):
- Bachelor's degree in Computer Science, Information Technology, or relevant background.
- Working knowledge of Linux command line environments and shell scripting.
- Understanding of networking fundamentals, HTTP protocols, and cloud architecture basics.
- Hands-on experience with Git version control and collaborative workflows.
- Eagerness to learn cloud technologies and modern infrastructure tools.

Preferred Qualifications (Bonus):
- Hands-on familiarity with Docker containerization and Kubernetes.
- Familiarity with cloud platforms such as AWS or Google Cloud (GCP).
- Experience with Infrastructure as Code (Terraform) or configuration management tools.
- AWS Certified Cloud Practitioner or equivalent foundational cloud certification.
"""
    }
]

@router.get("/sample-jobs")
def get_sample_jobs():
    """
    Returns pre-curated realistic job descriptions for immediate 1-click testing.
    """
    return SAMPLE_JOBS

@router.post("/analyze", response_model=MatchResponse)
def analyze_match(
    request: MatchRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    if not request.job_description.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job description cannot be empty."
        )

    resume_data = {}
    raw_text = request.resume_text or ""
    resume_obj = None

    if request.resume_id:
        resume_obj = db.query(Resume).filter(Resume.id == request.resume_id).first()
        if resume_obj:
            resume_data = {
                "contact_info": resume_obj.contact_info,
                "summary": resume_obj.summary,
                "education": resume_obj.education,
                "experience": resume_obj.experience,
                "projects": resume_obj.projects,
                "skills": resume_obj.skills,
                "certifications": resume_obj.certifications,
            }
            if not raw_text:
                raw_text = resume_obj.raw_text

    if not resume_data and request.structured_resume:
        resume_data = request.structured_resume

    result = analyze_job_match(
        job_description=request.job_description,
        resume_data=resume_data,
        raw_text=raw_text
    )

    # Save match report to database
    report = MatchReport(
        user_id=current_user.id if current_user else (resume_obj.user_id if resume_obj else None),
        resume_id=resume_obj.id if resume_obj else None,
        job_title=request.job_title or "Target Role",
        job_company=request.job_company or "",
        job_description=request.job_description,
        overall_score=result["overall_score"],
        score_breakdown=result["score_breakdown"],
        matched_keywords=result["matched_keywords"],
        missing_required=result["missing_required"],
        missing_preferred=result["missing_preferred"],
        section_analysis=result["section_analysis"],
        suggestions=result["suggestions"],
        truthfulness_note=result["truthfulness_note"]
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    return {
        "report_id": report.id,
        "job_title": report.job_title,
        "job_company": report.job_company,
        "overall_score": result["overall_score"],
        "score_breakdown": result["score_breakdown"],
        "matched_keywords": result["matched_keywords"],
        "missing_required": result["missing_required"],
        "missing_preferred": result["missing_preferred"],
        "section_analysis": result["section_analysis"],
        "suggestions": result["suggestions"],
        "truthfulness_note": result["truthfulness_note"]
    }
