import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { LogIn } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import GoogleButton from "@/components/GoogleButton";
import { safeReturnTo } from "@/lib/authReturnTo";
import Seo from '@/components/Seo';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // Post-login destination (e.g. the MCP OAuth consent page sends users here
  // with returnTo so the grant flow can resume). Same-origin paths only.
  const returnTo = safeReturnTo();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await base44.auth.loginViaEmailPassword(email, password);
      window.location.href = returnTo;
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      icon={LogIn}
      kicker="Log in"
      title="Welcome back."
      subtitle="Log in to pick up where you left off."
      footer={
        <>
          No account yet?{" "}
          <Link to={"/register" + (returnTo !== "/" ? "?returnTo=" + encodeURIComponent(returnTo) : "")}>
            Create one
          </Link>
        </>
      }
    >
      <Seo title="Log In | Pathways" description="Log in to Pathways to connect with students, professors, and counselors for free, firsthand college and career guidance." path="/login" noindex />

      {/* GoogleButton calls base44.auth.loginWithProvider("google", returnTo). */}
      <GoogleButton label="Continue with Google" returnTo={returnTo} variant="secondary" block />

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
          <div className="field-top">
            <label htmlFor="password">Password</label>
            <Link to="/forgot-password">Forgot password?</Link>
          </div>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            required
          />
        </div>
        <button type="submit" className={`btn btn-primary btn-lg btn-block${loading ? '' : ' btn-go'}`} disabled={loading}>
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>
    </AuthLayout>
  );
}
