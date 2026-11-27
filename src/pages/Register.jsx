import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { UserPlus, Mail } from "lucide-react";
import AuthLayout, { CodeBoxes } from "@/components/AuthLayout";
import GoogleButton from "@/components/GoogleButton";
import { toast } from "@/components/ui/use-toast";
import { safeReturnTo } from "@/lib/authReturnTo";
import Seo from '@/components/Seo';

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await base44.auth.register({ email, password });
      setShowOtp(true);
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await base44.auth.verifyOtp({ email, otpCode });
      if (result?.access_token) {
        base44.auth.setToken(result.access_token);
      }
      window.location.href = safeReturnTo();
    } catch (err) {
      setError(err.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      await base44.auth.resendOtp(email);
      toast({
        title: "Code sent",
        description: "Check your email for the new code.",
      });
    } catch (err) {
      setError(err.message || "Failed to resend code");
    }
  };

  if (showOtp) {
    return (
      <AuthLayout
        icon={Mail}
        kicker="Check your email"
        title="Verify your email."
        subtitle={`We sent a 6-digit code to ${email}`}
        footer={
          <>
            Didn't get the code?{" "}
            <button type="button" onClick={handleResend} className="link-btn">
              Send it again
            </button>
          </>
        }
      >
        {error && (
          <div role="alert" className="notice notice-error">
            {error}
          </div>
        )}
        <div className="code-field">
          <label htmlFor="register-code">Verification code</label>
          <CodeBoxes
            id="register-code"
            value={otpCode}
            onChange={setOtpCode}
            autoFocus
            autoComplete="one-time-code"
          />
        </div>
        <button
          type="button"
          className={`btn btn-primary btn-lg btn-block${loading ? '' : ' btn-go'}`}
          onClick={handleVerify}
          disabled={loading || otpCode.length < 6}
        >
          {loading ? "Verifying…" : "Verify"}
        </button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      icon={UserPlus}
      kicker="New account"
      title="Create your account."
      subtitle="Free for every student, and it stays free."
      footer={
        <>
          Already have an account?{" "}
          <Link to={"/login" + (safeReturnTo() !== "/" ? "?returnTo=" + encodeURIComponent(safeReturnTo()) : "")}>
            Log in
          </Link>
        </>
      }
    >
      <Seo title="Create Your Free Account | Pathways" description="Sign up for Pathways free with Google or email and start getting firsthand college and career guidance." path="/register" noindex />

      {/* GoogleButton calls base44.auth.loginWithProvider("google", returnTo). */}
      <GoogleButton label="Continue with Google" returnTo={safeReturnTo()} variant="secondary" block />

      <div className="or-rule">or</div>

      {error && (
        <div role="alert" className="notice notice-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            autoFocus
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            required
          />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            required
          />
        </div>
        <div className="field">
          <label htmlFor="confirm">Confirm password</label>
          <input
            id="confirm"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="input"
            required
          />
        </div>
        <button type="submit" className={`btn btn-primary btn-lg btn-block${loading ? '' : ' btn-go'}`} disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>
    </AuthLayout>
  );
}
