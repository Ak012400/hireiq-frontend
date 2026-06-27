import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { useAppSelector } from './store/hooks';
import { selectToken, selectRole } from './features/auth/store/authSlice';

// Feature pages
import Login from './features/auth/pages/Login';
import Register from './features/auth/pages/Register';
import Dashboard from './features/dashboard/pages/Dashboard';
import Analytics from './features/dashboard/pages/Analytics';
import Resumes from './features/resume/pages/Resumes';
import ResumeStudio from './features/resume/pages/ResumeStudio';
import TemplateStudio from './features/resume/editor/TemplateStudio';
import Jobs from './features/jobs/pages/Jobs';
import JobBoard from './features/jobs/pages/JobBoard';
import Screening from './features/screening/pages/Screening';
import Chat from './features/chat/pages/Chat';
import InterviewRooms from './features/interview/pages/InterviewRooms';
import MockInterview from './features/interview/pages/MockInterview';
import PdfTools from './features/pdf/pages/PdfTools';
import JobPostings from './features/jobPostings/pages/JobPostings';
import NewJobPosting from './features/jobPostings/pages/NewJobPosting';
import CandidatePipeline from './features/pipeline/pages/CandidatePipeline';
import AiInterviewRoom from './features/aiInterview/pages/AiInterviewRoom';
import PublicJobBoard from './features/candidatePortal/pages/PublicJobBoard';
import ApplyForm from './features/candidatePortal/pages/ApplyForm';
import MyApplications from './features/candidatePortal/pages/MyApplications';
import HirerDashboard from './features/hirer/pages/HirerDashboard';
import InterviewReport from './features/hirer/pages/InterviewReport';

// Shared
import Layout from './shared/layouts/Layout';
import { ToastProvider } from './shared/context/ToastContext';

const PrivateRoute = ({ children }) => {
  const token = useAppSelector(selectToken);
  return token ? children : <Navigate to="/login" />;
};

const HirerOnly = ({ children }) => {
  const role = useAppSelector(selectRole);
  const isHirer = role === 'recruiter' || role === 'hirer';
  return isHirer ? children : <Navigate to="/" />;
};

const CandidateOnly = ({ children }) => {
  const role = useAppSelector(selectRole);
  const isCandidate = role === 'candidate' || role === 'job_seeker';
  return isCandidate ? children : <Navigate to="/" />;
};

function App() {
  return (
    <Provider store={store}>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Public no-auth routes — candidate job browsing */}
            <Route path="/browse" element={<PublicJobBoard />} />
            <Route path="/jobs/:jobId/apply" element={<ApplyForm />} />

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
              <Route index element={<Dashboard />} />

              {/* Hirer routes */}
              <Route path="resumes" element={<HirerOnly><Resumes /></HirerOnly>} />
              <Route path="jobs" element={<HirerOnly><Jobs /></HirerOnly>} />
              <Route path="screening" element={<HirerOnly><Screening /></HirerOnly>} />
              <Route path="interview-rooms" element={<HirerOnly><InterviewRooms /></HirerOnly>} />
              <Route path="analytics" element={<HirerOnly><Analytics /></HirerOnly>} />
              <Route path="pdf-tools" element={<PdfTools />} />
              <Route path="template-studio" element={<TemplateStudio />} />
              <Route path="resume-studio" element={<ResumeStudio />} />
              <Route path="chat" element={<Chat />} />

              {/* Phase-2 hiring automation — hirer */}
              <Route path="hirer" element={<HirerOnly><HirerDashboard /></HirerOnly>} />
              <Route path="job-postings" element={<HirerOnly><JobPostings /></HirerOnly>} />
              <Route path="job-postings/new" element={<HirerOnly><NewJobPosting /></HirerOnly>} />
              <Route path="pipeline/:jobId" element={<HirerOnly><CandidatePipeline /></HirerOnly>} />
              <Route path="interview-report/:sessionId" element={<HirerOnly><InterviewReport /></HirerOnly>} />

              {/* Candidate-side */}
              <Route path="my-applications" element={<MyApplications />} />
              <Route path="ai-interview/:roomId/:journeyId" element={<AiInterviewRoom />} />

              {/* Candidate routes */}
              <Route path="job-board" element={<CandidateOnly><JobBoard /></CandidateOnly>} />
              <Route path="mock-interview" element={<CandidateOnly><MockInterview /></CandidateOnly>} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </Provider>
  );
}

export default App;
