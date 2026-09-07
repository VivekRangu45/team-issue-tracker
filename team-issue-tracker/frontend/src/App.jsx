import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import TechDashboard from './pages/TechDashboard';
import ReportIssue from './pages/ReportIssue';
import MyIssues from './pages/MyIssues';
import AvailableIssues from './pages/AvailableIssues';
import MyWork from './pages/MyWork';
import IssueDetails from './pages/IssueDetails';
import Profile from './pages/Profile';
import DevTools from './pages/DevTools';
import { ProtectedRoute } from './components/ProtectedRoute';

const DashboardRouter = () => {
    const { user } = useContext(AuthContext);
    if (!user) return <Navigate to="/login" />;
    return user.role === 'USER' ? <UserDashboard /> : <TechDashboard />;
};

function App() {
    return (
        <BrowserRouter>
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <Navbar />
                <main className="container" style={{ flex: 1 }}>
                    <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        <Route element={<ProtectedRoute />}>
                            <Route path="/dashboard" element={<DashboardRouter />} />
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/issues/:id" element={<IssueDetails />} />
                            <Route path="/dev-tools" element={<DevTools />} />
                        </Route>

                        <Route element={<ProtectedRoute roles={['USER']} />}>
                            <Route path="/report-issue" element={<ReportIssue />} />
                            <Route path="/my-issues" element={<MyIssues />} />
                        </Route>

                        <Route element={<ProtectedRoute roles={['TECH_MEMBER']} />}>
                            <Route path="/available-issues" element={<AvailableIssues />} />
                            <Route path="/my-work" element={<MyWork />} />
                        </Route>
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
}

export default App;
