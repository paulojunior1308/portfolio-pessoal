import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Researchers from './pages/Researchers';
import Projects from './pages/Projects';
import Expenses from './pages/Expenses';
import Contracts from './pages/Contracts';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import PublicLayout from './components/PublicLayout';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          {/* Rota pública para acesso via token */}
          <Route path="/dashboard/:projectId" element={<PublicLayout />}>
            <Route index element={<Dashboard isPublicAccess />} />
          </Route>
          <Route element={<PrivateRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/researchers" element={<Researchers />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/contracts" element={<Contracts />} />
              <Route path="/expenses" element={<Expenses />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;