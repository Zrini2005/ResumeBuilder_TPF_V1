import React, { useState, useRef } from 'react';
import ResumeForm from './components/ResumeForm';
import PaginatedResume from './components/PaginatedResume';
import type { ResumeData } from './types';

// Declare external libraries for TypeScript
declare const jspdf: any;
declare const html2canvas: any;

const initialResumeData: ResumeData = {
  personalDetails: {
    name: 'JOHN DOE',
    photo: 'https://via.placeholder.com/130x140.png?text=',
    degree: 'B.Tech - Computer Science and Engineering',
    gender: 'Male',
    dob: '06/09/2005',
    email: 'tp@nitt.edu',
    contact: '+91-431-2501081',
    logo: 'https://via.placeholder.com/144x144.png?text=',
  },
  education: [
    { id: 'edu1', year: '2023-Present', degree: 'B.Tech- CSE', institution: 'NIT, Trichy', grade: '9.2' },
    { id: 'edu2', year: '2023', degree: 'Class XII', institution: 'Delhi Public School, R. K. Puram', grade: '97.2%' },
    { id: 'edu3', year: '2021', degree: 'Class X', institution: 'Delhi Public School, R. K. Puram', grade: '98.8%' },
  ],
  internships: [
    {
      id: 'int1',
      title: 'Research Internship at Indian Institute of Technology Guwahati',
      date: 'Jun 2025 - Aug 2025',
      description: 'Working as a research intern on the project Air to Water Generator. I simulated a model in Dymola to extract water from humid air with the purpose of satisfying water requirements in coastal regions.',
    },
    {
      id: 'int2',
      title: 'Internship at AHODS Technologies Private Limited',
      date: 'Jan 2025 - Mar 2025',
      description: "Worked in the Research and Development team of AHODS Technologies on the project 'To increase hydrogen production for onboard application in vehicles' in collaboration Dr. K.K Pant of Chemical Engineering department of IIT Delhi.\nPerformed literature survey on different methods to improve hydrogen production through electrolysis and compared the different approaches based on energy requirement and sustainability to provide effective and cost-efficient solutions",
    },
  ],
  achievements: [
    { id: 'ach1', description: 'Secured <b>Rank 2</b> in Cyber Olympiad(IFCO) in the Zonal level conducted by International Olympiad Foundation in 2022.' },
    { id: 'ach2', description: 'Won <b>1st Place</b> at Smart India Hackathon 2024.' },
    { id: 'ach3', description: '<b>IBPC Meritorious Student Award</b> in 2021 and 2023.' },
  ],
  projects: [
    {
      id: 'proj1',
      name: 'RideNITT',
      date: 'January 2025 - March 2025',
      description: 'Developed a ride-sharing platform for students using React.js, Tailwind CSS, and Leaflet.js for routing. Built a secure Express.js backend with Prisma and PostgreSQL, featuring Google OAuth2 for authentication. Delivered a responsive, user-friendly interface, reducing load times by 30%.',
    },
    {
      id: 'proj2',
      name: 'Weather App',
      date: 'May 2025',
      description: 'Developed a Weather App that displays the weather of 3 cities on the home page. It also displays the weather of any city searched for in the search box. It displays temperature, feels like temperature, humidity, and wind speed. The front end is made using HTML, CSS, and JavaScript. The API used to get weather data is Weather API by WeatherAPI.com.',
    },
     {
      id: 'proj3',
      name: 'Chatty',
      date: 'June 2025',
      description: 'Built a real-time chat application with one-on-one messaging, notifications, and online user status. The frontend uses React.js and Tailwind CSS. The Node.js and Express backend handles user management and messaging with a MongoDB database. Implemented secure JWT authentication and used Socket.io for real-time message exchange.',
    },
  ],
  skills: [
      { id: 'skill1', category: 'Programming Languages', skills: 'C++, C, JavaScript, HTML, CSS' },
      { id: 'skill2', category: 'Frameworks/Libraries', skills: 'React.js, Socket.io' },
      { id: 'skill3', category: 'Tools', skills: 'Visual Studio Code, Git, GitHub, Node.js' },
      { id: 'skill4', category: 'Other Softwares', skills: 'Figma, Photoshop' },
  ],
  positions: [
    { id: 'pos1', title: 'Associate, The Product Folks NITT', date: 'May 2025-Present', description: 'As a member of the Product Management Club of NIT Trichy, I take part in upskilling sessions and work on case studies, projects, and product decks.'},
    { id: 'pos2', title: 'Manager, Marketing, Festember', date: 'Mar 2024 - Present', description: 'Worked as a Marketing Manager of Festember\'24, the annual cultural festival of NIT Trichy. Executed the task of establishing partnerships with various companies through effective communication and negotiation strategies.'},
  ],
  activities: [
      { id: 'act1', title: 'Social Activities', description: 'A volunteer under the HumaNITTy programme, NIT Trichy chapter, which aims at visiting local old age homes and orphanages and spending quality time with them.\nConducted Breast Cancer Awareness during my tenure as an A-Flight NCC Cadet at NIT Trichy.'},
      { id: 'act2', title: 'Cultural Activities', description: 'Secured 1st position in Pixel Pirates event of Pragyan in 2023.\nParticipated in the Republic Day Parade of NIT Trichy in 2024.\nDAN 1 - Black Belt Holder in Karate'},
      { id: 'act3', title: 'Sports Activities', description: 'Participated in 10K sportsfete marathon'},
  ]
};

function App() {
  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);
  const [isFormVisible, setIsFormVisible] = useState(true);
  const [zoom, setZoom] = useState(1);
  const paginatedResumeRef = useRef<HTMLDivElement>(null);
  const photoFileInputRef = useRef<HTMLInputElement>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  const handleTriggerPhotoUpload = () => {
    photoFileInputRef.current?.click();
  };

  const handleTriggerLogoUpload = () => {
    logoFileInputRef.current?.click();
  };

  const handleDownloadPdf = async () => {
    const container = paginatedResumeRef.current;
    if (!container) {
      console.error("Resume container not found for PDF generation.");
      alert("Could not generate PDF. Please try again.");
      return;
    }

    const pageElements = container.querySelectorAll('.resume-page-container');
    if (pageElements.length === 0) {
      console.error("No pages found to download.");
      alert("There is no content to download as a PDF.");
      return;
    }

    const pdf = new jspdf.jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    for (let i = 0; i < pageElements.length; i++) {
      const pageElement = pageElements[i] as HTMLElement;
      
      const uploadButtons = pageElement.parentElement?.querySelectorAll('button[aria-label^="Upload"]');
      uploadButtons?.forEach(btn => (btn as HTMLElement).style.visibility = 'hidden');

      const canvas = await html2canvas(pageElement, {
        scale: 2,
        useCORS: true,
        width: pageElement.offsetWidth,
        height: pageElement.offsetHeight,
      });

      uploadButtons?.forEach(btn => (btn as HTMLElement).style.visibility = 'visible');

      if (i > 0) {
        pdf.addPage();
      }
      
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    }

    pdf.save(`${resumeData.personalDetails.name.replace(/\s/g, '_')}_Resume.pdf`);
  };

  return (
    <div className="flex h-screen bg-gray-200 overflow-hidden">
      <aside className={`transition-all duration-300 ease-in-out bg-white shadow-lg flex-shrink-0 relative ${isFormVisible ? 'w-full md:w-[500px]' : 'w-0'} overflow-hidden`}>
        <div className="h-screen overflow-y-auto">
          <ResumeForm 
            resumeData={resumeData} 
            setResumeData={setResumeData} 
            photoFileInputRef={photoFileInputRef}
            logoFileInputRef={logoFileInputRef}
          />
        </div>
      </aside>

      <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto flex flex-col items-center">
        <div className="mb-6 bg-white p-2 rounded-lg shadow-md flex items-center space-x-2 sticky top-0 z-10">
            <button onClick={() => setZoom(prev => Math.max(0.2, prev - 0.1))} className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 font-bold">-</button>
            <button onClick={() => setZoom(1)} className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm">Reset</button>
            <button onClick={() => setZoom(prev => prev + 0.1)} className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 font-bold">+</button>
            <span className="text-sm text-gray-600 w-16 text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={handleDownloadPdf} className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm flex items-center space-x-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>PDF</span>
            </button>
        </div>
        
        <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top' }} className="transition-transform duration-200">
           <PaginatedResume 
            ref={paginatedResumeRef}
            resumeData={resumeData} 
            onPhotoUploadClick={handleTriggerPhotoUpload}
            onLogoUploadClick={handleTriggerLogoUpload}
          />
        </div>
      </main>

      {!isFormVisible && (
        <button
          onClick={() => setIsFormVisible(true)}
          className="fixed left-0 top-1/2 -translate-y-1/2 z-30 bg-blue-600 text-white rounded-r-lg px-2 py-4 shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 ease-in-out"
          aria-label="Show Editor"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {isFormVisible && (
       <button
          onClick={() => setIsFormVisible(false)}
          className="fixed top-1/2 -translate-y-1/2 z-30 bg-blue-600 text-white rounded-l-lg px-2 py-4 shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 ease-in-out left-full md:left-[500px] -translate-x-full"
          aria-label="Hide Editor"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
    )}
    </div>
  );
}

export default App;