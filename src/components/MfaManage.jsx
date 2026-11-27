import React, { useEffect, useState } from "react";
import { Smartphone, MessageSquare } from "lucide-react";
import Icon from "@/components/kit/Icon";
import Sign from "@/components/kit/Sign";
import MfaMethodSetup from "@/components/MfaMethodSetup";
import { CodeField, MfaHeader, MfaNotice, ResendLine, useCooldown } from "@/components/MfaParts";

const METHODS = [
  { id: "totp", name: "Authenticator app", icon: Smartphone,
    description: "Use an app like Google Authenticator or Duo to generate secure sign-in codes." },
  { id: "sms", name: "Text messages", icon: MessageSquare, description: "Get sign-in codes sent to your phone by text message." },
];
const SMS_RESEND_SECONDS = 30;

// Two-factor authentication settings: enable, replace or disable a method. Card content, shown
// with <MfaScreen>. session is the mfaSession that just verified a management sign-in; its grant
// lasts a few minutes, so an expired one sends the user back through /mfa.
// The helper also offers session.forgetDevices(code, method) for a "forget remembered devices" control.
export default function MfaManage({ session, returnTo }) {
  const [status, setStatus] = useState(null);
  const [view, setView] = useState({ name: "list" });
  const [error, setError] = useState(null);

  const load = async () => {
    setError(null);
    try {
      setStatus(await session.status());
    } catch (err) {
      setError(err);
    }
  };
  useEffect(() => { load(); }, [session]);

  const back = () => { setView({ name: "list" }); load(); };

  return (
    <div className="session-record-block">
      <MfaHeader title="Two-factor authentication"
        description="Add an extra layer of protection when signing in. You'll be asked for a code each time you sign in." />
      {view.name === "setup" && <MfaMethodSetup session={session} method={view.method} signInPath="/mfa" onDone={back} onBack={() => setView({ name: "list" })} />}
      {view.name === "disable" && <Disable session={session} method={view.method} onDone={back} onBack={() => setView({ name: "list" })} />}
      {view.name === "list" && (
        <div className="auth-stack">
          <MfaNotice error={error} signInPath="/mfa" />
          {!status && !error && (
            <div className="auth-wait" role="status">
              <span className="lane-load" aria-hidden="true" />
              Loading your methods…
            </div>
          )}
          {status && (
            <ul className="mfa-methods">
              {METHODS.map(({ id, name, icon, description }) => {
                const enrolled = status.methods.includes(id);
                return (
                  <li key={id} className="mfa-method">
                    <Icon as={icon} size={22} />
                    <div style={{ minWidth: 0 }}>
                      <span className="mfa-method-name">
                        {name}
                        {enrolled && <Sign color="green">On</Sign>}
                      </span>
                      <p>
                        {enrolled ? (id === "sms" && status.phone_hint ? `Enabled · ${status.phone_hint}` : "Enabled") : description}
                      </p>
                    </div>
                    {/* On a narrow screen the actions drop below the method instead of squeezing it. */}
                    <div className="mfa-method-actions">
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => setView({ name: "setup", method: id })}>
                        {enrolled ? "Replace" : "Enable"}
                      </button>
                      {enrolled && (
                        <button type="button" className="btn btn-quiet btn-sm" onClick={() => setView({ name: "disable", method: id })}>
                          Disable
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <button type="button" className="btn btn-primary btn-lg btn-block" onClick={() => { window.location.href = returnTo; }}>
            Done
          </button>
        </div>
      )}
    </div>
  );
}

// Disables a method after a fresh code from that same method.
function Disable({ session, method, onDone, onBack }) {
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(method === "totp");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useCooldown();

  const run = async (task) => {
    setError(null);
    setBusy(true);
    try {
      return await task();
    } catch (err) {
      setError(err);
      return null;
    } finally {
      setBusy(false);
    }
  };

  const sendCode = async () => {
    if (await run(() => session.sendProofCode())) {
      setCodeSent(true);
      setCooldown(SMS_RESEND_SECONDS);
    }
  };

  const confirm = async (value = code) => {
    if (busy || value.length < 6) return;
    if (await run(() => session.removeMethod(method, value, method))) onDone();
    else setCode("");
  };

  return (
    <div className="auth-stack">
      <h2 className="auth-step-title">
        {method === "totp" ? "Enter a code from your authenticator app" : "Verify with a code sent to your phone"}
      </h2>
      <MfaNotice error={error} signInPath="/mfa" />
      {codeSent ? (
        <>
          <CodeField id="mfa-disable-code" value={code} onChange={setCode} onComplete={confirm} />
          {method === "sms" && <ResendLine cooldown={cooldown} disabled={busy} onResend={sendCode} />}
        </>
      ) : (
        <button type="button" className="btn btn-secondary btn-block" disabled={busy} onClick={sendCode}>
          {busy && <span className="lane-load" aria-hidden="true" />}
          Send code
        </button>
      )}
      <div className="auth-actions">
        <button type="button" className="btn btn-secondary" disabled={busy} onClick={onBack}>Cancel</button>
        <button type="button" className="btn btn-danger" disabled={busy || !codeSent || code.length < 6} onClick={() => confirm()}>
          {busy && <span className="lane-load" aria-hidden="true" />}
          Verify and disable
        </button>
      </div>
    </div>
  );
}
