import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import PasswordInput from "./PasswordInput";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { forgotPassword, resetPassword } from "@/services/auth.service";
import "@/index.css";

type Step = "email" | "reset" | "done";

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address!"),
});
type EmailValues = z.infer<typeof emailSchema>;

const resetSchema = z.object({
  otp: z.string().length(6, "Code must be 6 digits.").regex(/^\d+$/, "Code must be numeric."),
  password: z.string()
    .min(8, "Password must be at least 8 characters.")
    .regex(/[a-z]/, "Must include a lowercase letter.")
    .regex(/[A-Z]/, "Must include an uppercase letter.")
    .regex(/[0-9]/, "Must include a number.")
    .regex(/[^A-Za-z0-9]/, "Must include a symbol."),
  confirmPassword: z.string().min(8, "Please re-enter your password."),
}).refine(d => d.password === d.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});
type ResetValues = z.infer<typeof resetSchema>;

export default function ForgotPasswordCard({
  onDone, goLogin,
  defaultEmail = "",
}: {
  onDone?: () => void;     // called after full success
  goLogin?: () => void;    // if you want a "Back to login" button
  defaultEmail?: string;
}) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState(defaultEmail);
  const [cooldown, setCooldown] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  // Countdown timer for resend
  useEffect(() => {
    if (step !== "reset" || cooldown <= 0) return;
    const id = setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [step, cooldown]);

  // Email form
  const emailForm = useForm<EmailValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: defaultEmail },
    mode: "onChange",
  });

  // Password reset form (with OTP)
  const resetForm = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { otp: "", password: "", confirmPassword: "" },
    mode: "onChange",
  });

  // Step 1: send the email and start the process
  const submitEmail = async (v: EmailValues) => {
    setLoading(true);
    try {
      const res = await forgotPassword(v.email);
      setEmail(v.email);
      setCooldown(res.cooldown ?? 60);
      setStep("reset");
      toast.success("Verification code sent!", {
        description: `We've sent a 6-digit code to ${v.email}. Please check your inbox.`
      });
    } catch (e: any) {
      console.error('[ForgotPassword] Failed to send OTP:', e);
      
      let title = "Couldn't send verification code";
      let description = "Unable to send the verification code. Please try again.";
      
      if (e?.status === 404) {
        title = "Email not found";
        description = "No account exists with this email address. Please check your email or create a new account.";
      } else if (e?.status === 429) {
        title = "Too many requests";
        description = "You've requested too many codes. Please wait a few minutes before trying again.";
      } else if (e?.status >= 500) {
        title = "Server error";
        description = "Our servers are temporarily unavailable. Please try again shortly.";
      } else if (!navigator.onLine) {
        title = "No internet connection";
        description = "Please check your internet connection and try again.";
      }
      
      toast.error(title, { description });
    } finally {
      setLoading(false);
    }
  };

  // Resend code
  const resendOtp = async () => {
    setLoading(true);
    try {
      const res = await forgotPassword(email);
      setCooldown(res.cooldown ?? 60);
      toast.success("New code sent!", {
        description: "A new verification code has been sent to your email."
      });
    } catch (e: any) {
      console.error('[ForgotPassword] Failed to resend OTP:', e);
      
      let title = "Couldn't resend code";
      let description = "Unable to send a new verification code. Please try again.";
      
      if (e?.status === 404) {
        title = "Email not found";
        description = "No account exists with this email address.";
      } else if (e?.status === 429) {
        title = "Too many requests";
        description = "Please wait a few minutes before requesting another code.";
      } else if (e?.status >= 500) {
        title = "Server error";
        description = "Our servers are temporarily unavailable. Please try again shortly.";
      } else if (!navigator.onLine) {
        title = "No internet connection";
        description = "Please check your internet connection and try again.";
      }
      
      toast.error(title, { description });
    } finally {
      setLoading(false);
    }
  };

  // Step 2: send the OTP + new password together to the server
  const submitReset = async (v: ResetValues) => {
setLoading(true);
    
    try {
      await resetPassword({
        email,
        otp: v.otp,
        new_password: v.password,
        password_confirm: v.confirmPassword,
      });
setStep("done");
      toast.success("Password reset successful!", {
        description: "Your password has been changed. You can now log in with your new password."
      });
      onDone?.();
    } catch (e: any) {
      console.error('[ForgotPassword] Failed to reset password:', e);
      
      let title = "Password reset failed";
      let description = "We couldn't reset your password. Please try again.";
      
      if (e?.status === 400 || e?.status === 401) {
        // OTP is wrong or expired
        title = "Invalid verification code";
        description = "The verification code you entered is incorrect or has expired. Please check the code and try again.";
        // Clear the OTP field
        resetForm.setValue("otp", "");
        resetForm.setFocus("otp");
      } else if (e?.status === 404) {
        // Email not found
        title = "Account not found";
        description = "No account found with this email address. Please check your email or sign up for a new account.";
      } else if (e?.status === 422) {
        // Validation issue (e.g. weak password)
        title = "Password requirements not met";
        description = "Your password must be at least 8 characters and include uppercase, lowercase, number, and symbol.";
      } else if (e?.status === 429) {
        // Too many requests made
        title = "Too many attempts";
        description = "You've made too many password reset attempts. Please wait a few minutes before trying again.";
      } else if (e?.status >= 500) {
        // Server issue
        title = "Server error";
        description = "Our servers are experiencing issues. Please try again in a few moments.";
      } else if (!navigator.onLine) {
        // Internet issue
        title = "No internet connection";
        description = "Please check your internet connection and try again.";
      }
      
      toast.error(title, { description });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {step === "email" && (
        <Form {...emailForm}>
          <form onSubmit={emailForm.handleSubmit(submitEmail)} className="space-y-3 text-left">
            <FormField name="email" control={emailForm.control} render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="profejoo-primary">Email address</FormLabel>
                <FormControl>
                  <Input placeholder="you@example.com" type="email" {...field} className="profejoo email-input" />
                </FormControl>
                <div className="min-h-5">
                  <FormMessage className="profejoo-accent text-sm" />
                </div>
              </FormItem>
            )}/>
            {goLogin && (
              <button
                type="button"
                onClick={goLogin}
                className="flex items-center gap-1 text-sm profejoo-primary hover:underline"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to login
              </button>
            )}
            <Button type="submit" disabled={loading} className="profejoo btn btn--secondary btn--md w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Send code
            </Button>
          </form>
        </Form>
      )}

      {step === "reset" && (
        <Form {...resetForm}>
          <form onSubmit={resetForm.handleSubmit(submitReset)} className="space-y-3 text-left">
            <p className="text-sm text-muted-foreground">
              Code sent to <span className="font-medium">{email || "—"}</span>
            </p>
            
            <FormField name="otp" control={resetForm.control} render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="profejoo-primary">Verification code</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="••••••" 
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    {...field}
                    onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ""))}
                    className="profejoo text-center tracking-[0.6em]" 
                  />
                </FormControl>
                <div className="min-h-4">
                  <FormMessage className="profejoo-accent text-sm" />
                </div>
              </FormItem>
            )}/>

            <FormField name="password" control={resetForm.control} render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="profejoo-primary">New password</FormLabel>
                <FormControl>
                  <PasswordInput placeholder="********" {...field} className="profejoo password-input" />
                </FormControl>
                <div className="min-h-5">
                  <FormMessage className="profejoo-accent text-sm" />
                </div>
              </FormItem>
            )}/>
            
            <FormField name="confirmPassword" control={resetForm.control} render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="profejoo-primary">Confirm new password</FormLabel>
                <FormControl>
                  <PasswordInput placeholder="********" {...field} className="profejoo password-input" />
                </FormControl>
                <div className="min-h-5">
                  <FormMessage className="profejoo-accent text-sm" />
                </div>
              </FormItem>
            )}/>
            
            <div className="flex flex-col gap-3">
              <Button type="submit" disabled={loading} className="profejoo btn btn--secondary btn--md w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Reset Password
              </Button>
              <div className="flex flex-col md:flex-row gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  disabled={cooldown > 0 || loading} 
                  onClick={resendOtp}
                  className="profejoo btn btn--outline-secondary btn--sm flex-1"
                >
                  {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setStep("email")}
                  className="profejoo btn btn--outline-secondary btn--sm flex-1"
                >
                  Back
                </Button>
              </div>
            </div>
          </form>
        </Form>
      )}

      {step === "done" && (
        <div className="space-y-6 text-left">
          <p className="profejoo-p profejoo-primary">Your password has been changed successfully.</p>
          {goLogin && (
            <Button onClick={goLogin} className="profejoo btn btn--secondary btn--md w-full">
              Go to login
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
