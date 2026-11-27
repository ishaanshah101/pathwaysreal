import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Lock, AlertTriangle } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import Seo from '@/components/Seo';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await base44.auth.resetPassword({ resetToken, newPassword });
      window.location.href = "/login";
    } catch (err) {
      setError(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (!resetToken) {
    return (
      <AuthLayout
        icon={AlertTriangle}
        kicker="Password"
        title="This reset link won't work."
        subtitle="It is missing the part that proves it came from us."
        footer={
          <Link to="/forgot-password">Request a new link</Link>
        }
      >
        <Seo title="Set a New Password | Pathways" description="Choose a new password for your Pathways account." path="/reset-password" noindex />
        <div className="notice notice-warning">
          The link you used is incomplete. Request a new password reset email and open the link
          from that one.
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      icon={Lock}
      kicker="Password"
      title="Set a new password."
      subtitle="Type it twice so a typo can't lock you out."
    >
      <Seo title="Set a New Password | Pathways" description="Choose a new password for your Pathways account." path="/reset-password" noindex />
      {error && (
        <div role="alert" className="notice notice-error">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="field">
          <label htmlFor="password">New password</label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            autoFocus
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
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
        <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
          {loading ? "Saving…" : "Save new password"}
        </button>
      </form>
    </AuthLayout>
  );
}
