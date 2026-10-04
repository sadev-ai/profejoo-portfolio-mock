// src/components/auth/LoginCard.tsx
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LoginForm from "@/components/auth/LoginForm";
import ForgotPasswordCard from "@/components/auth/ForgotPasswordCard";
import { login as apiLogin } from "@/services/auth.service";
import "@/index.css";

type Mode = "login" | "forgot";

export default function LoginCard() {
  const [mode, setMode] = useState<Mode>("login");

  const [lastRequest, setLastRequest] = useState<any>(null);
  const [lastResponse, setLastResponse] = useState<any>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  // Just a lightweight wrapper for debugging; no toast, no navigate
  const debugLogin = async (payload: { email: string; password: string }) => {
    setLastRequest({ ...payload, password: "[REDACTED]" });
    setLastResponse(null);
    setLastError(null);

    try {
      const res = await apiLogin(payload); // { accessToken, ... } or throws
      setLastResponse(res);
      return res; // LoginForm handles the rest of the flow (toast + redirect)
    } catch (e: any) {
      const msg = e?.message ?? "Request failed";
      setLastError(msg);
      throw e; // LoginForm handles the error (setting it on fields + toast)
    }
  };

  return (
    <Card className="profejoo rounded-2xl shadow-lg flex gap-10 items-start w-full border-none">
      <CardHeader>
        <CardTitle className="profejoo-h2 profejoo-primary">
          {mode === "login" ? "Login" : "Forgot password"}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6 w-full">
        {mode === "login" ? (
          <>
            <LoginForm onLogin={debugLogin} onForgot={() => setMode("forgot")} />
          </>
        ) : (
          <>
            <ForgotPasswordCard
              goLogin={() => setMode("login")}
              defaultEmail={
                typeof lastRequest?.email === "string" &&
                lastRequest.email.includes("@")
                  ? lastRequest.email
                  : ""
              }
            />
          </>
        )}

        {/* Optional debug panel
        {import.meta.env.DEV && (
          <div className="mt-2 space-y-2 rounded-lg border p-3 text-xs bg-muted/30">
            <div className="font-medium">Debug (POST /api/auth/login)</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div>
                <div className="opacity-70 mb-1">Request</div>
                <pre className="whitespace-pre-wrap break-words">
                  {JSON.stringify(lastRequest, null, 2) || "—"}
                </pre>
              </div>
              <div>
                <div className="opacity-70 mb-1">Response</div>
                <pre className="whitespace-pre-wrap break-words">
                  {JSON.stringify(lastResponse, null, 2) || "—"}
                </pre>
              </div>
              <div>
                <div className="opacity-70 mb-1">Error</div>
                <pre className="whitespace-pre-wrap break-words">
                  {lastError || "—"}
                </pre>
              </div>
            </div>
            {lastResponse?.accessToken && (
              <div className="mt-2">
                accessToken: <code className="break-words">{lastResponse.accessToken}</code>
              </div>
            )}
          </div>
        )} */}
      </CardContent>
    </Card>
  );
}
