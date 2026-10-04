import { Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { GoogleOAuthProvider } from "@react-oauth/google";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
const IS_DEMO_MODE = import.meta.env.VITE_MOCK_MODE !== "false";

function AppContent() {
  return (
    <>
      <Outlet />
      <Toaster position="top-center" duration={3000} />
    </>
  );
}

export default function App() {
  if (IS_DEMO_MODE || !GOOGLE_CLIENT_ID) return <AppContent />;
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AppContent />
    </GoogleOAuthProvider>
  );
}
