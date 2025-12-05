import React, { useState, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { initialResumeData } from '../data/initialData';
import type { ResumeData } from '../types';

interface UploadResumePageProps {
  onUploadComplete: (data: ResumeData) => void;
  onBack: () => void;
}

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    try {
      return crypto.randomUUID();
    } catch (e) {
    }
  }
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

const UploadResumePage: React.FC<UploadResumePageProps> = ({ onUploadComplete, onBack }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    if (file.type !== 'application/pdf') {
      alert("Please upload a valid PDF file.");
      return;
    }

    setIsProcessing(true);

    try {
      const pdfjsLib = (window as any).pdfjsLib;
      if (!pdfjsLib) {
        throw new Error("PDF processing library not loaded. Please check your internet connection.");
      }

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join('\n');
        fullText += `--- Page ${i} ---\n${pageText}\n`;
      }

      if (!fullText.trim() || fullText.replace(/--- Page \d+ ---/g, '').trim().length < 50) {
        throw new Error("Could not extract text from this PDF. It might be a scanned image or password protected. Please try a different file.");
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const schema = {
        type: Type.OBJECT,
        properties: {
          personalDetails: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, nullable: true },
              degree: { type: Type.STRING, nullable: true },
              gender: { type: Type.STRING, nullable: true },
              dob: { type: Type.STRING, nullable: true },
              email: { type: Type.STRING, nullable: true },
              contact: { type: Type.STRING, nullable: true },
              linkedin: { type: Type.STRING, nullable: true },
              github: { type: Type.STRING, nullable: true },
            },
          },
          summary: { type: Type.STRING, nullable: true },
          education: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                year: { type: Type.STRING, nullable: true },
                degree: { type: Type.STRING, nullable: true },
                institution: { type: Type.STRING, nullable: true },
                grade: { type: Type.STRING, nullable: true },
              },
            },
          },
          internships: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, nullable: true },
                date: { type: Type.STRING, nullable: true },
                description: { type: Type.STRING, nullable: true },
              },
            },
          },
          projects: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, nullable: true },
                date: { type: Type.STRING, nullable: true },
                description: { type: Type.STRING, nullable: true },
              },
            },
          },
          achievements: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                description: { type: Type.STRING, nullable: true },
              },
            },
          },
          skills: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING, nullable: true },
                skills: { type: Type.STRING, nullable: true },
              },
            },
          },
          languages: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                language: { type: Type.STRING, nullable: true },
                proficiency: { type: Type.STRING, nullable: true },
              },
            },
          },
          positions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, nullable: true },
                date: { type: Type.STRING, nullable: true },
                description: { type: Type.STRING, nullable: true },
              },
            },
          },
          activities: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, nullable: true },
                description: { type: Type.STRING, nullable: true },
              },
            },
          },
          webLinks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, nullable: true },
                url: { type: Type.STRING, nullable: true },
              },
            },
          },
          coursework: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING, nullable: true },
                subjects: { type: Type.STRING, nullable: true },
              },
            },
          },
          technicalAchievements: {
             type: Type.ARRAY,
             items: {
               type: Type.OBJECT,
               properties: {
                 year: { type: Type.STRING, nullable: true },
                 rank: { type: Type.STRING, nullable: true },
                 event: { type: Type.STRING, nullable: true },
               },
             },
          },
        },
      };

      const prompt = `Extract data from the following resume text.
      - Consolidate skills into categories if possible.
      - Extract a professional summary if present.
      - Extract languages known.
      - Extract Web Links (like Codechef, Github, etc) into the webLinks array.
      - Extract Coursework subjects categorized by degree/level if possible.
      - Extract Technical Achievements (Year, Rank/Position, Event Name).
      - Standardize 'activities' into: 'Social Activities', 'Cultural Activities', 'Sports Activities', 'Extracurricular Activities'.
      
      Resume Text:
      ${fullText}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: schema,
        }
      });

      const jsonText = response.text;
      if (!jsonText) throw new Error("AI response was empty.");

      const parsedData = JSON.parse(jsonText);

      const processList = (list: any[]) => {
        return list?.map(item => ({
            ...item,
            id: generateId(),
            description: item.description || '', 
            title: item.title || '',
            name: item.name || '',
            date: item.date || '',
            institution: item.institution || '',
            grade: item.grade || '',
            year: item.year || '',
            degree: item.degree || '',
            skills: item.skills || '',
            category: item.category || '',
            language: item.language || '',
            proficiency: item.proficiency || '',
            url: item.url || '',
            rank: item.rank || '',
            event: item.event || '',
            subjects: item.subjects || '',
        })) || [];
      };

      const standardizedActivities = [
          'Social Activities',
          'Cultural Activities',
          'Sports Activities'
      ].map(title => {
          const found = parsedData.activities?.find((a: any) => a.title === title) 
                        || parsedData.activities?.find((a: any) => a.title?.toLowerCase().includes(title.split(' ')[0].toLowerCase()));
          return {
              id: generateId(),
              title: title,
              description: found?.description || ''
          };
      });

      // Also keep general Extracurricular if found
      const extra = parsedData.activities?.find((a: any) => a.title?.toLowerCase().includes('extra'));
      if(extra) {
          standardizedActivities.push({
              id: generateId(),
              title: 'EXTRACURRICULAR ACTIVITIES',
              description: extra.description
          })
      }

      const finalData: ResumeData = {
          ...initialResumeData,
          personalDetails: {
              ...initialResumeData.personalDetails,
              ...parsedData.personalDetails,
              photo: initialResumeData.personalDetails.photo, 
              logo: initialResumeData.personalDetails.logo,
              linkedin: parsedData.personalDetails?.linkedin || '',
              github: parsedData.personalDetails?.github || '',
          },
          summary: parsedData.summary || '',
          education: processList(parsedData.education),
          internships: processList(parsedData.internships),
          projects: processList(parsedData.projects),
          achievements: processList(parsedData.achievements),
          skills: processList(parsedData.skills),
          positions: processList(parsedData.positions),
          activities: standardizedActivities,
          languages: processList(parsedData.languages),
          webLinks: processList(parsedData.webLinks),
          coursework: processList(parsedData.coursework),
          technicalAchievements: processList(parsedData.technicalAchievements),
      };
      
      onUploadComplete(finalData);

    } catch (error: any) {
      console.error("Error processing resume:", error);
      alert(`Error: ${error.message || "Failed to process the resume."}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
       <div className="fixed top-[-10%] left-[-5%] w-[50vw] h-[50vw] bg-[#FDF6B2] rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob pointer-events-none"></div>
      <div className="fixed top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[#99F6E4] rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-2000 pointer-events-none"></div>
      
      <div className="relative z-10 flex-grow flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
            <button 
                onClick={onBack}
                className="mb-8 flex items-center text-slate-500 hover:text-slate-800 transition-colors font-medium"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
            </button>

            <div className="bg-white rounded-3xl shadow-xl p-10 text-center border border-slate-100">
                <div className="bg-emerald-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                </div>
                
                <h1 className="text-3xl font-bold text-slate-900 mb-4">Upload your Resume</h1>
                <p className="text-slate-500 mb-8 max-w-md mx-auto">
                    Upload your existing PDF resume. We'll extract the details so you can skip the manual data entry.
                </p>

                <div 
                    className={`border-3 border-dashed rounded-2xl p-10 transition-all ${dragActive ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}
                    onDragEnter={handleDrag} 
                    onDragLeave={handleDrag} 
                    onDragOver={handleDrag} 
                    onDrop={handleDrop}
                >
                    {isProcessing ? (
                        <div className="flex flex-col items-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
                            <p className="text-lg font-semibold text-slate-700">Analyzing your resume...</p>
                        </div>
                    ) : (
                        <>
                            <p className="text-slate-700 font-medium mb-2">Drag and drop your PDF here</p>
                            <p className="text-slate-400 text-sm mb-6">or</p>
                            <button 
                                onClick={() => inputRef.current?.click()}
                                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-md transition-colors"
                            >
                                Browse Files
                            </button>
                            <input 
                                ref={inputRef}
                                type="file" 
                                className="hidden" 
                                accept=".pdf" 
                                onChange={handleChange}
                            />
                        </>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default UploadResumePage;