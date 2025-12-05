import React from 'react';

interface StartOptionPageProps {
    onCreateNew: () => void;
    onUpload: () => void;
    onBack: () => void;
}

const StartOptionPage: React.FC<StartOptionPageProps> = ({ onCreateNew, onUpload, onBack }) => {
  return (
    <div className="relative min-h-screen bg-white overflow-hidden font-sans selection:bg-teal-100 flex flex-col">
       {/* Background Blobs (Consistent with Login/Template) */}
       <div className="absolute top-[-10%] left-[-5%] w-[50vw] h-[50vw] bg-[#FDF6B2] rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob"></div>
      <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[#99F6E4] rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[10%] w-[50vw] h-[50vw] bg-[#FF7E67] rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob animation-delay-4000"></div>
      
      <div className="relative z-10 flex-grow flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-10">
                 <button 
                    onClick={onBack}
                    className="flex items-center text-slate-500 hover:text-slate-800 transition-colors font-medium"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back
                </button>
            </div>

            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">How would you like to start?</h1>
                <p className="text-xl text-slate-600">Choose your preferred way to create your resume</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* Option 1: Create from Template */}
                <div 
                    onClick={onCreateNew}
                    className="group cursor-pointer bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl border border-slate-100 transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 bg-blue-100 text-blue-600 text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl">Recommended</div>
                    
                    <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>

                    <h2 className="text-2xl font-bold text-slate-900 mb-3">Create from Template</h2>
                    <p className="text-slate-500 mb-8 leading-relaxed">
                        Start fresh with one of our professionally designed templates. Perfect for creating a new resume from scratch.
                    </p>

                    <div className="space-y-2 mb-8 text-sm text-slate-500">
                        <div className="flex items-center">
                            <svg className="w-4 h-4 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                            Professional templates
                        </div>
                        <div className="flex items-center">
                            <svg className="w-4 h-4 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            Ready in 5 minutes
                        </div>
                    </div>

                    <div className="flex items-center text-blue-600 font-bold group-hover:text-blue-700">
                        Choose Template
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </div>
                </div>

                {/* Option 2: Upload Existing Resume */}
                <div 
                    onClick={onUpload}
                    className="group cursor-pointer bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl border border-slate-100 transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden"
                >
                     <div className="bg-emerald-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                    </div>

                    <h2 className="text-2xl font-bold text-slate-900 mb-3">Upload Existing Resume</h2>
                    <p className="text-slate-500 mb-8 leading-relaxed">
                        Already have a resume? Upload it and we'll extract the content so you can edit and enhance it with AI. Double check on the content once extracted!
                    </p>

                    <div className="space-y-2 mb-8 text-sm text-slate-500">
                        <div className="flex items-center">
                            <svg className="w-4 h-4 text-emerald-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                            Supports PDF
                        </div>
                        <div className="flex items-center">
                            <svg className="w-4 h-4 text-emerald-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                            AI-powered extraction
                        </div>
                    </div>

                     <div className="flex items-center text-emerald-600 font-bold group-hover:text-emerald-700">
                        Upload Resume
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-slate-500 text-sm font-medium">
        Made with ❤️ by TPF-NITT
      </footer>

       <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 10s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}

export default StartOptionPage;