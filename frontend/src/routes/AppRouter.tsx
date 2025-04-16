// src/routes/AppRouter.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import NewDecisionPage from '../pages/NewDecisionPage';
import ValueCalibrationPage from '../pages/ValueCalibrationPage';
import ReflectionPage from '../pages/ReflectionPage';
import ChallengesPage from '../pages/ChallengesPage';

const AppRouter: React.FC = () => (
  <Router>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/journal/new" element={<NewDecisionPage />} />
      <Route path="/value-calibration" element={<ValueCalibrationPage />} />
      <Route path="/reflection" element={<ReflectionPage />} />
      <Route path="/challenges" element={<ChallengesPage />} />
      <Route path="*" element={<LoginPage />} />
    </Routes>
  </Router>
);

export default AppRouter;
