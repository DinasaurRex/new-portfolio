import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { ArrowUpRight, Mail, Monitor, MousePointer2, Radio, Wrench } from 'lucide-react';
import { RetroDeskScene } from './components/RetroDeskScene';
import { modeDetails, PortfolioMode, socials } from './portfolioData';

const modeIcons = { about: Monitor, projects: Radio, hardware: Wrench, contact: Mail };

function App() {
  const [activeMode, setActiveMode] = useState<PortfolioMode>('about');
  const active = modeDetails[activeMode];
  const orderedModes = useMemo(() => Object.keys(modeDetails) as PortfolioMode[], []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const index = Number(event.key) - 1;
      if (index >= 0 && index < orderedModes.length) setActiveMode(orderedModes[index]);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [orderedModes]);

  return (
    <main className="portfolio-world" style={{ '--accent': active.accent } as CSSProperties}>
      <div className="world-scene">
        <RetroDeskScene activeMode={activeMode} onSelectMode={setActiveMode} />
      </div>

      <header className="world-header">
        <a className="world-mark" href="#top" aria-label="Dina Saab home"><span>DS</span><strong>Dina Saab</strong></a>
        <p className="location-readout">Desktop / {active.label}</p>
      </header>

      <div className="world-hint" id="top"><MousePointer2 aria-hidden="true" size={15} /><span>Click an object to explore</span></div>

      <nav className="object-dock" aria-label="Portfolio sections">
        {orderedModes.map((mode, index) => {
          const Icon = modeIcons[mode];
          return <button aria-label={`Show ${modeDetails[mode].label}`} aria-pressed={activeMode === mode} key={mode} onClick={() => setActiveMode(mode)} type="button"><Icon aria-hidden="true" size={17} /><span>{modeDetails[mode].label}</span><kbd>{index + 1}</kbd></button>;
        })}
      </nav>

      {activeMode === 'contact' && <aside className="signal-links" aria-label="Contact links">
        {socials.map((social) => {
          const Icon = social.icon;
          return <a href={social.href} key={social.label} target={social.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer"><Icon aria-hidden="true" size={15} />{social.label}<ArrowUpRight aria-hidden="true" size={14} /></a>;
        })}
      </aside>}
    </main>
  );
}

export default App;
