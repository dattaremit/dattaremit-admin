"use client";

import { useState } from "react";
import Image from "next/image";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LogIn, Loader2, ArrowLeft, Lock, Mail } from "lucide-react";

const MAX_BACKOFF_MS = 30_000;

export default function SignInPage() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [nextAllowedAt, setNextAllowedAt] = useState(0);

  const completeSignIn = async (sessionId: string) => {
    if (!setActive) return;
    await setActive({ session: sessionId });
    router.push("/");
  };

  const prepareEmailVerification = async () => {
    if (!signIn) return;

    if (signIn.status === "needs_first_factor") {
      const emailFirstFactor = signIn.supportedFirstFactors?.find(
        (f): f is Extract<typeof f, { strategy: "email_code" }> =>
          f.strategy === "email_code"
      );
      if (emailFirstFactor) {
        await signIn.prepareFirstFactor({
          strategy: "email_code",
          emailAddressId: emailFirstFactor.emailAddressId,
        });
        setNeedsVerification(true);
        return;
      }
    }

    if (signIn.status === "needs_second_factor") {
      const emailSecondFactor = signIn.supportedSecondFactors?.find(
        (f) => f.strategy === "email_code"
      );
      if (emailSecondFactor) {
        await signIn.prepareSecondFactor({ strategy: "email_code" });
        setNeedsVerification(true);
        return;
      }
    }

    setError("No supported verification method found.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signIn) {
      setError("Authentication service is still loading. Please wait a moment and try again.");
      return;
    }

    if (Date.now() < nextAllowedAt) {
      const secs = Math.ceil((nextAllowedAt - Date.now()) / 1000);
      setError(`Too many attempts. Try again in ${secs}s.`);
      return;
    }

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete" && result.createdSessionId) {
        setFailedAttempts(0);
        setNextAllowedAt(0);
        await completeSignIn(result.createdSessionId);
      } else if (
        result.status === "needs_first_factor" ||
        result.status === "needs_second_factor"
      ) {
        await prepareEmailVerification();
      } else {
        console.error("Unexpected sign-in status:", result.status);
        setError("An unexpected error occurred during sign-in. Please try again.");
      }
    } catch (err: unknown) {
      const clerkError = err as { errors?: { longMessage?: string }[] };
      const nextFails = failedAttempts + 1;
      setFailedAttempts(nextFails);
      setNextAllowedAt(
        Date.now() + Math.min(MAX_BACKOFF_MS, 2 ** nextFails * 1000),
      );
      setError(
        clerkError?.errors?.[0]?.longMessage ||
          "Invalid email or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signIn) {
      setError("Authentication service is still loading. Please wait a moment and try again.");
      return;
    }

    if (!code.trim()) {
      setError("Please enter the verification code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let result;
      if (signIn.status === "needs_second_factor") {
        result = await signIn.attemptSecondFactor({
          strategy: "email_code",
          code,
        });
      } else {
        result = await signIn.attemptFirstFactor({
          strategy: "email_code",
          code,
        });
      }

      if (result.status === "complete" && result.createdSessionId) {
        await completeSignIn(result.createdSessionId);
      } else if (result.status === "needs_second_factor") {
        await prepareEmailVerification();
        setCode("");
      } else {
        setError("Verification could not be completed. Please try again.");
      }
    } catch (err: unknown) {
      const clerkError = err as { errors?: { longMessage?: string }[] };
      setError(
        clerkError?.errors?.[0]?.longMessage ||
          "Invalid verification code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setNeedsVerification(false);
    setCode("");
    setError("");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      <div className="absolute inset-0 bg-ambient" />
      <div
        className="ambient-blob"
        style={{
          top: "-160px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "640px",
          height: "480px",
          background:
            "radial-gradient(circle, oklch(from var(--brand) l c h / 0.18), transparent 70%)",
        }}
      />

      <div className="relative z-10 w-full max-w-sm animate-fade-up">
        <div className="mb-6 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border/60 bg-card shadow-sm">
            <Image src="/logo.png" alt="DattaRemit" width={28} height={28} priority />
          </div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            DattaRemit · Admin
          </p>
        </div>

        <div className="surface rounded-2xl p-7">
          <div className="space-y-1 pb-6">
            <h1 className="text-xl font-semibold tracking-tight">
              {needsVerification ? "Check your email" : "Sign in"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {needsVerification ? (
                <>
                  Code sent to{" "}
                  <span className="font-medium text-foreground">{email}</span>
                </>
              ) : (
                "Admin access only"
              )}
            </p>
          </div>

          {needsVerification ? (
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code" className="text-xs font-medium text-muted-foreground">
                  Verification code
                </Label>
                <Input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  autoComplete="one-time-code"
                  placeholder="••• •••"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  autoFocus
                  className="h-11 text-center text-lg font-medium tracking-[0.4em] tabular"
                />
              </div>

              {error && (
                <Alert variant="destructive" className="border-destructive/30 bg-destructive/5">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="h-11 w-full" disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <LogIn className="mr-2 h-4 w-4" />
                )}
                {loading ? "Verifying..." : "Verify & sign in"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full text-sm text-muted-foreground hover:text-foreground"
                onClick={handleBack}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    autoFocus
                    className="h-11 pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-medium text-muted-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="h-11 pl-9"
                  />
                </div>
              </div>

              {error && (
                <Alert variant="destructive" className="border-destructive/30 bg-destructive/5">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="h-11 w-full" disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <LogIn className="mr-2 h-4 w-4" />
                )}
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
