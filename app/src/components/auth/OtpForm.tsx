import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function OtpForm({
  email, cooldown, loading, onVerify, onResend, onBack,
}: {
  email: string;
  cooldown: number;
  loading?: boolean;
  onVerify: (otp: string) => void | Promise<void>;
  onResend: () => void | Promise<void>;
  onBack: () => void;
}) {
  const [otp, setOtp] = useState("");
  return (
    <form onSubmit={(e)=>{e.preventDefault(); onVerify(otp.trim());}} className="space-y-4 text-left">
      <p className="text-sm text-muted-foreground">
        Code sent to <span className="font-medium">{email || "—"}</span>
      </p>
      <Input
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={6}
        value={otp}
        onChange={(e)=>setOtp(e.target.value.replace(/\D/g,""))}
        placeholder="••••••"
        className="text-center tracking-[0.6em]"
      />
      <div className="flex flex-col md:flex-row gap-3">
      <Button type="submit" disabled={loading || otp.length < 6} className="profejoo btn btn--secondary btn--md flex-1">
        Verify
      </Button>        <Button type="button" variant="outline" disabled={cooldown>0 || loading} onClick={onResend} className="profejoo btn btn--outline-secondary btn--md flex-1">
          {cooldown>0 ? `Resend in ${cooldown}s` : "Resend code"}
        </Button>
      </div>
      <button type="button" onClick={onBack} className="text-xs underline">Change email/password</button>
    </form>
  );
}
