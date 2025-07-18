import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { supabase } from "@/supabaseClient";

import Layout from "./components/Layout";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import CreateCatalog from "./pages/CreateCatalog";
import PreviewCatalog from "./pages/PreviewCatalog";
import CatalogPreviewBySlug from "./pages/CatalogPreviewBySlug";
import EditCatalog from "./pages/EditCatalog";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

const queryClient = new QueryClient();

function AppWrapper() {
  const navigate = useNavigate();

  useEffect(() => {
    const publicRoutes = [
      "/",
      "/login",
      "/register",
      "/forgot-password",
      "/reset-password",
    ];

    // Function to detect public route including /catalog/:id and /:slug
    const isPublicRoute = (path: string) =>
      publicRoutes.includes(path) ||
      /^\/catalog\/[^/]+$/.test(path) ||  // matches /catalog/abc123
      /^\/[^/]+$/.test(path);            // matches /Johns_Store

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const path = window.location.pathname;
      if (!session && !isPublicRoute(path)) {
        navigate("/login");
      }
    });

    const checkInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const path = window.location.pathname;

      if (!session && !isPublicRoute(path)) {
        navigate("/login");
      }
    };

    checkInitialSession();

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/catalog/:id" element={<PreviewCatalog />} />
      <Route path="/:slug" element={<CatalogPreviewBySlug />} />

      {/* Protected Routes inside Layout */}
      <Route element={<Layout />}>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create"
          element={
            <ProtectedRoute>
              <CreateCatalog />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit/:id"
          element={
            <ProtectedRoute>
              <EditCatalog />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <AppWrapper />
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
