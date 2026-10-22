"use client";

import React, { useState, useEffect, useRef } from "react";
import { ResumeData, EducationEntry, ExperienceEntry, ProjectEntry, CertificationEntry, AchievementEntry } from "../types/resume";
import { ResumePreview } from "./ResumePreview";
import { api } from "../services/api";
import {
  User, BookOpen, Briefcase, FolderGit2, Wrench, Award, AlignLeft,
  Plus, Trash2, ArrowUp, ArrowDown, Download, Save, Check, RefreshCw,
  Eye, EyeOff, LayoutTemplate, History, Sparkles, FileText, CheckCircle2,
  AlertCircle, Trophy
} from "lucide-react";

interface ResumeEditorProps {
  resume: ResumeData;
  onUpdateResume: (updated: ResumeData) => void;
  onExportPdf: () => void;
  isSaving?: boolean;
}

export const ResumeEditor: React.FC<ResumeEditorProps> = ({
  resume,
  onUpdateResume,
  onExportPdf,
  isSaving,
}) => {
  const [activeTab, setActiveTab] = useState<string>("contact");
  const [showPreview, setShowPreview] = useState<boolean>(true);
  const [saveStatus, setSaveStatus] = useState<string>("Synced");
  const [showVersionModal, setShowVersionModal] = useState<boolean>(false);
  const [versions, setVersions] = useState<any[]>([]);
  const [loadingVersions, setLoadingVersions] = useState<boolean>(false);
  const [exportingPdf, setExportingPdf] = useState<boolean>(false);

  // New skill chip inputs
  const [newSkillText, setNewSkillText] = useState<{ [key: string]: string }>({
    technical: "",
    tools_frameworks: "",
    languages: "",
    soft_skills: "",
  });

  const updateField = (field: keyof ResumeData, value: any) => {
    setSaveStatus("Unsaved changes");
    onUpdateResume({
      ...resume,
      [field]: value,
    });
  };

  const updateContact = (field: string, val: string) => {
    updateField("contact_info", {
      ...resume.contact_info,
      [field]: val,
    });
  };

  // --- Education Handlers ---
  const addEducation = () => {
    const newEntry: EducationEntry = {
      id: "edu-" + Date.now(),
      institution: "",
      degree: "",
      field: "",
      location: "",
      start_date: "",
      end_date: "",
      gpa: "",
      highlights: [],
    };
    updateField("education", [...(resume.education || []), newEntry]);
  };

  const removeEducation = (index: number) => {
    const list = [...resume.education];
    list.splice(index, 1);
    updateField("education", list);
  };

  const moveEducation = (index: number, direction: "up" | "down") => {
    const list = [...resume.education];
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= list.length) return;
    const temp = list[index];
    list[index] = list[target];
    list[target] = temp;
    updateField("education", list);
  };

  const updateEducation = (index: number, field: keyof EducationEntry, val: any) => {
    const list = [...resume.education];
    list[index] = { ...list[index], [field]: val };
    updateField("education", list);
  };

  // --- Experience Handlers ---
  const addExperience = () => {
    const newEntry: ExperienceEntry = {
      id: "exp-" + Date.now(),
      company: "",
      title: "",
      location: "",
      start_date: "",
      end_date: "",
      is_current: false,
      bullets: [""],
    };
    updateField("experience", [...(resume.experience || []), newEntry]);
  };

  const removeExperience = (index: number) => {
    const list = [...resume.experience];
    list.splice(index, 1);
    updateField("experience", list);
  };

  const moveExperience = (index: number, direction: "up" | "down") => {
    const list = [...resume.experience];
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= list.length) return;
    const temp = list[index];
    list[index] = list[target];
    list[target] = temp;
    updateField("experience", list);
  };

  const updateExperience = (index: number, field: keyof ExperienceEntry, val: any) => {
    const list = [...resume.experience];
    list[index] = { ...list[index], [field]: val };
    updateField("experience", list);
  };

  // --- Projects Handlers ---
  const addProject = () => {
    const newEntry: ProjectEntry = {
      id: "proj-" + Date.now(),
      name: "",
      role: "",
      link: "",
      start_date: "",
      end_date: "",
      technologies: [],
      bullets: [""],
    };
    updateField("projects", [...(resume.projects || []), newEntry]);
  };

  const removeProject = (index: number) => {
    const list = [...resume.projects];
    list.splice(index, 1);
    updateField("projects", list);
  };

  const moveProject = (index: number, direction: "up" | "down") => {
    const list = [...resume.projects];
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= list.length) return;
    const temp = list[index];
    list[index] = list[target];
    list[target] = temp;
    updateField("projects", list);
  };

  const updateProject = (index: number, field: keyof ProjectEntry, val: any) => {
    const list = [...resume.projects];
    list[index] = { ...list[index], [field]: val };
    updateField("projects", list);
  };

  // --- Skills Handlers ---
  const addSkill = (category: keyof typeof resume.skills) => {
    const text = newSkillText[category]?.trim();
    if (!text) return;
    const currentList = resume.skills[category] || [];
    if (!currentList.includes(text)) {
      updateField("skills", {
        ...resume.skills,
        [category]: [...currentList, text],
      });
    }
    setNewSkillText({ ...newSkillText, [category]: "" });
  };

  const removeSkill = (category: keyof typeof resume.skills, index: number) => {
    const list = [...(resume.skills[category] || [])];
    list.splice(index, 1);
    updateField("skills", {
      ...resume.skills,
      [category]: list,
    });
  };

  // --- Certifications Handlers ---
  const addCertification = () => {
    const newEntry: CertificationEntry = {
      id: "cert-" + Date.now(),
      name: "",
      issuer: "",
      date: "",
      url: "",
    };
    updateField("certifications", [...(resume.certifications || []), newEntry]);
  };

  const removeCertification = (index: number) => {
    const list = [...resume.certifications];
    list.splice(index, 1);
    updateField("certifications", list);
  };

  const updateCertification = (index: number, field: keyof CertificationEntry, val: any) => {
    const list = [...(resume.certifications || [])];
    list[index] = { ...list[index], [field]: val };
    updateField("certifications", list);
  };

  // --- Achievement Handlers ---
  const addAchievement = () => {
    const newEntry: AchievementEntry = {
      id: "ach-" + Date.now(),
      title: "",
      issuer: "",
      date: "",
      description: "",
    };
    updateField("achievements", [...(resume.achievements || []), newEntry]);
  };

  const removeAchievement = (index: number) => {
    const list = [...(resume.achievements || [])];
    list.splice(index, 1);
    updateField("achievements", list);
  };

  const updateAchievement = (index: number, field: keyof AchievementEntry, val: any) => {
    const list = [...(resume.achievements || [])];
    list[index] = { ...list[index], [field]: val };
    updateField("achievements", list);
  };

  const moveAchievement = (index: number, direction: "up" | "down") => {
    const list = [...(resume.achievements || [])];
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= list.length) return;
    const temp = list[index];
    list[index] = list[target];
    list[target] = temp;
    updateField("achievements", list);
  };

  // --- Explicit Save ---
  const handleExplicitSave = () => {
    setSaveStatus("Saving...");
    onUpdateResume(resume);
    setTimeout(() => setSaveStatus("Synced"), 1000);
  };

  // --- Version History Fetch ---
  const loadVersions = async () => {
    if (!resume.id) return;
    try {
      setLoadingVersions(true);
      const data = await api.getResumeVersions(resume.id);
      setVersions(data);
      setShowVersionModal(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingVersions(false);
    }
  };

  const restoreVersion = async (versionId: string) => {
    if (!resume.id) return;
    try {
      const restored = await api.restoreResumeVersion(resume.id, versionId);
      onUpdateResume(restored);
      setShowVersionModal(false);
      setSaveStatus("Restored successfully");
    } catch (err) {
      alert("Failed to restore version snapshot.");
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setExportingPdf(true);
      if (resume.id) {
        window.open(api.exportPdfUrl(resume.id), "_blank");
      } else {
        const blob = await api.exportPdfPreview(resume);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${(resume.contact_info?.name || "Resume").replace(/\s+/g, "_")}_ATS_FitCheck.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      alert("PDF generation failed. Please try again.");
    } finally {
      setExportingPdf(false);
    }
  };

  const navSections = [
    { id: "contact", label: "Contact Info", icon: User },
    { id: "summary", label: "Summary", icon: AlignLeft },
    { id: "education", label: "Education", icon: BookOpen },
    { id: "experience", label: "Experience", icon: Briefcase },
    { id: "projects", label: "Projects", icon: FolderGit2 },
    { id: "skills", label: "Skills", icon: Wrench },
    { id: "certifications", label: "Certifications", icon: Award },
    { id: "achievements", label: "Achievements", icon: Trophy },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-200 gap-4">
        <div>
          <input
            type="text"
            value={resume.title}
            onChange={(e) => updateField("title", e.target.value)}
            className="text-xl sm:text-2xl font-black text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-indigo-600 focus:outline-none bg-transparent transition py-0.5"
            placeholder="Resume Title"
          />
          <div className="flex items-center space-x-3 text-xs text-slate-500 mt-1">
            <span className="flex items-center space-x-1.5">
              <span className={`w-2 h-2 rounded-full ${isSaving ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`}></span>
              <span className="font-medium text-slate-700">{isSaving ? "Autosaving changes..." : saveStatus}</span>
            </span>
            <span>•</span>
            <span>Standard ATS Format</span>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {/* Template Switcher */}
          <div className="flex items-center space-x-1.5 bg-slate-100 p-1.5 rounded-xl text-xs font-semibold text-slate-700 border border-slate-200">
            <LayoutTemplate className="w-3.5 h-3.5 ml-1 text-slate-500" />
            <select
              value={resume.template || "modern"}
              onChange={(e) => updateField("template", e.target.value)}
              className="bg-transparent border-none text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer pr-2"
            >
              <option value="modern">Modern (Balanced & Crisp)</option>
              <option value="minimal">Minimal (Clean Typography)</option>
              <option value="creative">Creative (Violet Accent & Badges)</option>
              <option value="executive">Executive (Classic Serif & Navy)</option>
              <option value="technical">Technical (Skills-First Density)</option>
            </select>
          </div>

          {/* Explicit Save Button */}
          <button
            onClick={handleExplicitSave}
            disabled={isSaving}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition disabled:opacity-50"
            title="Save changes immediately"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save</span>
          </button>

          {/* Version History Button */}
          {resume.id && (
            <button
              onClick={loadVersions}
              disabled={loadingVersions}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition"
              title="View saved versions"
            >
              <History className="w-3.5 h-3.5 text-slate-500" />
              <span>Versions</span>
            </button>
          )}

          {/* Toggle Live Preview */}
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition"
          >
            {showPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{showPreview ? "Hide Preview" : "Show Preview"}</span>
          </button>

          {/* Export PDF Button */}
          <button
            onClick={handleDownloadPdf}
            disabled={exportingPdf}
            className="flex items-center space-x-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition shadow-sm hover:shadow active:scale-95 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{exportingPdf ? "Generating PDF..." : "Export Clean ATS PDF"}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Form Left, Preview Right */}
      <div className={`mt-6 grid gap-8 ${showPreview ? "lg:grid-cols-12" : "grid-cols-1"}`}>
        {/* Editor Form Column */}
        <div className={showPreview ? "lg:col-span-7" : "max-w-3xl mx-auto w-full"}>
          {/* Section Navigation Tabs */}
          <div className="flex border-b border-slate-200 overflow-x-auto pb-1 mb-6 space-x-1">
            {navSections.map((sec) => {
              const Icon = sec.icon;
              const isActive = activeTab === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveTab(sec.id)}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold rounded-lg whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{sec.label}</span>
                </button>
              );
            })}
          </div>

          {/* Form Content */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            {/* 1. CONTACT INFO */}
            {activeTab === "contact" && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900">Personal & Contact Details</h3>
                  <p className="text-xs text-slate-500">
                    ATS scanners extract your contact details first. Use clean text without icons or tables.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={resume.contact_info.name}
                      onChange={(e) => updateContact("name", e.target.value)}
                      placeholder="e.g. Alex Chen"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      value={resume.contact_info.email}
                      onChange={(e) => updateContact("email", e.target.value)}
                      placeholder="e.g. alex.chen@university.edu"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={resume.contact_info.phone}
                      onChange={(e) => updateContact("phone", e.target.value)}
                      placeholder="e.g. (555) 234-5678"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Location (City, State)</label>
                    <input
                      type="text"
                      value={resume.contact_info.location}
                      onChange={(e) => updateContact("location", e.target.value)}
                      placeholder="e.g. San Francisco, CA"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">LinkedIn Profile</label>
                    <input
                      type="text"
                      value={resume.contact_info.linkedin}
                      onChange={(e) => updateContact("linkedin", e.target.value)}
                      placeholder="e.g. linkedin.com/in/alexchen-dev"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">GitHub / Code Portfolio</label>
                    <input
                      type="text"
                      value={resume.contact_info.github}
                      onChange={(e) => updateContact("github", e.target.value)}
                      placeholder="e.g. github.com/alexchen-code"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Personal Website / Portfolio</label>
                    <input
                      type="text"
                      value={resume.contact_info.portfolio}
                      onChange={(e) => updateContact("portfolio", e.target.value)}
                      placeholder="e.g. https://alexchen.dev"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. SUMMARY */}
            {activeTab === "summary" && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900">Professional Summary</h3>
                  <p className="text-xs text-slate-500">
                    A concise 2-3 sentence overview of your technical focus, academic background, and core capabilities.
                  </p>
                </div>

                <div>
                  <textarea
                    rows={5}
                    value={resume.summary}
                    onChange={(e) => updateField("summary", e.target.value)}
                    placeholder="e.g. Motivated Computer Science graduate with hands-on experience in full-stack web development, RESTful APIs, and relational databases. Seeking to leverage skills in Python, TypeScript, and modern web architectures to contribute to high-impact products."
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                  />
                  <div className="flex justify-between items-center text-xs text-slate-400 mt-1">
                    <span>Recommended: 40-70 words</span>
                    <span>{resume.summary ? resume.summary.split(/\s+/).filter(Boolean).length : 0} words</span>
                  </div>
                </div>
              </div>
            )}

            {/* 3. EDUCATION */}
            {activeTab === "education" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Education</h3>
                    <p className="text-xs text-slate-500">List university degrees, college credentials, or bootcamps.</p>
                  </div>
                  <button
                    onClick={addEducation}
                    className="flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Degree</span>
                  </button>
                </div>

                {resume.education?.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    No education entries added yet. Click &ldquo;Add Degree&rdquo; above.
                  </div>
                ) : (
                  resume.education.map((item, index) => (
                    <div key={item.id || index} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 relative">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                          Entry #{index + 1}
                        </span>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => moveEducation(index, "up")}
                            disabled={index === 0}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => moveEducation(index, "down")}
                            disabled={index === resume.education.length - 1}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => removeEducation(index)}
                            className="p-1 rounded text-rose-500 hover:text-rose-700"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Institution</label>
                          <input
                            type="text"
                            value={item.institution}
                            onChange={(e) => updateEducation(index, "institution", e.target.value)}
                            placeholder="e.g. California State University"
                            className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Degree</label>
                          <input
                            type="text"
                            value={item.degree}
                            onChange={(e) => updateEducation(index, "degree", e.target.value)}
                            placeholder="e.g. Bachelor of Science"
                            className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Field of Study</label>
                          <input
                            type="text"
                            value={item.field}
                            onChange={(e) => updateEducation(index, "field", e.target.value)}
                            placeholder="e.g. Computer Science"
                            className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">GPA (Optional)</label>
                          <input
                            type="text"
                            value={item.gpa}
                            onChange={(e) => updateEducation(index, "gpa", e.target.value)}
                            placeholder="e.g. 3.8 / 4.0"
                            className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
                          <input
                            type="text"
                            value={item.start_date}
                            onChange={(e) => updateEducation(index, "start_date", e.target.value)}
                            placeholder="e.g. Aug 2022"
                            className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">End Date (or Expected)</label>
                          <input
                            type="text"
                            value={item.end_date}
                            onChange={(e) => updateEducation(index, "end_date", e.target.value)}
                            placeholder="e.g. May 2026"
                            className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Highlights & Coursework (one per line)</label>
                        <textarea
                          rows={2}
                          value={item.highlights?.join("\n") || ""}
                          onChange={(e) =>
                            updateEducation(
                              index,
                              "highlights",
                              e.target.value.split("\n").filter((l) => l.trim().length > 0)
                            )
                          }
                          placeholder="e.g. Dean's Honor Roll&#10;Relevant Coursework: Data Structures, Database Systems"
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 4. EXPERIENCE */}
            {activeTab === "experience" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Work Experience</h3>
                    <p className="text-xs text-slate-500">Internships, research assistantships, co-ops, or full-time roles.</p>
                  </div>
                  <button
                    onClick={addExperience}
                    className="flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Position</span>
                  </button>
                </div>

                {resume.experience?.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    No experience added. Click &ldquo;Add Position&rdquo; above.
                  </div>
                ) : (
                  resume.experience.map((item, index) => (
                    <div key={item.id || index} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                          Position #{index + 1}
                        </span>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => moveExperience(index, "up")}
                            disabled={index === 0}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => moveExperience(index, "down")}
                            disabled={index === resume.experience.length - 1}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => removeExperience(index)}
                            className="p-1 rounded text-rose-500 hover:text-rose-700"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Job Title</label>
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => updateExperience(index, "title", e.target.value)}
                            placeholder="e.g. Software Engineering Intern"
                            className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Organization</label>
                          <input
                            type="text"
                            value={item.company}
                            onChange={(e) => updateExperience(index, "company", e.target.value)}
                            placeholder="e.g. Nexus Web Solutions"
                            className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
                          <input
                            type="text"
                            value={item.start_date}
                            onChange={(e) => updateExperience(index, "start_date", e.target.value)}
                            placeholder="e.g. Jun 2025"
                            className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              disabled={item.is_current}
                              value={item.is_current ? "Present" : item.end_date}
                              onChange={(e) => updateExperience(index, "end_date", e.target.value)}
                              placeholder="e.g. Aug 2025"
                              className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white disabled:bg-slate-100"
                            />
                            <label className="flex items-center space-x-1 text-xs text-slate-600 whitespace-nowrap">
                              <input
                                type="checkbox"
                                checked={item.is_current}
                                onChange={(e) => updateExperience(index, "is_current", e.target.checked)}
                                className="rounded text-indigo-600"
                              />
                              <span>Current</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Accomplishment Bullets (one bullet per line)
                        </label>
                        <textarea
                          rows={3}
                          value={item.bullets?.join("\n") || ""}
                          onChange={(e) =>
                            updateExperience(
                              index,
                              "bullets",
                              e.target.value.split("\n").filter((l) => l.trim().length > 0)
                            )
                          }
                          placeholder="e.g. Engineered 12+ RESTful API endpoints using FastAPI and PostgreSQL.&#10;Implemented reusable React components, improving web accessibility scores."
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white font-mono"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 5. PROJECTS */}
            {activeTab === "projects" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Projects</h3>
                    <p className="text-xs text-slate-500">Crucial for early career candidates: academic, capstone, or personal open-source projects.</p>
                  </div>
                  <button
                    onClick={addProject}
                    className="flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Project</span>
                  </button>
                </div>

                {resume.projects?.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    No projects added. Click &ldquo;Add Project&rdquo; above.
                  </div>
                ) : (
                  resume.projects.map((item, index) => (
                    <div key={item.id || index} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                          Project #{index + 1}
                        </span>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => moveProject(index, "up")}
                            disabled={index === 0}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => moveProject(index, "down")}
                            disabled={index === resume.projects.length - 1}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => removeProject(index)}
                            className="p-1 rounded text-rose-500 hover:text-rose-700"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Project Name</label>
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => updateProject(index, "name", e.target.value)}
                            placeholder="e.g. TaskFlow - Collaboration Board"
                            className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Role</label>
                          <input
                            type="text"
                            value={item.role}
                            onChange={(e) => updateProject(index, "role", e.target.value)}
                            placeholder="e.g. Lead Full-Stack Developer"
                            className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Repository / Live URL</label>
                          <input
                            type="text"
                            value={item.link}
                            onChange={(e) => updateProject(index, "link", e.target.value)}
                            placeholder="e.g. https://github.com/username/project"
                            className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Technologies (comma separated)</label>
                          <input
                            type="text"
                            value={item.technologies?.join(", ") || ""}
                            onChange={(e) =>
                              updateProject(
                                index,
                                "technologies",
                                e.target.value.split(",").map((t) => t.trim()).filter(Boolean)
                              )
                            }
                            placeholder="e.g. Next.js, TypeScript, PostgreSQL, Docker"
                            className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Bullet Points (one per line)</label>
                        <textarea
                          rows={2}
                          value={item.bullets?.join("\n") || ""}
                          onChange={(e) =>
                            updateProject(
                              index,
                              "bullets",
                              e.target.value.split("\n").filter((l) => l.trim().length > 0)
                            )
                          }
                          placeholder="e.g. Architected Kanban board with drag-and-drop tasks and role-based permissions."
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white font-mono"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 6. SKILLS */}
            {activeTab === "skills" && (
              <div className="space-y-6">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900">Skills & Competencies</h3>
                  <p className="text-xs text-slate-500">
                    ATS systems parse categorized skills directly. Add genuine skills that you are prepared to discuss in interviews.
                  </p>
                </div>

                {[
                  { key: "technical", label: "Technical Skills", placeholder: "e.g. FastAPI, React, REST APIs, Microservices" },
                  { key: "tools_frameworks", label: "Tools & Frameworks", placeholder: "e.g. Docker, Git, PostgreSQL, Linux" },
                  { key: "languages", label: "Programming & Markup Languages", placeholder: "e.g. Python, TypeScript, SQL, HTML5" },
                  { key: "soft_skills", label: "Core Competencies & Soft Skills", placeholder: "e.g. Problem Solving, Agile, Collaboration" },
                ].map((category) => {
                  const catKey = category.key as keyof typeof resume.skills;
                  const skillsList = resume.skills[catKey] || [];
                  return (
                    <div key={category.key} className="space-y-2">
                      <label className="block text-xs font-bold text-slate-800">{category.label}</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={newSkillText[catKey]}
                          onChange={(e) => setNewSkillText({ ...newSkillText, [catKey]: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addSkill(catKey);
                            }
                          }}
                          placeholder={category.placeholder}
                          className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                          onClick={() => addSkill(catKey)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition"
                        >
                          Add
                        </button>
                      </div>

                      {/* Skill Chips */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {skillsList.map((skill, sIdx) => (
                          <span
                            key={sIdx}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 text-slate-800 border border-slate-200"
                          >
                            <span>{skill}</span>
                            <button
                              onClick={() => removeSkill(catKey, sIdx)}
                              className="text-slate-400 hover:text-rose-500 text-sm font-bold ml-1 leading-none"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 7. CERTIFICATIONS */}
            {activeTab === "certifications" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Certifications & Licenses</h3>
                    <p className="text-xs text-slate-500">Cloud credentials, online certificates, or industry qualifications.</p>
                  </div>
                  <button
                    onClick={addCertification}
                    className="flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Certificate</span>
                  </button>
                </div>

                {resume.certifications?.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    No certifications added. Click &ldquo;Add Certificate&rdquo; above.
                  </div>
                ) : (
                  resume.certifications.map((item, index) => (
                    <div key={item.id || index} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                          Certificate #{index + 1}
                        </span>
                        <button
                          onClick={() => removeCertification(index)}
                          className="p-1 rounded text-rose-500 hover:text-rose-700"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Certification Name</label>
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => updateCertification(index, "name", e.target.value)}
                            placeholder="e.g. AWS Certified Cloud Practitioner"
                            className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Issuing Organization</label>
                          <input
                            type="text"
                            value={item.issuer}
                            onChange={(e) => updateCertification(index, "issuer", e.target.value)}
                            placeholder="e.g. Amazon Web Services"
                            className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                          <input
                            type="text"
                            value={item.date}
                            onChange={(e) => updateCertification(index, "date", e.target.value)}
                            placeholder="e.g. 2025"
                            className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Credential URL</label>
                          <input
                            type="text"
                            value={item.url}
                            onChange={(e) => updateCertification(index, "url", e.target.value)}
                            placeholder="e.g. https://aws.amazon.com/verify"
                            className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 8. ACHIEVEMENTS & HONORS */}
            {activeTab === "achievements" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Honors & Key Achievements</h3>
                    <p className="text-xs text-slate-500">Hackathon awards, academic honors, scholarships, publications, or competitive recognitions.</p>
                  </div>
                  <button
                    onClick={addAchievement}
                    className="flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Honor / Award</span>
                  </button>
                </div>

                {!resume.achievements || resume.achievements.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    No achievements added. Click &ldquo;Add Honor / Award&rdquo; to highlight scholarships, dean&apos;s lists, or competition awards.
                  </div>
                ) : (
                  resume.achievements.map((item, index) => (
                    <div key={item.id || index} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                            Honor #{index + 1}
                          </span>
                          <div className="flex items-center space-x-0.5">
                            <button
                              onClick={() => moveAchievement(index, "up")}
                              disabled={index === 0}
                              className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => moveAchievement(index, "down")}
                              disabled={index === (resume.achievements?.length || 0) - 1}
                              className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <button
                          onClick={() => removeAchievement(index)}
                          className="p-1 rounded text-rose-500 hover:text-rose-700"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Title / Recognition</label>
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => updateAchievement(index, "title", e.target.value)}
                            placeholder="e.g. 1st Place - University Hackathon 2025"
                            className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Grantor / Institution</label>
                          <input
                            type="text"
                            value={item.issuer || ""}
                            onChange={(e) => updateAchievement(index, "issuer", e.target.value)}
                            placeholder="e.g. ACM Student Chapter"
                            className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                          <input
                            type="text"
                            value={item.date || ""}
                            onChange={(e) => updateAchievement(index, "date", e.target.value)}
                            placeholder="e.g. Fall 2025"
                            className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Brief Description (Optional)</label>
                          <input
                            type="text"
                            value={item.description || ""}
                            onChange={(e) => updateAchievement(index, "description", e.target.value)}
                            placeholder="e.g. Outperformed 45 engineering teams by developing an accessible AI study tool."
                            className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Live Preview Column */}
        {showPreview && (
          <div className="lg:col-span-5 sticky top-24 self-start space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 px-1">
              <span className="flex items-center space-x-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                <span>Live ATS View (Selectable Text)</span>
              </span>
              <span className="text-[11px] text-slate-400">Template: {resume.template}</span>
            </div>

            <div className="overflow-auto max-h-[820px] rounded-2xl border border-slate-200 shadow-sm bg-slate-100 p-2 sm:p-4">
              <ResumePreview resume={resume} />
            </div>
          </div>
        )}
      </div>

      {/* Version History Modal */}
      {showVersionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-2">
                <History className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Version History</h3>
              </div>
              <button onClick={() => setShowVersionModal(false)} className="text-slate-400 hover:text-slate-700 text-lg">×</button>
            </div>

            <div className="mt-4 max-h-72 overflow-y-auto space-y-2">
              {versions.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No previous version snapshots found.</p>
              ) : (
                versions.map((ver) => (
                  <div key={ver.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition">
                    <div>
                      <div className="text-xs font-bold text-slate-800">Version {ver.version_num}</div>
                      <div className="text-[11px] text-slate-500">
                        {new Date(ver.created_at).toLocaleString()} • {ver.note}
                      </div>
                    </div>
                    <button
                      onClick={() => restoreVersion(ver.id)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition"
                    >
                      Restore
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowVersionModal(false)}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
