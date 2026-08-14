import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import RoleRoute from "@/components/RoleRoute";
import PushPrompt from "@/components/PushPrompt";
import OnboardingGate from "@/components/OnboardingGate";
import CreditGate from "@/components/CreditGate";
import RoleHomeRedirect from "@/components/RoleHomeRedirect";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import BusinessInfo from "./pages/BusinessInfo";
import MyWhatsApp from "./pages/MyWhatsApp";
import StoreManagement from "./pages/StoreManagement";
import MyProducts from "./pages/MyProducts";
import PublicStore from "./pages/PublicStore";
import MessageTopUp from "./pages/MessageTopUp";
import Orders from "./pages/Orders";
import Schedule from "./pages/Schedule";
import AdminDashboard from "./pages/AdminDashboard";
import AdminTokens from "./pages/AdminTokens";
import HumanTransfers from "./pages/HumanTransfers";
import SubAdminDashboard from "./pages/SubAdminDashboard";
import NotFound from "./pages/NotFound.tsx";
import LandingPageMWY from "../LandingPageMWY";
import SubAdminCreateUser from "./pages/subadmin/CreateUser";
import SubAdminUsers from "./pages/subadmin/Users";
import SubAdminNotifyAdmin from "./pages/subadmin/NotifyAdmin";
import { PrivacyPolicy } from "./pages/PrivacyPolicy";
import { TermsOfUse } from "./pages/TermsOfUse";
import { PrivacyPolicyViewer } from "./pages/PrivacyPolicyViewer";
import { TermsOfUseViewer } from "./pages/TermsOfUseViewer";

const queryClient = new QueryClient();
const protectedPage = (page: JSX.Element) => (
  <ProtectedRoute>
    <OnboardingGate>
      <CreditGate>{page}</CreditGate>
    </OnboardingGate>
  </ProtectedRoute>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <PushPrompt />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/loja/:slug" element={<PublicStore />} />
            <Route path="/" element={<LandingPageMWY />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <RoleHomeRedirect>
                    <OnboardingGate>
                      <CreditGate>
                        <Dashboard />
                      </CreditGate>
                    </OnboardingGate>
                  </RoleHomeRedirect>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <RoleRoute allow={["admin"]}>
                  <AdminDashboard />
                </RoleRoute>
              }
            />
            <Route
              path="/admin/tokens"
              element={
                <RoleRoute allow={["admin"]}>
                  <AdminTokens />
                </RoleRoute>
              }
            />
            <Route
              path="/gestor"
              element={
                <RoleRoute allow={["sub_admin"]}>
                  <SubAdminDashboard />
                </RoleRoute>
              }
            />
            <Route
              path="/gestor/create-user"
              element={
                <RoleRoute allow={["sub_admin"]}>
                  <SubAdminCreateUser />
                </RoleRoute>
              }
            />
            <Route
              path="/gestor/users"
              element={
                <RoleRoute allow={["sub_admin"]}>
                  <SubAdminUsers />
                </RoleRoute>
              }
            />
            <Route
              path="/gestor/notify-admin"
              element={
                <RoleRoute allow={["sub_admin"]}>
                  <SubAdminNotifyAdmin />
                </RoleRoute>
              }
            />
            <Route path="/negocio" element={protectedPage(<BusinessInfo />)} />
            <Route path="/whatsapp" element={protectedPage(<MyWhatsApp />)} />
            <Route path="/pedidos" element={protectedPage(<Orders />)} />
            <Route path="/agenda" element={protectedPage(<Schedule />)} />
            <Route
              path="/transferido-para-humano"
              element={protectedPage(<HumanTransfers />)}
            />
            <Route
              path="/minha-loja"
              element={protectedPage(<StoreManagement />)}
            />
            <Route path="/produtos" element={protectedPage(<MyProducts />)} />
            <Route
              path="/recargas"
              element={
                <ProtectedRoute>
                  <OnboardingGate>{<MessageTopUp />}</OnboardingGate>
                </ProtectedRoute>
              }
            />
            <Route
              path="/politica-privacidade"
              element={<PrivacyPolicyViewer />}
            />
            <Route path="/termos-uso" element={<TermsOfUseViewer />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
