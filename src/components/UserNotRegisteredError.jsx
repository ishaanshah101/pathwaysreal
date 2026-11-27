import React from 'react';
import BrandMark from '@/components/BrandMark';
import ContactEmail from '@/components/ContactEmail';
import { useAuth } from '@/lib/AuthContext';

// Shown when someone is signed in with an account this app does not know. It is
// a dead end unless it says what to do, so it offers the two things that
// actually fix it: a different account, or a person to write to.
const UserNotRegisteredError = () => {
  const { logout } = useAuth();

  return (
    <main className="lost">
      <div className="lost-inner">
        <div className="gate-sign" aria-hidden="true">
          <b>Not on the list</b>
          <span>Account not registered</span>
        </div>

        <h1 className="title-2">This account can't get in yet.</h1>

        <p className="lede" style={{ marginTop: 14 }}>
          You are signed in, but this account is not registered to use Pathways.
        </p>

        <ul className="gate-list">
          <li><b>Check the account.</b> If you have more than one email, you may be signed in with the wrong one.</li>
          <li><b>Sign out and back in.</b> That clears a sign-in that went stale.</li>
          <li><b>Ask us.</b> Email <ContactEmail /> and a person will sort it out.</li>
        </ul>

        <div className="flex flex-wrap items-center" style={{ gap: 12, marginTop: 26 }}>
          <button type="button" className="btn btn-primary btn-lg" onClick={() => logout(true)}>
            Sign out
          </button>
          <BrandMark size={44} />
        </div>
      </div>
    </main>
  );
};

export default UserNotRegisteredError;
