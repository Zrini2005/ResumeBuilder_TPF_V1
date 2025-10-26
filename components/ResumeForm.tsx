import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import type { ResumeData } from '../types';

interface ResumeFormProps {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
}

// FIX: Define a type for keys of ResumeData that correspond to array properties
// to ensure type safety in dynamic update functions.
type DynamicSectionKey = Exclude<keyof ResumeData, 'personalDetails'>;

const FormSection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
  <fieldset className="border border-gray-300 p-4 rounded-lg mb-6">
    <legend className="text-xl font-bold text-gray-700 px-2">{title}</legend>
    {children}
  </fieldset>
);

const Input: React.FC<{ label: string, value: string, name: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ label, value, name, onChange }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
    <input type="text" name={name} value={value} onChange={onChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white text-gray-800" />
  </div>
);

const TextArea: React.FC<{ label: string, value: string, name: string, rows?: number, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void }> = ({ label, value, name, rows = 3, onChange }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
    <textarea name={name} value={value} rows={rows} onChange={onChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white text-gray-800" />
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

  const handleDynamicChange = <K extends DynamicSectionKey>(section: K, id: string, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setResumeData(prev => ({
      ...prev,
      [section]: prev[section].map(item =>
        item.id === id ? { ...item, [name]: value } : item
      )
    }));
  };
  
  const addDynamicItem = <K extends DynamicSectionKey>(section: K, newItem: ResumeData[K][number]) => {
    setResumeData(prev => ({
        ...prev,
        [section]: [...prev[section], newItem]
    }));
  };

  const removeDynamicItem = <K extends DynamicSectionKey>(section: K, id: string) => {
    setResumeData(prev => ({
      ...prev,
      [section]: prev[section].filter(item => item.id !== id)
    }));
  };

  return (
    <div className="p-4 bg-white relative">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Resume Editor</h1>

      <FormSection title="Personal Details">
        <Input label="Full Name" name="name" value={resumeData.personalDetails.name} onChange={handlePersonalChange} />
        <Input label="Photo URL" name="photo" value={resumeData.personalDetails.photo} onChange={handlePersonalChange} />
        <Input label="Logo URL" name="logo" value={resumeData.personalDetails.logo} onChange={handlePersonalChange} />
        <Input label="Degree" name="degree" value={resumeData.personalDetails.degree} onChange={handlePersonalChange} />
        <Input label="Gender" name="gender" value={resumeData.personalDetails.gender} onChange={handlePersonalChange} />
        <Input label="Date of Birth" name="dob" value={resumeData.personalDetails.dob} onChange={handlePersonalChange} />
        <Input label="Email" name="email" value={resumeData.personalDetails.email} onChange={handlePersonalChange} />
        <Input label="Contact" name="contact" value={resumeData.personalDetails.contact} onChange={handlePersonalChange} />
      </FormSection>
      
      <FormSection title="Educational Qualification">
        {resumeData.education.map((edu, index) => (
          <div key={edu.id} className="border-b pb-4 mb-4">
            <h3 className="font-semibold text-md mb-2">Education #{index+1}</h3>
            <Input label="Year" name="year" value={edu.year} onChange={(e) => handleDynamicChange('education', edu.id, e)} />
            <Input label="Degree/Examination" name="degree" value={edu.degree} onChange={(e) => handleDynamicChange('education', edu.id, e)} />
            <Input label="Institution/Board" name="institution" value={edu.institution} onChange={(e) => handleDynamicChange('education', edu.id, e)} />
            <Input label="CGPA/Percentage" name="grade" value={edu.grade} onChange={(e) => handleDynamicChange('education', edu.id, e)} />
            <button onClick={() => removeDynamicItem('education', edu.id)} className="mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">Remove</button>
          </div>
        ))}
        <button onClick={() => addDynamicItem('education', {id: crypto.randomUUID(), year: '', degree: '', institution: '', grade: ''})} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Add Education</button>
      </FormSection>

       <FormSection title="Academic Achievements">
        {resumeData.achievements.map((ach, index) => (
            <div key={ach.id} className="border-b pb-4 mb-4">
                <h3 className="font-semibold text-md mb-2">Achievement #{index+1}</h3>
                <TextArea label="Description" name="description" value={ach.description} onChange={(e) => handleDynamicChange('achievements', ach.id, e)} />
                <p className="text-xs text-gray-500 -mt-2 mb-2 ml-1">Use &lt;b&gt;text&lt;/b&gt; to make text bold.</p>
                <button onClick={() => removeDynamicItem('achievements', ach.id)} className="mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">Remove</button>
            </div>
        ))}
        <button onClick={() => addDynamicItem('achievements', {id: crypto.randomUUID(), description: ''})} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Add Achievement</button>
       </FormSection>

       <FormSection title="Internship Experience">
        {resumeData.internships.map((intern, index) => (
            <div key={intern.id} className="border-b pb-4 mb-4">
                <h3 className="font-semibold text-md mb-2">Internship #{index+1}</h3>
                <Input label="Title" name="title" value={intern.title} onChange={(e) => handleDynamicChange('internships', intern.id, e)} />
                <Input label="Date" name="date" value={intern.date} onChange={(e) => handleDynamicChange('internships', intern.id, e)} />
                <TextArea label="Description" name="description" rows={5} value={intern.description} onChange={(e) => handleDynamicChange('internships', intern.id, e)} />
                <p className="text-xs text-gray-500 -mt-2 mb-2 ml-1">Use &lt;b&gt;text&lt;/b&gt; to make text bold.</p>
                <div className="flex items-center justify-between mt-2">
                    <button
                        onClick={() => handleEnhanceWithAi('internships', intern.id, intern.description)}
                        disabled={enhancingId === intern.id}
                        className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-purple-300 flex items-center space-x-2 text-sm"
                    >
                        {enhancingId === intern.id ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Enhancing...</span>
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                </svg>
                                <span>Enhance with AI</span>
                            </>
                        )}
                    </button>
                    <button onClick={() => removeDynamicItem('internships', intern.id)} className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm">Remove</button>
                </div>
            </div>
        ))}
        <button onClick={() => addDynamicItem('internships', {id: crypto.randomUUID(), title: '', date: '', description: ''})} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Add Internship</button>
       </FormSection>

       <FormSection title="Projects">
        {resumeData.projects.map((proj, index) => (
            <div key={proj.id} className="border-b pb-4 mb-4">
                <h3 className="font-semibold text-md mb-2">Project #{index+1}</h3>
                <Input label="Name" name="name" value={proj.name} onChange={(e) => handleDynamicChange('projects', proj.id, e)} />
                <Input label="Date" name="date" value={proj.date} onChange={(e) => handleDynamicChange('projects', proj.id, e)} />
                <TextArea label="Description" name="description" rows={5} value={proj.description} onChange={(e) => handleDynamicChange('projects', proj.id, e)} />
                <p className="text-xs text-gray-500 -mt-2 mb-2 ml-1">Use &lt;b&gt;text&lt;/b&gt; to make text bold.</p>
                <div className="flex items-center justify-between mt-2">
                    <button
                        onClick={() => handleEnhanceWithAi('projects', proj.id, proj.description)}
                        disabled={enhancingId === proj.id}
                        className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-purple-300 flex items-center space-x-2 text-sm"
                    >
                        {enhancingId === proj.id ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Enhancing...</span>
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                </svg>
                                <span>Enhance with AI</span>
                            </>
                        )}
                    </button>
                    <button onClick={() => removeDynamicItem('projects', proj.id)} className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm">Remove</button>
                </div>
            </div>
        ))}
        <button onClick={() => addDynamicItem('projects', {id: crypto.randomUUID(), name: '', date: '', description: ''})} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Add Project</button>
       </FormSection>

       <FormSection title="Technical Skills and Certifications">
        {resumeData.skills.map((skill, index) => (
            <div key={skill.id} className="border-b pb-4 mb-4">
                <h3 className="font-semibold text-md mb-2">Skill #{index+1}</h3>
                <Input label="Category" name="category" value={skill.category} onChange={(e) => handleDynamicChange('skills', skill.id, e)} />
                <Input label="Skills" name="skills" value={skill.skills} onChange={(e) => handleDynamicChange('skills', skill.id, e)} />
                <button onClick={() => removeDynamicItem('skills', skill.id)} className="mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">Remove</button>
            </div>
        ))}
        <button onClick={() => addDynamicItem('skills', {id: crypto.randomUUID(), category: '', skills: ''})} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Add Skill</button>
       </FormSection>

       <FormSection title="Positions of Responsibility">
        {resumeData.positions.map((pos, index) => (
            <div key={pos.id} className="border-b pb-4 mb-4">
                <h3 className="font-semibold text-md mb-2">Position #{index+1}</h3>
                <Input label="Title" name="title" value={pos.title} onChange={(e) => handleDynamicChange('positions', pos.id, e)} />
                <Input label="Date" name="date" value={pos.date} onChange={(e) => handleDynamicChange('positions', pos.id, e)} />
                <TextArea label="Description" name="description" value={pos.description} onChange={(e) => handleDynamicChange('positions', pos.id, e)} />
                <p className="text-xs text-gray-500 -mt-2 mb-2 ml-1">Use &lt;b&gt;text&lt;/b&gt; to make text bold.</p>
                <div className="flex items-center justify-between mt-2">
                    <button
                        onClick={() => handleEnhanceWithAi('positions', pos.id, pos.description)}
                        disabled={enhancingId === pos.id}
                        className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-purple-300 flex items-center space-x-2 text-sm"
                    >
                        {enhancingId === pos.id ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Enhancing...</span>
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                </svg>
                                <span>Enhance with AI</span>
                            </>
                        )}
                    </button>
                    <button onClick={() => removeDynamicItem('positions', pos.id)} className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm">Remove</button>
                </div>
            </div>
        ))}
        <button onClick={() => addDynamicItem('positions', {id: crypto.randomUUID(), title: '', date: '', description: ''})} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Add Position</button>
       </FormSection>
       
       <FormSection title="Extracurricular Activities">
        {resumeData.activities.map((act, index) => (
            <div key={act.id} className="border-b pb-4 mb-4">
                <h3 className="font-semibold text-md mb-2">Activity #{index+1}</h3>
                <Input label="Title" name="title" value={act.title} onChange={(e) => handleDynamicChange('activities', act.id, e)} />
                <TextArea label="Description (use newline for bullet points)" name="description" value={act.description} onChange={(e) => handleDynamicChange('activities', act.id, e)} />
                <p className="text-xs text-gray-500 -mt-2 mb-2 ml-1">Use &lt;b&gt;text&lt;/b&gt; to make text bold.</p>
                <button onClick={() => removeDynamicItem('activities', act.id)} className="mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">Remove</button>
            </div>
        ))}
        <button onClick={() => addDynamicItem('activities', {id: crypto.randomUUID(), title: '', description: ''})} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Add Activity</button>
       </FormSection>
    </div>
  );
};

export default ResumeForm;