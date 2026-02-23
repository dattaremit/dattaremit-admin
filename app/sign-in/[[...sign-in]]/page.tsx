"use client";

import { useState } from "react";
import Image from "next/image";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LogIn, Loader2, ArrowLeft } from "lucide-react";

export default function SignInPage() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);

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

    console.error("No supported verification method found. Sign-in status:", signIn.status,
      "First factors:", signIn.supportedFirstFactors,
      "Second factors:", signIn.supportedSecondFactors);
    setError("No supported verification method found.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signIn) return;

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

      console.log("Sign-in result:", result.status);

      if (result.status === "complete" && result.createdSessionId) {
        await completeSignIn(result.createdSessionId);
      } else if (
        result.status === "needs_first_factor" ||
        result.status === "needs_second_factor"
      ) {
        await prepareEmailVerification();
      } else {
        console.error("Unexpected sign-in status:", result.status, result);
        setError(`Unexpected sign-in status: ${result.status}`);
      }
    } catch (err: unknown) {
      console.error("Sign-in error:", err);
      const clerkError = err as { errors?: { longMessage?: string }[] };
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
    if (!isLoaded || !signIn) return;

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

      console.log("Verification result:", result.status);

      if (result.status === "complete" && result.createdSessionId) {
        await completeSignIn(result.createdSessionId);
      } else if (result.status === "needs_second_factor") {
        await prepareEmailVerification();
        setCode("");
      } else {
        console.error("Verification incomplete:", result.status, result);
        setError("Verification could not be completed. Please try again.");
      }
    } catch (err: unknown) {
      console.error("Verification error:", err);
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
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2">
            <Image
              src="/logo.png"
              alt="DattaRemit"
              width={64}
              height={64}
              priority
            />
          </div>
          <CardTitle className="text-2xl">DattaRemit Admin</CardTitle>
          <CardDescription>
            {needsVerification
              ? `We sent a verification code to ${email}`
              : "Sign in with your account to access the dashboard"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {needsVerification ? (
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  placeholder="Enter 6-digit code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  autoFocus
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={loading || !isLoaded}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <LogIn className="mr-2 h-4 w-4" />
                )}
                {loading ? "Verifying..." : "Verify & Sign In"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={handleBack}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to sign in
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={loading || !isLoaded}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <LogIn className="mr-2 h-4 w-4" />
                )}
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
