import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { PublicPortfolio } from './pages/PublicPortfolio';
import { Projects } from './pages/Projects';
import { ResumeBuilder } from './pages/ResumeBuilder';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Settings } from './pages/Settings';
import { Inbox } from './pages/Inbox';

function App() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={user.student?.slug ? <Navigate to={`/${user.student.slug}`} replace /> : <Navigate to="/login" replace />} />
      
      <Route path="/:username" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="projects" element={<Projects />} />
        <Route path="resume-builder" element={<ResumeBuilder />} />
        <Route path="settings" element={<Settings />} />
        <Route path="inbox" element={<Inbox />} />
      </Route>
      
      <Route path="/:username/portfolio" element={<PublicPortfolio />} />
    </Routes>
  );
}

export default App;
