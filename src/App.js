import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Resumes from './pages/Resumes';
import Jobs from './pages/Jobs';
import Screening from './pages/Screening';
import Chat from './pages/Chat';
import ResumeBuilder from './pages/ResumeBuilder';
import Layout from './components/Layout';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('hireiq_token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="resumes" element={<Resumes />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="screening" element={<Screening />} />
          <Route path="chat" element={<Chat />} />
          <Route path="resume-builder" element={<ResumeBuilder />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;