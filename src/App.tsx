import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import RoleSelection from './pages/RoleSelection';
import Simulation from './pages/Simulation';
import PerformanceReport from './pages/PerformanceReport';
import Login from './pages/Login';
import Signup from './pages/Signup';
import TaskDetail from './pages/TaskDetail';
import Interview from './pages/Interview';

function AppContent() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const isSignupPage = location.pathname === '/signup';
  const isSimulationPage = location.pathname === '/simulation';
  const isInterviewPage = location.pathname === '/interview';

  return (
    <>
      {!isLoginPage && !isSignupPage && !isSimulationPage && !isInterviewPage && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<RoleSelection />} />
        <Route path="/simulation" element={<Simulation />} />
        <Route path="/interview" element={<Interview />} />
        <Route path="/task/:taskId" element={<TaskDetail />} />
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
