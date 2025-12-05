import React, { forwardRef } from 'react';
import type { ResumeData } from '../../types';

interface ResumePreviewProps {
  resumeData: ResumeData;
  themeColor: string;
}

// Pre-calculated colors to simulate opacity over the specific background themes.
// Corresponds to: 
// textPrimary: White @ 90% opacity
// textSecondary: White @ 60% opacity
// border: White @ 20% opacity
// tagBg: White @ 10% opacity
const THEME_PALETTES: Record<string, { textPrimary: string; textSecondary: string; border: string; tagBg: string }> = {
  '#0f172a': { textPrimary: '#E7E8EA', textSecondary: '#9FA2A9', border: '#3F4554', tagBg: '#272E3F' }, // Slate
  '#7f1d1d': { textPrimary: '#F2E8E8', textSecondary: '#CBA4A4', border: '#984A4A', tagBg: '#8B3333' }, // Maroon
  '#1e3a8a': { textPrimary: '#E8EBF3', textSecondary: '#A5B0D0', border: '#4B61A1', tagBg: '#344D95' }, // Dark Blue
  '#581c87': { textPrimary: '#EEE8F3', textSecondary: '#BCA4CF', border: '#79499F', tagBg: '#683293' }, // Purple
  '#134e4a': { textPrimary: '#E7EDEC', textSecondary: '#A0B8B6', border: '#42716E', tagBg: '#2A5F5C' }, // Teal
  '#000000': { textPrimary: '#E5E5E5', textSecondary: '#999999', border: '#333333', tagBg: '#191919' }, // Black
};

const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(({ resumeData, themeColor }, ref) => {
  const { personalDetails, education, internships, achievements, projects, skills, positions, activities, summary, languages } = resumeData;

  const renderHTML = (text: string) => {
      if (!text) return '';
      let processedText = text.replace(/<b>/g, '<strong>').replace(/<\/b>/g, '</strong>');
      return processedText.replace(/\n/g, '<br />');
  }

  // Fallback to Slate if themeColor isn't exact match (though it should be)
  const palette = THEME_PALETTES[themeColor] || THEME_PALETTES['#0f172a'];

  const sidebarStyle = { backgroundColor: themeColor };
  const textThemeStyle = { color: themeColor };
  // const borderThemeStyle = { borderColor: themeColor }; // No longer used directly on H2
  
  // Dynamic styles from palette
  const primaryTextStyle = { color: palette.textPrimary };
  const secondaryTextStyle = { color: palette.textSecondary };
  const headerBorderStyle = { borderColor: palette.border, color: palette.textSecondary };
  const tagStyle = { backgroundColor: palette.tagBg, color: palette.textPrimary };
  const photoBorderStyle = { borderColor: palette.border };

  return (
    <div ref={ref} className="flex w-full min-h-[297mm] text-black modern-creative-container" style={{ fontFamily: 'Lato, sans-serif' }}>
      
      {/* Sidebar - Left Column */}
      <div className="w-[35%] px-6 pb-6 flex flex-col min-h-full flex-shrink-0 print:bg-red-500 modern-creative-sidebar" style={sidebarStyle}>
          
          {/* Photo */}
          {personalDetails.photo && (
              <div className="mb-8 flex justify-center pt-6">
                  <img src={personalDetails.photo} alt="Profile" className="h-40 w-40 object-cover rounded-full border-4 shadow-xl" style={photoBorderStyle} />
              </div>
          )}

          {/* Contact Info */}
          <div className="mb-6">
              <h3 className="text-sm font-bold uppercase tracking-widest border-b pb-2 mb-3" style={headerBorderStyle}>Contact</h3>
              <div className="space-y-3 text-sm" style={primaryTextStyle}>
                  {personalDetails.email && (
                      <div className="flex items-center break-all">
                          <img src="https://img.icons8.com/ios-filled/50/FFFFFF/mail.png" alt="Email" className="w-4 h-4 mr-3 flex-shrink-0 modern-creative-contact-icon" crossOrigin="anonymous" />
                          <span>{personalDetails.email}</span>
                      </div>
                  )}
                  {personalDetails.contact && (
                      <div className="flex items-center">
                          <img src="https://img.icons8.com/ios-filled/50/FFFFFF/phone.png" alt="Phone" className="w-4 h-4 mr-3 flex-shrink-0 modern-creative-contact-icon" crossOrigin="anonymous" />
                          <span>{personalDetails.contact}</span>
                      </div>
                  )}
                  {personalDetails.dob && (
                       <div className="flex items-center">
                          <img src="https://img.icons8.com/ios-filled/50/FFFFFF/calendar.png" alt="DOB" className="w-4 h-4 mr-3 flex-shrink-0 modern-creative-contact-icon" crossOrigin="anonymous" />
                          <span>{personalDetails.dob}</span>
                       </div>
                  )}
                  {personalDetails.linkedin && (
                      <div className="flex items-center break-all">
                         <img src="https://img.icons8.com/ios-filled/50/FFFFFF/linkedin.png" alt="LinkedIn" className="w-4 h-4 mr-3 flex-shrink-0 modern-creative-contact-icon" crossOrigin="anonymous" />
                         <a href={personalDetails.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" style={{ color: 'inherit' }}>{personalDetails.linkedin}</a>
                      </div>
                  )}
                   {personalDetails.github && (
                      <div className="flex items-center break-all">
                         <img src="https://img.icons8.com/ios-filled/50/FFFFFF/github.png" alt="GitHub" className="w-4 h-4 mr-3 flex-shrink-0 modern-creative-contact-icon" crossOrigin="anonymous" />
                         <a href={personalDetails.github} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" style={{ color: 'inherit' }}>{personalDetails.github}</a>
                      </div>
                  )}
              </div>
          </div>

          {/* Education - Sidebar Style */}
          {education && education.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-bold uppercase tracking-widest border-b pb-2 mb-3" style={headerBorderStyle}>Education</h3>
                <div className="space-y-4">
                    {education.map((edu, idx) => (
                        <div key={idx}>
                            <h4 className="font-bold text-sm text-white">{edu.degree}</h4>
                            <p className="text-xs mb-1" style={primaryTextStyle}>{edu.institution}</p>
                            <div className="flex justify-between text-xs" style={secondaryTextStyle}>
                                <span>{edu.year}</span>
                                {edu.grade && <span>{edu.grade}</span>}
                            </div>
                        </div>
                    ))}
                </div>
              </div>
          )}

           {/* Skills - Tags */}
           {skills && skills.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-bold uppercase tracking-widest border-b pb-2 mb-3" style={headerBorderStyle}>Skills</h3>
                <div className="flex flex-wrap gap-2">
                     {skills.map((skillGroup, idx) => (
                         skillGroup.skills.split(',').map((skill, sIdx) => (
                             skill.trim() && (
                                <span key={`${idx}-${sIdx}`} className="px-2 py-1 text-xs rounded-md modern-creative-skill-tag" style={tagStyle}>
                                    {skill.trim()}
                                </span>
                             )
                         ))
                     ))}
                </div>
              </div>
          )}

          {/* Languages */}
           {languages && languages.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-bold uppercase tracking-widest border-b pb-2 mb-3" style={headerBorderStyle}>Languages</h3>
                <div className="space-y-2">
                    {languages.map((lang, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                            <span style={primaryTextStyle}>{lang.language}</span>
                            <span className="text-xs" style={secondaryTextStyle}>{lang.proficiency}</span>
                        </div>
                    ))}
                </div>
              </div>
          )}
      </div>

      {/* Main Content - Right Column */}
      <div className="w-[65%] px-6 pb-6 flex flex-col bg-white modern-creative-right-column pt-10">
          {/* Header */}
          <div className="mb-6">
              <h1 className="text-4xl font-black tracking-tight uppercase mb-2" style={textThemeStyle}>{personalDetails.name}</h1>
              <p className="text-xl text-slate-800 font-medium">{personalDetails.degree}</p>
          </div>

          {/* Professional Summary */}
          {summary && (
              <div className="mb-5">
                   <div className="flex mb-3">
                        <div className="w-1 mr-3 flex-shrink-0 modern-creative-section-border" style={{ backgroundColor: themeColor }}></div>
                        <h2 className="text-lg font-bold uppercase text-slate-800">Professional Summary</h2>
                   </div>
                   <p className="text-sm text-slate-600 leading-relaxed">
                       {summary}
                   </p>
              </div>
          )}

          {/* Internships */}
          {internships && internships.length > 0 && (
              <div className="mb-5">
                   <div className="flex mb-3">
                        <div className="w-1 mr-3 flex-shrink-0 modern-creative-section-border" style={{ backgroundColor: themeColor }}></div>
                        <h2 className="text-lg font-bold uppercase text-slate-800">Experience</h2>
                   </div>
                   <div className="space-y-5">
                       {internships.map((intern, idx) => (
                           <div key={idx}>
                               <div className="flex justify-between items-baseline mb-1">
                                   <h3 className="text-base font-bold" style={textThemeStyle}>{intern.title}</h3>
                                   <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded modern-creative-date">{intern.date}</span>
                               </div>
                               <div className="text-sm text-slate-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: renderHTML(intern.description) }}></div>
                           </div>
                       ))}
                   </div>
              </div>
          )}

          {/* Projects */}
          {projects && projects.length > 0 && (
              <div className="mb-5">
                   <div className="flex mb-3">
                        <div className="w-1 mr-3 flex-shrink-0 modern-creative-section-border" style={{ backgroundColor: themeColor }}></div>
                        <h2 className="text-lg font-bold uppercase text-slate-800">Projects</h2>
                   </div>
                   <div className="space-y-5">
                       {projects.map((proj, idx) => (
                           <div key={idx}>
                               <div className="flex justify-between items-baseline mb-1">
                                   <h3 className="text-base font-bold" style={textThemeStyle}>{proj.name}</h3>
                                   <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded modern-creative-date">{proj.date}</span>
                               </div>
                               <div className="text-sm text-slate-600 leading-relaxed">
                                   {proj.description.includes('\n') ? (
                                        <div className="space-y-1">
                                            {proj.description.split('\n').filter(line => line.trim()).map((line, i) => (
                                                <div key={i} dangerouslySetInnerHTML={{ __html: line.replace(/<b>/g, '<strong>').replace(/<\/b>/g, '</strong>') }}></div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div dangerouslySetInnerHTML={{ __html: renderHTML(proj.description) }}></div>
                                    )}
                               </div>
                           </div>
                       ))}
                   </div>
              </div>
          )}

           {/* Achievements */}
           {achievements && achievements.length > 0 && (
              <div className="mb-5">
                   <div className="flex mb-3">
                        <div className="w-1 mr-3 flex-shrink-0 modern-creative-section-border" style={{ backgroundColor: themeColor }}></div>
                        <h2 className="text-lg font-bold uppercase text-slate-800">Achievements</h2>
                   </div>
                   <div className="space-y-2 text-sm text-slate-600">
                      {achievements.map((ach, idx) => (
                          <div key={idx} dangerouslySetInnerHTML={{ __html: ach.description }}></div>
                      ))}
                   </div>
              </div>
          )}

           {/* Activities */}
           {activities && activities.some(act => act.description.trim() !== '') && (
               <div className="mb-5">
                    <div className="flex mb-3">
                        <div className="w-1 mr-3 flex-shrink-0 modern-creative-section-border" style={{ backgroundColor: themeColor }}></div>
                        <h2 className="text-lg font-bold uppercase text-slate-800">Activities</h2>
                   </div>
                    <div className="space-y-3">
                        {activities.map((act, idx) => (
                            act.description.trim() !== '' && (
                                <div key={idx}>
                                    <h3 className="text-sm font-bold text-slate-700 mb-1">{act.title}</h3>
                                    <div className="text-sm text-slate-600" dangerouslySetInnerHTML={{ __html: renderHTML(act.description) }}></div>
                                </div>
                            )
                        ))}
                    </div>
               </div>
           )}

      </div>
    </div>
  );
});

export default ResumePreview;