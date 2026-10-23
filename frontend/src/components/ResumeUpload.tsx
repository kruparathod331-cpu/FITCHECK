"use client";

import React, { useState, useRef } from "react";
import { api } from "../services/api";
import { ResumeData } from "../types/resume";
import {
  UploadCloud, FileText, AlertTriangle, CheckCircle2, ArrowRight,
  Edit3, RefreshCw, FileCheck, ShieldAlert
} from "lucide-react";

interface ResumeUploadProps {
  onParsedResume: (resumeData: ResumeData) => void;
  onProceedToMatch: (resumeData: ResumeData) => void;
}

export const ResumeUpload: React.FC<ResumeUploadProps> = ({
  onParsedResume,
  onProceedToMatch,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Review Step State
  const [extractedRawText, setExtractedRawText] = useState<string>("");
  const [isScanned, setIsScanned] = useState<boolean>(false);
  const [scannedWarning, setScannedWarning] = useState<string | null>(null);
  const [parsedSections, setParsedSections] = useState<any | null>(null);
  const [isReviewing, setIsReviewing] = useState<boolean>(false);
  const [charCount, setCharCount] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      validateAndProcessFile(selected);
    }
  };

  const validateAndProcessFile = async (selectedFile: File) => {
    setErrorMsg(null);
    if (!selectedFile.name.toLowerCase().endsWith(".pdf")) {
      setErrorMsg("Please upload a PDF file (.pdf). Word documents or text files are not supported.");
      return;
    }

    if (selectedFile.size === 0) {
      setErrorMsg("The selected file is empty (0 bytes). Please upload a valid PDF resume.");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setErrorMsg("File size exceeds 5MB limit. Please upload a smaller PDF.");
      return;
    }

    setFile(selectedFile);
    setIsUploading(true);

    try {
      const response = await api.uploadPdf(selectedFile);
      setExtractedRawText(response.raw_text || "");
      setCharCount(response.char_count || 0);
      setIsScanned(response.is_scanned_warning || false);
      setScannedWarning(response.warning_message || null);
      setParsedSections(response.parsed_sections);
      setIsReviewing(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to process PDF. Please check file format and ensure it is not password-protected.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleTestWithSamplePdf = async () => {
    setErrorMsg(null);
    setIsUploading(true);
    try {
      const sample = await api.getSampleResume();
      const pdfBlob = await api.exportPdfPreview(sample);
      const sampleFile = new File([pdfBlob], "Alex_Chen_Sample_ATS_Resume.pdf", { type: "application/pdf" });
      await validateAndProcessFile(sampleFile);
    } catch (err: any) {
      setErrorMsg("Failed to generate sample PDF for testing: " + err.message);
      setIsUploading(false);
    }
  };


  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      validateAndProcessFile(droppedFile);
    }
  };

  const buildStructuredResume = (): ResumeData => {
    return {
      title: file ? file.name.replace(/\.pdf$/i, "") : "Uploaded ATS Resume",
      contact_info: parsedSections?.contact_info || {
        name: "Candidate",
        email: "",
        phone: "",
        location: "",
        linkedin: "",
        github: "",
        portfolio: "",
      },
      summary: parsedSections?.summary || "",
      education: parsedSections?.education || [],
      experience: parsedSections?.experience || [],
      projects: parsedSections?.projects || [],
      skills: parsedSections?.skills || {
        technical: [],
        tools_frameworks: [],
        soft_skills: [],
        languages: [],
      },
      certifications: parsedSections?.certifications || [],
      raw_text: extractedRawText,
      template: "classic-ats",
    };
  };

  const handleOpenInEditor = () => {
    const resume = buildStructuredResume();
    onParsedResume(resume);
  };

  const handleGoToMatch = () => {
    const resume = buildStructuredResume();
    onProceedToMatch(resume);
  };

  const handleReset = () => {
    setFile(null);
    setIsReviewing(false);
    setExtractedRawText("");
    setErrorMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          PDF Resume Extraction & Review
        </h2>
        <p className="text-sm text-slate-600 mt-1 max-w-xl mx-auto">
          FitCheck uses <code className="text-indigo-600 font-semibold bg-indigo-50 px-1 py-0.5 rounded">pdfplumber</code> to extract selectable text. Review and edit the extracted content before running job matching.
        </p>
      </div>

      {!isReviewing ? (
        /* Upload Step */
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-10 text-center cursor-pointer transition bg-slate-50/50 hover:bg-indigo-50/20 group"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf"
              className="hidden"
            />
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center group-hover:scale-105 transition shadow-sm">
              <UploadCloud className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-4">
              Click to select or drag and drop your resume PDF
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Supports standard machine-readable PDF resumes up to 5MB.
            </p>
            <div className="mt-4 flex items-center justify-center space-x-2 text-xs text-emerald-700 bg-emerald-50 max-w-sm mx-auto py-1.5 px-3 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Zero server file persistence — processed safely in-memory.</span>
            </div>

            <div className="mt-4 flex items-center justify-center space-x-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleTestWithSamplePdf();
                }}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-white px-3 py-1.5 rounded-lg border border-indigo-200 hover:bg-indigo-50 transition shadow-sm"
              >
                Or test with sample ATS Resume PDF
              </button>
            </div>
          </div>

          {isUploading && (
            <div className="mt-6 flex items-center justify-center space-x-3 text-sm text-indigo-700 bg-indigo-50 py-3 px-4 rounded-xl">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Extracting text and identifying ATS sections with pdfplumber...</span>
            </div>
          )}

          {errorMsg && (
            <div className="mt-6 flex items-start space-x-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 p-4 rounded-xl">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Extraction Error:</strong>
                <p className="text-xs mt-0.5">{errorMsg}</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Review Step */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
            <div className="flex items-center space-x-2">
              <FileCheck className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-bold text-slate-900">
                Extraction Review: {file?.name}
              </h3>
            </div>
            <div className="flex items-center space-x-3 text-xs text-slate-500">
              <span>{charCount} Characters Extracted</span>
              <button
                onClick={handleReset}
                className="text-slate-600 hover:text-rose-600 underline"
              >
                Upload Different File
              </button>
            </div>
          </div>

          {/* Scanned PDF Warning Banner if detected */}
          {isScanned && (
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-start space-x-3 text-amber-900">
              <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <strong className="font-bold text-sm text-amber-800">
                  Notice: Minimal Selectable Text Detected
                </strong>
                <p>{scannedWarning}</p>
                <p className="font-medium">
                  Recommendation: Paste your resume text into the editor below or fill in the guided builder directly.
                </p>
              </div>
            </div>
          )}

          {/* Editable Raw Text Field */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Extracted Resume Text (Editable Review)</span>
              </label>
              <span className="text-[11px] text-slate-400">
                Fix any OCR quirks or typos here before analysis
              </span>
            </div>
            <textarea
              rows={12}
              value={extractedRawText}
              onChange={(e) => {
                setExtractedRawText(e.target.value);
                setCharCount(e.target.value.length);
              }}
              className="w-full px-3.5 py-2.5 text-xs font-mono border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 leading-relaxed"
              placeholder="Extracted resume text appears here..."
            />
          </div>

          {/* Quick Summary of Detected Sections */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block">Identified Name:</span>
              <strong className="text-slate-800 truncate block">
                {parsedSections?.contact_info?.name || "Not detected"}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block">Education Entries:</span>
              <strong className="text-slate-800 block">
                {parsedSections?.education?.length || 0} degrees
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block">Experience Entries:</span>
              <strong className="text-slate-800 block">
                {parsedSections?.experience?.length || 0} positions
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block">Skills Extracted:</span>
              <strong className="text-slate-800 block">
                {(parsedSections?.skills?.technical?.length || 0) + (parsedSections?.skills?.languages?.length || 0)} skills
              </strong>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end items-center gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={handleOpenInEditor}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold transition flex items-center justify-center space-x-1.5"
            >
              <FileText className="w-4 h-4 text-slate-500" />
              <span>Edit in Guided Resume Builder</span>
            </button>
            <button
              onClick={handleGoToMatch}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm flex items-center justify-center space-x-1.5"
            >
              <span>Proceed to Job Matcher</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
