import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Response
from fastapi.responses import StreamingResponse
import io
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Resume, ResumeVersion, User
from ..schemas import (
    ResumeCreate, ResumeUpdate, ResumeResponse, ResumeListItem, 
    ResumeVersionResponse, PDFExtractResponse, ParsedSections
)
from ..auth import get_current_user_optional, get_current_user
from ..parser import extract_text_from_pdf, parse_resume_text
from ..pdf_generator import generate_ats_pdf
from ..config import settings

router = APIRouter(prefix="/api/resumes", tags=["resumes"])

@router.get("/sample", response_model=ResumeResponse)
def get_sample_resume():
    """
    Returns a sample early-career ATS resume for demonstration or instant exploration.
    """
    return {
        "id": "sample-template-id",
        "user_id": None,
        "title": "Alex Chen - Early Career Software Engineer",
        "contact_info": {
            "name": "Alex Chen",
            "email": "alex.chen@university.edu",
            "phone": "(555) 234-5678",
            "location": "San Francisco, CA",
            "linkedin": "https://linkedin.com/in/alexchen-dev",
            "github": "https://github.com/alexchen-code",
            "portfolio": "https://alexchen.dev"
        },
        "summary": "Motivated Computer Science graduate with hands-on experience in full-stack web development, RESTful APIs, and relational databases. Proven track record building responsive web applications and deploying scalable containerized microservices.",
        "education": [
            {
                "id": "edu-sample-1",
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
        "experience": [
            {
                "id": "exp-sample-1",
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
        "projects": [
            {
                "id": "proj-sample-1",
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
        "skills": {
            "technical": ["FastAPI", "React", "Next.js", "Node.js", "REST APIs", "Data Structures", "Algorithms", "Object-Oriented Programming"],
            "tools_frameworks": ["PostgreSQL", "Docker", "Git", "GitHub Actions", "Linux", "Tailwind CSS"],
            "soft_skills": ["Teamwork", "Problem Solving", "Agile / Scrum", "Code Review", "Adaptability"],
            "languages": ["Python", "TypeScript", "JavaScript", "SQL", "HTML5", "CSS3"]
        },
        "certifications": [
            {
                "id": "cert-sample-1",
                "name": "AWS Certified Cloud Practitioner",
                "issuer": "Amazon Web Services",
                "date": "2025",
                "url": "https://aws.amazon.com"
            }
        ],
        "raw_text": "",
        "template": "classic-ats",
        "created_at": "2026-01-01T00:00:00",
        "updated_at": "2026-01-01T00:00:00"
    }

@router.get("/", response_model=List[ResumeListItem])
def list_resumes(
    db: Session = Depends(get_db), 
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Returns list of saved resumes. If user is authenticated, returns their resumes.
    Otherwise, returns recent unassigned/guest resumes.
    """
    query = db.query(Resume)
    if current_user:
        query = query.filter(Resume.user_id == current_user.id)
    else:
        query = query.filter(Resume.user_id.is_(None))
    
    resumes = query.order_by(Resume.updated_at.desc()).all()
    results = []
    for r in resumes:
        v_count = db.query(ResumeVersion).filter(ResumeVersion.resume_id == r.id).count()
        results.append({
            "id": r.id,
            "title": r.title,
            "template": r.template,
            "created_at": r.created_at,
            "updated_at": r.updated_at,
            "version_count": max(v_count, 1)
        })
    return results

@router.post("/", response_model=ResumeResponse)
def create_resume(
    resume_in: ResumeCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    resume = Resume(
        user_id=current_user.id if current_user else None,
        title=resume_in.title,
        contact_info=resume_in.contact_info.model_dump(),
        summary=resume_in.summary,
        education=[e.model_dump() for e in resume_in.education],
        experience=[e.model_dump() for e in resume_in.experience],
        projects=[p.model_dump() for p in resume_in.projects],
        skills=resume_in.skills.model_dump(),
        certifications=[c.model_dump() for c in resume_in.certifications],
        raw_text=resume_in.raw_text,
        template=resume_in.template
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)

    # Initial version
    version = ResumeVersion(
        resume_id=resume.id,
        version_num=1,
        snapshot={
            "contact_info": resume.contact_info,
            "summary": resume.summary,
            "education": resume.education,
            "experience": resume.experience,
            "projects": resume.projects,
            "skills": resume.skills,
            "certifications": resume.certifications,
            "template": resume.template
        },
        note="Initial draft"
    )
    db.add(version)
    db.commit()

    return resume

@router.get("/{resume_id}", response_model=ResumeResponse)
def get_resume(resume_id: str, db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resume

@router.put("/{resume_id}", response_model=ResumeResponse)
def update_resume(
    resume_id: str,
    resume_in: ResumeUpdate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    # Update fields
    if resume_in.title is not None:
        resume.title = resume_in.title
    if resume_in.contact_info is not None:
        resume.contact_info = resume_in.contact_info.model_dump()
    if resume_in.summary is not None:
        resume.summary = resume_in.summary
    if resume_in.education is not None:
        resume.education = [e.model_dump() for e in resume_in.education]
    if resume_in.experience is not None:
        resume.experience = [e.model_dump() for e in resume_in.experience]
    if resume_in.projects is not None:
        resume.projects = [p.model_dump() for p in resume_in.projects]
    if resume_in.skills is not None:
        resume.skills = resume_in.skills.model_dump()
    if resume_in.certifications is not None:
        resume.certifications = [c.model_dump() for c in resume_in.certifications]
    if resume_in.raw_text is not None:
        resume.raw_text = resume_in.raw_text
    if resume_in.template is not None:
        resume.template = resume_in.template

    # Associate with user if now logged in
    if current_user and not resume.user_id:
        resume.user_id = current_user.id

    db.commit()
    db.refresh(resume)

    # Count existing versions
    v_count = db.query(ResumeVersion).filter(ResumeVersion.resume_id == resume.id).count()
    new_version = ResumeVersion(
        resume_id=resume.id,
        version_num=v_count + 1,
        snapshot={
            "contact_info": resume.contact_info,
            "summary": resume.summary,
            "education": resume.education,
            "experience": resume.experience,
            "projects": resume.projects,
            "skills": resume.skills,
            "certifications": resume.certifications,
            "template": resume.template
        },
        note=f"Autosave Version {v_count + 1}"
    )
    db.add(new_version)
    db.commit()

    return resume

@router.delete("/{resume_id}")
def delete_resume(resume_id: str, db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    db.delete(resume)
    db.commit()
    return {"message": "Resume deleted successfully"}

@router.get("/{resume_id}/versions", response_model=List[ResumeVersionResponse])
def get_resume_versions(resume_id: str, db: Session = Depends(get_db)):
    versions = (
        db.query(ResumeVersion)
        .filter(ResumeVersion.resume_id == resume_id)
        .order_by(ResumeVersion.version_num.desc())
        .limit(20)
        .all()
    )
    return versions

@router.post("/{resume_id}/versions/{version_id}/restore", response_model=ResumeResponse)
def restore_version(resume_id: str, version_id: str, db: Session = Depends(get_db)):
    version = db.query(ResumeVersion).filter(ResumeVersion.id == version_id, ResumeVersion.resume_id == resume_id).first()
    if not version:
        raise HTTPException(status_code=404, detail="Version snapshot not found")
    
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    snapshot = version.snapshot
    resume.contact_info = snapshot.get("contact_info", {})
    resume.summary = snapshot.get("summary", "")
    resume.education = snapshot.get("education", [])
    resume.experience = snapshot.get("experience", [])
    resume.projects = snapshot.get("projects", [])
    resume.skills = snapshot.get("skills", {})
    resume.certifications = snapshot.get("certifications", [])
    resume.template = snapshot.get("template", "classic-ats")

    db.commit()
    db.refresh(resume)
    return resume

@router.post("/upload-pdf", response_model=PDFExtractResponse)
async def upload_pdf(file: UploadFile = File(...)):
    """
    Accepts PDF upload, extracts text with pdfplumber, validates file size and readability,
    and returns parsed sections alongside editable raw text.
    Data retention: The file bytes are processed transiently in-memory and NOT stored on disk.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Only .pdf files are supported."
        )

    file_bytes = await file.read()
    if not file_bytes or len(file_bytes.strip()) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded file is empty (0 bytes). Please upload a valid PDF resume."
        )

    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if len(file_bytes) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB}MB."
        )

    if not file_bytes.startswith(b"%PDF"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded file does not contain a valid PDF signature (%PDF). The file may be corrupted or another file type renamed as .pdf."
        )

    raw_text, is_scanned, warning_msg = extract_text_from_pdf(file_bytes)

    # Check for unreadable encryption or corrupted stream
    if not raw_text and is_scanned:
        lower_msg = warning_msg.lower()
        if "password" in lower_msg or "encrypt" in lower_msg:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The uploaded PDF is password-protected or encrypted. Please remove password protection and try again."
            )
        if "failed to parse" in lower_msg:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unable to read PDF content: {warning_msg}"
            )

    parsed = parse_resume_text(raw_text)

    return {
        "raw_text": raw_text,
        "char_count": len(raw_text),
        "is_scanned_warning": is_scanned,
        "warning_message": warning_msg if is_scanned else None,
        "parsed_sections": parsed
    }

@router.get("/{resume_id}/export-pdf")
def export_resume_pdf(resume_id: str, db: Session = Depends(get_db)):
    """
    Generates and downloads an ATS-optimized, selectable-text PDF.
    """
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    resume_data = {
        "contact_info": resume.contact_info,
        "summary": resume.summary,
        "education": resume.education,
        "experience": resume.experience,
        "projects": resume.projects,
        "skills": resume.skills,
        "certifications": resume.certifications,
    }
    
    pdf_bytes = generate_ats_pdf(resume_data, template=resume.template or "classic-ats")
    safe_name = (resume.contact_info.get("name") or "Resume").replace(" ", "_")
    filename = f"{safe_name}_ATS_FitCheck.pdf"

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )

@router.post("/export-pdf-preview")
def export_pdf_preview(resume_in: ResumeCreate):
    """
    Generates an on-the-fly PDF from the currently edited resume payload (without needing prior save).
    """
    resume_data = {
        "contact_info": resume_in.contact_info.model_dump(),
        "summary": resume_in.summary,
        "education": [e.model_dump() for e in resume_in.education],
        "experience": [e.model_dump() for e in resume_in.experience],
        "projects": [p.model_dump() for p in resume_in.projects],
        "skills": resume_in.skills.model_dump(),
        "certifications": [c.model_dump() for c in resume_in.certifications],
    }
    pdf_bytes = generate_ats_pdf(resume_data, template=resume_in.template or "classic-ats")
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={
            "Content-Disposition": 'inline; filename="FitCheck_Resume_Preview.pdf"'
        }
    )
