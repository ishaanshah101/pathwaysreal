import React, { useEffect, useRef, useState } from "react";
import {
  CodeField, CopyKeyButton, INVALID_PHONE, MfaNotice, PhoneField, ResendLine,
  defaultDialCode, isPlausiblePhone, isTouchDevice, useCooldown,
} from "@/components/MfaParts";

const SMS_RESEND_SECONDS = 30;
const FULL_CODE = "Enter the full 6-digit code";

// Sets up one method: method is "totp" (authenticator app) or "sms" (text messages).
// onDone receives the server's result once the code is confirmed; onBack leaves the setup.
export default function MfaMethodSetup({ session, method, onDone, onBack, signInPath }) {
  const [setup, setSetup] = useState(null);
  const [step, setStep] = useState("start");
  const [countryCode, setCountryCode] = useState(defaultDialCode);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [code, setCode] = useState("");
  const [fieldError, setFieldError] = useState(null);
  const [error, setError] = useState(null);
  const [resendError, setResendError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useCooldown();
  const started = useRef(false);
  const fullPhone = `${countryCode}${phoneNumber}`;

  // Runs a request with the buttons held; a failure goes to onError and the result is null.
  const run = async (action, onError) => {
    setBusy(true);
    try {
      return await action();
    } catch (err) {
      onError(err);
      return null;
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    // Each setup call issues a new secret, so start it once.
    if (method !== "totp" || started.current) return;
    started.current = true;
    run(() => session.setupAuthenticator(), setError).then((result) => result && setSetup(result));
  }, [method, session]);

  // A number that can't be real never reaches the server. A server rejection that names the phone shows
  // as the same field error; anything else shows under the field as it is.
  const sendCode = async () => {
    setFieldError(null);
    setError(null);
    setResendError(null);
    if (!isPlausiblePhone(fullPhone)) {
      setFieldError(INVALID_PHONE);
      return;
    }
    const sent = await run(() => session.sendPhoneCode(fullPhone), (err) => {
      if (err.message?.toLowerCase().includes("phone")) setFieldError(INVALID_PHONE);
      else setError(err);
    });
    if (sent) {
      setStep("code");
      setCode("");
      setCooldown(SMS_RESEND_SECONDS);
    }
  };

  const resend = async () => {
    if (cooldown > 0) return;
    setResendError(null);
    try {
      await session.sendPhoneCode(fullPhone);
      setCooldown(SMS_RESEND_SECONDS);
    } catch (err) {
      setResendError(err.message || "Failed to resend");
    }
  };

  // An incomplete code is flagged without a request. A wrong one keeps the digits and says so under them.
  const confirm = async (value = code) => {
    if (busy) return;
    if (value.length !== 6) {
      setFieldError(FULL_CODE);
      return;
    }
    setFieldError(null);
    setError(null);
    const result = await run(
      () => (method === "totp" ? session.confirmAuthenticator(value) : session.confirmPhone(value)),
      (err) => (err.mustSignInAgain ? setError(err) : setFieldError(err.message || "Invalid code")),
    );
    if (result) onDone(result);
  };

  const backToStart = () => {
    setStep("start");
    setCode("");
    setFieldError(null);
    setError(null);
    setResendError(null);
  };

  const actions = (secondary, onSecondary, primary, onPrimary, disabled = false) => (
    <div className="auth-actions">
      <button type="button" className="btn btn-secondary" disabled={busy} onClick={onSecondary}>{secondary}</button>
      <button type="button" className="btn btn-primary" disabled={busy || disabled} onClick={onPrimary}>
        {busy && <span className="lane-load" aria-hidden="true" />}
        {primary}
      </button>
    </div>
  );

  if (method === "totp" && step === "start") {
    return (
      <div className="auth-stack">
        <h2 className="auth-step-title">Set up your authenticator app</h2>
        <MfaNotice error={error} signInPath={signInPath} />
        {!setup && !error && (
          <div className="auth-wait" role="status">
            <span className="lane-load" aria-hidden="true" />
            Making your setup key…
          </div>
        )}
        {setup && (isTouchDevice() ? (
          <div className="auth-group">
            <ol className="auth-steps">
              <li>Copy the key below.</li>
              <li>In your authenticator app, add an account and paste the key.</li>
              <li>Come back here and enter the code the app shows.</li>
            </ol>
            <code className="keycode">
              {setup.secret_formatted}
            </code>
            <CopyKeyButton text={setup.secret_formatted} wide />
          </div>
        ) : (
          <div className="qr-row">
            <img src={setup.qr_code} alt="QR code for authenticator app setup" className="qr" />
            <div className="auth-group">
              <p className="auth-note"><b>Scan the QR code with your authenticator app</b></p>
              <p className="auth-note">Can't scan the code? Enter it manually:</p>
              <div className="key-row">
                <code className="keycode">{setup.secret_formatted}</code>
                <CopyKeyButton text={setup.secret_formatted} />
              </div>
            </div>
          </div>
        ))}
        {actions("Cancel", onBack, "Continue", () => setStep("code"), !setup)}
      </div>
    );
  }

  if (method === "sms" && step === "start") {
    const phoneError = fieldError ?? (error && !error.mustSignInAgain ? error.message : null);
    return (
      <div className="auth-stack">
        <div className="auth-group" style={{ gap: 6 }}>
          <h2 className="auth-step-title">Enter your phone number</h2>
          <p className="auth-note">A verification code will be sent to this number to confirm it's yours.</p>
        </div>
        <div className="field">
          <label htmlFor="mfa-phone">Phone number</label>
          <PhoneField
            countryCode={countryCode} onCountryCodeChange={setCountryCode}
            phoneNumber={phoneNumber} onPhoneNumberChange={(value) => { setPhoneNumber(value); setFieldError(null); }}
            error={phoneError} onSubmit={!busy && phoneNumber.length >= 4 ? sendCode : undefined}
          />
        </div>
        {error?.mustSignInAgain && <MfaNotice error={error} signInPath={signInPath} />}
        {actions("Cancel", onBack, "Send code", sendCode, phoneNumber.length < 4)}
      </div>
    );
  }

  return (
    <div className="auth-stack">
      <div className="auth-group" style={{ gap: 6 }}>
        <h2 className="auth-step-title">
          {method === "totp" ? "Enter a code from your authenticator app" : "Verify your phone number"}
        </h2>
        {method === "sms" && <p className="auth-note">A 6-digit code sent to {countryCode} {phoneNumber}</p>}
      </div>
      <div className="auth-group" style={{ gap: 8 }}>
        <CodeField id="mfa-setup-code" value={code} onChange={(value) => { setCode(value); setFieldError(null); }}
          onComplete={confirm} hasError={Boolean(fieldError)} />
        {fieldError && <span className="field-error" style={{ marginTop: 0 }}>{fieldError}</span>}
        {method === "totp"
          ? <span className="field-hint" style={{ marginTop: 0 }}>Codes refresh every 30 seconds.</span>
          : <ResendLine cooldown={cooldown} onResend={resend} error={resendError} />}
      </div>
      <MfaNotice error={error} signInPath={signInPath} />
      {actions("Back", backToStart, "Verify", () => confirm())}
    </div>
  );
}
