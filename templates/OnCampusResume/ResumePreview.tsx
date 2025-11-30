import React, { forwardRef } from 'react';
import type { ResumeData } from '../../types';

interface ResumePreviewProps {
  resumeData: ResumeData;
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
  splittable?: boolean;
}

// === CONFIGURATION ===
// Adjust this value to change the vertical alignment of the section header 
// relative to the maroon line. Higher values move the text higher up.
const HEADER_BOTTOM_PADDING = '4px'; 

const Section: React.FC<SectionProps> = ({ title, children, splittable = false }) => (
    <div className="mb-6 break-inside-avoid" data-splittable={splittable}>
        <div className="flex items-center mb-1.5">
            <h2 
                className="text-xl font-bold pr-4 flex-shrink-0" 
                style={{ paddingBottom: HEADER_BOTTOM_PADDING }}
            >
                {title}
            </h2>
            <div className="flex-grow border-t-[4px]" style={{ borderColor: '#C00000' }}></div>
        </div>
        {children}
    </div>
);

const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(({ resumeData }, ref) => {
  const { personalDetails, education, internships, achievements, projects, skills, positions, activities } = resumeData;

  const renderHTML = (text: string) => {
      if (!text) return '';
      // First, replace newlines with <br />, then process <b> tags.
      // This ensures <b> tags within a line are preserved.
      let processedText = text.replace(/<b>/g, '<strong>').replace(/<\/b>/g, '</strong>');
      return processedText.replace(/\n/g, '<br />');
  }

  return (
    <div ref={ref} className="bg-white shadow-lg pt-10 px-10 pb-2 leading-relaxed w-[210mm] text-black" style={{ fontFamily: 'Lato, sans-serif' }}>
      <header className="flex items-start justify-between pb-4 text-[15px]">
        <div className="flex items-center flex-grow min-w-0">
            {personalDetails.logo && <img src={personalDetails.logo} alt="Institute Logo" className="h-36 w-36 mr-6 flex-shrink-0" />}
            <div className="flex-grow min-w-0">
                <h1 className="font-bold tracking-wide break-words text-[25px] leading-none mb-1">{personalDetails.name}</h1>
                <p>{personalDetails.degree}</p>
                <div className="leading-normal">
                    <p>Gender: {personalDetails.gender}</p>
                    <p>Date of Birth: {personalDetails.dob}</p>
                    <p>E-mail: {personalDetails.email}</p>
                    <p>Contact : {personalDetails.contact}</p>
                </div>
            </div>
        </div>
        {personalDetails.photo && <img src={personalDetails.photo} alt="Profile" className="h-[140px] w-[130px] object-cover border-2 border-black ml-4 flex-shrink-0" />}
      </header>

      <hr className="border-t-[3px] border-black mt-4 mb-2 -mx-10" />

      <main className="text-[15px] pt-2">
        {education && education.length > 0 && (
          <Section title="Educational Qualification">
            <div className="mt-3">
              <table className="w-full border-collapse border border-black text-black text-center text-[15px]">
                <thead>
                  <tr>
                    <th className="border border-black p-2 font-bold h-[0.5in]">Year</th>
                    <th className="border border-black p-2 font-bold h-[0.5in]">Degree/Examination</th>
                    <th className="border border-black p-2 font-bold h-[0.5in]">Institution/Board</th>
                    <th className="border border-black p-2 font-bold h-[0.5in]">CGPA/Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {education.map(edu => (
                    <tr key={edu.id}>
                      <td className="border border-black p-2 h-[0.5in]">{edu.year}</td>
                      <td className="border border-black p-2 h-[0.5in]">{edu.degree}</td>
                      <td className="border border-black p-2 h-[0.5in]">{edu.institution}</td>
                      <td className="border border-black p-2 h-[0.5in]">{edu.grade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        )}

        {achievements && achievements.length > 0 && (
          <Section title="Academic Achievements" splittable>
              <ul className="custom-bullet-list technical-skills-list space-y-1 text-[15px]">
                  {achievements.map(ach => (
                      <li key={ach.id} dangerouslySetInnerHTML={{ __html: ach.description }}></li>
                  ))}
              </ul>
          </Section>
        )}
        
        {internships && internships.length > 0 && (
            <Section title="Internship Experience" splittable>
                <ul className="custom-bullet-list technical-skills-list space-y-4 text-[15px]">
                    {internships.map(intern => (
                        <li key={intern.id}>
                            <div className="flex justify-between items-baseline">
                                <h3 className="font-bold text-[15px]">{intern.title}</h3>
                                <p className="flex-shrink-0 ml-4 text-right">{intern.date}</p>
                            </div>
                            <div dangerouslySetInnerHTML={{ __html: renderHTML(intern.description) }}></div>
                        </li>
                    ))}
                </ul>
            </Section>
        )}

        {projects && projects.length > 0 && (
            <Section title="Projects" splittable>
                <ul className="custom-bullet-list technical-skills-list space-y-4 text-[15px]">
                    {projects.map(proj => (
                        <li key={proj.id}>
                            <div className="flex justify-between items-baseline">
                                <h3 className="font-bold text-[15px]">{proj.name}</h3>
                                <p className="flex-shrink-0 ml-4 text-right">{proj.date}</p>
                            </div>
                            {proj.description.includes('\n') ? (
                                <ul className="custom-square-list mt-1">
                                    {proj.description.split('\n').filter(line => line.trim()).map((line, i) => (
                                        <li key={i} dangerouslySetInnerHTML={{ __html: line.replace(/<b>/g, '<strong>').replace(/<\/b>/g, '</strong>') }}></li>
                                    ))}
                                </ul>
                            ) : (
                                <div dangerouslySetInnerHTML={{ __html: renderHTML(proj.description) }}></div>
                            )}
                        </li>
                    ))}
                </ul>
            </Section>
        )}
        
        {skills && skills.length > 0 && (
            <Section title="Technical Skills and Certifications" splittable={false}>
                <ul className="custom-bullet-list technical-skills-list">
                    {skills.map(skill => (
                        <li key={skill.id} className="flex items-start">
                            <span className="w-56 flex-shrink-0 break-words">{skill.category}</span>
                            <span className="mx-2 flex-shrink-0">:</span>
                            <span className="flex-1 break-words">{skill.skills}</span>
                        </li>
                    ))}
                </ul>
            </Section>
        )}
        
        {positions && positions.length > 0 && (
            <Section title="Positions of Responsibility" splittable>
                <ul className="custom-bullet-list technical-skills-list space-y-4 text-[15px]">
                    {positions.map(pos => (
                         <li key={pos.id}>
                            <div className="flex justify-between items-baseline">
                                <h3 className="font-bold text-[15px]">{pos.title}</h3>
                                <p className="flex-shrink-0 ml-4 text-right">{pos.date}</p>
                            </div>
                            <div dangerouslySetInnerHTML={{ __html: renderHTML(pos.description) }}></div>
                        </li>
                    ))}
                </ul>
            </Section>
        )}
        
        {activities && activities.some(act => act.description.trim() !== '') && (
            <Section title="Extracurricular Activities" splittable>
                <div className="space-y-3">
                    {activities.map(act => (
                        act.description.trim() !== '' && (
                            <div key={act.id}>
                                <h3 className="font-bold text-[15px]">{act.title}</h3>
                                <ul className="custom-bullet-list technical-skills-list mt-1">
                                    {act.description.split('\n').map((line, i) => (
                                       line.trim() !== '' && <li key={i} dangerouslySetInnerHTML={{ __html: line }}></li>
                                    ))}
                                </ul>
                            </div>
                        )
                    ))}
                </div>
            </Section>
        )}

      </main>
      
      <footer
        className="flex items-center justify-center text-center w-full"
        style={{ 
            fontFamily: 'Cambria, serif', 
            fontSize: '10pt', 
            color: '#808080',
            lineHeight: '1.2',
            paddingBottom: '20px' 
        }}
      >
        <div style={{ borderTop: '1px solid #808080', width: '130px', margin: '0 10px' }}></div>
        <div className="px-1">
            <p style={{ margin: 0 }}>Department of Training and Placement, NIT Trichy 620015</p>
            <p style={{ margin: 0 }}>Telephone : +91-431-2501081 | e-mail: tp@nitt.edu,</p>
            <p style={{ margin: 0 }}>tnp.nitt@gmail.com</p>
        </div>
        <div style={{ borderTop: '1px solid #808080', width: '130px', margin: '0 10px' }}></div>
      </footer>
    </div>
  );
});

export default ResumePreview;