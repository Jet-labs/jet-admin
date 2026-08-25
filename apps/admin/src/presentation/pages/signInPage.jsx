import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Loader2, ShieldCheck } from "lucide-react";
import { operatorLoginAPI } from "@/data/apis/auth";
import { useOperator } from "@/logic/hooks/useOperator";
import { useAdminStore } from "@/logic/stores/useAdminStore";

import { Button, Input, Label } from "@jet-admin/ui";

const SignInPage = () => {
  const operator = useOperator();
  const navigate = useNavigate();
  const setSession = useAdminStore((s) => s.setSession);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (operator) return <Navigate to="/library" replace />;

  const _handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const { operator: signedInOperator, token } = await operatorLoginAPI({
        email: email.trim(),
        password,
      });
      setSession({ token, operator: signedInOperator });
      navigate("/library", { replace: true });
    } catch (signInError) {
      setError(signInError?.message || "Sign-in failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background p-4">
      <form
        onSubmit={_handleSubmit}
        className="w-full max-w-sm rounded border border-border/50 bg-background p-4"
      >
        <div className="mb-4 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold text-foreground">Platform Admin</h1>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SignInPage;
