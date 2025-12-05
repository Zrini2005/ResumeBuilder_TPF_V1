import React from 'react';

const TemplateSelectionPage = ({ onSelect, onBack }: { onSelect: (id: 'on-campus' | 'modern-creative' | 'corporate-minimal') => void; onBack: () => void }) => {
  return (
    <div className="relative min-h-screen bg-white overflow-hidden font-sans selection:bg-teal-100 flex flex-col">
      
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-5%] w-[50vw] h-[50vw] bg-[#FDF6B2] rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob"></div>
      <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[#99F6E4] rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[10%] w-[50vw] h-[50vw] bg-[#FF7E67] rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob animation-delay-4000"></div>

      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white rounded-full blur-[80px] opacity-60 z-0 pointer-events-none"></div>

      <div className="relative z-10 p-6 md:p-12 max-w-7xl mx-auto flex-grow w-full">
        
        <div className="w-full mb-8">
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

        <div className="text-center mb-16">
            <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Choose a Template</h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">Select a design that best fits your profession and personality to start building.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Template 1 - The OnCampus One */}
          <div 
            onClick={() => onSelect('on-campus')}
            className="group cursor-pointer bg-white/80 backdrop-blur-md rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/50 hover:border-blue-500 transform hover:-translate-y-1 ring-1 ring-slate-900/5 p-8 flex flex-col h-full"
          >
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-6 group-hover:scale-110 transition-transform duration-300">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
               </svg>
            </div>
            
            <h3 className="font-bold text-2xl text-slate-900 mb-3">OnCampus Resume</h3>
            <p className="text-slate-500 leading-relaxed mb-8 flex-grow">A clean, professional format optimized for academic institutions. Perfect for engineering and research roles.</p>
            
            <div className="flex items-center text-blue-600 font-bold group-hover:text-blue-700">
                Select Template
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
            </div>
          </div>

          {/* Template 2 - Modern Creative */}
          <div 
             onClick={() => onSelect('modern-creative')}
             className="group cursor-pointer bg-white/80 backdrop-blur-md rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/50 hover:border-purple-500 transform hover:-translate-y-1 ring-1 ring-slate-900/5 p-8 flex flex-col h-full"
          >
             <div className="flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 text-purple-600 mb-6 group-hover:scale-110 transition-transform duration-300">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
               </svg>
             </div>
             <h3 className="font-bold text-2xl text-slate-900 mb-3">Modern Creative</h3>
             <p className="text-slate-500 leading-relaxed mb-8 flex-grow">A vibrant layout with accent colors and a sidebar. Ideal for creative professionals, designers, and developers.</p>
             
             <div className="flex items-center text-purple-600 font-bold group-hover:text-purple-700">
                Select Template
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
            </div>
          </div>
          
           {/* Template 3 - Corporate Minimal */}
           <div 
             onClick={() => onSelect('corporate-minimal')}
             className="group cursor-pointer bg-white/80 backdrop-blur-md rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/50 hover:border-emerald-500 transform hover:-translate-y-1 ring-1 ring-slate-900/5 p-8 flex flex-col h-full"
           >
             <div className="flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
             </div>
             <h3 className="font-bold text-2xl text-slate-900 mb-3">Corporate Minimal</h3>
             <p className="text-slate-500 leading-relaxed mb-8 flex-grow">A strictly business layout focusing on experience and skills, featuring a clear two-column structure.</p>
             
             <div className="flex items-center text-emerald-600 font-bold group-hover:text-emerald-700">
                Select Template
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
            </div>
          </div>

        </div>
      </div>
      
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

export default TemplateSelectionPage;