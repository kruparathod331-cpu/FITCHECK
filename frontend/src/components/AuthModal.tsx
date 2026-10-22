"use client";

import React, { useState } from "react";
import { api } from "../services/api";
import { UserProfile } from "../types/resume";
import { LogIn, UserPlus, Sparkles, AlertCircle, X, ShieldCheck } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: "login" | "register";
  onClose: () => void;
  onAuthSuccess: (user: UserProfile) => void;
  onEnableDemo: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = "login",
  onClose,
  onAuthSuccess,
  onEnableDemo,
}) => {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMsg(null);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (mode === "login") {
        const res = await api.login(email, password);
        localStorage.setItem("fitcheck_token", res.access_token);
        onAuthSuccess(res.user);
        onClose();
      } else {
        const res = await api.register(email, password, fullName);
        localStorage.setItem("fitcheck_token", res.access_token);
        onAuthSuccess(res.user);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Authentication failed. Please verify credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-slate-400 hover:text-slate-700 text-lg p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-sm">
            {mode === "login" ? <LogIn className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
          </div>
          <h3 className="text-xl font-black text-slate-900">
            {mode === "login" ? "Sign in to FitCheck" : "Create your FitCheck Account"}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Securely save your resumes, snapshots, and ATS match reports.
          </p>
        </div>

        {/* 1-Click Demo Shortcut */}
        <div className="mb-5">
          <button
            type="button"
            onClick={() => {
              onEnableDemo();
              onClose();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-50 to-sky-50 border border-indigo-200 hover:border-indigo-300 text-indigo-700 text-xs font-bold transition flex items-center justify-center space-x-2 group"
          >
            <Sparkles className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition" />
            <span>Instant Demo Mode (No Password Needed)</span>
          </button>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400 font-semibold text-[10px]">Or continue with email</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Alex Chen"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. you@university.edu"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {errorMsg && (
            <div className="flex items-center space-x-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 p-3 rounded-xl">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition shadow-sm disabled:opacity-50"
          >
            {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-5 text-center text-xs text-slate-500">
          {mode === "login" ? (
            <p>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setErrorMsg(null);
                }}
                className="text-indigo-600 font-bold hover:underline"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setErrorMsg(null);
                }}
                className="text-indigo-600 font-bold hover:underline"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
