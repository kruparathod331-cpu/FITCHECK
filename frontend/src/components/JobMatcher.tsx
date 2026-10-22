"use client";

import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { ResumeData, MatchReportData, SampleJob } from "../types/resume";
import { MatchReportView } from "./MatchReportView";
import {
  Briefcase, FileText, Sparkles, RefreshCw, AlertCircle, ArrowRight,
  CheckCircle2, Compass, Layers, Building, MapPin
} from "lucide-react";

interface JobMatcherProps {
  currentResume: ResumeData;
  savedResumes: ResumeData[];
  onSelectResumeToMatch: (resume: ResumeData) => void;
  onEditResume: () => void;
}

export const JobMatcher: React.FC<JobMatcherProps> = ({
  currentResume,
  savedResumes,
  onSelectResumeToMatch,
  onEditResume,
}) => {
  const [selectedResumeId, setSelectedResumeId] = useState<string>(currentResume.id || "current-active");
  const [jobTitle, setJobTitle] = useState<string>("");
  const [jobCompany, setJobCompany] = useState<string>("");
  const [jobDescription, setJobDescription] = useState<string>("");
  const [sampleJobs, setSampleJobs] = useState<SampleJob[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [report, setReport] = useState<MatchReportData | null>(null);

  useEffect(() => {
    // Load sample jobs
    api.getSampleJobs().then(setSampleJobs).catch(console.error);
  }, []);

  const handleApplySampleJob = (job: SampleJob) => {
    setJobTitle(job.title);
    setJobCompany(job.company);
    setJobDescription(job.description);
    setErrorMsg(null);
  };

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      setErrorMsg("Please paste a job description or select one of the sample roles below.");
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg(null);

    try {
      // Find the chosen resume object
      const chosen = savedResumes.find((r) => r.id === selectedResumeId) || currentResume;
      
      const res = await api.analyzeMatch({
        job_description: jobDescription,
        job_title: jobTitle || "Target Role",
        job_company: jobCompany || "",
        resume_id: chosen.id,
        structured_resume: chosen,
      });

      setReport(res);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to analyze match. Please check inputs.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (report) {
    return (
      <MatchReportView
        report={report}
        onEditResume={onEditResume}
        onNewMatch={() => setReport(null)}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-in fade-in">
      <div className="text-center max-w-xl mx-auto">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          ATS Job Description Matcher
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Compare your resume against any job description. Get an explainable match score, identify missing keywords, and receive truthful gap-bridging suggestions.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        {/* Step 1: Select Resume */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center space-x-1.5">
            <FileText className="w-4 h-4 text-indigo-600" />
            <span>1. Choose Resume for Analysis</span>
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={selectedResumeId}
              onChange={(e) => {
                setSelectedResumeId(e.target.value);
                const chosen = savedResumes.find((r) => r.id === e.target.value);
                if (chosen) onSelectResumeToMatch(chosen);
              }}
              className="flex-1 px-3.5 py-2.5 text-xs font-semibold border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
            >
              <option value="current-active">
                Active Resume: {currentResume.title} ({currentResume.contact_info.name || "Draft"})
              </option>
              {savedResumes
                .filter((r) => r.id !== currentResume.id)
                .map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title} ({r.contact_info.name || "Resume"})
                  </option>
                ))}
            </select>
            <button
              onClick={onEditResume}
              className="px-3.5 py-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 rounded-xl border border-indigo-100 transition whitespace-nowrap"
            >
              Open in Editor
            </button>
          </div>
        </div>

        {/* Step 2: Sample Role Presets */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
              <Compass className="w-4 h-4 text-indigo-600" />
              <span>Or Choose a Sample Early-Career Posting</span>
            </span>
            <span className="text-[11px] text-slate-400">1-click test</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {sampleJobs.map((job) => (
              <button
                key={job.id}
                onClick={() => handleApplySampleJob(job)}
                className="text-left p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-indigo-50/40 hover:border-indigo-300 transition group"
              >
                <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 truncate">
                  {job.title}
                </div>
                <div className="text-[11px] text-slate-500 flex items-center space-x-1 mt-0.5">
                  <Building className="w-3 h-3 text-slate-400" />
                  <span className="truncate">{job.company}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 3: Job Description Form */}
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Job Title</label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Junior Full-Stack Developer"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Organization</label>
              <input
                type="text"
                value={jobCompany}
                onChange={(e) => setJobCompany(e.target.value)}
                placeholder="e.g. Acme Tech Corp"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Job Description Text *
              </label>
              <span className="text-[11px] text-slate-400">
                {jobDescription ? `${jobDescription.split(/\s+/).filter(Boolean).length} words` : "Paste full posting"}
              </span>
            </div>
            <textarea
              rows={9}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the complete job description here, including responsibilities, required qualifications, and preferred skills..."
              className="w-full px-3.5 py-2.5 text-xs font-mono border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed bg-slate-50"
            />
          </div>
        </div>

        {errorMsg && (
          <div className="flex items-center space-x-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 p-3 rounded-xl">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-md flex items-center justify-center space-x-2 disabled:opacity-50 active:scale-98"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                <span>Extracting Skills with spaCy NLP...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Calculate Match Score & Suggestions</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
