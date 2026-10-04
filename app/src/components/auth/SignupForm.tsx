// src/components/auth/SignupForm.tsx
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import PasswordInput from "@/components/auth/PasswordInput";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import "@/index.css";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { googleAuth } from "@/services/auth.service";
import { ApiError } from "@/lib/apiError";
import { toast } from "sonner";
import { useState } from "react";
import { useGoogleButtonMetrics } from "@/hooks/useGoogleButtonMetrics";
import { ROUTES } from "@/constants/routes";

const IS_DEMO_MODE = import.meta.env.VITE_MOCK_MODE !== "false";

// Per the new Swagger spec: only email, password, password_confirm
export const schema = z.object({
  email: z.string().email("Please enter a valid email address!"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .regex(/[a-z]/, "Must include a lowercase letter.")
    .regex(/[A-Z]/, "Must include an uppercase letter.")
    .regex(/[0-9]/, "Must include a number.")
    .regex(/[^A-Za-z0-9]/, "Must include a symbol."),
  confirmPassword: z.string().min(8, "Please re-enter your password."),
  acceptTos: z.boolean().refine((v) => v === true, {
    message: "You must accept the Terms & Privacy.",
  }),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

export type SignupStartValues = z.infer<typeof schema>;

export default function SignupForm({
  onStart,
  loading,
}: {
  onStart: (v: SignupStartValues) => Promise<void> | void;
  loading?: boolean;
}) {
  const navigate = useNavigate();
  const [googleLoading, setGoogleLoading] = useState(false);

  // Dynamic width measurement for Google button
  const { containerRef: googleContainerRef, buttonWidth: googleButtonWidth, borderRadius: buttonBorderRadius } = useGoogleButtonMetrics("8px");

  const form = useForm<SignupStartValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      acceptTos: false,
    },
    mode: "onChange",
  });

  const submit = async (v: SignupStartValues) => {
    await onStart(v);
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    // Check whether the terms of service have been accepted
    const acceptTos = form.getValues("acceptTos");
    if (!acceptTos) {
      toast.error("Terms not accepted", { 
        description: "Please accept the Terms and Privacy Policy before signing up with Google." 
      });
      return;
    }

    const idToken = credentialResponse.credential;
    if (!idToken) {
      toast.error("Google signup failed", { 
        description: "No credential received from Google" 
      });
      return;
    }

    try {
      setGoogleLoading(true);
      await googleAuth(idToken);
      
      toast.success("Welcome!", { 
        description: "Google signup successful. Redirecting to dashboard..." 
      });
      
      // Redirect with full page reload to refresh auth context
      window.location.href = ROUTES.DASHBOARD;
    } catch (e: any) {
      toast.error("Google signup failed", { 
        description: e instanceof ApiError ? e.message : "Unable to authenticate with Google" 
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast.error("Google signup failed", { 
      description: "Unable to authenticate with Google. Please try again." 
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submit)} className="space-y-4 text-left">
        <FormField
          name="email"
          control={form.control}
          render={({ field }) => (
            <FormItem className="w-full relative">
              <FormLabel className="profejoo-primary">Email address</FormLabel>
              <FormControl>
                <Input
                  placeholder="info@example.com"
                  type="email"
                  autoComplete="email"
                  {...field}
                  className="profejoo email-input"
                />
              </FormControl>
              <FormMessage className="profejoo-accent absolute -bottom-1/2" />
            </FormItem>
          )}
        />

        <div className="flex flex-col md:flex-row gap-2 mt-8">
          <FormField
            name="password"
            control={form.control}
            render={({ field }) => (
              <FormItem className="w-full relative">
                <FormLabel className="profejoo-primary">Password</FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder="********"
                    autoComplete="new-password"
                    {...field}
                    className="profejoo password-input"
                  />
                </FormControl>
                <FormMessage className="profejoo-accent absolute -bottom-1/2" />
              </FormItem>
            )}
          />
          <FormField
            name="confirmPassword"
            control={form.control}
            render={({ field }) => (
              <FormItem className="w-full relative mt-6 md:mt-0">
                <FormLabel className="profejoo-primary">Confirm password</FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder="********"
                    autoComplete="new-password"
                    {...field}
                    className="profejoo password-input"
                  />
                </FormControl>
                <FormMessage className="profejoo-accent absolute -bottom-1/2" />
              </FormItem>
            )}
          />
        </div>

        <FormField
          name="acceptTos"
          control={form.control}
          render={({ field }) => (
            <FormItem className="flex items-start gap-3 mt-8">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(v) => field.onChange(Boolean(v))}
                  className="checkbox-primary mt-1"
                  id="terms"
                />
              </FormControl>

              <div className="flex min-w-0">
                <FormLabel htmlFor="terms" className="w-full font-normal text-sm flex gap-0.5">
                  <span>
                    I agree to the{" "}
                    <Link to="/terms" className="profejoo-tertiary underline">
                      Terms
                    </Link>
                    &nbsp;and&nbsp;
                    <Link to="/privacy" className="profejoo-tertiary underline">
                      Privacy Policy
                    </Link>
                    .
                  </span>
                  <FormMessage className="profejoo-accent" />
                </FormLabel>
              </div>
            </FormItem>
          )}
        />

        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <Button
            type="submit"
            disabled={loading || form.formState.isSubmitting || googleLoading}
            className="profejoo btn btn--secondary btn--md w-full sm:w-1/2 flex-1"
            style={{
              borderRadius: buttonBorderRadius
            }}
          >
            {(loading || form.formState.isSubmitting) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Sign up
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
                text="signup_with"
                theme="outline"
                size="large"
                width={googleButtonWidth}
              />
            </div>
          )}
        </div>

        <p className="profejoo-p profejoo-primary text-left">
          Already have an account?{" "}
          <Link to={ROUTES.LOGIN} className="profejoo-large profejoo-tertiary hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </Form>
  );
}
