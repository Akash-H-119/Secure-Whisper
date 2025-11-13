import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import OnboardingPage from "./pages/OnboardingPage";
import ChatPage from "./pages/ChatPage";
import SettingsPage from "./pages/SettingsPage";
import AboutPage from "./pages/AboutPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const router = createBrowserRouter(
  [
    { path: "/", element: <Index /> },
    { path: "/auth", element: <AuthPage /> },
    { path: "/onboarding", element: <OnboardingPage /> },
    { path: "/chat", element: <ChatPage /> },
    { path: "/settings", element: <SettingsPage /> },
    { path: "/about", element: <AboutPage /> },
    // ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE
    { path: "*", element: <NotFound /> },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
      v7_normalizeFormMethod: true
    }
  }
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <RouterProvider router={router} />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
