import React, { useEffect, useState } from "react";
import GoogleIcon from "@/components/GoogleIcon";
import MfaFlow from "@/components/MfaFlow";
import MfaManage from "@/components/MfaManage";
import { MfaHeader, MfaNotice, MfaScreen, useAppInfo } from "@/components/MfaParts";
import { Spinner } from "@/components/RequireAuth";
import { finishSignIn, resumeMfa, signInToManageMfa, signInWithProvider } from "@/lib/authMfaFlow";
import { safeReturnTo } from "@/lib/authReturnTo";

const PROVIDERS = [
  { id: "google", flag: "enable_google_login", name: "Google" },
  { id: "microsoft", flag: "enable_microsoft_login", name: "Microsoft" },
  { id: "facebook", flag: "enable_facebook_login", name: "Facebook" },
  { id: "apple", flag: "enable_apple_login", name: "Apple" },
];

// /mfa: finishes a Google, Microsoft, Facebook, Apple or SSO sign-in that needs a second step
// (?mfa_code=…), and opened directly it is the two-factor authentication settings page.
export default function Mfa() {
  const returnTo = safeReturnTo();
  const [challenge, setChallenge] = useState(null);
  const [managing, setManaging] = useState(null);
  const [resuming, setResuming] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    resumeMfa()
      .then((result) => {
        // A remembered device signs in straight away; otherwise continue the second step here.
        if (result?.access_token) return finishSignIn(result.access_token, returnTo);
        if (result) setChallenge(result);
        setResuming(false);
      })
      .catch((err) => { setError(err); setResuming(false); });
  }, []);

  if (resuming) return <Spinner />;
  return (
    <MfaScreen>
      {managing ? <MfaManage session={managing} returnTo={returnTo} />
        : challenge ? <MfaFlow challenge={challenge} returnTo={returnTo} onManage={setManaging} />
        : <ConfirmIdentity returnTo={returnTo} onChallenge={setChallenge} initialError={error} />}
    </MfaScreen>
  );
}

// Changing two-factor settings starts with a fresh sign-in, then a code from an enrolled method.
function ConfirmIdentity({ returnTo, onChallenge, initialError }) {
  const info = useAppInfo();
  const options = info ? info.auth_config || {} : null;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(initialError);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      onChallenge(await signInToManageMfa(email, password));
    } catch (err) {
      setError(err);
      setBusy(false);
    }
  };

  const withProvider = (provider) => signInWithProvider(provider, returnTo, { manage: true }).catch(setError);
  const providers = options ? PROVIDERS.filter((provider) => options[provider.flag] ?? provider.id === "google") : [];

  return (
    <>
      <MfaHeader title={info && `Welcome to ${info.name || "the app"}`} description="Sign in to continue" />
      <div className="auth-stack">
        <MfaNotice error={error} />
        {!options && !error && (
          <div className="auth-wait" role="status">
            <span className="lane-load" aria-hidden="true" />
            Loading sign-in options…
          </div>
        )}
        {options && (
          <>
            {providers.map((provider) => (
              <button key={provider.id} type="button" className="btn btn-secondary btn-lg btn-block" style={{ gap: 10 }} onClick={() => withProvider(provider.id)}>
                {provider.id === "google" && (
                  // Google's mark always sits on white, whatever the button colour.
                  <span className="flex items-center justify-center" style={{ width: 24, height: 24, borderRadius: 3, background: "#fff", flex: "none" }}>
                    <GoogleIcon style={{ width: 18, height: 18 }} />
                  </span>
                )}
                Continue with {provider.name}
              </button>
            ))}
            {(options.enable_sso_login || options.use_workspace_sso) && (
              <button type="button" className="btn btn-secondary btn-lg btn-block" onClick={() => withProvider("sso")}>
                Continue with SSO
              </button>
            )}
            {options.enable_username_password && (
              <>
                {(providers.length > 0 || options.enable_sso_login || options.use_workspace_sso) && <div className="or-rule">or</div>}
                <form onSubmit={submit} className="auth-form">
                  <div className="field">
                    <label htmlFor="mfa-email">Email</label>
                    <input id="mfa-email" type="email" autoComplete="email" placeholder="you@example.com" value={email}
                      onChange={(e) => setEmail(e.target.value)} className="input" required />
                  </div>
                  <div className="field">
                    <label htmlFor="mfa-password">Password</label>
                    <input id="mfa-password" type="password" autoComplete="current-password" value={password}
                      onChange={(e) => setPassword(e.target.value)} className="input" required />
                  </div>
                  <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={busy}>
                    {busy && <span className="lane-load" aria-hidden="true" />}
                    Continue
                  </button>
                </form>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}
