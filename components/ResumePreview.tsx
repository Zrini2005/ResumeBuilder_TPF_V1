import React, { forwardRef } from 'react';
import type { ResumeData } from '../types';

interface ResumePreviewProps {
  resumeData: ResumeData;
}

const Section: React.FC<{ title: string, children: React.ReactNode, splittable?: boolean }> = ({ title, children, splittable = false }) => (
    <div className="mb-6 break-inside-avoid" data-splittable={splittable}>
        <div className="flex items-center mb-3">
            <h2 className="text-xl font-bold pr-4 flex-shrink-0">{title}</h2>
            <div className="flex-grow border-t-[4px] border-[#C00000]"></div>
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
    <div ref={ref} className="bg-white shadow-lg pt-16 px-10 pb-4 leading-relaxed w-[210mm] text-black">
      <header className="flex items-start justify-between pb-4 text-base">
        <div className="flex items-center flex-grow min-w-0">
            {personalDetails.logo && <img src={personalDetails.logo} alt="Institute Logo" className="h-36 w-36 mr-6 flex-shrink-0" />}
            <div className="flex-grow min-w-0">
                <h1 className="text-3xl font-bold tracking-wide break-words">{personalDetails.name}</h1>
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

      <hr className="border-t-[3px] border-black my-4 -mx-10" />

      <main className="text-base pt-6">
        {education && education.length > 0 && (
          <Section title="Educational Qualification">
            <div className="mt-2">
              <table className="w-full border-collapse border border-black text-black text-center text-base">
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
              <ul className="custom-bullet-list technical-skills-list space-y-1 text-base">
                  {achievements.map(ach => (
                      <li key={ach.id} dangerouslySetInnerHTML={{ __html: ach.description }}></li>
                  ))}
              </ul>
          </Section>
        )}
        
        {internships && internships.length > 0 && (
            <Section title="Internship Experience" splittable>
                <ul className="custom-bullet-list technical-skills-list space-y-4 text-base">
                    {internships.map(intern => (
                        <li key={intern.id}>
                            <div className="flex justify-between items-baseline">
                                <b className="font-bold">{intern.title}</b>
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
                <ul className="custom-bullet-list technical-skills-list space-y-4 text-base">
                    {projects.map(proj => (
                        <li key={proj.id}>
                            <div className="flex justify-between items-baseline">
                                <h3 className="font-bold">{proj.name}</h3>
                                <p className="flex-shrink-0 ml-4 text-right">{proj.date}</p>
                            </div>
                            <div dangerouslySetInnerHTML={{ __html: renderHTML(proj.description) }}></div>
                        </li>
                    ))}
                </ul>
            </Section>
        )}
        
        {skills && skills.length > 0 && (
            <Section title="Technical Skills and Certifications" splittable={false}>
                <ul className="custom-bullet-list technical-skills-list">
                    {skills.map(skill => (
                        <li key={skill.id}>
                            <span className="inline-block w-56">{skill.category}</span>
                            <span>: {skill.skills}</span>
                        </li>
                    ))}
                </ul>
            </Section>
        )}
        
        {positions && positions.length > 0 && (
            <Section title="Positions of Responsibility" splittable>
                <ul className="custom-bullet-list technical-skills-list space-y-4 text-base">
                    {positions.map(pos => (
                         <li key={pos.id}>
                            <div className="flex justify-between items-baseline">
                                <h3 className="font-bold text-base">{pos.title}</h3>
                                <p className="flex-shrink-0 ml-4 text-right">{pos.date}</p>
                            </div>
                            <div dangerouslySetInnerHTML={{ __html: renderHTML(pos.description) }}></div>
                        </li>
                    ))}
                </ul>
            </Section>
        )}
        
        {activities && activities.length > 0 && (
            <Section title="Extracurricular Activities" splittable>
                {activities.map(act => (
                    <div key={act.id} className="mb-3">
                        <h3 className="font-bold text-base">{act.title}</h3>
                        <ul className="custom-bullet-list technical-skills-list mt-1">
                            {act.description.split('\n').map((line, i) => (
                               line && <li key={i} dangerouslySetInnerHTML={{ __html: line }}></li>
                            ))}
                        </ul>
                    </div>
                ))}
            </Section>
        )}

      </main>
      
      <footer
        className="flex items-center justify-center text-center text-gray-500 leading-tight mt-2"
        style={{ fontFamily: 'Cambria, serif', fontSize: '10pt' }}
      >
        <div className="border-t border-gray-400 w-32"></div>
        <div className="px-4">
            <p>Department of Training and Placement, NIT Trichy 620015</p>
            <p>Telephone : +91-431-2501081 | e-mail: tp@nitt.edu,</p>
            <p>tnp.nitt@gmail.com</p>
        </div>
        <div className="border-t border-gray-400 w-32"></div>
      </footer>
    </div>
  );
});

export default ResumePreview;