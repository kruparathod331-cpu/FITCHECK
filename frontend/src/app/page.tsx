"use client";

import React, { useState, useEffect, useRef } from "react";
import { Navbar } from "../components/Navbar";
import { Dashboard } from "../components/Dashboard";
import { ResumeEditor } from "../components/ResumeEditor";
import { ResumeUpload } from "../components/ResumeUpload";
import { JobMatcher } from "../components/JobMatcher";
import { MatchReportView } from "../components/MatchReportView";
import { AuthModal } from "../components/AuthModal";
import { api } from "../services/api";
import { ResumeData, UserProfile, MatchReportData } from "../types/resume";
import { ShieldCheck, ArrowUpRight, FileText, CheckCircle2 } from "lucide-react";

const DEFAULT_RESUME: ResumeData = {
  title: "My ATS Resume",
  contact_info: {
    name: "Alex Chen",
    email: "alex.chen@university.edu",
    phone: "(555) 234-5678",
    location: "San Francisco, CA",
    linkedin: "https://linkedin.com/in/alexchen-dev",
    github: "https://github.com/alexchen-code",
    portfolio: "https://alexchen.dev",
  },
  summary:
    "Motivated Computer Science graduate with hands-on experience in full-stack web development, RESTful APIs, and relational databases. Proven track record building responsive web applications and deploying scalable containerized microservices.",
  education: [
    {
      id: "edu-default-1",
      institution: "California State University",
      degree: "Bachelor of Science",
      field: "Computer Science",
      location: "San Francisco, CA",
      start_date: "Aug 2022",
      end_date: "May 2026",
      gpa: "3.82 / 4.0",
      highlights: [
        "Dean's Honor List (All Semesters)",
        "Relevant Coursework: Data Structures & Algorithms, Database Management Systems, Cloud Computing, Web Architecture",
      ],
    },
  ],
  experience: [
    {
      id: "exp-default-1",
      company: "Nexus Web Solutions",
      title: "Software Engineering Intern",
      location: "Remote",
      start_date: "Jun 2025",
      end_date: "Aug 2025",
      is_current: false,
      bullets: [
        "Engineered 12+ RESTful API endpoints using FastAPI and PostgreSQL, reducing endpoint response times by 28%.",
        "Implemented reusable React and TypeScript components, improving Lighthouse accessibility scores from 74 to 98.",
        "Configured Docker containers and automated GitHub Actions CI/CD workflows for staging deployments.",
      ],
    },
  ],
  projects: [
    {
      id: "proj-default-1",
      name: "TaskFlow - Realtime Collaboration Board",
      role: "Lead Full-Stack Developer",
      link: "https://github.com/alexchen-code/taskflow",
      start_date: "Jan 2025",
      end_date: "May 2025",
      technologies: ["Next.js", "TypeScript", "Tailwind CSS", "PostgreSQL", "Docker"],
      bullets: [
        "Architected a Kanban web application supporting drag-and-drop tasks, real-time board updates, and role-based permissions.",
        "Optimized SQL queries and database indexes, reducing query latency across 50,000 synthetic records by 42%.",
        "Authored 30+ end-to-end and unit tests with 88% overall code coverage.",
      ],
    },
  ],
  skills: {
    technical: ["FastAPI", "React", "Next.js", "Node.js", "REST APIs", "Data Structures", "Algorithms", "Object-Oriented Programming"],
    tools_frameworks: ["PostgreSQL", "Docker", "Git", "GitHub Actions", "Linux", "Tailwind CSS"],
    soft_skills: ["Teamwork", "Problem Solving", "Agile / Scrum", "Code Review", "Adaptability"],
    languages: ["Python", "TypeScript", "JavaScript", "SQL", "HTML5", "CSS3"],
  },
  certifications: [
    {
      id: "cert-default-1",
      name: "AWS Certified Cloud Practitioner",
      issuer: "Amazon Web Services",
      date: "2025",
      url: "https://aws.amazon.com",
    },
  ],
  achievements: [
    {
      id: "achieve-default-1",
      title: "1st Place - University Hackathon 2025",
      issuer: "CS Department Innovation Challenge",
      date: "Mar 2025",
      description: "Developed an AI-assisted accessibility tool for visually impaired screen-reader users.",
    },
  ],
  template: "classic-ats",
};

export default function Home() {
  const [currentTab, setCurrentTab] = useState<string>("dashboard");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [resumes, setResumes] = useState<ResumeData[]>([]);
  const [activeResume, setActiveResume] = useState<ResumeData>(DEFAULT_RESUME);
  const [reports, setReports] = useState<any[]>([]);
  const [viewingReport, setViewingReport] = useState<MatchReportData | null>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register">("login");
  const [loadingDemo, setLoadingDemo] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initial Load: check session and fetch data
  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    try {
      const me = await api.getMe();
      if (me) {
        setUser(me);
      }
    } catch (e) {
      console.warn("No active session:", e);
    }
    refreshData();
  };

  const refreshData = async () => {
    try {
      const [resumesList, reportsList] = await Promise.all([
        api.listResumes().catch(() => []),
        api.listReports().catch(() => []),
      ]);
      setResumes(resumesList);
      setReports(reportsList);
      if (resumesList.length > 0 && !activeResume.id) {
        api.getResume(resumesList[0].id!).then(setActiveResume).catch(console.error);
      }
    } catch (err) {
      console.error("Error refreshing data:", err);
    }
  };

  // Debounced autosave
  const handleUpdateResume = (updated: ResumeData) => {
    setActiveResume(updated);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        setIsSaving(true);
        if (updated.id) {
          const saved = await api.updateResume(updated.id, updated);
          setActiveResume(saved);
        } else {
          const created = await api.createResume(updated);
          setActiveResume(created);
        }
        refreshData();
      } catch (err) {
        console.error("Autosave error:", err);
      } finally {
        setIsSaving(false);
      }
    }, 1200);
  };

  const handleEnableDemo = async () => {
    try {
      setLoadingDemo(true);
      const res = await api.getDemoAccount();
      localStorage.setItem("fitcheck_token", res.access_token);
      setUser(res.user);
      await refreshData();
      // Load sample resume into active state
      const sample = await api.getSampleResume();
      setActiveResume(sample);
      setCurrentTab("dashboard");
    } catch (err) {
      alert("Failed to load demo account. Please check backend connection.");
    } finally {
      setLoadingDemo(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("fitcheck_token");
    setUser(null);
    refreshData();
    setCurrentTab("dashboard");
  };

  const handleOpenBuilderWithResume = (res?: ResumeData, initialTemplate?: string) => {
    if (res?.id) {
      api.getResume(res.id).then((fullResume) => {
        if (initialTemplate) fullResume.template = initialTemplate;
        setActiveResume(fullResume);
        setCurrentTab("editor");
      }).catch(() => {
        if (res) {
          if (initialTemplate) res.template = initialTemplate;
          setActiveResume(res);
        }
        setCurrentTab("editor");
      });
    } else {
      const target = res ? { ...res } : { ...activeResume };
      if (initialTemplate) target.template = initialTemplate;
      setActiveResume(target);
      setCurrentTab("editor");
    }
  };

  const handleViewReport = async (reportId: string) => {
    try {
      const rep = await api.getReport(reportId);
      setViewingReport(rep);
      setCurrentTab("view_report");
    } catch (err) {
      alert("Failed to load match report details.");
    }
  };

  const handleSelectTab = (tab: string, sectionId?: string) => {
    setViewingReport(null);
    setCurrentTab(tab);
    if (sectionId && typeof window !== "undefined") {
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 80);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* 1. Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        user={user}
        onOpenAuth={(mode = "login") => {
          setAuthModalMode(mode);
          setShowAuthModal(true);
        }}
        onLogout={handleLogout}
        onEnableDemo={handleEnableDemo}
        loadingDemo={loadingDemo}
      />

      {/* Main Content Sections */}
      <main className="flex-1 pb-16">
        {currentTab === "dashboard" && (
          <Dashboard
            resumes={resumes}
            reports={reports}
            onOpenBuilder={handleOpenBuilderWithResume}
            onOpenUpload={() => setCurrentTab("upload")}
            onOpenMatcher={(r) => {
              if (r) setActiveResume(r);
              setCurrentTab("match");
            }}
            onViewReport={handleViewReport}
            onRefreshData={refreshData}
            onLoadDemo={handleEnableDemo}
          />
        )}

        {currentTab === "editor" && (
          <ResumeEditor
            resume={activeResume}
            onUpdateResume={handleUpdateResume}
            onExportPdf={() => {
              if (activeResume.id) {
                window.open(api.exportPdfUrl(activeResume.id), "_blank");
              }
            }}
            isSaving={isSaving}
          />
        )}

        {currentTab === "upload" && (
          <ResumeUpload
            onParsedResume={(parsed) => {
              handleUpdateResume(parsed);
              setCurrentTab("editor");
            }}
            onProceedToMatch={(parsed) => {
              handleUpdateResume(parsed);
              setCurrentTab("match");
            }}
          />
        )}

        {currentTab === "match" && (
          <JobMatcher
            currentResume={activeResume}
            savedResumes={resumes}
            onSelectResumeToMatch={(r) => setActiveResume(r)}
            onEditResume={() => setCurrentTab("editor")}
          />
        )}

        {currentTab === "view_report" && viewingReport && (
          <MatchReportView
            report={viewingReport}
            onEditResume={() => setCurrentTab("editor")}
            onNewMatch={() => setCurrentTab("match")}
          />
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        initialMode={authModalMode}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={(u) => {
          setUser(u);
          refreshData();
        }}
        onEnableDemo={handleEnableDemo}
      />

      {/* 11. Comprehensive Modern SaaS Footer */}
      <footer className="border-t border-slate-200 bg-white text-slate-600 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand column */}
            <div className="space-y-3 md:col-span-1">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-sm">
                  FC
                </div>
                <span className="font-black text-base text-slate-900 tracking-tight">
                  Fit<span className="text-indigo-600">Check</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Empowering candidates with truthful, single-column ATS resumes, pdfplumber text extraction, and explainable spaCy job matching.
              </p>
              <div className="flex items-center space-x-2 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 w-fit">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Truth-in-Hiring Compliant</span>
              </div>
            </div>

            {/* Platform Navigation */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Platform</h4>
              <ul className="space-y-1.5 text-xs text-slate-500">
                <li>
                  <button onClick={() => handleSelectTab("dashboard")} className="hover:text-indigo-600 transition">
                    Dashboard & Home
                  </button>
                </li>
                <li>
                  <button onClick={() => handleSelectTab("editor")} className="hover:text-indigo-600 transition">
                    ATS Resume Builder
                  </button>
                </li>
                <li>
                  <button onClick={() => handleSelectTab("upload")} className="hover:text-indigo-600 transition">
                    PDF Upload & Extraction
                  </button>
                </li>
                <li>
                  <button onClick={() => handleSelectTab("match")} className="hover:text-indigo-600 transition">
                    Job Description Matcher
                  </button>
                </li>
              </ul>
            </div>

            {/* Templates & Features */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">ATS Templates</h4>
              <ul className="space-y-1.5 text-xs text-slate-500">
                <li>
                  <button onClick={() => handleOpenBuilderWithResume(undefined, "classic-ats")} className="hover:text-indigo-600 transition">
                    Modern ATS (Classic)
                  </button>
                </li>
                <li>
                  <button onClick={() => handleOpenBuilderWithResume(undefined, "minimal")} className="hover:text-indigo-600 transition">
                    Minimal Clean (High Density)
                  </button>
                </li>
                <li>
                  <button onClick={() => handleOpenBuilderWithResume(undefined, "creative")} className="hover:text-indigo-600 transition">
                    Creative Accent (Indigo)
                  </button>
                </li>
                <li>
                  <button onClick={() => handleOpenBuilderWithResume(undefined, "executive")} className="hover:text-indigo-600 transition">
                    Executive Leadership
                  </button>
                </li>
                <li>
                  <button onClick={() => handleOpenBuilderWithResume(undefined, "technical")} className="hover:text-indigo-600 transition">
                    Technical Focus
                  </button>
                </li>
              </ul>
            </div>

            {/* Architecture & Truth Policy */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">ATS Standards</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Vector PDFs built with Python ReportLab. Section parsing via pdfplumber. Natural language processing via spaCy. Zero hidden white text.
              </p>
              <div className="pt-1">
                <button
                  onClick={() => handleSelectTab("dashboard", "about")}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition"
                >
                  Read Truth-in-Hiring Policy →
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400 text-[11px]">
            <div>
              © 2026 FitCheck ATS Resume Builder. All rights reserved.
            </div>
            <div className="flex items-center space-x-4">
              <span>Single-Column ATS Geometry</span>
              <span>•</span>
              <span>Transparent Match Scoring</span>
              <span>•</span>
              <span>Secure Bcrypt Passwords</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
