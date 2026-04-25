import { createBrowserRouter, Outlet } from "react-router";
import { AppProvider, useApp } from "./context/AppContext";
import { AmbientBackground } from "./components/AmbientBackground";
import { NeuralBackground } from "./components/NeuralBackground";
import { LoginPage } from "./pages/LoginPage";
import { GuestDashboard } from "./pages/GuestDashboard";
import { LoggedInDashboard } from "./pages/LoggedInDashboard";

function Root() {
  const { isDark } = useApp();

  return (
    <div
      className="min-h-screen font-['Inter',sans-serif] transition-colors duration-300"
      style={{ background: isDark ? "#050505" : "#FBFBFD" }}
    >
      <AmbientBackground />
      <NeuralBackground />
      <div className="relative z-10">
        <Outlet />
      </div>
    </div>
  );
}

function RootWithProvider() {
  return (
    <AppProvider>
      <Root />
    </AppProvider>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootWithProvider,
    children: [
      { index: true, Component: GuestDashboard },
      { path: "login", Component: LoginPage },
      { path: "dashboard", Component: LoggedInDashboard },
    ],
  },
]);