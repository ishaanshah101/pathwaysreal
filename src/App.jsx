import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { useProfile } from '@/lib/useProfile';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import RequireAuth, { Spinner } from '@/components/RequireAuth';
import ScrollToTop from './components/ScrollToTop';
import Layout from '@/components/Layout';

// Phase 1 — the public landing experience
import Home from '@/pages/Home';
import HowItWorks from '@/pages/HowItWorks';
import Sage from '@/pages/Sage';
import Faq from '@/pages/Faq';
import Join from '@/pages/Join';
import Privacy from '@/pages/Privacy';
import Terms from '@/pages/Terms';

// Auth
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import OAuthConsent from '@/pages/OAuthConsent';
import Onboarding from '@/pages/Onboarding';

// Phase 2 — the real app
import AppShell from '@/components/app/AppShell';
import Feed from '@/pages/app/Feed';
import Explore from '@/pages/app/Explore';
import Messages from '@/pages/app/Messages';
import SageChat from '@/pages/app/SageChat';
import ProfilePage from '@/pages/app/ProfilePage';

// The root decides Phase 1 vs Phase 2 from REAL auth state, not a hardcoded
// assumption. A logged-out visitor gets the landing page; a signed-in user is
// carried into the app (or into onboarding if they never finished it), on first
// load, on refresh, and on every return visit.
const RootRoute = () => {
  const { isAuthenticated, isLoadingAuth, isLoadingPublicSettings } = useAuth();
  const { isLoadingProfile, isOnboarded } = useProfile();

  if (isLoadingPublicSettings || isLoadingAuth) return <Spinner />;
  if (!isAuthenticated) return <Home />;
  if (isLoadingProfile) return <Spinner />;
  if (!isOnboarded) return <Navigate to="/onboarding" replace />;
  return <Navigate to="/app" replace />;
};

const AuthenticatedApp = () => {
  const { isLoadingPublicSettings, authError } = useAuth();

  if (isLoadingPublicSettings) return <Spinner />;

  // Only a genuine "you are not a member of this app" state is fatal.
  // auth_required is NOT fatal here: the landing pages are public, and
  // RequireAuth sends visitors to login only for the routes that need it.
  if (authError?.type === 'user_not_registered') {
    return <UserNotRegisteredError />;
  }

  return (
    <Routes>
      {/* Phase 1 — public marketing site */}
      <Route element={<Layout />}>
        <Route path="/" element={<RootRoute />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/sage" element={<Sage />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/join" element={<Join />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
      </Route>

      {/* Auth pages — these existed but were never routed, so every
          "Continue with Google" and password flow landed on a 404. */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/oauth-consent" element={<OAuthConsent />} />

      {/* Bridge between signing in and entering the app */}
      <Route
        path="/onboarding"
        element={<RequireAuth><Onboarding /></RequireAuth>}
      />

      {/* Phase 2 — the real app */}
      <Route
        path="/app"
        element={<RequireAuth requireOnboarded><AppShell /></RequireAuth>}
      >
        <Route index element={<Feed />} />
        <Route path="explore" element={<Explore />} />
        <Route path="messages" element={<Messages />} />
        <Route path="sage" element={<SageChat />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
