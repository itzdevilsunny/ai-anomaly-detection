import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import MonitoringNodeDemo from './components/MonitoringNodeDemo';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function LandingPage() {
  return (
    <div className="bg-slate-950 min-h-screen font-sans text-slate-50 selection:bg-neon-blue/30 selection:text-neon-blue">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <MonitoringNodeDemo />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}
