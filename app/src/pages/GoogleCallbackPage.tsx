import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { ROUTES } from "@/constants/routes";

export default function GoogleCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");
        const refreshToken = params.get("refresh_token");
        const expiresAt = params.get("expires_at");
        const user = params.get("user");

        if (token && refreshToken && expiresAt) {
          // Save tokens to localStorage
          localStorage.setItem("accessToken", token);
          localStorage.setItem("refreshToken", refreshToken);
          localStorage.setItem("expiresAt", expiresAt);
          
          if (user) {
            try {
              const userData = JSON.parse(decodeURIComponent(user));
              localStorage.setItem("user", JSON.stringify(userData));
            } catch (e) {
              console.error("Failed to parse user data:", e);
            }
          }

          // Redirect to dashboard
          navigate(ROUTES.DASHBOARD, { replace: true });
        } else {
          // If no token, redirect to login
          navigate(ROUTES.LOGIN, { replace: true });
        }
      } catch (error) {
        console.error("Google callback error:", error);
        navigate(ROUTES.LOGIN, { replace: true });
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-tertiary-50">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary-500" />
        <p className="mt-4 text-lg text-gray-600">Authenticating with Google...</p>
      </div>
    </div>
  );
}
