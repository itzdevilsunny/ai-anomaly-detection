import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import MonitoringNodeDemo from './components/MonitoringNodeDemo';
import Footer from './components/Footer';
import DashboardLayout from './pages/Dashboard';
import DashboardOverview from './modules/Dashboard/DashboardOverview';
import CameraGrid from './modules/Cameras/CameraGrid';
import ZoneMap from './modules/Map/ZoneMap';
import AlertDashboard from './modules/Alerts/AlertDashboard';
import AnalyticsDashboard from './modules/Analytics/AnalyticsDashboard';
import EdgeDashboard from './modules/EdgeNodes/EdgeDashboard';
import SecurityDashboard from './modules/Security/SecurityDashboard';
import StorageDashboard from './modules/Storage/StorageDashboard';
import SettingsDashboard from './modules/Settings/SettingsDashboard';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useSocket } from './hooks/useSocket';
import { setupAxiosInterceptors } from './store/useAuthStore';

// Initialize JWT injection into every Axios request
setupAxiosInterceptors();

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
  useSocket(); // Initialize real-time WebSocket connection to Node.js backend

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardOverview />} />
          <Route path="cameras" element={<CameraGrid />} />
          <Route path="map" element={<ZoneMap />} />
          <Route path="alerts" element={<AlertDashboard />} />
          <Route path="analytics" element={<AnalyticsDashboard />} />
          <Route path="edge" element={<EdgeDashboard />} />
          <Route path="security" element={<SecurityDashboard />} />
          <Route path="storage" element={<StorageDashboard />} />
          <Route path="settings" element={<SettingsDashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}

