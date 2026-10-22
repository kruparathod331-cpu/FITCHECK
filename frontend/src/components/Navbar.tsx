"use client";

import React, { useState } from "react";
import { UserProfile } from "../types/resume";
import { 
  FileText, Sparkles, CheckCircle2, ShieldCheck, LogIn, LogOut, 
  Menu, X, LayoutTemplate, Briefcase, Info, ArrowRight, UserPlus
} from "lucide-react";

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string, sectionId?: string) => void;
  user: UserProfile | null;
  onOpenAuth: (mode?: "login" | "register") => void;
  onLogout: () => void;
  onEnableDemo: () => void;
  loadingDemo?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  user,
  onOpenAuth,
  onLogout,
  onEnableDemo,
  loadingDemo,
}) => {
  const [showTruthModal, setShowTruthModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (tab: string, sectionId?: string) => {
    onSelectTab(tab, sectionId);
    setMobileMenuOpen(false);
    if (sectionId && typeof window !== "undefined") {
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group" 
            onClick={() => handleNavClick("dashboard")}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-sky-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform duration-200">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  Fit<span className="text-indigo-600">Check</span>
                </span>
                <span className="hidden sm:inline-flex text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  ATS Verified
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">AI-Powered ATS Resume Builder</p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center space-x-1">
            <button
              onClick={() => handleNavClick("dashboard")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                currentTab === "dashboard"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick("dashboard", "features")}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
            >
              Features
            </button>
            <button
              onClick={() => handleNavClick("editor")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                currentTab === "editor"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              Resume Builder
            </button>
            <button
              onClick={() => handleNavClick("match")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                currentTab === "match"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              Job Matcher
            </button>
            <button
              onClick={() => handleNavClick("dashboard", "templates")}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
            >
              Templates
            </button>
            <button
              onClick={() => handleNavClick("dashboard", "about")}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
            >
              About
            </button>
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Truthfulness Badge info */}
            <button
              onClick={() => setShowTruthModal(true)}
              className="hidden xl:flex items-center space-x-1.5 px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition"
              title="FitCheck Truth-in-Hiring ATS standard"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Truthful ATS Policy</span>
            </button>

            {/* Demo Button */}
            {!user?.is_demo && (
              <button
                onClick={onEnableDemo}
                disabled={loadingDemo}
                className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>{loadingDemo ? "Loading Demo..." : "Explore Demo"}</span>
              </button>
            )}

            {user?.is_demo && (
              <span className="flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Demo Mode</span>
              </span>
            )}

            {/* Auth / Profile Actions */}
            {user ? (
              <div className="flex items-center space-x-2 border-l border-slate-200 pl-2.5 sm:pl-3">
                <span className="text-xs font-semibold text-slate-700 max-w-[120px] truncate" title={user.email}>
                  {user.full_name || user.email.split("@")[0]}
                </span>
                <button
                  onClick={onLogout}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onOpenAuth("login")}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuth("register")}
                  className="hidden sm:flex items-center space-x-1 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200 transition"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Responsive Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 shadow-xl animate-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-2 gap-2 pb-2">
              <button
                onClick={() => handleNavClick("dashboard")}
                className={`p-2.5 rounded-xl text-left text-xs font-bold flex items-center space-x-2 ${
                  currentTab === "dashboard" ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-700"
                }`}
              >
                <span>🏠 Home</span>
              </button>
              <button
                onClick={() => handleNavClick("editor")}
                className={`p-2.5 rounded-xl text-left text-xs font-bold flex items-center space-x-2 ${
                  currentTab === "editor" ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-700"
                }`}
              >
                <span>📝 Resume Builder</span>
              </button>
              <button
                onClick={() => handleNavClick("match")}
                className={`p-2.5 rounded-xl text-left text-xs font-bold flex items-center space-x-2 ${
                  currentTab === "match" ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-700"
                }`}
              >
                <span>🎯 Job Matcher</span>
              </button>
              <button
                onClick={() => handleNavClick("upload")}
                className={`p-2.5 rounded-xl text-left text-xs font-bold flex items-center space-x-2 ${
                  currentTab === "upload" ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-700"
                }`}
              >
                <span>📤 Upload PDF</span>
              </button>
            </div>

            <div className="border-t border-slate-100 pt-2 space-y-1">
              <button
                onClick={() => handleNavClick("dashboard", "features")}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 rounded-lg"
              >
                ✨ Features
              </button>
              <button
                onClick={() => handleNavClick("dashboard", "templates")}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 rounded-lg"
              >
                🎨 Resume Templates
              </button>
              <button
                onClick={() => handleNavClick("dashboard", "how-it-works")}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 rounded-lg"
              >
                ⚙️ How It Works
              </button>
              <button
                onClick={() => handleNavClick("dashboard", "about")}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 rounded-lg"
              >
                🛡️ Truthful ATS Policy
              </button>
            </div>

            {!user && (
              <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth("register");
                  }}
                  className="w-full py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl text-center shadow-sm"
                >
                  Create Free Account
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onEnableDemo();
                  }}
                  className="w-full py-2 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-xl text-center border border-indigo-200"
                >
                  Explore Demo Resume
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Truth in Hiring Modal */}
      {showTruthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative space-y-4">
            <button
              onClick={() => setShowTruthModal(false)}
              className="absolute right-5 top-5 text-slate-400 hover:text-slate-700 text-sm p-1 rounded-lg"
            >
              ✕
            </button>

            <div className="flex items-center space-x-2 text-emerald-600">
              <ShieldCheck className="w-6 h-6" />
              <h3 className="text-lg font-bold text-slate-900">Truth-in-Hiring ATS Standard</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Many resume platforms promote deceptive gimmicks: invisible white-text keyword stuffing, fake credentials, and opaque AI match scores that promise impossible results.
            </p>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2.5 text-xs text-slate-700">
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span><strong>Single-Column Strict Geometry:</strong> Eliminates table traps and multi-column parsing errors that scramble 40%+ of resumes in Workday, Greenhouse, and Taleo.</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span><strong>Explainable Keyword Analysis:</strong> We inspect resume content against job requirements using spaCy NLP and a transparent scoring formula.</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span><strong>No Fake Scores:</strong> We display actual verified coverage across required skills, education, and experience rather than fabricated percentages.</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowTruthModal(false)}
                className="px-5 py-2 text-xs font-bold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
