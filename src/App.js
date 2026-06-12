import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Resumes from './pages/Resumes';
import Jobs from './pages/Jobs';
import Screening from './pages/Screening';
import Chat from './pages/Chat';
import Layout from './components/Layout';
import PdfTools from './pages/PdfTools';
import TemplateStudio from './SpecialEditor/TemplateStudio';
import InterviewRooms from './pages/InterviewRooms';
import Analytics from './pages/Analytics';
import JobBoard from './pages/JobBoard';
import MockInterview from './pages/MockInterview';
import ResumeStudio from './pages/ResumeStudio';
import { ToastProvider } from './context/ToastContext';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('hireiq_token');
  return token ? children : <Navigate to="/login" />;
};

const HirerOnly = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('hireiq_user') || '{}');
  const isHirer = user.role === 'recruiter' || user.role === 'hirer';
  return isHirer ? children : <Navigate to="/" />;
};

const CandidateOnly = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('hireiq_user') || '{}');
  const isCandidate = user.role === 'candidate' || user.role === 'job_seeker';
  return isCandidate ? children : <Navigate to="/" />;
};

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={
            <PrivateRoute><Layout /></PrivateRoute>
          }>
            <Route index element={<Dashboard />} />

            {/* Hirer routes */}
            <Route path="resumes" element={<HirerOnly><Resumes /></HirerOnly>} />
            <Route path="jobs" element={<HirerOnly><Jobs /></HirerOnly>} />
            <Route path="screening" element={<HirerOnly><Screening /></HirerOnly>} />
            <Route path="interview-rooms" element={<HirerOnly><InterviewRooms /></HirerOnly>} />
            <Route path="analytics" element={<HirerOnly><Analytics /></HirerOnly>} />
            <Route path="pdf-tools" element={<PdfTools />} />
            <Route path="template-studio" element={<TemplateStudio />} />

            {/* Candidate routes */}
            <Route path="job-board" element={<CandidateOnly><JobBoard /></CandidateOnly>} />
            <Route path="mock-interview" element={<CandidateOnly><MockInterview /></CandidateOnly>} />

            {/* Shared */}
            <Route path="resume-studio" element={<ResumeStudio />} /> {/* ✅ one hub: Builder + Coach + Enhancer + Templates */}
            <Route path="resume-builder" element={<Navigate to="/resume-studio" replace />} />
            <Route path="chat" element={<Chat />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
