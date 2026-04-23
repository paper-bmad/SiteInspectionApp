import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginScreen } from './components/LoginScreen';
import { ProjectsScreen } from './components/ProjectsScreen';
import { ProjectBriefing } from './components/ProjectBriefing';
import { InspectionScreen } from './components/InspectionScreen';
import { InspectionReview } from './components/InspectionReview';
import { UserPreferencesScreen } from './components/UserPreferences';
import { ComplianceChecker } from './components/ComplianceChecker';
import { ErrorBoundary } from './components/ErrorBoundary';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = localStorage.getItem('auth_token') !== null;
  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
}

function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<LoginScreen />} />
        <Route
          path="/preferences"
          element={
            <PrivateRoute>
              <UserPreferencesScreen />
            </PrivateRoute>
          }
        />
        <Route
          path="/projects"
          element={
            <PrivateRoute>
              <ProjectsScreen />
            </PrivateRoute>
          }
        />
        <Route
          path="/projects/:projectId"
          element={
            <PrivateRoute>
              <ProjectBriefing />
            </PrivateRoute>
          }
        />
        <Route
          path="/inspection/:projectId"
          element={
            <PrivateRoute>
              <InspectionScreen />
            </PrivateRoute>
          }
        />
        <Route
          path="/inspection/:projectId/review"
          element={
            <PrivateRoute>
              <InspectionReview />
            </PrivateRoute>
          }
        />
        <Route
          path="/compliance"
          element={
            <PrivateRoute>
              <ComplianceChecker />
            </PrivateRoute>
          }
        />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
