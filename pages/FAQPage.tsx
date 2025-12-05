import React, { useState } from 'react';

const FAQItem = ({ q, a }: { q: string, a: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-sm transition-all duration-300 ${isOpen ? 'bg-white/90 ring-1 ring-slate-200 shadow-md' : 'hover:bg-white/70'}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-6 flex justify-between items-center focus:outline-none group"
      >
        <h3 className={`text-lg font-bold pr-8 transition-colors ${isOpen ? 'text-blue-600' : 'text-slate-900 group-hover:text-slate-800'}`}>{q}</h3>
        <div className={`flex-shrink-0 ml-4 p-2 rounded-full transition-all duration-300 ${isOpen ? 'bg-blue-100 text-blue-600 rotate-180' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}`}>
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
        </div>
      </button>
      
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="px-6 pb-6 text-slate-600 leading-relaxed border-t border-slate-100/50 pt-4">
            {a}
        </div>
      </div>
    </div>
  );
};

const FAQPage = ({ onBack }: { onBack: () => void }) => {
  return (
    <div className="relative min-h-screen bg-white overflow-hidden font-sans selection:bg-teal-100 flex flex-col">
       {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-5%] w-[50vw] h-[50vw] bg-[#FDF6B2] rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob"></div>
      <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[#99F6E4] rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[10%] w-[50vw] h-[50vw] bg-[#FF7E67] rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob animation-delay-4000"></div>
      
      <div className="relative z-10 flex-grow flex flex-col p-6 md:p-12 max-w-4xl mx-auto w-full">
         <div className="w-full mb-8">
             <button 
                onClick={onBack}
                className="flex items-center text-slate-600 hover:text-slate-900 transition-colors font-medium"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
            </button>
        </div>

        <h1 className="text-4xl font-extrabold text-slate-900 mb-10 tracking-tight text-center">Frequently Asked Questions</h1>
        
        <div className="space-y-4 overflow-y-auto pb-10">
            {[
                {
                    q: "Is ResuMate free to use?",
                    a: "Yes, ResuMate is a completely free and open-source tool designed to help students generate professional resumes without any cost."
                },
                {
                    q: "Do I need to create an account or sign in?",
                    a: "No. We use a secure 'Stateless' architecture. You do not need to share your email, create a password, or log in. You can start building your resume immediately."
                },
                {
                    q: "Do you store my personal data or uploaded photos?",
                    a: "Absolutely not. Your data lives only in your browser while you are typing. When you click 'Download', the data is sent to our server solely to generate the PDF file and is immediately wiped from memory. We do not have a database."
                },
                {
                    q: "Can I save my progress and come back later?",
                    a: "Since we value privacy and do not store your data, closing the browser tab will result in losing your progress. We recommend keeping the tab open until you have downloaded the final PDF."
                },
                {
                    q: "Why does the download take a few seconds?",
                    a: "Unlike basic tools that take a screenshot, ResuMate spins up a real, high-fidelity browser engine on our server to ensure your fonts, margins, and layout are pixel-perfect. This high-quality rendering takes about 2-5 seconds."
                },
                {
                    q: "Why did I get a 'Timeout' error when downloading?",
                    a: "This usually happens if your Profile Photo or Institute Logo is extremely large (e.g., over 5MB). The server takes too long to process and download huge images. Please try compressing your images and uploading them again."
                },
                {
                    q: "Why does my resume have 3 pages instead of 2?",
                    a: "Our automated layout engine ensures text is never cut in half. If your content is slightly too long for 2 pages, it will push the excess content to a 3rd page. We recommend shortening your project descriptions or bullet points to fit the standard 2-page limit."
                },
                {
                    q: "Why is the AI Enhancement button not working?",
                    a: "The AI feature requires an active internet connection to communicate with Google's Gemini API. Also, ensure you have typed a basic description first; the AI needs something to read before it can improve it."
                }
            ].map((item, index) => (
                <FAQItem key={index} q={item.q} a={item.a} />
            ))}
        </div>
      </div>
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

export default FAQPage;