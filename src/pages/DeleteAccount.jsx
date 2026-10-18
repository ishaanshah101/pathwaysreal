import React from 'react';
import { Link } from 'react-router-dom';
import Seo from '@/components/Seo';
import DeletionDetails from '@/components/account/DeletionDetails';
import { useAuth } from '@/lib/AuthContext';

export default function DeleteAccount() {
  const { isAuthenticated, isLoadingAuth } = useAuth();
  return (
    <section className="page-hero max-w-[68ch] pb-16">
      <Seo title="Delete your Pathways account" description="Delete your Pathways account from your Profile page or request deletion by email within 30 days. Learn what is deleted and what is retained." path="/delete-account" />
      <h1 className="text-pw-3xl mb-6">Delete your Pathways account</h1>
      <div className="space-y-6 leading-relaxed text-ink-muted">
        <section className="space-y-3">
          <h2 className="h-sans text-pw-lg text-ink">Delete instantly from your Profile</h2>
          <p>Signed-in members can delete their account instantly from the bottom of their Profile page. It is immediate and permanent: there is no grace period, no soft delete, and no way for us to restore it afterwards.</p>
          {isLoadingAuth ? <span role="status">Checking sign-in…</span> : (
            <Link className="btn btn-primary" to={isAuthenticated ? '/app/profile' : '/login?returnTo=%2Fapp%2Fprofile'}>
              {isAuthenticated ? 'Go to Profile' : 'Log in to delete your account'}
            </Link>
          )}
        </section>
        <section className="space-y-3">
          <h2 className="h-sans text-pw-lg text-ink">Request deletion by email</h2>
          <p>No app installation or login is required. Anyone can instead email <a href="mailto:ishaan@pathways.uno?subject=Delete%20my%20account">ishaan@pathways.uno</a> from the address on the account with the subject <b>Delete my account</b>. Your deletion request will be completed within 30 days.</p>
        </section>
        <section className="space-y-3">
          <h2 className="h-sans text-pw-lg text-ink">What happens to your data</h2>
          <p>Here is exactly what happens when an account is deleted.</p>
          <DeletionDetails />
          <p><Link to="/privacy">Read the full Privacy Policy</Link>.</p>
        </section>
      </div>
    </section>
  );
}