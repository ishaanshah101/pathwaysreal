import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Mail, ArrowLeft } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import Icon from "@/components/kit/Icon";
import Seo from '@/components/Seo';

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await base44.auth.resetPasswordRequest(email);
    } catch {
      // Always show success regardless
    } finally {
      setLoading(false);
      setSent(true);
    }
  };

  return (
    <AuthLayout
      icon={Mail}
      kicker="Password"
      title="Reset your password."
      subtitle="Enter your email and we'll send a link to set a new one."
      footer={
        <Link to="/login" className="auth-back">
          <Icon as={ArrowLeft} size={16} />Back to log in
        </Link>
      }
    >
      <Seo title="Reset Your Password | Pathways" description="Request a password reset link for your Pathways account." path="/forgot-password" noindex />
      {sent ? (
        <div role="status" className="notice notice-success">
          If an account exists with that email, you'll receive a password reset link shortly.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label htmlFor="email">Email address</label>
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
          <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
            {loading ? "Sending…" : "Send reset link"}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
