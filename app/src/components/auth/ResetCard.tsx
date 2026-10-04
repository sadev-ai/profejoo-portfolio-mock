// src/components/auth/ResetCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ResetForm from "@/components/auth/ResetCard";

export default function ResetCard() {
  return (
    <Card className="profejoo rounded-2xl shadow-lg w-full border-none">
      <CardHeader>
        <CardTitle className="profejoo-h1 profejoo-primary">Set a new password</CardTitle>
      </CardHeader>
      <CardContent>
        <ResetForm />
      </CardContent>
    </Card>
  );
}
