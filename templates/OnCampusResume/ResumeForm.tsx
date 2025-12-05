import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import type { ResumeData } from '../../types';

interface ResumeFormProps {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
  photoFileInputRef: React.RefObject<HTMLInputElement>;
  logoFileInputRef: React.RefObject<HTMLInputElement>;
}

type DynamicSectionKey = Exclude<keyof ResumeData, 'personalDetails' | 'activities'>;

interface FormSectionProps {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
    icon?: React.ReactNode;
}

const FormSection: React.FC<FormSectionProps> = ({ title, children, defaultOpen = false, icon }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`mb-5 rounded-xl transition-all duration-300 border ${isOpen ? 'border-blue-400 shadow-md bg-white ring-1 ring-blue-100' : 'border-gray-200 shadow-sm hover:border-blue-300 bg-white'}`}>
      <button 
        type="button" 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full flex items-center justify-between px-5 py-4 focus:outline-none group rounded-xl"
      >
        <div className="flex items-center gap-3">
            {/* Icon Container */}
            <div className={`p-2 rounded-lg transition-colors duration-300 ${isOpen ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-500'}`}>
                {icon || <div className="w-5 h-5 bg-gray-400 rounded-sm" />} 
            </div>
            <span className={`text-lg font-bold transition-colors ${isOpen ? 'text-gray-900' : 'text-gray-600 group-hover:text-gray-900'}`}>
                {title}
            </span>
        </div>
        
        <div className={`p-2 rounded-full transition-all duration-300 ${isOpen ? 'bg-blue-50 text-blue-600 rotate-180' : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100 group-hover:text-gray-600'}`}>
            <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
            >
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
        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white text-gray-800 text-base placeholder-gray-400 shadow-sm" 
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
        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white text-gray-800 text-base placeholder-gray-400 shadow-sm resize-y" 
        placeholder={`Enter ${label.toLowerCase()}`}
    />
  </div>
);

const ResumeForm: React.FC<ResumeFormProps> = ({ resumeData, setResumeData, photoFileInputRef, logoFileInputRef }) => {
  const [enhancingId, setEnhancingId] = useState<string | null>(null);
  
  // State for image cropping modal
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop>();
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [editingImageFor, setEditingImageFor] = useState<'photo' | 'logo' | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

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

  const handleDynamicChange = <K extends keyof ResumeData>(section: K, id: string, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setResumeData(prev => ({
      ...prev,
      [section]: (prev[section] as any[]).map(item =>
        item.id === id ? { ...item, [name]: value } : item
      )
    }));
  };
  
  const addDynamicItem = <K extends DynamicSectionKey>(section: K, newItem: ResumeData[K][number]) => {
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

  const handleSetNITTLogo = () => {
    const NITT_LOGO_URL = "/images/NITTLogo.png";
    setResumeData(prev => ({
        ...prev,
        personalDetails: { ...prev.personalDetails, logo: NITT_LOGO_URL }
    }));
  };

  // Image crop functions
  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>, imageType: 'photo' | 'logo') => {
    if (e.target.files && e.target.files.length > 0) {
      setEditingImageFor(imageType);
      setCrop(undefined); // Makes crop preview update between images.
      const reader = new FileReader();
      reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''));
      reader.readAsDataURL(e.target.files[0]);
      setIsCropModalOpen(true);
    }
  };

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    imgRef.current = e.currentTarget;
    const { width, height } = e.currentTarget;
    const aspect = editingImageFor === 'logo' ? 1 : 130 / 140;
    const crop = centerCrop(
      makeAspectCrop({ unit: '%', width: 90 }, aspect, width, height),
      width,
      height
    );
    setCrop(crop);
    setCompletedCrop(crop);
  }

  const handleCropImage = () => {
    if (!completedCrop || !imgRef.current) {
        return;
    }
    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    const pixelRatio = window.devicePixelRatio;
    canvas.width = completedCrop.width * scaleX * pixelRatio;
    canvas.height = completedCrop.height * scaleY * pixelRatio;
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
    );
    
    const base64Image = canvas.toDataURL('image/jpeg');
    const fieldToUpdate = editingImageFor;
    if (fieldToUpdate) {
        setResumeData(prev => ({
            ...prev,
            personalDetails: { ...prev.personalDetails, [fieldToUpdate]: base64Image }
        }));
    }

    setIsCropModalOpen(false);
    setImgSrc('');
    if(photoFileInputRef.current) photoFileInputRef.current.value = "";
    if(logoFileInputRef.current) logoFileInputRef.current.value = "";
  }

  return (
    <div className="p-4 bg-white relative">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Resume Editor</h1>
      
      <FormSection 
        title="Personal Details" 
        defaultOpen={true}
        icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
        }
      >
        <Input label="Full Name" name="name" value={resumeData.personalDetails.name} onChange={handlePersonalChange} />
        
        <div className="mb-4">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">Profile Photo</label>
          <input type="file" accept="image/*" onChange={(e) => onSelectFile(e, 'photo')} ref={photoFileInputRef} className="hidden" />
          <button 
            onClick={() => photoFileInputRef.current?.click()}
            className="w-full px-4 py-2.5 border border-dashed border-gray-300 rounded-lg hover:bg-gray-50 hover:border-blue-300 hover:text-blue-600 transition-all bg-white text-gray-600 text-sm font-medium"
          >
            Upload Photo
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">Institute Logo</label>
          <input type="file" accept="image/*" onChange={(e) => onSelectFile(e, 'logo')} ref={logoFileInputRef} className="hidden" />
          <div className="flex gap-2">
              <button 
                onClick={handleSetNITTLogo}
                className="w-1/2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-blue-300 hover:text-blue-600 transition-all bg-white text-gray-600 text-sm font-medium"
              >
                NITT Logo
              </button>
              <button 
                onClick={() => logoFileInputRef.current?.click()}
                className="w-1/2 px-4 py-2.5 border border-dashed border-gray-300 rounded-lg hover:bg-gray-50 hover:border-blue-300 hover:text-blue-600 transition-all bg-white text-gray-600 text-sm font-medium"
              >
                Upload Logo
              </button>
          </div>
        </div>

        <Input label="Degree" name="degree" value={resumeData.personalDetails.degree} onChange={handlePersonalChange} />
        <Input label="Gender" name="gender" value={resumeData.personalDetails.gender} onChange={handlePersonalChange} />
        <Input label="Date of Birth" name="dob" value={resumeData.personalDetails.dob} onChange={handlePersonalChange} />
        <Input label="Email" name="email" value={resumeData.personalDetails.email} onChange={handlePersonalChange} />
        <Input label="Contact" name="contact" value={resumeData.personalDetails.contact} onChange={handlePersonalChange} />
      </FormSection>
      
      <FormSection 
        title="Educational Qualification"
        icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M12 14l9-5-9-5-9 5 9 5z" />
                <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
            </svg>
        }
      >
        {resumeData.education.map((edu, index) => (
          <div key={edu.id} className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
            <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                Education
            </h3>
            <Input label="Year" name="year" value={edu.year} onChange={(e) => handleDynamicChange('education', edu.id, e)} />
            <Input label="Degree/Examination" name="degree" value={edu.degree} onChange={(e) => handleDynamicChange('education', edu.id, e)} />
            <Input label="Institution/Board" name="institution" value={edu.institution} onChange={(e) => handleDynamicChange('education', edu.id, e)} />
            <Input label="CGPA/Percentage" name="grade" value={edu.grade} onChange={(e) => handleDynamicChange('education', edu.id, e)} />
            <div className="flex justify-end">
                <button onClick={() => removeDynamicItem('education', edu.id)} className="px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 text-xs font-semibold shadow-sm transition-colors">Remove Education</button>
            </div>
          </div>
        ))}
        <button onClick={() => addDynamicItem('education', {id: crypto.randomUUID(), year: '', degree: '', institution: '', grade: ''})} className="mt-4 w-full py-2 border-2 border-dashed border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors font-semibold text-sm">+ Add Education</button>
      </FormSection>

       <FormSection 
            title="Academic Achievements"
            icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
            }
       >
        {resumeData.achievements.map((ach, index) => (
            <div key={ach.id} className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
                <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                    Achievement
                </h3>
                <TextArea label="Description" name="description" value={ach.description} onChange={(e) => handleDynamicChange('achievements', ach.id, e)} />
                <p className="text-xs text-gray-400 -mt-2 mb-2 ml-1">Use &lt;b&gt;text&lt;/b&gt; to make text bold.</p>
                <div className="flex justify-end">
                    <button onClick={() => removeDynamicItem('achievements', ach.id)} className="px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 text-xs font-semibold shadow-sm transition-colors">Remove Achievement</button>
                </div>
            </div>
        ))}
        <button onClick={() => addDynamicItem('achievements', {id: crypto.randomUUID(), description: ''})} className="mt-4 w-full py-2 border-2 border-dashed border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors font-semibold text-sm">+ Add Achievement</button>
       </FormSection>

       <FormSection 
            title="Internship Experience"
            icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            }
       >
        {resumeData.internships.map((intern, index) => (
            <div key={intern.id} className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
                <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                    Internship
                </h3>
                <Input label="Title" name="title" value={intern.title} onChange={(e) => handleDynamicChange('internships', intern.id, e)} />
                <Input label="Date" name="date" value={intern.date} onChange={(e) => handleDynamicChange('internships', intern.id, e)} />
                <TextArea label="Description" name="description" rows={5} value={intern.description} onChange={(e) => handleDynamicChange('internships', intern.id, e)} />
                <p className="text-xs text-gray-400 -mt-2 mb-2 ml-1">Use &lt;b&gt;text&lt;/b&gt; to make text bold.</p>
                <div className="flex items-center justify-between mt-3">
                    <button
                        onClick={() => handleEnhanceWithAi('internships', intern.id, intern.description)}
                        disabled={enhancingId === intern.id}
                        className="px-3 py-1.5 bg-purple-50 text-purple-600 border border-purple-200 rounded-md hover:bg-purple-100 disabled:opacity-50 flex items-center space-x-2 text-xs font-semibold shadow-sm transition-colors"
                    >
                        {enhancingId === intern.id ? (<span>Enhancing...</span>) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                                </svg>
                                <span>Enhance with AI</span>
                            </>
                        )}
                    </button>
                    <button onClick={() => removeDynamicItem('internships', intern.id)} className="px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 text-xs font-semibold shadow-sm transition-colors">Remove Internship</button>
                </div>
            </div>
        ))}
        <button onClick={() => addDynamicItem('internships', {id: crypto.randomUUID(), title: '', date: '', description: ''})} className="mt-4 w-full py-2 border-2 border-dashed border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors font-semibold text-sm">+ Add Internship</button>
       </FormSection>

       <FormSection 
            title="Projects"
            icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
            }
       >
        {resumeData.projects.map((proj, index) => (
            <div key={proj.id} className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
                <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                    Project
                </h3>
                <Input label="Name" name="name" value={proj.name} onChange={(e) => handleDynamicChange('projects', proj.id, e)} />
                <Input label="Date" name="date" value={proj.date} onChange={(e) => handleDynamicChange('projects', proj.id, e)} />
                <TextArea label="Description" name="description" rows={5} value={proj.description} onChange={(e) => handleDynamicChange('projects', proj.id, e)} />
                <p className="text-xs text-gray-400 -mt-2 mb-2 ml-1">Use &lt;b&gt;text&lt;/b&gt; to make text bold. Use a newline for bullet points.</p>
                <div className="flex items-center justify-between mt-3">
                     <button
                        onClick={() => handleEnhanceWithAi('projects', proj.id, proj.description)}
                        disabled={enhancingId === proj.id}
                        className="px-3 py-1.5 bg-purple-50 text-purple-600 border border-purple-200 rounded-md hover:bg-purple-100 disabled:opacity-50 flex items-center space-x-2 text-xs font-semibold shadow-sm transition-colors"
                    >
                        {enhancingId === proj.id ? (<span>Enhancing...</span>) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                                </svg>
                                <span>Enhance with AI</span>
                            </>
                        )}
                    </button>
                    <button onClick={() => removeDynamicItem('projects', proj.id)} className="px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 text-xs font-semibold shadow-sm transition-colors">Remove Project</button>
                </div>
            </div>
        ))}
        <button onClick={() => addDynamicItem('projects', {id: crypto.randomUUID(), name: '', date: '', description: ''})} className="mt-4 w-full py-2 border-2 border-dashed border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors font-semibold text-sm">+ Add Project</button>
       </FormSection>
        
        <FormSection 
            title="Technical Skills and Certifications"
            icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            }
        >
        {resumeData.skills.map((skill, index) => (
            <div key={skill.id} className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
                <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                    Skill
                </h3>
                <Input label="Category" name="category" value={skill.category} onChange={(e) => handleDynamicChange('skills', skill.id, e)} />
                <Input label="Skills" name="skills" value={skill.skills} onChange={(e) => handleDynamicChange('skills', skill.id, e)} />
                <div className="flex justify-end">
                    <button onClick={() => removeDynamicItem('skills', skill.id)} className="px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 text-xs font-semibold shadow-sm transition-colors">Remove Skill</button>
                </div>
            </div>
        ))}
        <button onClick={() => addDynamicItem('skills', {id: crypto.randomUUID(), category: '', skills: ''})} className="mt-4 w-full py-2 border-2 border-dashed border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors font-semibold text-sm">+ Add Skill</button>
       </FormSection>

       <FormSection 
            title="Positions of Responsibility"
            icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            }
       >
        {resumeData.positions.map((pos, index) => (
            <div key={pos.id} className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
                <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                    Position
                </h3>
                <Input label="Title" name="title" value={pos.title} onChange={(e) => handleDynamicChange('positions', pos.id, e)} />
                <Input label="Date" name="date" value={pos.date} onChange={(e) => handleDynamicChange('positions', pos.id, e)} />
                <TextArea label="Description" name="description" value={pos.description} onChange={(e) => handleDynamicChange('positions', pos.id, e)} />
                <p className="text-xs text-gray-400 -mt-2 mb-2 ml-1">Use &lt;b&gt;text&lt;/b&gt; to make text bold.</p>
                <div className="flex items-center justify-between mt-3">
                    <button
                        onClick={() => handleEnhanceWithAi('positions', pos.id, pos.description)}
                        disabled={enhancingId === pos.id}
                        className="px-3 py-1.5 bg-purple-50 text-purple-600 border border-purple-200 rounded-md hover:bg-purple-100 disabled:opacity-50 flex items-center space-x-2 text-xs font-semibold shadow-sm transition-colors"
                    >
                        {enhancingId === pos.id ? (<span>Enhancing...</span>) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                                </svg>
                                <span>Enhance with AI</span>
                            </>
                        )}
                    </button>
                    <button onClick={() => removeDynamicItem('positions', pos.id)} className="px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 text-xs font-semibold shadow-sm transition-colors">Remove Position</button>
                </div>
            </div>
        ))}
        <button onClick={() => addDynamicItem('positions', {id: crypto.randomUUID(), title: '', date: '', description: ''})} className="mt-4 w-full py-2 border-2 border-dashed border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors font-semibold text-sm">+ Add Position</button>
       </FormSection>
       
       <FormSection 
            title="Extracurricular Activities"
            icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
            }
       >
        {resumeData.activities.map((act) => (
          <div key={act.id} className="mb-4">
            <TextArea 
              label={act.title}
              name="description" 
              value={act.description} 
              onChange={(e) => handleDynamicChange('activities', act.id, e)} 
            />
            <p className="text-xs text-gray-400 -mt-2 mb-2 ml-1">Use a newline for bullet points. Use &lt;b&gt;text&lt;/b&gt; to make text bold.</p>
          </div>
        ))}
       </FormSection>

       {isCropModalOpen && (
         <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-lg max-w-2xl w-full">
              <h2 className="text-xl font-bold mb-4">Crop Your Image</h2>
              {imgSrc && (
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={editingImageFor === 'logo' ? 1 : 130 / 140}
                >
                  <img
                    ref={imgRef}
                    alt="Crop me"
                    src={imgSrc}
                    onLoad={onImageLoad}
                    style={{ maxHeight: '70vh' }}
                  />
                </ReactCrop>
              )}
              <div className="mt-4 flex justify-end space-x-2">
                <button onClick={() => setIsCropModalOpen(false)} className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400">Cancel</button>
                <button onClick={handleCropImage} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Crop & Save</button>
              </div>
            </div>
         </div>
       )}
    </div>
  );
};

export default ResumeForm;