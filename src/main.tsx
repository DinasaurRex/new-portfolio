import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

// Device screens use separate DOM roots, so their mounts must remain stable.
createRoot(document.getElementById('root')!).render(<App />);
