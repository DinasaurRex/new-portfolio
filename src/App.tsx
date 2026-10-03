import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Disc3,
  Mail,
  Monitor,
  Wrench,
} from 'lucide-react';
import { RetroDeskScene } from './components/RetroDeskScene';
import {
  modeDetails,
  PortfolioMode,
  projects,
  socials,
  stats,
} from './portfolioData';

const modeIcons = {
  about: Monitor,
  projects: BriefcaseBusiness,
  hardware: Wrench,
  contact: Mail,
};

function App() {
  const [activeMode, setActiveMode] = useState<PortfolioMode>('about');
  const active = modeDetails[activeMode];

  const orderedModes = useMemo(
    () => Object.keys(modeDetails) as PortfolioMode[],
    [],
  );

  return (
    <main
      className="app-shell"
      style={{ '--accent': active.accent } as CSSProperties}
    >
      <section className="hero-stage" aria-label="Dina Saab portfolio">
        <div className="scene-wrap">
          <RetroDeskScene activeMode={activeMode} onSelectMode={setActiveMode} />
        </div>

        <div className="hero-interface">
          <nav className="top-nav" aria-label="Primary navigation">
            <a className="brand-lockup" href="#top" aria-label="Dina Saab home">
              <span className="brand-mark">DS</span>
              <span>Dina Saab</span>
            </a>
            <div className="nav-links">
              <a href="#projects">Projects</a>
              <a href="#lab">Lab</a>
              <a href="#contact">Contact</a>
            </div>
          </nav>

          <div className="hero-content" id="top">
            <p className="eyebrow">{active.kicker}</p>
            <h1>{active.title}</h1>
            <p className="intro-copy">{active.body}</p>

            <div className="mode-switcher" aria-label="Portfolio mode selector">
              {orderedModes.map((mode) => {
                const Icon = modeIcons[mode];
                return (
                  <button
                    aria-pressed={activeMode === mode}
                    className="mode-button"
                    key={mode}
                    onClick={() => setActiveMode(mode)}
                    type="button"
                  >
                    <Icon aria-hidden="true" size={17} />
                    <span>{modeDetails[mode].label}</span>
                  </button>
                );
              })}
            </div>

            <div className="hero-actions">
              <a className="primary-link" href="#projects">
                View projects
                <ArrowUpRight aria-hidden="true" size={18} />
              </a>
              <a className="secondary-link" href="mailto:dina07.saab@gmail.com">
                Contact me
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="stats-band" aria-label="Quick profile stats">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <article className="stat-tile" key={stat.label}>
              <Icon aria-hidden="true" size={21} />
              <div>
                <h2>{stat.label}</h2>
                <p>{stat.value}</p>
              </div>
            </article>
          );
        })}
      </section>

      <section className="project-section" id="projects">
        <div className="section-heading">
          <p className="eyebrow">Portfolio tape deck</p>
          <h2>Projects worth pressing play on</h2>
        </div>
        <div className="project-grid">
          {projects.map((project) => {
            const Icon = project.icon;
            return (
              <a className="project-card" href={project.href} key={project.name}>
                <span className="project-icon">
                  <Icon aria-hidden="true" size={22} />
                </span>
                <span className="project-tag">{project.tag}</span>
                <h3>{project.name}</h3>
                <p>{project.description}</p>
                <span className="project-cta">
                  Open
                  <ArrowUpRight aria-hidden="true" size={16} />
                </span>
              </a>
            );
          })}
        </div>
      </section>

      <section className="lab-section" id="lab">
        <div className="lab-copy">
          <p className="eyebrow">How I build</p>
          <h2>Part workshop, part interface, part organized chaos.</h2>
          <p>
            I like projects with a physical edge: hardware that needs a clear
            control surface, dashboards that simplify real workflows, and
            student tools that make ambition easier to act on.
          </p>
        </div>
        <div className="signal-panel" aria-label="Current build signals">
          {active.screenLines.map((line) => (
            <span key={line}>
              <Disc3 aria-hidden="true" size={16} />
              {line}
            </span>
          ))}
        </div>
      </section>

      <section className="contact-section" id="contact">
        <div className="section-heading">
          <p className="eyebrow">Patch cable</p>
          <h2>Send a signal</h2>
        </div>
        <div className="social-row">
          {socials.map((social) => {
            const Icon = social.icon;
            return (
              <a className="social-link" href={social.href} key={social.label}>
                <Icon aria-hidden="true" size={20} />
                <span>{social.label}</span>
              </a>
            );
          })}
        </div>
      </section>
    </main>
  );
}

export default App;
