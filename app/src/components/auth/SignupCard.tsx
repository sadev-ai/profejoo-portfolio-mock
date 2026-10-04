// src/components/auth/SignupCard.tsx
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SignupForm, { type SignupStartValues } from "@/components/auth/SignupForm";
import OtpForm from "@/components/auth/OtpForm";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  signup,                // ← signup with email, password, password_confirm
  signupVerify,          // ← verify with email, otp, password
} from "@/services/auth.service";
import { ApiError } from "@/lib/apiError";
import { ROUTES } from "@/constants/routes";


type Step = "form" | "otp";

function isDuplicateError(e: ApiError) {
  const code = (e.code || "").toUpperCase();
  return (
    e.status === 409 ||
    code === "USER_EXISTS" ||
    code === "EMAIL_TAKEN" ||
    code === "USERNAME_TAKEN" ||
    code === "ACCOUNT_EXISTS" ||
    /exist|taken|duplicate/i.test(e.message || "")
  );
}

export default function SignupCard() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("form");
  const [loading, setLoading] = useState(false);

  // First-step form data
  const [pending, setPending] = useState<SignupStartValues | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  // Step 1: signup with just email + password → sends the OTP directly
  const handleStart = async (v: SignupStartValues) => {
    setLoading(true);
    setPending(v);

    const requestPayload = {
      email: v.email,
      password: v.password,
      password_confirm: v.confirmPassword,
    };

    try {
      // Just signup → this sends the OTP directly
      await signup(requestPayload);
      
      // Move into the OTP step
      setStep("otp");

      toast.success("Verification code sent!", {
        description: `We've sent a 6-digit code to ${v.email}. Please check your inbox.`,
      });
    } catch (err: any) {
      const e = err as ApiError;
      console.error('[SignupCard] Signup failed:', e);

      let title = "Couldn't create account";
      let description = "Unable to create your account. Please try again.";
      
      // User already exists
      if (isDuplicateError(e)) {
        title = "Email already registered";
        description = "An account with this email already exists. Please sign in instead, or use the 'Forgot Password' option.";
      } else if (e.status === 400) {
        title = "Invalid information";
        description = "Please check your email and password requirements and try again.";
      } else if (e.status === 422) {
        title = "Password requirements not met";
        description = "Your password must be at least 8 characters and include uppercase, lowercase, number, and symbol.";
      } else if (e.status >= 500) {
        title = "Server error";
        description = "Our servers are experiencing issues. Please try again in a few moments.";
      } else if (!navigator.onLine) {
        title = "No internet connection";
        description = "Please check your internet connection and try again.";
      }

      toast.error(title, { description });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (otp: string) => {
    if (!pending) return;
    setLoading(true);

    const verifyPayload = {
      email: pending.email,
      otp: otp,
      password: pending.password,
    };

    try {
      // Using signupVerify, which we added to auth.service
      const res = await signupVerify(verifyPayload);
      
      // signupVerify returns a JWT itself and saves the tokens and user
      if (res.accessToken) {
        toast.success("Welcome to Profejoo!", { 
          description: "Your account has been created successfully. Redirecting to dashboard..." 
        });
        // A full page reload lets AuthContext load from localStorage
        window.location.href = ROUTES.DASHBOARD;
        return;
      }

      // Otherwise, go to login
      toast.success("Account created successfully!", {
        description: "Please log in with your credentials."
      });
      navigate(ROUTES.LOGIN, { replace: true });

    } catch (e: any) {
      console.error('[SignupCard] Verify failed:', e);
      
      let title = "Verification failed";
      let description = "Unable to verify your account. Please try again.";
      
      if (e?.status === 400 || e?.status === 401) {
        title = "Invalid verification code";
        description = "The code you entered is incorrect or has expired. Please check the code and try again.";
      } else if (e?.status === 404) {
        title = "Registration not found";
        description = "Your registration session has expired. Please sign up again.";
      } else if (e?.status === 429) {
        title = "Too many attempts";
        description = "You've made too many verification attempts. Please wait a few minutes before trying again.";
      } else if (e?.status >= 500) {
        title = "Server error";
        description = "Our servers are experiencing issues. Please try again in a few moments.";
      } else if (!navigator.onLine) {
        title = "No internet connection";
        description = "Please check your internet connection and try again.";
      }
      
      toast.error(title, { description });
    } finally {
      setLoading(false);
    }
  };


  // Resend code (currently disabled)
  const handleResend = async () => {
    if (!pending || cooldown > 0) return;
    toast.info("Resend is not available yet.");
  };

  // Go back from OTP to the form
  const handleBack = () => {
    setStep("form");
    setCooldown(0);
    // If you want the form to fully reset:
    // setPending(null);
  };

  return (
    <Card className="profejoo rounded-2xl shadow-lg w-full border-none">
      <CardHeader className="w-full pb-2">
        <CardTitle className="profejoo-h2 profejoo-primary">
          {step === "form" ? "Signup" : "Enter verification code"}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6 w-full">
        {step === "form" ? (
          <SignupForm onStart={handleStart} loading={loading} />
        ) : (
          <OtpForm
            email={pending?.email ?? ""}
            cooldown={cooldown}
            loading={loading}
            onVerify={handleVerify}
            onResend={handleResend}
            onBack={handleBack}
          />
        )}

        {/* {import.meta.env.DEV && (
          <div className="mt-4 space-y-2 rounded-lg border p-3 text-xs bg-muted/30">
            <div className="font-medium">Debug (Signup)</div>
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
          </div>
        )} */}
      </CardContent>
    </Card>
  );
}
