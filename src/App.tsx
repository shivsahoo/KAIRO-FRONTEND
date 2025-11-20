import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import RoleSelection from './pages/RoleSelection';
import Simulation from './pages/Simulation';
import PerformanceReport from './pages/PerformanceReport';
import Login from './pages/Login';

function AppContent() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const isSimulationPage = location.pathname === '/simulation';

  return (
    <>
      {!isLoginPage && !isSimulationPage && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<RoleSelection />} />
        <Route path="/simulation" element={<Simulation />} />
        <Route path="/report" element={<PerformanceReport />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
