// src/components/auth/LoginForm.tsx
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import PasswordInput from "@/components/auth/PasswordInput";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { login as apiLogin, me, googleAuth } from "@/services/auth.service";
import { ApiError } from "@/lib/apiError";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";
import "@/index.css";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { useAuth } from "@/hooks/useAuth";
import { useGoogleButtonMetrics } from "@/hooks/useGoogleButtonMetrics";
import { useState } from "react";
import { ROUTES } from "@/constants/routes";

const IS_DEMO_MODE = import.meta.env.VITE_MOCK_MODE !== "false";


// Per the new Swagger spec: only email and password
const schema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Please enter your password."),
});




type Values = z.infer<typeof schema>;

export default function LoginForm({
  onLogin,
  onForgot,
}: {
  onLogin?: (payload: { email: string; password: string }) => Promise<{ accessToken: string; expiresAt?: number; user?: any }>;
  onForgot?: () => void;
}) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);

  // Dynamic width measurement for Google button
  const { containerRef: googleContainerRef, buttonWidth: googleButtonWidth, borderRadius: buttonBorderRadius } = useGoogleButtonMetrics();

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: IS_DEMO_MODE ? "demo@profejoo.dev" : "", password: IS_DEMO_MODE ? "demo1234" : "" },
    mode: "onSubmit",
    shouldFocusError: true,
  });

  // Google OAuth handler - receiving the ID token
  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    const idToken = credentialResponse.credential;
    if (!idToken) {
      toast.error("Google login failed", { 
        description: "No credential received from Google" 
      });
      return;
    }

    try {
      setGoogleLoading(true);
      await googleAuth(idToken);
      
      toast.success("Welcome!", { 
        description: "Google login successful. Redirecting to dashboard..." 
      });
      
      // Redirect with full page reload to refresh auth context
      window.location.href = ROUTES.DASHBOARD;
    } catch (e: any) {
      toast.error("Google login failed", { 
        description: e instanceof ApiError ? e.message : "Unable to authenticate with Google" 
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast.error("Google login failed", { 
      description: "Unable to authenticate with Google. Please try again." 
    });
  };

  // If it's a JWT: three parts + a reasonable length. Otherwise, a
  // minimum length of 16 is enough.
  const isLikelyToken = (t: unknown) => {
    if (typeof t !== "string") return false;
    if (t.split(".").length === 3 && t.length >= 60) return true; // JWT
    return t.length >= 16; // non-JWT minimal
  };

  const onSubmit = async (v: Values) => {
    const email = v.email.trim();
    const password = v.password;

    try {
      form.clearErrors();

      // Using useAuth's login
      await login({ email, password });
      
      toast.success("Welcome back!", { 
        description: "Login successful. Redirecting to dashboard..." 
      });
      navigate(ROUTES.DASHBOARD, { replace: true });


    } catch (e: any) {
      let title = "Login failed";
      let description = "Unable to log in. Please check your credentials and try again.";

      if (e instanceof ApiError) {
        const status = e.status;
        const code = e.code?.toUpperCase?.();

        if (status === 404 || code === "USER_NOT_FOUND" || code === "EMAIL_NOT_FOUND") {
          title = "Account not found";
          description = "This email address is not registered. Please check your email or sign up to create a new account.";
          form.setError("email", { message: "This email is not registered" });
        } else if (status === 401 || code === "INVALID_CREDENTIALS" || code === "WRONG_PASSWORD") {
          title = "Incorrect password";
          description = "The password you entered is incorrect. Please try again or use 'Forgot Password'.";
          form.setError("password", { message: "Incorrect password" });
        } else if (status === 429 || code === "TOO_MANY_ATTEMPTS") {
          title = "Too many attempts";
          description = "You've made too many login attempts. Please wait a few minutes before trying again.";
        } else if (status === 400 || code === "VALIDATION_ERROR") {
          title = "Invalid credentials";
          description = "Please check your email and password format and try again.";
        } else if (status >= 500) {
          title = "Server error";
          description = "Our servers are experiencing issues. Please try again in a few moments.";
        } else if (!navigator.onLine) {
          title = "No internet connection";
          description = "Please check your internet connection and try again.";
        }
      } else if (!navigator.onLine) {
        title = "No internet connection";
        description = "Please check your connection and try again.";
      }

      console.error('[LoginForm] Login failed:', e);
      toast.error(title, { description });
    }
  };

  const submitting = form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 text-left">
        <FormField
          name="email"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="profejoo-primary">Email address</FormLabel>
              <FormControl>
                <Input
                  placeholder="info@example.com"
                  type="email"
                  autoComplete="email"
                  {...field}
                  disabled={submitting}
                  className="profejoo email-input"
                />
              </FormControl>
              <FormMessage className="profejoo-accent" />
            </FormItem>
          )}
        />

        <FormField
          name="password"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="profejoo-primary">Password</FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder="********"
                  autoComplete="current-password"
                  {...field}
                  disabled={submitting}
                  className="profejoo password-input"
                />
              </FormControl>
              <FormMessage className="profejoo-accent" />

              <div className="text-xs text-left">
                <button
                  type="button"
                  onClick={() => onForgot?.()}
                  disabled={submitting}
                  className="profejoo-tertiary hover:underline text-left"
                >
                  Forgot your password?
                </button>
              </div>
            </FormItem>
          )}
        />

        {IS_DEMO_MODE && (
          <div className="rounded-xl border border-[var(--primary-200)] bg-[var(--primary-50)]/60 px-4 py-3 text-sm text-[var(--primary-800)]">
            <strong>Portfolio demo:</strong> credentials are prefilled. All data stays in your browser and API calls are mocked.
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <Button
            type="submit"
            disabled={submitting || googleLoading}
            className="profejoo btn btn--secondary btn--md w-full sm:w-1/2 flex-1"
            style={{
              borderRadius: buttonBorderRadius
            }}
          >
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Log in
          </Button>

          {!IS_DEMO_MODE && (
          <div 
            ref={googleContainerRef}
            className="w-full sm:w-1/2 flex-1 flex items-center justify-center"
          >
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap={false}
              locale="en"
              text="signin_with"
              theme="outline"
              size="large"
              width={googleButtonWidth}
            />
          </div>
          )}
        </div>

        <p className="profejoo-p profejoo-primary text-left">
          Don’t have an account?{" "}
          <Link to={ROUTES.SIGNUP} className="profejoo-large profejoo-tertiary hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </Form>
  );
}
