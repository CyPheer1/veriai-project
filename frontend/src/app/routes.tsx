import { createBrowserRouter, Outlet } from "react-router";
import { AppProvider } from "./context/AppContext";
import { LoginPage } from "./pages/LoginPage";
import { GuestDashboard } from "./pages/GuestDashboard";
import { LoggedInDashboard } from "./pages/LoggedInDashboard";

function Root() {
  return (
    <div className="min-h-screen bg-[#f4f7fb] font-['Outfit',system-ui,sans-serif] text-[#101828] antialiased">
      <Outlet />
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
