import { useEffect, useState } from 'react';
import { Armchair, ArrowLeft, Disc3, Gamepad2, Home, Monitor, Radio } from 'lucide-react';
import { RetroDeskScene } from './components/RetroDeskScene';
import { modeDetails, PortfolioMode } from './portfolioData';

const modes: PortfolioMode[] = ['about', 'projects', 'hardware', 'contact'];
const icons = { about: Monitor, projects: Gamepad2, hardware: Radio, contact: Disc3 };

function App() {
  const [activeMode, setActiveMode] = useState<PortfolioMode | null>(null);
  const [atDesk, setAtDesk] = useState(false);
  const selectMode = (mode: PortfolioMode | null) => { setAtDesk(true); setActiveMode(mode); };
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === 'Escape') selectMode(null);
      const index = Number(event.key) - 1;
      if (index >= 0 && index < modes.length) selectMode(modes[index]);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return <main className="portfolio-world" data-mode={activeMode ?? (atDesk ? 'desk' : 'room')}>
    <div className="world-scene"><RetroDeskScene activeMode={activeMode} atDesk={atDesk} onSelectMode={selectMode} /></div>
    <header className="world-header">
      <button className="world-mark" onClick={() => selectMode(null)} aria-label="Dina Saab desk"><span>DS</span><strong>Dina Saab</strong></button>
      {(activeMode || !atDesk) && <button className="back-to-desk" aria-label={atDesk ? 'Back to desk' : 'Sit at the desk'} onClick={() => selectMode(null)}>{atDesk ? <ArrowLeft size={16} /> : <Armchair size={16} />}Desk</button>}
    </header>
    <nav className="object-dock" aria-label="Devices">
      <button className="desk-button" aria-label="View room" title="Room" aria-pressed={!atDesk && activeMode === null} onClick={() => { setActiveMode(null); setAtDesk(false); }}><Home size={17} /></button>
      {modes.map(mode => { const Icon = icons[mode]; return <button key={mode} aria-label={`Open ${modeDetails[mode].device}`} title={modeDetails[mode].label} aria-pressed={activeMode === mode} style={{ '--object-color': modeDetails[mode].accent } as React.CSSProperties} onClick={() => selectMode(mode)}><Icon size={17} /><span>{modeDetails[mode].label}</span></button>; })}
    </nav>
  </main>;
}

export default App;
