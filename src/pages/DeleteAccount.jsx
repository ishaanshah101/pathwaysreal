import React from 'react';
import { Link } from 'react-router-dom';
import Seo from '@/components/Seo';
import ContactEmail from '@/components/ContactEmail';
import DeletionDetails from '@/components/account/DeletionDetails';
import { useAuth } from '@/lib/AuthContext';

export default function DeleteAccount() {
  const { isAuthenticated, isLoadingAuth } = useAuth();
  return (
    <section className="band doc">
      <div className="wrap-read">
        <Seo title="Delete your Pathways account" description="Delete your Pathways account from your Profile page or request deletion by email within 30 days. Learn what is deleted and what is retained." path="/delete-account" />
        <span className="kicker kicker-sun">Exit</span>
        <h1 className="title-1">Delete your Pathways account</h1>

        <section>
          <h2>Delete instantly from your Profile</h2>
          <p>Signed-in members can delete their account instantly from the bottom of their Profile page. It is immediate and permanent: there is no grace period, no soft delete, and no way for us to restore it afterwards.</p>
          {isLoadingAuth ? <span role="status">Checking sign-in…</span> : (
            <Link className="btn btn-primary" to={isAuthenticated ? '/app/profile' : '/login?returnTo=%2Fapp%2Fprofile'}>
              {isAuthenticated ? 'Go to Profile' : 'Log in to delete your account'}
            </Link>
          )}
        </section>

        <section>
          <h2>Request deletion by email</h2>
          <p>No app installation or login is required. Anyone can instead email <ContactEmail /> from the address on the account with the subject <b>Delete my account</b>. Your deletion request will be completed within 30 days.</p>
        </section>

        <section>
          <h2>What happens to your data</h2>
          <p>Here is exactly what happens when an account is deleted.</p>
          <DeletionDetails />
          <p><Link to="/privacy">Read the full Privacy Policy</Link>.</p>
        </section>
      </div>
    </section>
  );
}
