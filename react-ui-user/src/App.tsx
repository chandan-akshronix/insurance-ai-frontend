import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import AIAssistant from "./components/AIAssistant";
import Homepage from "./components/pages/Homepage";
import Login from "./components/pages/Login";
import AboutUs from "./components/pages/AboutUs";
import LifeInsurance from "./components/pages/LifeInsurance";
import LifeInsuranceBrochure from "./components/pages/LifeInsuranceBrochure";
import CarInsurance from "./components/pages/CarInsurance";
import HealthInsurance from "./components/pages/HealthInsurance";
import Quotes from "./components/pages/Quotes";
import Confirmation from "./components/pages/Confirmation";
import Dashboard from "./components/pages/Dashboard";
import Profile from "./components/pages/Profile";
import AdminPanelApp from "./components/AdminPanelApp";
import ClaimsSubmit from "./components/pages/ClaimsSubmit";
import ClaimsTrack from "./components/pages/ClaimsTrack";
import CarClaim from "./components/pages/CarClaim";
import Contact from "./components/pages/Contact";
import FAQ from "./components/pages/FAQ";
import Terms from "./components/pages/Terms";

/**
 * AppContent Component
 * 
 * Main application content wrapper with conditional layout rendering.
 * 
 * Layout Isolation:
 * - On admin routes (/admin), Navigation, Footer, and AIAssistant are hidden
 * - AdminPanelApp handles its own full-screen layout with sidebar
 * - On all other routes, standard layout with Navigation/Footer is shown
 */
function AppContent() {
  const location = useLocation();
  // Hide Navigation/Footer on admin routes for full-screen admin panel experience
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col">
      {!isAdminRoute && <Navigation />}
      <main className="flex-1">
        <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Homepage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/terms" element={<Terms />} />

              {/* Life Insurance Routes */}
              {/* Brochure page - Public so users can view before signing up */}
              <Route
                path="/life-insurance"
                element={<LifeInsuranceBrochure />}
              />
              {/* Application form - Protected, requires login */}
              <Route
                path="/life-insurance/apply"
                element={
                  <ProtectedRoute>
                    <LifeInsurance />
                  </ProtectedRoute>
                }
              />

              {/* Other Protected Routes - Require Login */}
              <Route
                path="/car-insurance"
                element={
                  <ProtectedRoute>
                    <CarInsurance />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/health-insurance"
                element={
                  <ProtectedRoute>
                    <HealthInsurance />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quotes"
                element={
                  <ProtectedRoute>
                    <Quotes />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/confirmation"
                element={
                  <ProtectedRoute>
                    <Confirmation />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/claims/submit"
                element={
                  <ProtectedRoute>
                    <ClaimsSubmit />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/claims/track"
                element={
                  <ProtectedRoute>
                    <ClaimsTrack />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/claims/car"
                element={
                  <ProtectedRoute>
                    <CarClaim />
                  </ProtectedRoute>
                }
              />

              {/* Admin Only Route - Full Admin Panel Interface */}
              {/* 
                AdminPanelApp integrates the complete admin_panel folder interface.
                It imports all components directly from the separate admin_panel folder,
                maintaining the exact design and functionality of the original admin panel.
                The admin panel renders in full-screen mode without Navigation/Footer.
              */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminPanelApp />
                  </ProtectedRoute>
                }
              />

              <Route
                path="*"
                element={<Navigate to="/" replace />}
              />
            </Routes>
          </main>
          {!isAdminRoute && <Footer />}
          {!isAdminRoute && <AIAssistant />}
          <Toaster />
        </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}
