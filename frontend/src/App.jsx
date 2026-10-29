import LoadingScreen from './components/LoadingScreen';
import StudentQuiz from './components/StudentQuiz';
import { ArenaScreen, DashboardScreen, IdentityScreen, LeaderboardScreen, LoginScreen, PasswordResetScreen, ProjectScreen, QuestScreen, ReferralScreen, RegisterScreen, ShareScreen, VerifyEmailScreen } from './pages/StudentPages';
import WorkshopScreen from './pages/WorkshopScreen';
import EmailVerificationScreen from './pages/EmailVerificationScreen';
import AdminDashboard from './pages/AdminDashboard';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';

function AppRoutes() {
  const navigate = useNavigate();
  const location = useLocation();
  if (location.pathname === '/' && new URLSearchParams(location.search).get('screen') === 'quiz') return <Navigate to="/quiz" replace />;
  const go = (path) => navigate(path);
  return <Routes>
    <Route path="/" element={<LoadingScreen onComplete={() => go('/quiz')} />} />
    <Route path="/quiz" element={<StudentQuiz onComplete={() => go('/identity')} />} />
    <Route path="/identity" element={<IdentityScreen navigate={go} />} />
    <Route path="/share" element={<ShareScreen navigate={go} />} />
    <Route path="/register" element={<RegisterScreen navigate={go} />} />
    <Route path="/login" element={<LoginScreen navigate={go} />} />
    <Route path="/admin" element={<AdminDashboard />} />
    <Route path="/verify-email" element={<EmailVerificationScreen navigate={go} />} />
    <Route path="/reset-password" element={<PasswordResetScreen navigate={go} />} />
    <Route path="/workshop" element={<WorkshopScreen navigate={go} />} />
    <Route path="/quest/day/:day" element={<QuestRoute navigate={go} />} />
    <Route path="/project" element={<ProjectScreen navigate={go} />} />
    <Route path="/arena" element={<ArenaScreen navigate={go} />} />
    <Route path="/referrals" element={<ReferralScreen navigate={go} />} />
    <Route path="/leaderboard" element={<LeaderboardScreen navigate={go} />} />
    <Route path="/dashboard" element={<DashboardScreen navigate={go} />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}

function QuestRoute({ navigate }) {
  const { day } = useParams();
  return <QuestScreen day={Number(day) || 1} navigate={navigate} />;
}

export default function App() {
  return <BrowserRouter><AppRoutes /></BrowserRouter>;
}
