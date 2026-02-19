import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { useAppStore } from './store/useAppStore';
import { AppShell } from './layouts/AppShell';

// Pages
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Welcome from './pages/Welcome';
import CourseStart from './pages/CourseStart';
import Objectives from './pages/Objectives';
import ObjectiveDetail from './pages/ObjectiveDetail';
import Units from './pages/Units';
import LessonsList from './pages/LessonsList';
import LessonDetail from './pages/LessonDetail';
import Chat from './pages/Chat';
import Activity from './pages/Activity';
import Survey from './pages/Survey';
import SurveyResults from './pages/SurveyResults';
import Roadmap from './pages/Roadmap';
import Settings from './pages/Settings';

// ─── Protected route ────────────────────────────────────────────────────────

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const activeUserId = useAppStore((s) => s.activeUserId);
  if (!activeUserId) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// ─── App routes ──────────────────────────────────────────────────────────────

const AppRoutes: React.FC = () => {
  return (
    <AppShell>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Protected */}
        <Route
          path="/onboarding"
          element={<ProtectedRoute><Onboarding /></ProtectedRoute>}
        />
        <Route
          path="/welcome"
          element={<ProtectedRoute><Welcome /></ProtectedRoute>}
        />
        <Route
          path="/course-start"
          element={<ProtectedRoute><CourseStart /></ProtectedRoute>}
        />
        <Route
          path="/objectives"
          element={<ProtectedRoute><Objectives /></ProtectedRoute>}
        />
        <Route
          path="/objectives/:id"
          element={<ProtectedRoute><ObjectiveDetail /></ProtectedRoute>}
        />
        <Route
          path="/units"
          element={<ProtectedRoute><Units /></ProtectedRoute>}
        />
        <Route
          path="/units/:unitId/lessons"
          element={<ProtectedRoute><LessonsList /></ProtectedRoute>}
        />
        <Route
          path="/units/:unitId/lessons/:lessonId"
          element={<ProtectedRoute><LessonDetail /></ProtectedRoute>}
        />
        <Route
          path="/units/:unitId/lessons/:lessonId/chat"
          element={<ProtectedRoute><Chat /></ProtectedRoute>}
        />
        <Route
          path="/units/:unitId/lessons/:lessonId/activity"
          element={<ProtectedRoute><Activity /></ProtectedRoute>}
        />
        <Route
          path="/survey"
          element={<ProtectedRoute><Survey /></ProtectedRoute>}
        />
        <Route
          path="/survey/results"
          element={<ProtectedRoute><SurveyResults /></ProtectedRoute>}
        />
        <Route
          path="/roadmap"
          element={<ProtectedRoute><Roadmap /></ProtectedRoute>}
        />
        <Route
          path="/settings"
          element={<ProtectedRoute><Settings /></ProtectedRoute>}
        />

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AppShell>
  );
};

// ─── Root App ────────────────────────────────────────────────────────────────

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="app-container">
        <AppRoutes />
      </div>
    </BrowserRouter>
  );
};

export default App;
