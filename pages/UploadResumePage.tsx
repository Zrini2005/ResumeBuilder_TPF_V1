import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { initialResumeData } from '../data/initialData';
import type { ResumeData } from '../types';

declare const pdfjsLib: any;

interface UploadResumePageProps {
  onUploadComplete: (data: ResumeData) => void;
  onBack: () => void;
}

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
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n';
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `You are a data extraction assistant. Parse the following resume text and structure it strictly according to this JSON format.
      
      JSON Structure:
      ${JSON.stringify(initialResumeData)}

      Instructions:
      1. Extract name, email, contact, education, experience, etc.
      2. Map them to the corresponding fields in the JSON.
      3. For arrays (education, internships, projects, etc.), create as many items as found in the text.
      4. Ensure dates and descriptions are preserved.
      5. Return ONLY the valid JSON string, no markdown formatting or backticks.
      
      Resume Text:
      ${fullText}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const responseText = response.text.trim().replace(/```json/g, '').replace(/```/g, '');
      const parsedData = JSON.parse(responseText);

      // Merge with initial structure to ensure type safety
      const finalData: ResumeData = {
          ...initialResumeData,
          ...parsedData,
          personalDetails: {
              ...initialResumeData.personalDetails,
              ...parsedData.personalDetails,
              // Keep default placeholders if extraction failed or returned empty
              photo: parsedData.personalDetails?.photo || initialResumeData.personalDetails.photo,
              logo: parsedData.personalDetails?.logo || initialResumeData.personalDetails.logo
          }
      };
      
      onUploadComplete(finalData);

    } catch (error) {
      console.error("Error processing resume:", error);
      alert("Failed to process the resume. Please try again or create from scratch.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
       {/* Background Blobs */}
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
                            <p className="text-sm text-slate-500">This uses AI and might take a few seconds.</p>
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