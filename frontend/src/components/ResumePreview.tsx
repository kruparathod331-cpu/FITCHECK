"use client";

import React from "react";
import { ResumeData } from "../types/resume";

interface ResumePreviewProps {
  resume: ResumeData;
  scale?: number;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({ resume }) => {
  const { contact_info, summary, education, experience, projects, skills, certifications, achievements, template } = resume;

  const tKey = (template || "modern").toLowerCase();
  const isMinimal = tKey === "minimal" || tKey === "modern-minimal";
  const isCreative = tKey === "creative";
  const isExecutive = tKey === "executive";
  const isTechnical = tKey === "technical" || tKey === "technical-ats";
  // Theme styling according to template
  const containerClass = "bg-white text-slate-900 p-8 sm:p-10 shadow-xl rounded-xl border border-slate-200 min-h-[900px] max-w-[800px] mx-auto leading-normal selection:bg-indigo-100 transition-all";
  let fontClass = "font-sans";
  let nameColorClass = "text-indigo-950";
  let headingColorClass = "text-indigo-900 border-indigo-200";
  let dateColorClass = "text-slate-500";
  let badgeClass = "bg-indigo-50 text-indigo-700 border-indigo-100";

  if (isMinimal) {
    nameColorClass = "text-slate-900";
    headingColorClass = "text-slate-800 border-slate-200";
    dateColorClass = "text-slate-500";
    badgeClass = "bg-slate-100 text-slate-700 border-slate-200";
  } else if (isCreative) {
    nameColorClass = "text-purple-950";
    headingColorClass = "text-purple-900 border-purple-200";
    dateColorClass = "text-purple-700";
    badgeClass = "bg-purple-50 text-purple-700 border-purple-200";
  } else if (isExecutive) {
    fontClass = "font-serif";
    nameColorClass = "text-slate-950 tracking-normal";
    headingColorClass = "text-slate-900 border-slate-300";
    dateColorClass = "text-slate-600";
    badgeClass = "bg-slate-100 text-slate-800 border-slate-300";
  } else if (isTechnical) {
    nameColorClass = "text-blue-950";
    headingColorClass = "text-blue-900 border-blue-200";
    dateColorClass = "text-blue-700";
    badgeClass = "bg-blue-50 text-blue-700 border-blue-200 font-mono text-[10px]";
  }

  const renderContactInfo = () => {
    const parts = [
      contact_info?.email,
      contact_info?.phone,
      contact_info?.location,
      contact_info?.linkedin ? contact_info.linkedin.replace(/^https?:\/\/(www\.)?/, "") : null,
      contact_info?.github ? contact_info.github.replace(/^https?:\/\/(www\.)?/, "") : null,
      contact_info?.portfolio ? contact_info.portfolio.replace(/^https?:\/\/(www\.)?/, "") : null,
    ].filter(Boolean);

    return (
      <header className={`text-center pb-4 mb-2 ${isCreative ? "border-b-2 border-purple-500" : "border-b border-slate-200"}`}>
        {isCreative && (
          <div className="w-12 h-1 bg-gradient-to-r from-purple-600 to-indigo-600 mx-auto mb-2 rounded-full"></div>
        )}
        <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${nameColorClass}`}>
          {contact_info?.name || "Your Full Name"}
        </h1>
        {parts.length > 0 && (
          <p className="text-xs text-slate-600 mt-1.5 font-medium space-x-1.5 flex flex-wrap justify-center items-center">
            {parts.map((p, idx) => (
              <span key={idx} className="inline-flex items-center">
                {idx > 0 && <span className="mx-1.5 text-slate-300">•</span>}
                <span>{p}</span>
              </span>
            ))}
          </p>
        )}
      </header>
    );
  };

  const renderSectionHeader = (title: string) => (
    <div className={`mt-4 mb-2 border-b pb-1 ${headingColorClass}`}>
      <h2 className={`text-xs font-bold tracking-wider uppercase flex items-center justify-between ${isExecutive ? "font-serif text-slate-900 font-black text-sm" : ""}`}>
        <span>{title}</span>
        {isTechnical && (
          <span className="text-[10px] font-mono lowercase text-blue-600 font-normal">#{title.toLowerCase().replace(/\s+/g, "_")}</span>
        )}
      </h2>
    </div>
  );

  const renderSummary = () => {
    if (!summary?.trim()) return null;
    return (
      <section>
        {renderSectionHeader("Professional Summary")}
        <p className="text-[11.5px] leading-relaxed text-slate-800 text-justify">
          {summary}
        </p>
      </section>
    );
  };

  const renderEducation = () => {
    if (!education || education.length === 0) return null;
    return (
      <section>
        {renderSectionHeader("Education")}
        <div className="space-y-2.5">
          {education.map((item, idx) => (
            <div key={item.id || idx} className="text-[11.5px]">
              <div className="flex justify-between items-baseline font-semibold text-slate-900">
                <span>
                  {item.institution}
                  {item.location && <span className="font-normal italic text-slate-500"> — {item.location}</span>}
                </span>
                <span className={`text-[11px] font-normal ${dateColorClass}`}>
                  {item.start_date} {item.start_date && item.end_date ? "–" : ""} {item.end_date}
                </span>
              </div>
              <div className="flex justify-between items-baseline text-slate-700">
                <span>
                  {item.degree}
                  {item.field && <span> in {item.field}</span>}
                  {item.gpa && <span className="font-medium text-slate-800"> (GPA: {item.gpa})</span>}
                </span>
              </div>
              {item.highlights && item.highlights.length > 0 && (
                <ul className="list-disc list-outside ml-4 mt-1 space-y-0.5 text-slate-700">
                  {item.highlights.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderSkills = () => {
    const hasSkills =
      skills &&
      ((skills.technical && skills.technical.length > 0) ||
        (skills.tools_frameworks && skills.tools_frameworks.length > 0) ||
        (skills.languages && skills.languages.length > 0) ||
        (skills.soft_skills && skills.soft_skills.length > 0));

    if (!hasSkills) return null;

    if (isTechnical || isCreative) {
      return (
        <section>
          {renderSectionHeader("Skills & Competencies")}
          <div className="space-y-2 text-[11.5px]">
            {skills.technical && skills.technical.length > 0 && (
              <div className="flex items-start gap-2">
                <span className="font-bold text-slate-900 min-w-[130px] pt-0.5">Technical:</span>
                <div className="flex flex-wrap gap-1.5 flex-1">
                  {skills.technical.map((s, i) => (
                    <span key={i} className={`px-2 py-0.5 rounded border text-[11px] ${badgeClass}`}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {skills.tools_frameworks && skills.tools_frameworks.length > 0 && (
              <div className="flex items-start gap-2">
                <span className="font-bold text-slate-900 min-w-[130px] pt-0.5">Tools & Cloud:</span>
                <div className="flex flex-wrap gap-1.5 flex-1">
                  {skills.tools_frameworks.map((s, i) => (
                    <span key={i} className={`px-2 py-0.5 rounded border text-[11px] ${badgeClass}`}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {skills.languages && skills.languages.length > 0 && (
              <div className="flex items-start gap-2">
                <span className="font-bold text-slate-900 min-w-[130px] pt-0.5">Languages:</span>
                <div className="flex flex-wrap gap-1.5 flex-1">
                  {skills.languages.map((s, i) => (
                    <span key={i} className={`px-2 py-0.5 rounded border text-[11px] ${badgeClass}`}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {skills.soft_skills && skills.soft_skills.length > 0 && (
              <div className="flex items-start gap-2">
                <span className="font-bold text-slate-900 min-w-[130px] pt-0.5">Competencies:</span>
                <span className="text-slate-700 pt-0.5">{skills.soft_skills.join(", ")}</span>
              </div>
            )}
          </div>
        </section>
      );
    }

    return (
      <section>
        {renderSectionHeader("Skills & Competencies")}
        <div className="text-[11.5px] space-y-1 text-slate-800 leading-snug">
          {skills.technical && skills.technical.length > 0 && (
            <div>
              <span className="font-bold text-slate-900">Technical Skills: </span>
              <span>{skills.technical.join(", ")}</span>
            </div>
          )}
          {skills.tools_frameworks && skills.tools_frameworks.length > 0 && (
            <div>
              <span className="font-bold text-slate-900">Tools & Frameworks: </span>
              <span>{skills.tools_frameworks.join(", ")}</span>
            </div>
          )}
          {skills.languages && skills.languages.length > 0 && (
            <div>
              <span className="font-bold text-slate-900">Languages: </span>
              <span>{skills.languages.join(", ")}</span>
            </div>
          )}
          {skills.soft_skills && skills.soft_skills.length > 0 && (
            <div>
              <span className="font-bold text-slate-900">Core Competencies: </span>
              <span>{skills.soft_skills.join(", ")}</span>
            </div>
          )}
        </div>
      </section>
    );
  };

  const renderExperience = () => {
    if (!experience || experience.length === 0) return null;
    return (
      <section>
        {renderSectionHeader("Professional Experience")}
        <div className="space-y-3.5">
          {experience.map((item, idx) => (
            <div key={item.id || idx} className="text-[11.5px]">
              <div className="flex justify-between items-baseline font-semibold text-slate-900">
                <span>
                  <strong className="font-bold text-slate-900">{item.title}</strong>
                  <span className="font-normal text-slate-600"> — {item.company}</span>
                  {item.location && <span className="font-normal italic text-slate-500"> ({item.location})</span>}
                </span>
                <span className={`text-[11px] font-normal ${dateColorClass}`}>
                  {item.start_date} {item.start_date && (item.end_date || item.is_current) ? "–" : ""}{" "}
                  {item.is_current ? "Present" : item.end_date}
                </span>
              </div>
              {item.bullets && item.bullets.length > 0 && (
                <ul className="list-disc list-outside ml-4 mt-1 space-y-0.5 text-slate-700">
                  {item.bullets.map((bullet, i) => (
                    <li key={i} className="leading-snug">{bullet}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderProjects = () => {
    if (!projects || projects.length === 0) return null;
    return (
      <section>
        {renderSectionHeader("Key Projects")}
        <div className="space-y-3">
          {projects.map((item, idx) => (
            <div key={item.id || idx} className="text-[11.5px]">
              <div className="flex justify-between items-baseline font-semibold text-slate-900">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-bold">{item.name}</span>
                  {item.role && <span className="font-normal italic text-slate-600"> | {item.role}</span>}
                  {item.technologies && item.technologies.length > 0 && (
                    <span className="font-normal text-slate-500 text-[11px]">
                      — ({item.technologies.join(", ")})
                    </span>
                  )}
                </div>
                <span className={`text-[11px] font-normal ${dateColorClass} whitespace-nowrap ml-2`}>
                  {item.start_date} {item.start_date && item.end_date ? "–" : ""} {item.end_date}
                </span>
              </div>
              {item.link && (
                <p className="text-[10.5px] text-indigo-600 hover:underline truncate mt-0.5">{item.link}</p>
              )}
              {item.bullets && item.bullets.length > 0 && (
                <ul className="list-disc list-outside ml-4 mt-1 space-y-0.5 text-slate-700">
                  {item.bullets.map((bullet, i) => (
                    <li key={i} className="leading-snug">{bullet}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderCertifications = () => {
    if (!certifications || certifications.length === 0) return null;
    return (
      <section>
        {renderSectionHeader("Certifications & Credentials")}
        <ul className="list-disc list-outside ml-4 mt-1 space-y-0.5 text-[11.5px] text-slate-800">
          {certifications.map((item, idx) => (
            <li key={item.id || idx}>
              <span className="font-bold">{item.name}</span>
              {item.issuer && <span> — {item.issuer}</span>}
              {item.date && <span className="text-slate-500"> ({item.date})</span>}
            </li>
          ))}
        </ul>
      </section>
    );
  };

  const renderAchievements = () => {
    if (!achievements || achievements.length === 0) return null;
    return (
      <section>
        {renderSectionHeader("Honors & Achievements")}
        <ul className="list-disc list-outside ml-4 mt-1 space-y-0.5 text-[11.5px] text-slate-800">
          {achievements.map((item, idx) => (
            <li key={item.id || idx}>
              <span className="font-bold">{item.title}</span>
              {item.issuer && <span> — {item.issuer}</span>}
              {item.date && <span className="text-slate-500"> ({item.date})</span>}
              {item.description && <p className="text-slate-600 text-[11px] mt-0.5">{item.description}</p>}
            </li>
          ))}
        </ul>
      </section>
    );
  };

  return (
    <div className={`${containerClass} ${fontClass}`}>
      {renderContactInfo()}
      {renderSummary()}
      {isTechnical ? (
        <>
          {renderSkills()}
          {renderProjects()}
          {renderExperience()}
          {renderEducation()}
          {renderCertifications()}
          {renderAchievements()}
        </>
      ) : isExecutive ? (
        <>
          {renderExperience()}
          {renderProjects()}
          {renderEducation()}
          {renderSkills()}
          {renderCertifications()}
          {renderAchievements()}
        </>
      ) : (
        <>
          {renderEducation()}
          {renderExperience()}
          {renderProjects()}
          {renderSkills()}
          {renderCertifications()}
          {renderAchievements()}
        </>
      )}
    </div>
  );
};
