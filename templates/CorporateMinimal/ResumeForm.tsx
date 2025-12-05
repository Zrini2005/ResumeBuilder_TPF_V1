import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import type { ResumeData } from '../../types';

interface ResumeFormProps {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
  photoFileInputRef: React.RefObject<HTMLInputElement>;
  logoFileInputRef: React.RefObject<HTMLInputElement>;
}

// Define specific keys that are arrays in ResumeData to ensure type safety
type DynamicSectionKey = 'education' | 'webLinks' | 'coursework' | 'projects' | 'achievements' | 'skills' | 'positions' | 'activities' | 'languages' | 'internships';

interface FormSectionProps {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
    icon?: React.ReactNode;
}

const FormSection: React.FC<FormSectionProps> = ({ title, children, defaultOpen = false, icon }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`mb-5 rounded-xl transition-all duration-300 border ${isOpen ? 'border-emerald-400 shadow-md bg-white ring-1 ring-emerald-100' : 'border-gray-200 shadow-sm hover:border-emerald-300 bg-white'}`}>
      <button 
        type="button" 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full flex items-center justify-between px-5 py-4 focus:outline-none group rounded-xl"
      >
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg transition-colors duration-300 ${isOpen ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500 group-hover:bg-emerald-50 group-hover:text-emerald-500'}`}>
                {icon || <div className="w-5 h-5 bg-gray-400 rounded-sm" />} 
            </div>
            <span className={`text-lg font-bold transition-colors ${isOpen ? 'text-gray-900' : 'text-gray-600 group-hover:text-gray-900'}`}>
                {title}
            </span>
        </div>
        
        <div className={`p-2 rounded-full transition-all duration-300 ${isOpen ? 'bg-emerald-50 text-emerald-600 rotate-180' : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100 group-hover:text-gray-600'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
        </div>
      </button>

      <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
            <div className="px-5 pb-5">
                <div className="h-px bg-gray-100 mb-5 mx-1"></div>
                {children}
            </div>
        </div>
      </div>
    </div>
  );
};

const Input: React.FC<{ label: string, value: string, name: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ label, value, name, onChange }) => (
  <div className="mb-4">
    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">{label}</label>
    <input 
        type="text" 
        name={name} 
        value={value} 
        onChange={onChange} 
        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all duration-200 bg-gray-50 focus:bg-white text-gray-800 text-base placeholder-gray-400 shadow-sm" 
        placeholder={`Enter ${label.toLowerCase()}`}
    />
  </div>
);

const TextArea: React.FC<{ label: string, value: string, name: string, rows?: number, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void }> = ({ label, value, name, rows = 3, onChange }) => (
  <div className="mb-4">
    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">{label}</label>
    <textarea 
        name={name} 
        value={value} 
        rows={rows} 
        onChange={onChange} 
        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all duration-200 bg-gray-50 focus:bg-white text-gray-800 text-base placeholder-gray-400 shadow-sm resize-y" 
        placeholder={`Enter ${label.toLowerCase()}`}
    />
  </div>
);

const ResumeForm: React.FC<ResumeFormProps> = ({ resumeData, setResumeData }) => {
  const [enhancingId, setEnhancingId] = useState<string | null>(null);

  const handlePersonalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setResumeData(prev => ({
      ...prev,
      personalDetails: { ...prev.personalDetails, [name]: value }
    }));
  };

  const handleDynamicChange = <K extends DynamicSectionKey>(section: K, id: string, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setResumeData(prev => ({
      ...prev,
      [section]: (prev[section] as any[]).map(item =>
        item.id === id ? { ...item, [name]: value } : item
      )
    }));
  };
  
  const addDynamicItem = <K extends DynamicSectionKey>(section: K, newItem: any) => {
    setResumeData(prev => ({
        ...prev,
        [section]: [...(prev[section] as any[]), newItem]
    }));
  };

  const removeDynamicItem = <K extends DynamicSectionKey>(section: K, id: string) => {
    setResumeData(prev => ({
      ...prev,
      [section]: (prev[section] as any[]).filter(item => item.id !== id)
    }));
  };

  const handleEnhanceWithAi = async <K extends 'projects' | 'positions' | 'internships'>(
    section: K,
    id: string,
    description: string
  ) => {
    if (!description.trim()) {
      alert("Please enter a description to enhance.");
      return;
    }
    setEnhancingId(id);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Rewrite and enhance the following professional experience description for a resume, making it more impactful, professional, and concise. Focus on action verbs and quantifiable results where possible based on the text. Do not add any new information. Keep the response as a single paragraph. Original description: "${description}"`,
      });
      
      const enhancedDescription = response.text.trim();

      setResumeData(prev => {
        const newSectionData = (prev[section] as any[]).map(item =>
          item.id === id ? { ...item, description: enhancedDescription } : item
        );
        return { ...prev, [section]: newSectionData };
      });

    } catch (error) {
      console.error("AI enhancement failed:", error);
      alert("Failed to enhance the description. Please try again.");
    } finally {
      setEnhancingId(null);
    }
  };

  return (
    <div className="p-4 bg-white relative">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Resume Editor</h1>
      
      <FormSection 
        title="Personal Details" 
        defaultOpen={true}
        icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
            </svg>
        }
      >
        <Input label="Full Name" name="name" value={resumeData.personalDetails.name} onChange={handlePersonalChange} />
        <Input label="Email" name="email" value={resumeData.personalDetails.email} onChange={handlePersonalChange} />
        <Input label="Contact" name="contact" value={resumeData.personalDetails.contact} onChange={handlePersonalChange} />
      </FormSection>

      <FormSection 
        title="Education"
        icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M12 14l9-5-9-5-9 5 9 5z" />
                <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
            </svg>
        }
      >
        {resumeData.education.map((edu) => (
          <div key={edu.id} className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
            <Input label="Institution" name="institution" value={edu.institution} onChange={(e) => handleDynamicChange('education', edu.id, e)} />
            <Input label="Degree" name="degree" value={edu.degree} onChange={(e) => handleDynamicChange('education', edu.id, e)} />
            <Input label="Date / Year" name="year" value={edu.year} onChange={(e) => handleDynamicChange('education', edu.id, e)} />
            <Input label="Grade / Aggregate" name="grade" value={edu.grade} onChange={(e) => handleDynamicChange('education', edu.id, e)} />
            <div className="flex justify-end">
                <button onClick={() => removeDynamicItem('education', edu.id)} className="px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 text-xs font-semibold shadow-sm transition-colors">Remove</button>
            </div>
          </div>
        ))}
        <button onClick={() => addDynamicItem('education', {id: crypto.randomUUID(), year: '', degree: '', institution: '', grade: ''})} className="mt-4 w-full py-2 border-2 border-dashed border-emerald-200 text-emerald-600 rounded-lg hover:bg-emerald-50 hover:border-emerald-300 transition-colors font-semibold text-sm">+ Add Education</button>
      </FormSection>

      <FormSection 
        title="Links"
        icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
        }
      >
          {resumeData.webLinks.map(link => (
              <div key={link.id} className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
                  <Input label="Name (e.g. Github)" name="name" value={link.name} onChange={(e) => handleDynamicChange('webLinks', link.id, e)} />
                  <Input label="URL / Handle" name="url" value={link.url} onChange={(e) => handleDynamicChange('webLinks', link.id, e)} />
                  <div className="flex justify-end">
                    <button onClick={() => removeDynamicItem('webLinks', link.id)} className="px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 text-xs font-semibold shadow-sm transition-colors">Remove</button>
                  </div>
              </div>
          ))}
          <button onClick={() => addDynamicItem('webLinks', {id: crypto.randomUUID(), name: '', url: ''})} className="mt-4 w-full py-2 border-2 border-dashed border-emerald-200 text-emerald-600 rounded-lg hover:bg-emerald-50 hover:border-emerald-300 transition-colors font-semibold text-sm">+ Add Link</button>
      </FormSection>

      <FormSection 
        title="Coursework"
        icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
        }
      >
          {resumeData.coursework.map(cw => (
               <div key={cw.id} className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
                  <Input label="Category (e.g. Undergraduate)" name="category" value={cw.category} onChange={(e) => handleDynamicChange('coursework', cw.id, e)} />
                  <TextArea label="Subjects (One per line)" name="subjects" rows={4} value={cw.subjects} onChange={(e) => handleDynamicChange('coursework', cw.id, e)} />
                  <div className="flex justify-end">
                    <button onClick={() => removeDynamicItem('coursework', cw.id)} className="px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 text-xs font-semibold shadow-sm transition-colors">Remove</button>
                  </div>
               </div>
          ))}
          <button onClick={() => addDynamicItem('coursework', {id: crypto.randomUUID(), category: '', subjects: ''})} className="mt-4 w-full py-2 border-2 border-dashed border-emerald-200 text-emerald-600 rounded-lg hover:bg-emerald-50 hover:border-emerald-300 transition-colors font-semibold text-sm">+ Add Coursework</button>
      </FormSection>

      <FormSection 
            title="Internship Experience"
            icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            }
       >
        {resumeData.internships.map((intern) => (
            <div key={intern.id} className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
                <Input label="Role Title" name="title" value={intern.title} onChange={(e) => handleDynamicChange('internships', intern.id, e)} />
                <Input label="Date" name="date" value={intern.date} onChange={(e) => handleDynamicChange('internships', intern.id, e)} />
                <TextArea label="Description" name="description" rows={4} value={intern.description} onChange={(e) => handleDynamicChange('internships', intern.id, e)} />
                <p className="text-xs text-gray-400 -mt-2 mb-2 ml-1">Use &lt;b&gt;text&lt;/b&gt; to make text bold.</p>
                <div className="flex items-center justify-between mt-3">
                    <button
                        onClick={() => handleEnhanceWithAi('internships', intern.id, intern.description)}
                        disabled={enhancingId === intern.id}
                        className="px-3 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-md hover:bg-emerald-100 disabled:opacity-50 flex items-center space-x-2 text-xs font-semibold"
                    >
                        {enhancingId === intern.id ? (<span>Enhancing...</span>) : <span>Enhance with AI</span>}
                    </button>
                    <button onClick={() => removeDynamicItem('internships', intern.id)} className="px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 text-xs font-semibold shadow-sm transition-colors">Remove</button>
                </div>
            </div>
        ))}
        <button onClick={() => addDynamicItem('internships', {id: crypto.randomUUID(), title: '', date: '', description: ''})} className="mt-4 w-full py-2 border-2 border-dashed border-emerald-200 text-emerald-600 rounded-lg hover:bg-emerald-50 hover:border-emerald-300 transition-colors font-semibold text-sm">+ Add Internship</button>
       </FormSection>

      <FormSection 
        title="Projects"
        icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
        }
      >
        {resumeData.projects.map((proj) => (
            <div key={proj.id} className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
                <Input label="Project Name | Tech Stack" name="name" value={proj.name} onChange={(e) => handleDynamicChange('projects', proj.id, e)} />
                <Input label="Date" name="date" value={proj.date} onChange={(e) => handleDynamicChange('projects', proj.id, e)} />
                <TextArea label="Description" name="description" rows={4} value={proj.description} onChange={(e) => handleDynamicChange('projects', proj.id, e)} />
                <p className="text-xs text-gray-400 -mt-2 mb-2 ml-1">Use &lt;b&gt;text&lt;/b&gt; to make text bold.</p>
                <div className="flex items-center justify-between mt-3">
                     <button
                        onClick={() => handleEnhanceWithAi('projects', proj.id, proj.description)}
                        disabled={enhancingId === proj.id}
                        className="px-3 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-md hover:bg-emerald-100 disabled:opacity-50 flex items-center space-x-2 text-xs font-semibold"
                    >
                        {enhancingId === proj.id ? (<span>Enhancing...</span>) : <span>Enhance with AI</span>}
                    </button>
                    <button onClick={() => removeDynamicItem('projects', proj.id)} className="px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 text-xs font-semibold shadow-sm transition-colors">Remove</button>
                </div>
            </div>
        ))}
        <button onClick={() => addDynamicItem('projects', {id: crypto.randomUUID(), name: '', date: '', description: ''})} className="mt-4 w-full py-2 border-2 border-dashed border-emerald-200 text-emerald-600 rounded-lg hover:bg-emerald-50 hover:border-emerald-300 transition-colors font-semibold text-sm">+ Add Project</button>
       </FormSection>

       <FormSection 
        title="Achievements and Interests"
        icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
        }
       >
        {resumeData.achievements.map((ach) => (
            <div key={ach.id} className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
                <TextArea label="Description" name="description" value={ach.description} onChange={(e) => handleDynamicChange('achievements', ach.id, e)} />
                <p className="text-xs text-gray-400 -mt-2 mb-2 ml-1">Use &lt;b&gt;text&lt;/b&gt; to make text bold.</p>
                <div className="flex justify-end">
                    <button onClick={() => removeDynamicItem('achievements', ach.id)} className="px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 text-xs font-semibold shadow-sm transition-colors">Remove</button>
                </div>
            </div>
        ))}
        <button onClick={() => addDynamicItem('achievements', {id: crypto.randomUUID(), description: ''})} className="mt-4 w-full py-2 border-2 border-dashed border-emerald-200 text-emerald-600 rounded-lg hover:bg-emerald-50 hover:border-emerald-300 transition-colors font-semibold text-sm">+ Add Achievement</button>
       </FormSection>

        <FormSection 
            title="Skills"
            icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            }
        >
            {resumeData.skills.map(skill => (
                <div key={skill.id} className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
                    <Input label="Category (e.g. LANGUAGES)" name="category" value={skill.category} onChange={(e) => handleDynamicChange('skills', skill.id, e)} />
                    <TextArea label="Details" name="skills" value={skill.skills} onChange={(e) => handleDynamicChange('skills', skill.id, e)} />
                    <div className="flex justify-end">
                        <button onClick={() => removeDynamicItem('skills', skill.id)} className="px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 text-xs font-semibold shadow-sm transition-colors">Remove</button>
                    </div>
                </div>
            ))}
            <button onClick={() => addDynamicItem('skills', {id: crypto.randomUUID(), category: '', skills: ''})} className="mt-4 w-full py-2 border-2 border-dashed border-emerald-200 text-emerald-600 rounded-lg hover:bg-emerald-50 hover:border-emerald-300 transition-colors font-semibold text-sm">+ Add Skill</button>
        </FormSection>

        <FormSection 
            title="Positions of Responsibility"
            icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            }
        >
            {resumeData.positions.map(pos => (
                 <div key={pos.id} className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
                    <TextArea label="Description" name="description" value={pos.description} onChange={(e) => handleDynamicChange('positions', pos.id, e)} />
                    <p className="text-xs text-gray-400 -mt-2 mb-2 ml-1">Use &lt;b&gt;text&lt;/b&gt; to make text bold.</p>
                    <div className="flex justify-end">
                        <button onClick={() => removeDynamicItem('positions', pos.id)} className="px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 text-xs font-semibold shadow-sm transition-colors">Remove</button>
                    </div>
                 </div>
            ))}
             <button onClick={() => addDynamicItem('positions', {id: crypto.randomUUID(), title: '', date: '', description: ''})} className="mt-4 w-full py-2 border-2 border-dashed border-emerald-200 text-emerald-600 rounded-lg hover:bg-emerald-50 hover:border-emerald-300 transition-colors font-semibold text-sm">+ Add Position</button>
        </FormSection>

        <FormSection 
            title="Extracurricular Activities"
            icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
            }
        >
             {resumeData.activities.map(act => (
                 act.title === 'EXTRACURRICULAR ACTIVITIES' && (
                     <div key={act.id}>
                          <TextArea label="Description (One per line)" name="description" rows={5} value={act.description} onChange={(e) => handleDynamicChange('activities', act.id, e)} />
                          <p className="text-xs text-gray-400 -mt-2 mb-2 ml-1">Use &lt;b&gt;text&lt;/b&gt; to make text bold.</p>
                     </div>
                 )
             ))}
             {!resumeData.activities.some(a => a.title === 'EXTRACURRICULAR ACTIVITIES') && (
                 <button onClick={() => addDynamicItem('activities', {id: crypto.randomUUID(), title: 'EXTRACURRICULAR ACTIVITIES', description: ''})} className="mt-4 w-full py-2 border-2 border-dashed border-emerald-200 text-emerald-600 rounded-lg hover:bg-emerald-50 hover:border-emerald-300 transition-colors font-semibold text-sm">+ Add Extracurricular Section</button>
             )}
        </FormSection>

    </div>
  );
};

export default ResumeForm;