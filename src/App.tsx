import { useEffect, useState } from 'react';
import { ArrowLeft, Disc3, Gamepad2, Home, Monitor, Radio } from 'lucide-react';
import { RetroDeskScene } from './components/RetroDeskScene';
import { modeDetails, PortfolioMode } from './portfolioData';

const modes: PortfolioMode[] = ['about', 'projects', 'hardware', 'contact'];
const icons = { about: Monitor, projects: Gamepad2, hardware: Radio, contact: Disc3 };

function App() {
  const [activeMode, setActiveMode] = useState<PortfolioMode | null>(null);
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === 'Escape') setActiveMode(null);
      const index = Number(event.key) - 1;
      if (index >= 0 && index < modes.length) setActiveMode(modes[index]);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return <main className="portfolio-world" data-mode={activeMode ?? 'desk'}>
    <div className="world-scene"><RetroDeskScene activeMode={activeMode} onSelectMode={setActiveMode} /></div>
    <header className="world-header">
      <button className="world-mark" onClick={() => setActiveMode(null)} aria-label="Dina Saab desk"><span>DS</span><strong>Dina Saab</strong></button>
      {activeMode && <button className="back-to-desk" onClick={() => setActiveMode(null)}><ArrowLeft size={16} />Desk</button>}
    </header>
    <nav className="object-dock" aria-label="Devices">
      <button className="desk-button" aria-label="Return to desk" title="Desk" aria-pressed={activeMode === null} onClick={() => setActiveMode(null)}><Home size={17} /></button>
      {modes.map(mode => { const Icon = icons[mode]; return <button key={mode} aria-label={`Open ${modeDetails[mode].device}`} title={modeDetails[mode].label} aria-pressed={activeMode === mode} style={{ '--object-color': modeDetails[mode].accent } as React.CSSProperties} onClick={() => setActiveMode(mode)}><Icon size={17} /><span>{modeDetails[mode].label}</span></button>; })}
    </nav>
  </main>;
}

export default App;
