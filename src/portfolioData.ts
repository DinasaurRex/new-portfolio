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
    kicker: 'Dina Saab',
    title: 'Dina Saab',
    body: 'Electrical engineering, web, and physical computing.',
    screenLines: ['DINA.SAAB', 'ELECTRICAL ENGINEERING', 'WEB + HARDWARE'],
    accent: '#67e8f9',
  },
  projects: {
    label: 'Projects',
    kicker: 'Projects',
    title: 'Projects',
    body: 'BuildWith, Trakkit, and more.',
    screenLines: ['PROJECTS', 'BUILDWITH', 'TRAKKIT'],
    accent: '#f97316',
  },
  hardware: {
    label: 'Hardware',
    kicker: 'Hardware',
    title: 'Hardware',
    body: 'Robots, gardens, sensors, motors, and microcontrollers.',
    screenLines: ['HENRY JR.', 'AUTOMATED GARDEN', 'ESP32 + ARDUINO'],
    accent: '#a3e635',
  },
  contact: {
    label: 'Contact',
    kicker: 'Contact',
    title: 'Contact',
    body: 'Email, GitHub, LinkedIn.',
    screenLines: ['DINA07.SAAB@GMAIL.COM', 'GITHUB', 'LINKEDIN'],
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
