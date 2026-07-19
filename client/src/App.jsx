import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import PasswordGate from './components/PasswordGate';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import CasesPage from './pages/CasesPage';
import CaseDetailPage from './pages/CaseDetailPage';
import NotFoundPage from './pages/NotFoundPage';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <div key={location.pathname} className="page-enter">
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/cases" element={<CasesPage />} />
        <Route path="/cases/:caseId" element={<CaseDetailPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <PasswordGate>
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </PasswordGate>
  );
}

export default App;
