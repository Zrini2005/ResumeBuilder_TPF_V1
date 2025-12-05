import React from 'react';

const LoginPage = ({ onGetStarted, onHelpClick }: { onGetStarted: () => void; onHelpClick: () => void }) => {
  return (
    <div className="relative min-h-screen bg-white overflow-hidden font-sans selection:bg-teal-100 flex flex-col">
      
      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-end px-6 py-6 max-w-7xl mx-auto w-full">
        <button 
            onClick={onHelpClick}
            className="text-slate-600 hover:text-slate-900 transition-colors" 
            aria-label="Help"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
               <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </button>
      </nav>

      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-5%] w-[50vw] h-[50vw] bg-[#FDF6B2] rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob"></div>
      <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[#99F6E4] rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[10%] w-[50vw] h-[50vw] bg-[#FF7E67] rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob animation-delay-4000"></div>

      {/* Center White Tinge/Glow */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white rounded-full blur-[80px] opacity-60 z-0 pointer-events-none"></div>

      {/* Hero Section */}
      <div className="relative z-10 flex-grow flex flex-col justify-center items-center px-6 text-center">
        <div className="max-w-4xl mx-auto">
            {/* Branding - ResuMate */}
            <div className="flex justify-center items-center gap-3 mb-8">
            <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-lg transform rotate-[-5deg]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            </div>
            <span className="text-4xl font-extrabold text-slate-900 tracking-tight">ResuMate</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-tight mb-6 tracking-tight">
                Build your resume <br />
                <span className="text-slate-800">in minutes.</span>
            </h1>
            
            <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                Create professional, ATS-friendly resumes with our real-time builder. 
                Powered by AI to help you write impactful descriptions and stand out.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button 
                    onClick={onGetStarted}
                    className="px-8 py-4 bg-[#2EC4B6] hover:bg-[#25a599] text-white text-lg font-bold rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center gap-3 min-w-[200px] justify-center"
                >
                    <span>Get Started</span>
                </button>
            </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-slate-500 text-sm font-medium">
        Made with ❤️ by TPF-NITT
      </footer>

       {/* CSS for blob animation */}
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
};

export default LoginPage;