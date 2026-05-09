import { createBrowserRouter, Outlet } from "react-router";
import { AppProvider } from "./context/AppContext";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { GuestDashboard } from "./pages/GuestDashboard";
import { LoggedInDashboard } from "./pages/LoggedInDashboard";
import { ScanHistoryPage } from "./pages/ScanHistoryPage";
import { BillingCancelPage, BillingSuccessPage } from "./pages/BillingStatusPage";

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
      { path: "signup", Component: SignupPage },
      { path: "dashboard", Component: LoggedInDashboard },
      { path: "history", Component: ScanHistoryPage },
      { path: "billing/success", Component: BillingSuccessPage },
      { path: "billing/cancel", Component: BillingCancelPage },
    ],
  },
]);
