import {
  CircuitBoard,
  Code2,
  ExternalLink,
  Github,
  GraduationCap,
  Linkedin,
  Mail,
  Radio,
  Sprout,
  Wrench,
} from 'lucide-react';

export type PortfolioMode = 'about' | 'projects' | 'hardware' | 'contact';

export const modeDetails: Record<
  PortfolioMode,
  {
    label: string;
    kicker: string;
    title: string;
    body: string;
    screenLines: string[];
    accent: string;
  }
> = {
  about: {
    label: 'About',
    kicker: 'Electrical engineering + code',
    title: 'I build working systems with a little personality.',
    body:
      'I am Dina Saab, an electrical engineering student at McGill who likes turning fuzzy ideas into practical tools, robots, automations, and full-stack products people can actually use.',
    screenLines: ['DINA.EXE', 'MCGILL E.E.', 'WEB + HARDWARE'],
    accent: '#67e8f9',
  },
  projects: {
    label: 'Projects',
    kicker: 'Selected builds',
    title: 'Useful websites, student tools, and weird little machines.',
    body:
      'My work moves between polished web apps and physical prototypes: BuildWith for student opportunities, McGillTrack for academic planning, and tiny hardware systems that make ideas tangible.',
    screenLines: ['PROJECTS', 'BUILDWITH', 'MCGILLTRACK'],
    accent: '#f97316',
  },
  hardware: {
    label: 'Hardware',
    kicker: 'Embedded systems shelf',
    title: 'Robots, gardens, sensors, motors, and microcontrollers.',
    body:
      'I am drawn to the moment software leaves the screen: ESP32 control loops, Arduino sensing, motor drivers, CAD assemblies, and interfaces that make machines feel approachable.',
    screenLines: ['ESP32 ONLINE', 'ARDUINO I/O', 'MOTOR READY'],
    accent: '#a3e635',
  },
  contact: {
    label: 'Contact',
    kicker: 'Open channel',
    title: 'Have an idea that needs both circuits and a UI?',
    body:
      'I am happiest around ambitious, useful projects: education tools, hardware prototypes, practical dashboards, and anything that rewards careful engineering.',
    screenLines: ['MAIL READY', 'GITHUB SYNC', 'LINKEDIN'],
    accent: '#f0abfc',
  },
};

export const stats = [
  { label: 'McGill', value: 'Electrical Engineering', icon: GraduationCap },
  { label: 'Stack', value: 'React, Next.js, TypeScript, Supabase', icon: Code2 },
  { label: 'Lab', value: 'ESP32, Arduino, sensors, motor control', icon: CircuitBoard },
];

export const projects = [
  {
    name: 'BuildWith',
    tag: 'Student platform',
    description:
      'A full-stack app helping students discover projects, competitions, teammates, and opportunities.',
    icon: Radio,
    href: 'https://buildwith.littlerayofdina.com',
  },
  {
    name: 'Henry Jr.',
    tag: 'ESP32 robot',
    description:
      'A four-wheel remote-controlled companion robot built with embedded C++, Wi-Fi control, and CAD work.',
    icon: Wrench,
    href: 'https://github.com/DinasaurRex',
  },
  {
    name: 'Self-sustainable garden',
    tag: 'Arduino automation',
    description:
      'A 1 x 3 m automated garden with sensing, time-based watering, and environmental control.',
    icon: Sprout,
    href: 'https://github.com/DinasaurRex',
  },
];

export const socials = [
  {
    label: 'Email',
    href: 'mailto:dina07.saab@gmail.com',
    icon: Mail,
  },
  {
    label: 'GitHub',
    href: 'https://github.com/DinasaurRex',
    icon: Github,
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/dinasaab/',
    icon: Linkedin,
  },
  {
    label: 'Live builds',
    href: 'https://littlerayofdina.com',
    icon: ExternalLink,
  },
];
