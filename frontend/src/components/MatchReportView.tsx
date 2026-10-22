"use client";

import React, { useState } from "react";
import { MatchReportData, KeywordMatchItem, SuggestionItem } from "../types/resume";
import {
  CheckCircle2, XCircle, AlertCircle, ShieldCheck, Sparkles,
  ArrowRight, Copy, Check, Info, FileText, ChevronRight, HelpCircle
} from "lucide-react";

interface MatchReportViewProps {
  report: MatchReportData;
  onEditResume: () => void;
  onNewMatch: () => void;
}

export const MatchReportView: React.FC<MatchReportViewProps> = ({
  report,
  onEditResume,
  onNewMatch,
}) => {
  const [keywordFilter, setKeywordFilter] = useState<"all" | "matched" | "missing_req" | "missing_pref">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { overall_score, score_breakdown, matched_keywords, missing_required, missing_preferred, suggestions, truthfulness_note } = report;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (score >= 65) return "text-indigo-600 bg-indigo-50 border-indigo-200";
    if (score >= 50) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-rose-600 bg-rose-50 border-rose-200";
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredKeywords = () => {
    if (keywordFilter === "matched") return matched_keywords;
    if (keywordFilter === "missing_req") return missing_required;
    if (keywordFilter === "missing_pref") return missing_preferred;
    return [...matched_keywords, ...missing_required, ...missing_preferred];
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
            Explainable ATS Match Report
          </span>
          <h2 className="text-2xl font-black text-slate-900 mt-2">
            {report.job_title} {report.job_company ? `at ${report.job_company}` : ""}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Analyzed with spaCy NLP and Curated Tech Taxonomy
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={onNewMatch}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            New Job Match
          </button>
          <button
            onClick={onEditResume}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition flex items-center space-x-1.5 shadow-sm"
          >
            <span>Update Resume</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Scorecard Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Radial / Large Score Display */}
          <div className="flex items-center space-x-6">
            <div className={`w-28 h-28 rounded-3xl border-4 flex flex-col items-center justify-center font-black shadow-inner ${getScoreColor(overall_score)}`}>
              <span className="text-3xl tracking-tight">{overall_score}%</span>
              <span className="text-[10px] uppercase font-bold tracking-wider mt-0.5 opacity-80">Match Score</span>
            </div>

            <div className="space-y-1.5 max-w-md">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-slate-900">
                  {overall_score >= 75 ? "Strong Candidate Alignment" : overall_score >= 50 ? "Moderate Alignment with Growth Opportunities" : "Key Skill Gaps Identified"}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Matches {matched_keywords.length} role terms across your resume. Address the missing core requirements below to maximize ATS pass-through.
              </p>
              {/* Disclaimer Notice */}
              <div className="flex items-start space-x-1.5 pt-1 text-[11px] text-slate-500 italic">
                <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-slate-400" />
                <span>
                  Transparent Estimate: This score is calculated from keyword coverage and formatting heuristics. It is not an actual proprietary ATS algorithm or hiring guarantee.
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Badges */}
          <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3 text-center">
              <span className="text-xl font-bold text-emerald-700 block">{matched_keywords.length}</span>
              <span className="text-[11px] font-semibold text-emerald-800">Matched Skills</span>
            </div>
            <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-3 text-center">
              <span className="text-xl font-bold text-rose-700 block">{missing_required.length}</span>
              <span className="text-[11px] font-semibold text-rose-800">Missing Core Skills</span>
            </div>
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3 text-center">
              <span className="text-xl font-bold text-amber-700 block">{missing_preferred.length}</span>
              <span className="text-[11px] font-semibold text-amber-800">Missing Bonus Skills</span>
            </div>
            <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-3 text-center">
              <span className="text-xl font-bold text-indigo-700 block">
                {score_breakdown.ats_formatting_score?.score || 85}%
              </span>
              <span className="text-[11px] font-semibold text-indigo-800">ATS Format Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Score Breakdown Cards */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center space-x-2">
          <span>Score Breakdown & Component Weights</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: "Required Qualifications",
              weight: "45% weight",
              score: score_breakdown.required_skills?.score || 0,
              desc: score_breakdown.required_skills?.description,
              color: "text-indigo-600 bg-indigo-50 border-indigo-100",
              count: `${score_breakdown.required_skills?.matched_count || 0}/${score_breakdown.required_skills?.total_count || 0} skills`,
            },
            {
              title: "Preferred Qualifications",
              weight: "25% weight",
              score: score_breakdown.preferred_skills?.score || 0,
              desc: score_breakdown.preferred_skills?.description,
              color: "text-sky-600 bg-sky-50 border-sky-100",
              count: `${score_breakdown.preferred_skills?.matched_count || 0}/${score_breakdown.preferred_skills?.total_count || 0} skills`,
            },
            {
              title: "Role Terminology Depth",
              weight: "20% weight",
              score: score_breakdown.role_terminology?.score || 0,
              desc: score_breakdown.role_terminology?.description,
              color: "text-purple-600 bg-purple-50 border-purple-100",
              count: "NLP Domain overlap",
            },
            {
              title: "ATS Single-Column Format",
              weight: "10% weight",
              score: score_breakdown.ats_formatting_score?.score || 0,
              desc: score_breakdown.ats_formatting_score?.description,
              color: "text-emerald-600 bg-emerald-50 border-emerald-100",
              count: "Semantic layout check",
            },
          ].map((item, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2 shadow-sm">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-slate-700 leading-tight">{item.title}</span>
                <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                  {item.weight}
                </span>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-black text-slate-900">{item.score}%</span>
                <span className="text-[11px] text-slate-500 font-medium">{item.count}</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Truth-in-Hiring Alert Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start space-x-3 text-emerald-900">
        <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <strong className="font-bold text-emerald-950">
            FitCheck Truth-in-Hiring Ethical Guideline
          </strong>
          <p className="leading-relaxed text-emerald-800">{truthfulness_note}</p>
        </div>
      </div>

      {/* Actionable & Truthful Suggestions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Actionable Recommendations ({suggestions.length})
            </h3>
          </div>
          <span className="text-xs text-slate-400">Tailored suggestions to honestly address gaps</span>
        </div>

        <div className="space-y-3.5">
          {suggestions.map((sug) => (
            <div
              key={sug.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3 hover:border-indigo-300 transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${
                    sug.type === "missing_required"
                      ? "bg-rose-100 text-rose-800"
                      : sug.type === "missing_preferred"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-indigo-100 text-indigo-800"
                  }`}>
                    {sug.type.replace("_", " ")}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">{sug.title}</h4>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{sug.recommendation}</p>

              {/* Concrete Bullet Example */}
              {sug.actionable_example && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start justify-between gap-3 text-xs">
                  <div className="text-slate-800 font-mono text-[11px] leading-relaxed">
                    <span className="text-slate-400 font-bold mr-1.5">•</span>
                    {sug.actionable_example}
                  </div>
                  <button
                    onClick={() => copyToClipboard(sug.actionable_example, sug.id)}
                    className="flex-shrink-0 text-slate-400 hover:text-indigo-600 transition p-1"
                    title="Copy bullet example"
                  >
                    {copiedId === sug.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              )}

              {/* Truthfulness Warning */}
              <div className="flex items-start space-x-1.5 text-[11px] text-amber-700 bg-amber-50/60 p-2.5 rounded-lg border border-amber-200/60">
                <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0 text-amber-600 mt-0.5" />
                <span className="leading-snug">{sug.truthfulness_warning}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Keywords Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
          <h3 className="text-sm font-bold text-slate-900">
            Detected Keywords & Section Breakdown
          </h3>
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => setKeywordFilter("all")}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                keywordFilter === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
              }`}
            >
              All ({matched_keywords.length + missing_required.length + missing_preferred.length})
            </button>
            <button
              onClick={() => setKeywordFilter("matched")}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                keywordFilter === "matched" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-600"
              }`}
            >
              Matched ({matched_keywords.length})
            </button>
            <button
              onClick={() => setKeywordFilter("missing_req")}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                keywordFilter === "missing_req" ? "bg-white text-rose-700 shadow-sm" : "text-slate-600"
              }`}
            >
              Missing Required ({missing_required.length})
            </button>
            <button
              onClick={() => setKeywordFilter("missing_pref")}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                keywordFilter === "missing_pref" ? "bg-white text-amber-700 shadow-sm" : "text-slate-600"
              }`}
            >
              Missing Preferred ({missing_preferred.length})
            </button>
          </div>
        </div>

        {/* Chips Grid */}
        <div className="flex flex-wrap gap-2">
          {filteredKeywords().map((kw, idx) => {
            const isMatched = kw.in_resume;
            return (
              <div
                key={idx}
                className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs transition ${
                  isMatched
                    ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                    : kw.category.includes("preferred")
                    ? "bg-amber-50 text-amber-900 border-amber-200"
                    : "bg-rose-50 text-rose-900 border-rose-200"
                }`}
              >
                {isMatched ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                )}
                <span className="font-bold">{kw.term}</span>
                <span className="text-[10px] text-slate-400 capitalize">
                  ({kw.category.replace("_", " ")})
                </span>
                {kw.found_in_sections?.length > 0 && (
                  <span className="text-[10px] font-semibold bg-white/80 px-1.5 py-0.5 rounded text-emerald-800 border border-emerald-200">
                    in {kw.found_in_sections.join(", ")}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
