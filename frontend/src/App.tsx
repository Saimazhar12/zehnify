import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import FeaturesPage from './pages/FeaturesPage';
import ForDoctorsPage from './pages/ForDoctorsPage';
import AboutUsPage from './pages/AboutUsPage';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import PatientApp from './pages/PatientApp';
import DashboardHome from './pages/DashboardHome.tsx';
import ChatInterface from './components/ChatInterface.tsx';
import JournalSection from './components/JournalSection.tsx';
import ExerciseSection from './components/ExerciseSection.tsx';
import ResourcesSection from './components/ResourcesSection.tsx';
import ArticleReaderPage from './pages/ArticleReaderPage';
import DoctorArticlesPage from './pages/DoctorArticlesPage';
import MoodInsightsPage from './pages/MoodInsightsPage';
import DoctorPanel from './pages/DoctorPanel';
import AdminDashboard from './pages/AdminDashboard';
import GoogleAuthCallback from './pages/GoogleAuthCallback';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import { useAppContext } from './context/AppContext';

function App() {
  const {
    handleLogout
  } = useAppContext();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/features" element={<FeaturesPage />} />
      <Route path="/doctors" element={<ForDoctorsPage />} />
      <Route path="/about" element={<AboutUsPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/auth/google/callback" element={<GoogleAuthCallback />} />

      {/* Protected Routes */}
      <Route
        path="/app"
        element={
          <ProtectedRoute allowedRoles={['user', 'admin']}>
            <PatientApp handleLogout={handleLogout} />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="chat" element={<ChatInterface />} />
        <Route path="journal" element={<JournalSection />} />
        <Route path="exercise" element={<ExerciseSection />} />
        <Route path="resources" element={<ResourcesSection />} />
        <Route path="resources/:articleId" element={<ArticleReaderPage />} />
      </Route>

      <Route
        path="/doctor"
        element={
          <ProtectedRoute allowedRoles={['doctor', 'admin']}>
            <DoctorPanel />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/articles"
        element={
          <ProtectedRoute allowedRoles={['doctor', 'admin']}>
            <DoctorArticlesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/insights/:patientId"
        element={
          <ProtectedRoute allowedRoles={['doctor', 'admin']}>
            <MoodInsightsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;