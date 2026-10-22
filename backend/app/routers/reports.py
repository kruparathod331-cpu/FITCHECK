from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from pydantic import BaseModel, ConfigDict

from ..database import get_db
from ..models import MatchReport, User
from ..auth import get_current_user_optional

router = APIRouter(prefix="/api/reports", tags=["reports"])

class ReportListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    job_title: str
    job_company: str
    overall_score: float
    created_at: datetime
    resume_id: Optional[str] = None


@router.get("/", response_model=List[ReportListItem])
def list_reports(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    query = db.query(MatchReport)
    if current_user:
        query = query.filter(MatchReport.user_id == current_user.id)
    
    reports = query.order_by(MatchReport.created_at.desc()).limit(20).all()
    return reports

@router.get("/{report_id}")
def get_report(report_id: str, db: Session = Depends(get_db)):
    report = db.query(MatchReport).filter(MatchReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Match report not found")
    return {
        "id": report.id,
        "resume_id": report.resume_id,
        "job_title": report.job_title,
        "job_company": report.job_company,
        "job_description": report.job_description,
        "overall_score": report.overall_score,
        "score_breakdown": report.score_breakdown,
        "matched_keywords": report.matched_keywords,
        "missing_required": report.missing_required,
        "missing_preferred": report.missing_preferred,
        "section_analysis": report.section_analysis,
        "suggestions": report.suggestions,
        "truthfulness_note": report.truthfulness_note,
        "created_at": report.created_at
    }

@router.delete("/{report_id}")
def delete_report(report_id: str, db: Session = Depends(get_db)):
    report = db.query(MatchReport).filter(MatchReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Match report not found")
    db.delete(report)
    db.commit()
    return {"message": "Report deleted successfully"}
