export type PortfolioMode = 'about' | 'projects' | 'hardware' | 'contact';

export const modeDetails = {
  about: { label: 'Experience', device: 'Computer', accent: '#66e1ca' },
  projects: { label: 'Projects', device: '3DS', accent: '#ffd760' },
  hardware: { label: 'Hardware', device: 'Cassette player', accent: '#ff92b6' },
  contact: { label: 'Contact', device: 'Turntable', accent: '#b7a3ff' },
};

const projectNotes = 'https://www.linkedin.com/in/dinasaab/details/projects/';

export const projects = [
  {
    name: 'Trakkit', category: 'Web app', period: 'Aug - Sep 2026', color: '#63cdb8',
    description: 'Academic planning for university students. A PDF schedule parser imports courses into a calendar, alongside assignments, grades, focus sessions, and availability sharing.',
    details: ['Approximately 15 daily active users.', 'Authentication, cloud storage, and PostgreSQL Row Level Security.'],
    stack: ['Next.js', 'React', 'TypeScript', 'Supabase'],
    href: 'https://tracker.littlerayofdina.com', linkLabel: 'Visit Trakkit',
    source: 'https://github.com/DinasaurRex/McGillTrack',
  },
  {
    name: 'BuildWith', category: 'Web app', period: 'May - Aug 2026', color: '#ff986e',
    description: 'A collaborative platform connecting students with projects, competitions, and teammates. Includes authentication, role management, and dynamic project pages.',
    details: ['Designed a scalable application and database architecture.', 'Built through iterative development and collaborative version control.'],
    stack: ['Next.js', 'React', 'TypeScript', 'Supabase'],
    href: 'https://buildwith.littlerayofdina.com', linkLabel: 'Visit BuildWith',
  },
  {
    name: 'Henry Jr.', category: 'Robot', period: 'Apr - Sep 2026', color: '#a9a2f5',
    description: 'A four-wheel ESP32 companion robot with Wi-Fi remote control, differential steering, and a little LED face. A custom body designed in Onshape houses the soldered electronics.',
    details: ['DC motors, H-bridge driver, PWM, GPIO, and embedded C++.', 'Speaker and camera integration in progress.'],
    stack: ['ESP32', 'C++', 'Onshape', 'Motor control'],
    href: projectNotes, linkLabel: 'Project notes',
  },
  {
    name: 'Self-sustainable garden', category: 'Automation', period: 'Jan - May 2026', color: '#a2cc73',
    description: 'A 1 x 3 m Arduino garden used by around 20 students and faculty. Soil-moisture sensing, a clock, and relay-controlled irrigation automate plant care.',
    details: ['Watering responds to sensor thresholds and scheduled intervals.', 'Custom CAD enclosure and integrated sensor and actuator control.'],
    stack: ['Arduino', 'C++', 'Sensors', 'CAD'],
    href: projectNotes, linkLabel: 'Project notes',
  },
  {
    name: 'MissedDay', category: 'Pitch detection', period: 'May - Aug 2025', color: '#f49bcd',
    description: 'A singing pitch detector with immediate sharp, flat, and in-tune feedback. An ESP32 samples a MAX9814 microphone and processes audio in C++ inside a custom CAD body.',
    details: ['Real-time audio processing and frequency analysis.', 'Hardware and software integrated into a functional prototype.'],
    stack: ['ESP32', 'C++', 'DSP', 'CAD'],
    href: projectNotes, linkLabel: 'Project notes',
  },
  {
    name: 'Binomial theorem in Lean', category: 'Formal proof', period: 'Jan - May 2026', color: '#6bbad7',
    description: 'A formal proof of the binomial theorem by induction in Lean. Explores symbolic logic, computer-assisted proof validation, and AI-assisted theorem proving.',
    details: ['Constructed and verified a mathematical proof.', 'Applied logical reasoning and formal verification techniques.'],
    stack: ['Lean', 'Induction', 'Formal verification'],
    href: projectNotes, linkLabel: 'Project notes',
  },
  {
    name: 'Rock-paper-scissors', category: 'Machine learning', period: 'Jun - Aug 2024', color: '#f3b261',
    description: 'A Python machine learning game that predicts and responds to player actions. Predictive models were trained, evaluated, and improved through testing.',
    details: ['Iterative model evaluation and debugging.'],
    stack: ['Python', 'Machine learning'],
    href: projectNotes, linkLabel: 'Project notes',
  },
  {
    name: 'Feathers Pandemonium', category: 'Game', period: 'Aug 2023 - Jun 2024', color: '#d69bec',
    description: 'A competitive race game with changing weapons and obstacles: swinging axes, adhesive surfaces, and jetpacks. Object-oriented components drive collision and physics systems.',
    details: ['Motion, acceleration, and forces translated into game mechanics.', 'Reusable components for maintainable gameplay systems.'],
    stack: ['C++', 'OOP', 'Collision', 'Physics'],
    href: 'https://github.com/DinasaurRex/Plumes-et-pandemonium', linkLabel: 'View source',
  },
];

export const hardwareProjects = projects.filter(project => ['Robot', 'Automation', 'Pitch detection'].includes(project.category));

export const experience = [
  { name: 'McGill Robotics', title: 'Rover Electrical Division', period: 'Sep 2026 - Present', description: 'Team member on the Mars Rover electrical division, contributing to circuit design and firmware on STM32 microcontrollers.', bullets: ['Circuit design', 'STM32 firmware'] },
  { name: 'MCommercial', title: 'Web Developer', period: 'Apr 2026 - Present', description: 'Rebuilt the company website as a production application with Next.js, React, TypeScript, Tailwind CSS, and Supabase. Website traffic increased by 35%.', bullets: ['Application architecture and database maintenance', 'Business requirements translated into production features'] },
  { name: 'MCommercial', title: 'Administrative Assistant', period: 'Aug 2020 - Present', description: 'Progressed from clerical and mailing work to bookkeeping, financial record management, data entry, and daily administrative operations.', bullets: ['Confidential financial documentation', 'Organization and professional communication'] },
  { name: 'Private Tutor', title: 'Freelance', period: 'Jan 2020 - Present', description: '400+ hours of individualized instruction in computer science, mathematics, and English, from elementary school to college.', bullets: ['Personalized strategies for different learning needs', 'Targeted instruction and study strategies'] },
  { name: 'College Beaubois', title: 'Tech Squad Leader', period: 'Aug 2019 - Jun 2024', description: 'Led a 10-member technical support team serving 1,500+ students and faculty. Resolved 50+ hardware and software issues.', bullets: ['Python, Scratch, and micro:bit activities for around 120 students', 'Technical video tutorials, including one with 5,500+ views'] },
];

export const education = [
  { name: 'McGill University', title: 'B.Eng. Electrical Engineering', period: '2026 - 2029', description: 'J.W. McConnell Scholarship and Community Leadership Entrance Award.', bullets: ['McGill Robotics / Mars Rover Electrical Division'] },
  { name: 'John Abbott College', title: 'Science DEC', period: '2024 - 2026', description: 'R-score 37.7. Dean\'s List and Honour Roll (4x).', bullets: ['Student Union, peer tutoring, and peer support', 'Volunteer at Sainte-Anne\'s Hospital'] },
  { name: 'Certifications', title: 'CAD & Marketing', period: '2026', description: 'Introduction to Parametric Feature-Based CAD, Onshape by PTC. Inbound Marketing Certified, HubSpot Academy.', bullets: ['Onshape: July 2026', 'HubSpot: June 2026'] },
  { name: 'Volunteering', title: 'Special Care & Peer Tutoring', period: '2024 - Present', description: 'Special Care Volunteer at Centre de repit Angelman since December 2024. Peer Tutor at John Abbott College, October 2024 - May 2026.', bullets: ['Support for individuals with physical and intellectual disabilities', 'Academic support in science courses'] },
];

export const skills = {
  Software: ['Python', 'C / C++', 'JavaScript', 'TypeScript', 'React', 'Next.js', 'Supabase', 'PostgreSQL', 'Git / GitHub'],
  Hardware: ['ESP32', 'STM32', 'Arduino', 'Raspberry Pi', 'Sensors', 'Motor control', 'Onshape', 'Soldering'],
};

export const socials = [
  { label: 'Email', detail: 'dina07.saab@gmail.com', href: 'mailto:dina07.saab@gmail.com' },
  { label: 'GitHub', detail: 'DinasaurRex', href: 'https://github.com/DinasaurRex' },
  { label: 'LinkedIn', detail: 'Dina Saab', href: 'https://www.linkedin.com/in/dinasaab/' },
  { label: 'Portfolio', detail: 'littlerayofdina.com', href: 'https://littlerayofdina.com' },
];
