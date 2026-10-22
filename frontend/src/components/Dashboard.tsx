"use client";

import React, { useState } from "react";
import { ResumeData } from "../types/resume";
import { api } from "../services/api";
import {
  FileText, UploadCloud, Sparkles, Plus, Trash2, Edit3, Download,
  ArrowRight, CheckCircle2, ShieldCheck, Compass, Eye,
  Building, Check, Layers, HelpCircle, AlertCircle, ChevronDown,
  FileCheck, Cpu, Code2, Award, BookOpen, User, Star, Info
} from "lucide-react";

interface DashboardProps {
  resumes: ResumeData[];
  reports: any[];
  onOpenBuilder: (resume?: ResumeData, initialTemplate?: string) => void;
  onOpenUpload: () => void;
  onOpenMatcher: (resume?: ResumeData, sampleJob?: any) => void;
  onViewReport: (reportId: string) => void;
  onRefreshData: () => void;
  onLoadDemo: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  resumes,
  reports,
  onOpenBuilder,
  onOpenUpload,
  onOpenMatcher,
  onViewReport,
  onRefreshData,
  onLoadDemo,
}) => {
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameText, setRenameText] = useState<string>("");
  const [selectedTemplatePreview, setSelectedTemplatePreview] = useState<string>("classic-ats");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleExportPdf = (resumeId: string) => {
    window.open(api.exportPdfUrl(resumeId), "_blank");
  };

  const handleDeleteResume = async (resumeId: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await api.deleteResume(resumeId);
        onRefreshData();
      } catch (err) {
        alert("Failed to delete resume.");
      }
    }
  };

  const handleSaveRename = async (resumeId: string) => {
    if (!renameText.trim()) return;
    try {
      await api.updateResume(resumeId, { title: renameText.trim() });
      setRenamingId(null);
      onRefreshData();
    } catch (err) {
      alert("Failed to rename resume.");
    }
  };

  const handleDeleteReport = async (reportId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Delete this match report?")) {
      try {
        await api.deleteReport(reportId);
        onRefreshData();
      } catch (err) {
        alert("Failed to delete report.");
      }
    }
  };

  const templatesList = [
    {
      id: "classic-ats",
      name: "Modern ATS",
      badge: "Industry Standard",
      description: "Clean single-column layout with high contrast headers, bulleted achievements, and optimized line spacing for all ATS parsers.",
      bestFor: "Software Engineers, Product Managers, General Applications",
      accentColor: "#1e293b",
    },
    {
      id: "minimal",
      name: "Minimal Clean",
      badge: "High Density",
      description: "Understated typography with elegant horizontal dividers. Maximizes content density without visual clutter.",
      bestFor: "Experienced Professionals, Academic, Technical Leads",
      accentColor: "#475569",
    },
    {
      id: "creative",
      name: "Creative Accent",
      badge: "Modern Palette",
      description: "Subtle indigo header accents and structured badge styling for skills and credentials while remaining 100% single-column ATS readable.",
      bestFor: "Frontend Developers, Designers, Growth Roles",
      accentColor: "#4f46e5",
    },
    {
      id: "executive",
      name: "Executive Leadership",
      badge: "Authoritative",
      description: "Sophisticated serif headings, summary callouts, and prominent career milestones tailored for senior and management candidates.",
      bestFor: "Managers, Directors, Senior Consultants",
      accentColor: "#0f172a",
    },
    {
      id: "technical",
      name: "Technical Focus",
      badge: "Skills Prioritized",
      description: "Brings technical competencies, architecture stacks, and GitHub/project repositories directly below the summary for fast technical recruiter screening.",
      bestFor: "DevOps, Backend Engineers, Data Scientists",
      accentColor: "#0284c7",
    },
  ];

  const sampleMatchPreview = {
    role: "Junior Full-Stack Engineer",
    company: "CloudScale Systems",
    score: 84,
    matchedKeywords: ["Python", "FastAPI", "React", "TypeScript", "PostgreSQL", "Docker", "REST APIs", "Git"],
    missingRequired: ["GraphQL", "Kubernetes"],
    missingPreferred: ["AWS Lambda", "Redis"],
    recommendation: "Your core full-stack stack matches 84% of requirements. Add your containerization experience with Docker to your Nexus internship bullet points to address deployment criteria.",
  };

  const faqs = [
    {
      q: "How does FitCheck calculate ATS Match Scores?",
      a: "FitCheck extracts technical skills, tools, and requirements from job postings using spaCy Natural Language Processing (NLP) and our curated technology taxonomy. It compares this against your resume sections using transparent keyword coverage (60% required skills, 20% experience depth, 10% education, 10% preferred tools) — no fabricated numbers or undisclosed AI guesswork.",
    },
    {
      q: "Why does FitCheck enforce single-column layouts?",
      a: "Major Applicant Tracking Systems (Workday, Greenhouse, Taleo, iCIMS) parse resumes sequentially from left to right. Multi-column tables, text boxes, and sidebars frequently cause skills and dates to interweave, rendering 30-45% of applicant data unsearchable to recruiters. Single-column strict geometry guarantees clean linear text streams.",
    },
    {
      q: "What file formats does FitCheck support for upload?",
      a: "FitCheck supports machine-readable PDF resumes. Uploads are processed using pdfplumber to extract raw text, section markers, and contact details. If a PDF contains zero extractable text (e.g. an image scan), FitCheck detects this immediately and advises you to use a selectable PDF rather than silently failing.",
    },
    {
      q: "Can I download my resume as a real PDF?",
      a: "Yes. FitCheck generates real vector PDFs via Python's ReportLab engine. The output files are crisp, selectable, printable, and include exact structural text layers that recruiters and ATS bots can copy and index flawlessly.",
    },
    {
      q: "Is my resume data private and secure?",
      a: "Yes. Resumes and account credentials are stored in your database session. Passwords are encrypted with salted bcrypt hashing, and FitCheck does not sell data, index private files for public LLM training, or share personal contact information with third parties.",
    },
  ];

  return (
    <div className="space-y-16 pb-12 animate-fade-in" id="top">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        {/* Subtle animated background shapes */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" style={{ animationDelay: "2s" }} />

        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-400/30 text-indigo-300 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>ATS-Optimized Resumes • Truth-in-Hiring Standard</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15]">
              Your Next Opportunity <br className="hidden sm:inline" />
              Starts With a{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-300 to-violet-400">
                Better Resume.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal">
              Build clean, single-column resumes that applicant tracking systems actually parse. Upload existing PDFs for instant text extraction, match your skills against real job descriptions, and fix resume gaps with honest, explainable recommendations.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row gap-3.5 justify-center lg:justify-start">
              <button
                onClick={() => onOpenBuilder()}
                className="px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 active:scale-98"
              >
                <Plus className="w-4 h-4" />
                <span>Build My Resume</span>
              </button>

              <button
                onClick={onLoadDemo}
                className="px-7 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-700 text-sm font-bold transition-all flex items-center justify-center space-x-2 active:scale-98"
              >
                <Compass className="w-4 h-4 text-sky-400" />
                <span>Explore Demo Resume</span>
              </button>

              <button
                onClick={onOpenUpload}
                className="px-6 py-3.5 rounded-xl bg-transparent hover:bg-slate-800/60 text-slate-300 border border-slate-800 text-sm font-semibold transition-all flex items-center justify-center space-x-2"
              >
                <UploadCloud className="w-4 h-4 text-indigo-400" />
                <span>Upload PDF</span>
              </button>
            </div>

            {/* Quick trust metrics */}
            <div className="pt-4 grid grid-cols-3 gap-4 border-t border-slate-800/80 text-left max-w-md mx-auto lg:mx-0">
              <div>
                <div className="text-xl font-extrabold text-white">100%</div>
                <div className="text-[11px] text-slate-400 font-medium">Single-Column ATS</div>
              </div>
              <div>
                <div className="text-xl font-extrabold text-indigo-400">5</div>
                <div className="text-[11px] text-slate-400 font-medium">Verified Templates</div>
              </div>
              <div>
                <div className="text-xl font-extrabold text-sky-400">spaCy</div>
                <div className="text-[11px] text-slate-400 font-medium">Explainable NLP</div>
              </div>
            </div>
          </div>

          {/* Interactive Hero Mockup Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="bg-gradient-to-tr from-indigo-500/20 to-sky-500/20 p-1.5 rounded-3xl shadow-2xl backdrop-blur-xl border border-slate-700/60">
                <div className="bg-slate-900 rounded-[22px] p-6 text-left space-y-4 shadow-inner">
                  {/* Mockup Header */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                      <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                      ReportLab ATS Vector Stream
                    </span>
                  </div>

                  {/* Mockup Resume Snippet */}
                  <div className="space-y-3 bg-white text-slate-900 p-5 rounded-xl shadow-md text-[11px]">
                    <div className="border-b border-slate-200 pb-2 text-center">
                      <h4 className="font-extrabold text-sm text-slate-900 tracking-tight">ALEX CHEN</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        San Francisco, CA • alex.chen@university.edu • (555) 234-5678
                      </p>
                    </div>

                    <div>
                      <div className="text-[10px] font-black uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-0.5 mb-1">
                        Professional Summary
                      </div>
                      <p className="text-[10px] text-slate-600 leading-snug">
                        Early-career Software Engineer with hands-on experience in FastAPI, React, and PostgreSQL. Proven ability building scalable microservices and responsive web UIs.
                      </p>
                    </div>

                    <div>
                      <div className="text-[10px] font-black uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-0.5 mb-1">
                        Core Competencies
                      </div>
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {["FastAPI", "Python", "React", "TypeScript", "PostgreSQL", "Docker", "REST APIs"].map((s) => (
                          <span key={s} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[9px] font-medium">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2 flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-[10px] font-bold text-emerald-800">ATS Structure Validated</span>
                      </div>
                      <span className="text-[9px] font-semibold text-emerald-700 bg-white px-1.5 py-0.5 rounded">0 Errors</span>
                    </div>
                  </div>

                  {/* Live Quick Action */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-slate-400">Template: Modern ATS</span>
                    <button
                      onClick={() => onOpenBuilder()}
                      className="text-sky-400 hover:text-sky-300 font-semibold flex items-center space-x-1 transition"
                    >
                      <span>Open Editor</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRUST AND VALUE SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="about">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-10 shadow-sm space-y-8">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
              Truth-in-Hiring Philosophy
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-3">
              Built on Genuine Engineering, Not Marketing Hype.
            </h2>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              We reject the deceptive gimmicks prevalent in modern resume tools. Here is our direct commitment to candidates and recruiters:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                <FileCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Zero Deceptive White Text</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Invisible keyword stuffing causes immediate ATS flagging and instant recruiter rejection. FitCheck helps you incorporate relevant skills honestly into genuine experience bullets.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Explainable NLP Match Scoring</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Scores reflect real, transparent overlap between your resume content and job requirements extracted via spaCy — showing exactly which keywords matched and which are missing.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Strict Single-Column ATS Standards</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every template adheres to single-column guidelines with standard section headings, preventing the parsing corruption that plagues multi-column design templates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* USER SAVED RESUMES & REPORTS (WHEN AVAILABLE) */}
      {(resumes.length > 0 || reports.length > 0) && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-900">Your Workspace Resumes & Match Reports</h2>
                <p className="text-xs text-slate-500 mt-0.5">Manage your saved resumes, PDF exports, and job analysis history</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onOpenBuilder()}
                  className="px-3.5 py-2 text-xs font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition flex items-center space-x-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Resume</span>
                </button>
                <button
                  onClick={onOpenUpload}
                  className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition flex items-center space-x-1.5"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload PDF</span>
                </button>
              </div>
            </div>

            {/* Resumes List */}
            {resumes.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Saved Resumes ({resumes.length})</h3>
                <div className="divide-y divide-slate-100">
                  {resumes.map((r) => (
                    <div
                      key={r.id}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 px-3 rounded-xl transition"
                    >
                      <div className="space-y-1">
                        {renamingId === r.id ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={renameText}
                              onChange={(e) => setRenameText(e.target.value)}
                              className="px-2 py-1 text-xs border border-indigo-400 rounded-lg focus:outline-none"
                            />
                            <button
                              onClick={() => handleSaveRename(r.id!)}
                              className="px-2 py-1 text-xs font-bold bg-indigo-600 text-white rounded-lg"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setRenamingId(null)}
                              className="text-xs text-slate-400"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-bold text-slate-900">{r.title}</span>
                            <button
                              onClick={() => {
                                setRenamingId(r.id!);
                                setRenameText(r.title);
                              }}
                              className="text-slate-400 hover:text-slate-700"
                              title="Rename resume"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                          </div>
                        )}

                        <div className="flex items-center space-x-3 text-[11px] text-slate-500">
                          <span className="capitalize">{r.template.replace("-", " ")}</span>
                          <span>•</span>
                          <span>{r.contact_info.name || "Alex Chen"}</span>
                          <span>•</span>
                          <span>Updated {r.updated_at ? new Date(r.updated_at).toLocaleDateString() : "Recently"}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onOpenBuilder(r)}
                          className="px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition"
                        >
                          Edit in Builder
                        </button>
                        <button
                          onClick={() => onOpenMatcher(r)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition"
                        >
                          Match Role
                        </button>
                        <button
                          onClick={() => handleExportPdf(r.id!)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                          title="Export PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteResume(r.id!, r.title)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete resume"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reports List */}
            {reports.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Recent Job Matches ({reports.length})</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {reports.map((rep) => (
                    <div
                      key={rep.id}
                      onClick={() => onViewReport(rep.id)}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-indigo-50/40 hover:border-indigo-300 transition cursor-pointer space-y-2 group"
                    >
                      <div className="flex justify-between items-start">
                        <span className="px-2 py-0.5 rounded-full text-xs font-black bg-indigo-100 text-indigo-800 border border-indigo-200">
                          {rep.overall_score}% Match
                        </span>
                        <button
                          onClick={(e) => handleDeleteReport(rep.id, e)}
                          className="text-slate-300 hover:text-rose-500 p-1"
                          title="Delete report"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="truncate font-bold text-xs text-slate-900">{rep.job_title}</div>
                      <div className="text-[11px] text-slate-500 truncate">{rep.job_company || "Target Company"}</div>
                      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1">
                        <span>{new Date(rep.created_at).toLocaleDateString()}</span>
                        <span className="text-indigo-600 font-semibold group-hover:underline flex items-center">
                          View Details <ArrowRight className="w-3 h-3 ml-0.5" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 3. FEATURES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8" id="features">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
            Core Capabilities
          </span>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Engineered to Help You Pass the Filter
          </h2>
          <p className="text-sm text-slate-600">
            Everything you need to craft, refine, and test your resume before submitting applications.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 hover:border-indigo-400 hover:shadow-md transition">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Smart Resume Builder</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Multi-section structured editor with live preview, section reordering, bullet management, honors/achievements, and autosave.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onOpenBuilder()}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
              >
                <span>Launch Builder</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 hover:border-indigo-400 hover:shadow-md transition">
            <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <UploadCloud className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">PDF Upload & Extraction</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Extract existing PDF resumes using pdfplumber with word-stream fallbacks. Automatically populates editable sections for review.
            </p>
            <div className="pt-2">
              <button
                onClick={onOpenUpload}
                className="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center space-x-1"
              >
                <span>Upload a Resume</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 hover:border-indigo-400 hover:shadow-md transition">
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">ATS Compatibility Insights</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Guaranteed single-column geometry, standard section headers, and semantic bullets that prevent parser scrambling in Taleo and Workday.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 hover:border-indigo-400 hover:shadow-md transition">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Job Match Scoring</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Compare your resume against any job description. Get an explainable percentage broken down by required skills, experience, and tools.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onOpenMatcher()}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-800 flex items-center space-x-1"
              >
                <span>Try Job Matcher</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 hover:border-indigo-400 hover:shadow-md transition">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Personalized Improvement Tips</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Actionable suggestions highlight exactly where in your resume to incorporate missing qualifications without fabricating experience.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 hover:border-indigo-400 hover:shadow-md transition">
            <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">5 Professional Templates</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Switch effortlessly between Modern ATS, Minimal Clean, Creative Accent, Executive, and Technical with live visual synchronization.
            </p>
            <div className="pt-2">
              <a
                href="#templates"
                className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center space-x-1"
              >
                <span>View Templates</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8" id="how-it-works">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
            Workflow
          </span>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            How FitCheck Works in 4 Steps
          </h2>
          <p className="text-sm text-slate-600">
            From raw qualifications to an ATS-tested, job-tailored application.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 relative">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-black">
              1
            </div>
            <h3 className="text-sm font-bold text-slate-900">Create or Upload</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Start fresh with guided form sections or upload an existing PDF to extract your experience and education automatically.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 relative">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-black">
              2
            </div>
            <h3 className="text-sm font-bold text-slate-900">Review & Refine</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Organize your bullets with quantifiable metrics, reorder sections, add certifications, and choose from 5 ATS-compliant templates.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 relative">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-black">
              3
            </div>
            <h3 className="text-sm font-bold text-slate-900">Compare with Target Role</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Paste the target job description into the Job Matcher to calculate your score, extract missing keywords, and view gap suggestions.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 relative">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-black">
              4
            </div>
            <h3 className="text-sm font-bold text-slate-900">Download Crisp PDF</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Export a genuine vector PDF generated via ReportLab — cleanly formatted, selectable, and ready to submit to recruiters.
            </p>
          </div>
        </div>
      </section>

      {/* 5. RESUME TEMPLATES GALLERY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8" id="templates">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
              Verified Layouts
            </span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-2">
              Professional Resume Templates
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-xl">
              All 5 templates are genuinely implemented in both the live web preview and the ReportLab PDF generator. Click any template to preview and apply it to the builder.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {templatesList.map((tpl) => {
            const isSelected = selectedTemplatePreview === tpl.id;
            return (
              <div
                key={tpl.id}
                onClick={() => setSelectedTemplatePreview(tpl.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? "border-indigo-600 ring-2 ring-indigo-500/20 shadow-md"
                    : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
                }`}
              >
                <div className="space-y-2">
                  <div className="h-28 rounded-xl bg-slate-100 border border-slate-200 p-2.5 flex flex-col justify-between overflow-hidden relative">
                    {/* Simulated miniature layout */}
                    <div className="space-y-1">
                      <div
                        className="h-2 rounded w-2/3"
                        style={{ backgroundColor: tpl.accentColor }}
                      />
                      <div className="h-1 bg-slate-300 rounded w-1/2" />
                    </div>
                    <div className="space-y-1 py-1">
                      <div className="h-1 bg-slate-300 rounded w-full" />
                      <div className="h-1 bg-slate-300 rounded w-5/6" />
                    </div>
                    <div className="flex gap-1">
                      <div className="h-1.5 bg-slate-400 rounded w-8" />
                      <div className="h-1.5 bg-slate-400 rounded w-8" />
                    </div>
                    {isSelected && (
                      <span className="absolute top-2 right-2 p-1 bg-indigo-600 text-white rounded-full">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                      {tpl.badge}
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 mt-1">{tpl.name}</h3>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{tpl.description}</p>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenBuilder(undefined, tpl.id);
                  }}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1 ${
                    isSelected
                      ? "bg-indigo-600 text-white hover:bg-indigo-700"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <span>Build with this</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. JOB MATCHER PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6" id="job-matcher-preview">
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-10 text-white border border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400 bg-sky-950/80 px-3 py-1 rounded-full border border-sky-800">
                Live Interactive Example
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight mt-2">
                Job Matcher Preview & Scoring Breakdown
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Here is an illustrative match report showing how spaCy NLP extracts role terms and assesses coverage:
              </p>
            </div>

            <button
              onClick={() => onOpenMatcher()}
              className="px-5 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold transition shadow-md flex items-center space-x-2 whitespace-nowrap self-start sm:self-auto"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Open Live Job Matcher</span>
            </button>
          </div>

          <div className="bg-slate-800/80 rounded-2xl border border-slate-700 p-6 space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-700/80 pb-4">
              <div>
                <div className="text-xs text-slate-400 uppercase font-mono">Sample Target Role</div>
                <div className="text-lg font-black text-white">{sampleMatchPreview.role}</div>
                <div className="text-xs text-slate-300">{sampleMatchPreview.company}</div>
              </div>

              <div className="flex items-center space-x-3 bg-slate-900/90 px-4 py-2 rounded-2xl border border-slate-700">
                <div className="text-2xl font-black text-emerald-400">{sampleMatchPreview.score}%</div>
                <div className="text-left text-[11px] leading-tight">
                  <span className="font-bold text-white block">Strong Alignment</span>
                  <span className="text-slate-400">8 of 10 terms verified</span>
                </div>
              </div>
            </div>

            {/* Matched & Missing Chips */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-xs font-bold text-emerald-400 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Matched Skills in Resume ({sampleMatchPreview.matchedKeywords.length})</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {sampleMatchPreview.matchedKeywords.map((k) => (
                    <span key={k} className="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs font-medium">
                      {k}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-rose-400 flex items-center space-x-1.5">
                  <AlertCircle className="w-4 h-4" />
                  <span>Missing Role Keywords ({sampleMatchPreview.missingRequired.length + sampleMatchPreview.missingPreferred.length})</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {sampleMatchPreview.missingRequired.map((k) => (
                    <span key={k} className="px-2.5 py-1 rounded-lg bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs font-medium">
                      {k} (Required)
                    </span>
                  ))}
                  {sampleMatchPreview.missingPreferred.map((k) => (
                    <span key={k} className="px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-800/80 text-amber-300 text-xs font-medium">
                      {k} (Preferred)
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-700/80 text-xs text-slate-300 flex items-start space-x-2.5">
              <Info className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
              <span><strong>Recommendation:</strong> {sampleMatchPreview.recommendation}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. INTERACTIVE DEMO CALLOUT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-indigo-50/70 rounded-3xl border border-indigo-200 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-white px-3 py-1 rounded-full border border-indigo-200">
              No Sign-Up Required
            </span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Test FitCheck Immediately With Our Demo Account
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Explore the resume editor, test all 5 ATS templates, inspect sample PDF extraction, and calculate job match scores using the pre-loaded early-career software engineer profile for Alex Chen.
            </p>
            <p className="text-[11px] text-slate-500 italic">
              Note: Demo mode operates with safe test data and does not overwrite or expose private user records.
            </p>
          </div>

          <button
            onClick={onLoadDemo}
            className="px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-md flex items-center space-x-2 whitespace-nowrap active:scale-98"
          >
            <Compass className="w-4 h-4" />
            <span>Launch Demo Account</span>
          </button>
        </div>
      </section>

      {/* 8. FAQ SECTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6" id="faq">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
            Frequently Asked Questions
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Transparent Answers to ATS Inquiries
          </h2>
          <p className="text-xs text-slate-500">
            Understand how parsing, single-column formatting, and privacy work in FitCheck.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden transition"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between font-bold text-xs sm:text-sm text-slate-900 hover:text-indigo-600 transition"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-indigo-600" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 9. FINAL CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-center text-white border border-slate-800 space-y-6 relative overflow-hidden shadow-2xl">
          <div className="max-w-xl mx-auto space-y-3 relative z-10">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Ready to Upgrade Your ATS Resume?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Build a clean resume, analyze job requirements with transparent NLP, and submit applications with genuine confidence.
            </p>
            <div className="pt-3 flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => onOpenBuilder()}
                className="px-7 py-3 rounded-xl bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold transition shadow-md flex items-center space-x-2"
              >
                <Plus className="w-4 h-4 text-indigo-600" />
                <span>Create ATS Resume</span>
              </button>
              <button
                onClick={onOpenUpload}
                className="px-7 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center space-x-2 shadow-md"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload & Extract PDF</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
