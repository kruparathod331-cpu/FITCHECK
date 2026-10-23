import { ResumeData, MatchReportData, UserProfile, SampleJob } from "../types/resume";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

function getAuthHeaders(extraHeaders: Record<string, string> = {}): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("fitcheck_token") : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...extraHeaders,
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 15000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return res;
  } catch (err: any) {
    if (err.name === "AbortError") {
      throw new Error(`Request to ${url} timed out after ${timeoutMs / 1000}s. Please check backend server responsiveness.`);
    }
    // Network / CORS / connection refused error
    throw new Error(`Unable to connect to the FitCheck backend server at ${API_BASE}. Please ensure the backend is running (python -m uvicorn app.main:app --port 8000).`);
  } finally {
    clearTimeout(timeoutId);
  }
}

async function handleResponse<T = any>(res: Response): Promise<T> {
  if (res.status === 401 && typeof window !== "undefined") {
    // Stale or invalid credentials: clear token
    // Do not clear if user is actively logging in
    if (!res.url.includes("/auth/login")) {
      localStorage.removeItem("fitcheck_token");
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({
      detail: res.statusText || `Request failed with HTTP status ${res.status}`
    }));
    throw new Error(err.detail || err.message || `Request failed (${res.status})`);
  }

  return res.json();
}

export const api = {
  // --- Auth Endpoints ---
  async login(email: string, password: string): Promise<{ access_token: string; user: UserProfile }> {
    const res = await fetchWithTimeout(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  },

  async register(email: string, password: string, full_name?: string): Promise<{ access_token: string; user: UserProfile }> {
    const res = await fetchWithTimeout(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, full_name }),
    });
    return handleResponse(res);
  },

  async getDemoAccount(): Promise<{ access_token: string; user: UserProfile }> {
    const res = await fetchWithTimeout(`${API_BASE}/auth/demo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    return handleResponse(res);
  },

  async getMe(): Promise<UserProfile | null> {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("fitcheck_token") : null;
      if (!token) return null;

      const res = await fetchWithTimeout(`${API_BASE}/auth/me`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  },

  // --- Resume Endpoints ---
  async getSampleResume(): Promise<ResumeData> {
    const res = await fetchWithTimeout(`${API_BASE}/resumes/sample`);
    return handleResponse(res);
  },

  async listResumes(): Promise<ResumeData[]> {
    const res = await fetchWithTimeout(`${API_BASE}/resumes/`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getResume(id: string): Promise<ResumeData> {
    const res = await fetchWithTimeout(`${API_BASE}/resumes/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async createResume(data: Partial<ResumeData>): Promise<ResumeData> {
    const res = await fetchWithTimeout(`${API_BASE}/resumes/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async updateResume(id: string, data: Partial<ResumeData>): Promise<ResumeData> {
    const res = await fetchWithTimeout(`${API_BASE}/resumes/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async deleteResume(id: string): Promise<void> {
    const res = await fetchWithTimeout(`${API_BASE}/resumes/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getResumeVersions(id: string): Promise<any[]> {
    const res = await fetchWithTimeout(`${API_BASE}/resumes/${id}/versions`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async restoreResumeVersion(resumeId: string, versionId: string): Promise<ResumeData> {
    const res = await fetchWithTimeout(`${API_BASE}/resumes/${resumeId}/versions/${versionId}/restore`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async uploadPdf(file: File): Promise<any> {
    const formData = new FormData();
    formData.append("file", file);

    const token = typeof window !== "undefined" ? localStorage.getItem("fitcheck_token") : null;
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetchWithTimeout(`${API_BASE}/resumes/upload-pdf`, {
      method: "POST",
      headers,
      body: formData,
    }, 30000); // 30s timeout for file upload
    return handleResponse(res);
  },

  exportPdfUrl(resumeId: string): string {
    return `${API_BASE}/resumes/${resumeId}/export-pdf`;
  },

  async fetchGithubInfo(url: string): Promise<any> {
    try {
      const res = await fetchWithTimeout(
        `${API_BASE}/resumes/github/fetch?url=${encodeURIComponent(url)}`,
        { headers: getAuthHeaders() },
        10000
      );
      return await handleResponse(res);
    } catch (_backendErr) {
      // Fallback directly to public GitHub API if backend is unreachable
      const cleanPath = url.replace(/^(?:https?:\/\/)?(?:www\.)?github\.com\//i, "").replace(/\/$/, "");
      const parts = cleanPath.split("/").filter(Boolean);
      if (parts.length >= 2) {
        const [owner, repo] = parts;
        const resp = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
        if (!resp.ok) throw new Error("Could not fetch repository from GitHub");
        const repoData = await resp.json();
        return {
          type: "repository",
          owner,
          repo,
          html_url: repoData.html_url,
          project: {
            id: `proj-gh-${Math.random().toString(36).substring(2, 9)}`,
            name: repoData.name,
            role: "Creator & Lead Developer",
            link: repoData.html_url,
            start_date: "",
            end_date: "",
            technologies: [repoData.language, ...(repoData.topics || [])].filter(Boolean),
            bullets: [
              repoData.description || `Open-source project on GitHub with ${repoData.stargazers_count} stars.`,
              `Architected and implemented project features using ${repoData.language || "modern tech stack"}.`
            ]
          }
        };
      } else if (parts.length === 1) {
        const [owner] = parts;
        const resp = await fetch(`https://api.github.com/users/${owner}`);
        if (!resp.ok) throw new Error("Could not fetch user profile from GitHub");
        const userData = await resp.json();
        return {
          type: "profile",
          username: owner,
          html_url: userData.html_url,
          contact_info: {
            name: userData.name || owner,
            github: userData.html_url,
            location: userData.location || "",
            portfolio: userData.blog || ""
          },
          summary_snippet: userData.bio || ""
        };
      }
      throw new Error("Invalid GitHub URL format");
    }
  },

  async exportPdfPreview(resumeData: Partial<ResumeData>): Promise<Blob> {
    const res = await fetchWithTimeout(`${API_BASE}/resumes/export-pdf-preview`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(resumeData),
    }, 20000);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Failed to generate PDF preview" }));
      throw new Error(err.detail || "Failed to generate PDF preview");
    }
    return res.blob();
  },

  // --- Matcher Endpoints ---
  async getSampleJobs(): Promise<SampleJob[]> {
    const res = await fetchWithTimeout(`${API_BASE}/matcher/sample-jobs`);
    return handleResponse(res);
  },

  async analyzeMatch(payload: {
    job_description: string;
    job_title?: string;
    job_company?: string;
    resume_id?: string;
    resume_text?: string;
    structured_resume?: any;
  }): Promise<MatchReportData> {
    const res = await fetchWithTimeout(`${API_BASE}/matcher/analyze`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    }, 25000);
    return handleResponse(res);
  },

  // --- Reports Endpoints ---
  async listReports(): Promise<any[]> {
    const res = await fetchWithTimeout(`${API_BASE}/reports/`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getReport(id: string): Promise<MatchReportData> {
    const res = await fetchWithTimeout(`${API_BASE}/reports/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async deleteReport(id: string): Promise<void> {
    const res = await fetchWithTimeout(`${API_BASE}/reports/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  }
};
