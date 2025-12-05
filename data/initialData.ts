import type { ResumeData } from '../types';

export const initialResumeData: ResumeData = {
  personalDetails: {
    name: 'JOHN DOE',
    photo: 'https://via.placeholder.com/130x140.png?text=',
    degree: 'B.Tech - Computer Science and Engineering',
    gender: 'Male',
    dob: '06/09/2005',
    email: 'tp@nitt.edu',
    contact: '+91-431-2501081',
    logo: 'https://via.placeholder.com/144x144.png?text=',
    linkedin: '',
    github: '',
  },
  summary: '',
  education: [
    { id: 'edu1', year: '2023-Present', degree: 'B.Tech- CSE', institution: 'NIT, Trichy', grade: '9.2' },
    { id: 'edu2', year: '2023', degree: 'Class XII', institution: 'Delhi Public School, R. K. Puram', grade: '97.2%' },
    { id: 'edu3', year: '2021', degree: 'Class X', institution: 'Delhi Public School, R. K. Puram', grade: '98.8%' },
  ],
  internships: [
    {
      id: 'int1',
      title: 'Research Internship at Indian Institute of Technology Guwahati',
      date: 'Jun 2025 - Present',
      description: 'Working as a research intern on the project Air to Water Generator. I simulated a model in Dymola to extract water from humid air with the purpose of satisfying water requirements in coastal regions.',
    },
    {
      id: 'int2',
      title: 'Internship at AHODS Technologies Private Limited',
      date: 'Jun 2025 - Aug 2025',
      description: "Collaborated with IIT Delhi on a project to enhance onboard hydrogen production for vehicles. Conducted a literature review on electrolysis methods to propose cost-effective solutions.",
    },
  ],
  achievements: [
    { id: 'ach1', description: 'Secured <b>Rank 2</b> in Cyber Olympiad(IFCO) in the Zonal level conducted by International Olympiad Foundation in 2022.' },
    { id: 'ach2', description: 'Achieved <b>Top 5%</b> in the national competitive programming contest CodeSprint 2023.' },
    { id: 'ach3', description: '<b>IBPC Meritorious Student Award</b> in 2021 and 2023.' },
  ],
  projects: [
    {
      id: 'proj1',
      name: 'Smart Inventory System',
      date: 'January 2025 - March 2025',
      description: 'Designed and deployed a comprehensive inventory management system using the MERN stack to streamline stock tracking for local businesses. Implemented real-time data visualization dashboards using Chart.js to analyze sales trends and predict future stock requirements with 95% accuracy. Integrated a secure payment gateway and role-based access control to ensure data privacy and secure transactions for over 500 active users.',
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
      description: 'Built Chatty, a real-time chat application with one-on-one messaging and online status, using the MERN stack with Socket.io, JWT for security, and Zustand for state management. Optimized database queries and implemented a caching layer, improving message delivery speed by 30%.',
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
      { id: 'act1', title: 'Social Activities', description: 'A volunteer under the HumaNITTy programme, NIT Trichy chapter, which aims at visiting local old age homes and orphanages and spending quality time with them.\nOrganized a campus-wide blood donation camp in collaboration with the Red Cross Society, collecting over 200 units of blood.'},
      { id: 'act2', title: 'Cultural Activities', description: 'Secured 1st position in Pixel Pirates event of Pragyan in 2023.\nDAN 1 - Black Belt Holder in Karate'},
      { id: 'act3', title: 'Sports Activities', description: 'Participated in 10K sportsfete marathon'},
  ],
  languages: [],
  webLinks: [],
  coursework: [],
  technicalAchievements: [],
};

export const modernCreativeInitialData: ResumeData = {
  personalDetails: {
    name: 'SAM WILSON',
    photo: 'https://via.placeholder.com/150',
    degree: 'B.Des - Product Design',
    gender: 'Male',
    dob: '12/05/2003',
    email: 's@gmail.com',
    contact: '+91-9876543210',
    logo: '', 
    linkedin: 'https://linkedin.com/in/samwilson',
    github: 'https://github.com/samwilson',
  },
  summary: 'Creative and detail-oriented Product Designer with a passion for user-centric solutions. Experienced in creating intuitive interfaces and conducting user research. Proficient in modern design tools and prototyping frameworks, with a strong ability to collaborate across cross-functional teams to deliver high-quality digital products.',
  education: [
    { id: 'edu1', year: '2021-2025', degree: 'B.Des', institution: 'National Institute of Design', grade: '8.8 CGPA' },
    { id: 'edu2', year: '2021', degree: 'Class XII', institution: 'City High School', grade: '95%' },
  ],
  internships: [
    {
      id: 'int1',
      title: 'Product Design Intern',
      date: 'May 2024 - Jul 2024',
      description: 'Designed user-centric interfaces for a mobile application. Conducted user research and usability testing to improve experience.',
    },
    {
      id: 'int2',
      title: 'UI/UX Intern',
      date: 'May 2023 - Jul 2023',
      description: 'Collaborated with the dev team to implement responsive designs. Created wireframes and prototypes for web platforms.',
    },
  ],
  achievements: [
    { id: 'ach1', description: 'Winner of National Design Challenge 2023.' },
    { id: 'ach2', description: 'Featured in Design Daily Magazine for innovative mobile UI concepts.' },
  ],
  projects: [
    {
      id: 'proj1',
      name: 'SmartHome App',
      date: 'Jan 2024',
      description: 'A mobile app to control smart home devices. Created wireframes, high-fidelity mockups, and interactive prototypes.',
    },
    {
      id: 'proj2',
      name: 'Portfolio Website',
      date: 'Nov 2023',
      description: 'Designed and developed a personal portfolio website using React and Tailwind CSS to showcase design projects.',
    },
  ],
  skills: [
      { id: 'skill1', category: '', skills: 'Figma, Adobe XD, Photoshop, Illustrator, ProtoPie, Framer, HTML, CSS, React.js' },
  ],
  positions: [
    { id: 'pos1', title: 'Creative Lead', date: '2023-Present', description: 'Leading the design team for the college annual magazine. Overseeing layout, typography, and visual consistency.'},
  ],
  activities: [
      { id: 'act1', title: 'Volunteering', description: 'Volunteer at local animal shelter.\nOrganized fundraising event for charity.'},
      { id: 'act2', title: 'Interests', description: 'Photography, Traveling, Sketching.'},
  ],
  languages: [
    { id: 'lang1', language: 'English', proficiency: 'Native' },
    { id: 'lang2', language: 'Spanish', proficiency: 'Intermediate' },
  ],
  webLinks: [],
  coursework: [],
  technicalAchievements: [],
};

export const corporateMinimalInitialData: ResumeData = {
    personalDetails: {
      name: 'Divyansh Kumar Singh',
      photo: '',
      degree: 'B.Tech in Computer Science',
      gender: '',
      dob: '',
      email: 'divyanshnikhil@gmail.com',
      contact: '+91-8697-537-895',
      logo: '',
      linkedin: 'divyansh-kumar-singh',
      github: 'd-skyhawk',
    },
    summary: '',
    education: [
      { id: 'edu1', year: 'Expected June 2019', degree: 'B.Tech in Computer Science', institution: 'NATIONAL INSTITUTE OF TECHNOLOGY DURGAPUR', grade: 'Cum. GPA: 9.13/10.0' },
      { id: 'edu2', year: 'Grad. May 2013', degree: 'Indian Certificate of Secondary Education', institution: 'DON BOSCO SCHOOL BANDEL', grade: 'Aggregate: 94.6 %' },
      { id: 'edu3', year: 'Grad. May 2015', degree: 'Indian School Certificate', institution: 'DON BOSCO SCHOOL BANDEL', grade: 'Aggregate: 97.0 %' },
    ],
    internships: [
        {
            id: 'int1',
            title: 'Research Intern at IIT Madras',
            date: 'June 2018 - August 2018',
            description: 'Worked on Machine Learning algorithms for predictive analysis. Optimized data processing pipelines using Python and Scikit-Learn.\nImplemented a new feature selection method that improved model accuracy by 15%.',
        }
    ],
    achievements: [
        { id: 'ach1', description: 'Secured <b>Top 1 percentile</b> in Indian School Certificate Examination 2015.' },
        { id: 'ach2', description: 'School and City Topper at 6th National Cyber Olympiad.' },
        { id: 'ach3', description: 'Active Participant in Competitive Programming Contests held over Codechef, Codeforces, Hackerrank and other Online Judge Platforms.' },
    ],
    projects: [
      {
        id: 'proj1',
        name: 'SPAM FILTER',
        date: 'Jan 2017 - Present',
        description: 'Separating Spam emails from Ham using Naive Bayes and Support Vector Machines.\nTested on subset of 2005 TREC Public Spam Corpus with accuracy of 91.8% using Naive Bayes and 97.2% using Support Vector Machines.',
      },
      {
        id: 'proj2',
        name: 'STOCK PRICE PREDICTION',
        date: 'Aug 2016 - Oct 2016',
        description: 'Developed a recurrent neural network using LSTM to predict stock prices.\nTrained the model on 5 years of historical data achieving 85% directional accuracy.',
      },
    ],
    skills: [
        { id: 'skill1', category: 'LANGUAGES', skills: 'Proficient:\nC • C++ •\nIntermediate/Basics:\nPython • Shell • Java' },
        { id: 'skill2', category: 'TOOLS AND FRAMEWORKS', skills: 'Git • Scikit-Learn(ML) • MySQL' },
    ],
    positions: [
        { id: 'pos1', title: '', date: '', description: '<b>Competitive Programming and Academic Mentor</b> for freshmen and sophomores at NIT Durgapur'},
        { id: 'pos2', title: '', date: '', description: '<b>Mentoring Competitive Programming Aspirants</b> through my blog on Algorithms, Programming and Mathematical concepts.'},
    ],
    activities: [
        { id: 'act1', title: 'EXTRACURRICULAR ACTIVITIES', description: 'Top Performer at a Global Tech Company Challenge titled "<b>Design the future of gaming and entertainment</b>"\nHobbies: Sudoku Solving, Cycling and playing Cricket.'},
    ],
    languages: [],
    webLinks: [
        { id: 'link1', name: 'LinkedIn', url: 'divyansh-kumar-singh' },
        { id: 'link2', name: 'Codechef', url: 'd_skyhawk' },
        { id: 'link3', name: 'Codeforces', url: 'd_skyhawk' },
        { id: 'link4', name: 'Hackerrank', url: 'd_skyhawk' },
        { id: 'link5', name: 'Github', url: 'd-skyhawk' },
    ],
    coursework: [
        { id: 'cw1', category: 'UNDERGRADUATE', subjects: 'Data Structures\nOperating Systems\nObject Oriented Programming\nDiscrete Mathematics' },
    ],
    technicalAchievements: [],
  };