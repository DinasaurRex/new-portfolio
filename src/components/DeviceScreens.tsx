import { useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, CircleUserRound, Code2, Folder, Github, GraduationCap, Linkedin, Mail, Monitor, Pause, Play, Radio, Sprout, Volume2, Wrench } from 'lucide-react';
import { education, experience, hardwareProjects, projects, skills, socials } from '../portfolioData';

function ExternalLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  const isWeb = href.startsWith('https://');
  return <a className={className} href={href} target={isWeb ? '_blank' : undefined} rel={isWeb ? 'noopener noreferrer' : undefined}>{children}</a>;
}

export function ComputerScreen() {
  const [tab, setTab] = useState<'about' | 'experience' | 'education'>('about');
  const [workIndex, setWorkIndex] = useState(0);
  const [educationIndex, setEducationIndex] = useState(0);
  const entries = tab === 'education' ? education : experience;
  const index = tab === 'education' ? educationIndex : workIndex;
  const entry = entries[index];
  const move = (direction: number) => {
    const next = (index + direction + entries.length) % entries.length;
    if (tab === 'education') setEducationIndex(next); else setWorkIndex(next);
  };

  return <div className="crt-desktop" data-testid="computer-screen">
    <div className="os-title"><Monitor size={18} /><span>dina / desktop</span><span className="os-status">ONLINE</span></div>
    <nav className="os-tabs" aria-label="Computer pages">
      <button aria-pressed={tab === 'about'} onClick={() => setTab('about')}><CircleUserRound size={18} />About</button>
      <button aria-pressed={tab === 'experience'} onClick={() => setTab('experience')}><Folder size={18} />Experience</button>
      <button aria-pressed={tab === 'education'} onClick={() => setTab('education')}><GraduationCap size={18} />Education</button>
    </nav>
    <div className="computer-content">
      {tab === 'about' ? <>
        <div className="identity-row"><div className="pixel-avatar" aria-hidden="true">DS</div><div><h1>Dina Saab</h1><p>Electrical Engineering / McGill</p><p className="computer-muted">Montreal, QC / English & French</p></div></div>
        <div className="skill-columns">{Object.entries(skills).map(([label, items]) => <section key={label}><h2>{label}</h2><p>{items.join(' / ')}</p></section>)}</div>
      </> : <article className="experience-entry" aria-live="polite">
        <div className="entry-meta"><span>{entry.period}</span><span>{String(index + 1).padStart(2, '0')} / {String(entries.length).padStart(2, '0')}</span></div>
        <h2>{entry.name}</h2><h3>{entry.title}</h3><p>{entry.description}</p>
        <ul>{entry.bullets.map(bullet => <li key={bullet}>{bullet}</li>)}</ul>
      </article>}
    </div>
    <footer className="computer-footer">
      <div className="computer-links"><ExternalLink href="https://github.com/DinasaurRex"><Github size={17} />GitHub<ArrowUpRight size={14} /></ExternalLink><ExternalLink href="https://www.linkedin.com/in/dinasaab/"><Linkedin size={17} />LinkedIn<ArrowUpRight size={14} /></ExternalLink><ExternalLink href="mailto:dina07.saab@gmail.com"><Mail size={17} />Email</ExternalLink></div>
      {tab !== 'about' && <div className="paging"><button title="Previous entry" aria-label="Previous entry" onClick={() => move(-1)}><ArrowLeft size={22} /></button><button title="Next entry" aria-label="Next entry" onClick={() => move(1)}><ArrowRight size={22} /></button></div>}
    </footer>
  </div>;
}

export type ProjectItem = typeof projects[number];

export function ProjectTopScreen({ project, index }: { project: ProjectItem; index: number }) {
  const Icon = project.category === 'Robot' ? Wrench : project.category === 'Automation' ? Sprout : Code2;
  return <div className="ds-upper-screen" style={{ '--project-color': project.color } as React.CSSProperties} data-testid="project-screen">
    <div className="ds-status"><span>PROJECTS</span><span>{String(index + 1).padStart(2, '0')} / {projects.length}</span></div>
    <div className="project-heading"><div className="project-symbol"><Icon size={32} /></div><div><span className="project-category">{project.category}</span><h2>{project.name}</h2></div></div>
    <p className="project-description" aria-live="polite">{project.description}</p>
    <div className="project-period">{project.period}</div>
  </div>;
}

export function ProjectBottomScreen({ project, index, onChange, details, onToggleDetails }: { project: ProjectItem; index: number; onChange: (direction: number) => void; details: boolean; onToggleDetails: () => void }) {
  return <div className="ds-lower-screen">
    <div className="ds-lower-header"><span>{details ? 'DETAILS' : 'STACK'}</span><button onClick={onToggleDetails} aria-label={details ? 'Show project stack' : 'Show project details'} title={details ? 'Stack' : 'Details'}><Folder size={16} /></button></div>
    {details ? <ul className="project-facts">{project.details.map(detail => <li key={detail}>{detail}</li>)}</ul> : <div className="project-stack">{project.stack.map(item => <span key={item}>{item}</span>)}</div>}
    <div className="ds-link-row"><ExternalLink href={project.href}>{project.linkLabel}<ArrowUpRight size={15} /></ExternalLink>{'source' in project && project.source && <ExternalLink href={project.source} className="source-link"><Github size={16} /><span className="sr-only">Project source</span></ExternalLink>}</div>
    <div className="ds-pagination"><button aria-label="Previous project" title="Previous project" onClick={() => onChange(-1)}><ArrowLeft size={20} /></button><span>{index + 1} / {projects.length}</span><button aria-label="Next project" title="Next project" onClick={() => onChange(1)}><ArrowRight size={20} /></button></div>
  </div>;
}

export function CassetteScreen({ index, playing, onChange, onTogglePlay }: { index: number; playing: boolean; onChange: (direction: number) => void; onTogglePlay: () => void }) {
  const project = hardwareProjects[index];
  return <div className="cassette-display" data-testid="hardware-screen">
    <div className="tape-status"><Radio size={17} /><span>HARDWARE</span><span>{index + 1} / {hardwareProjects.length}</span></div>
    <h2>{project.name}</h2><p>{project.description}</p>
    <div className={`equalizer ${playing ? 'is-playing' : ''}`} aria-hidden="true">{Array.from({ length: 22 }, (_, i) => <i key={i} style={{ '--bar-delay': `${i * -0.17}s`, height: `${7 + (i * 13 % 21)}px` } as React.CSSProperties} />)}</div>
    <div className="tape-stack">{project.stack.join(' / ')}</div>
    <div className="tape-controls"><button aria-label="Previous hardware project" title="Previous hardware project" onClick={() => onChange(-1)}><ArrowLeft size={21} /></button><button aria-label={playing ? 'Pause cassette' : 'Play cassette'} title={playing ? 'Pause' : 'Play'} onClick={onTogglePlay}>{playing ? <Pause size={20} /> : <Play size={20} />}</button><button aria-label="Next hardware project" title="Next hardware project" onClick={() => onChange(1)}><ArrowRight size={21} /></button><ExternalLink href={project.href}>Notes<ArrowUpRight size={15} /></ExternalLink></div>
  </div>;
}

export function ContactScreen({ index, onChange }: { index: number; onChange: (direction: number) => void }) {
  const social = socials[index];
  const icons = [Mail, Github, Linkedin, CircleUserRound];
  const Icon = icons[index];
  return <div className="contact-display" data-testid="contact-screen">
    <div className="contact-title"><Volume2 size={17} /><span>CONTACT</span><span>SIDE {String.fromCharCode(65 + index)}</span></div>
    <div className="contact-channel"><Icon size={25} /><h2>{social.label}</h2></div><p>{social.detail}</p>
    <div className="contact-controls"><button aria-label="Previous contact" title="Previous contact" onClick={() => onChange(-1)}><ArrowLeft size={20} /></button><ExternalLink href={social.href}>Open {social.label}<ArrowUpRight size={15} /></ExternalLink><button aria-label="Next contact" title="Next contact" onClick={() => onChange(1)}><ArrowRight size={20} /></button></div>
  </div>;
}
