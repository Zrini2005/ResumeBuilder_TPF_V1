export interface PersonalDetails {
  name: string;
  photo: string;
  degree: string;
  gender: string;
  dob: string;
  email: string;
  contact: string;
  logo: string;
  linkedin?: string;
  github?: string;
}

export interface Education {
  id: string;
  year: string;
  degree: string;
  institution: string;
  grade: string;
}

export interface Internship {
  id: string;
  title: string;
  date: string;
  description: string;
}

export interface Project {
  id: string;
  name: string;
  date: string;
  description: string;
}

export interface Achievement {
  id: string;
  description: string;
}

export interface Skill {
  id: string;
  category: string;
  skills: string;
}

export interface Position {
  id: string;
  title: string;
  date: string;
  description: string;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
}

export interface Language {
  id: string;
  language: string;
  proficiency: string;
}

export interface WebLink {
  id: string;
  name: string;
  url: string;
}

export interface Coursework {
  id: string;
  category: string;
  subjects: string;
}

export interface TechnicalAchievement {
  id: string;
  year: string;
  rank: string;
  event: string;
}

export interface ResumeData {
  personalDetails: PersonalDetails;
  summary: string;
  education: Education[];
  internships: Internship[];
  achievements: Achievement[];
  projects: Project[];
  skills: Skill[];
  positions: Position[];
  activities: Activity[];
  languages: Language[];
  webLinks: WebLink[];
  coursework: Coursework[];
  technicalAchievements: TechnicalAchievement[];
}