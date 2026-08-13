import { base44 } from '@/api/base44Client';

// One button covers both cases. Google returns an existing member straight to
// the app and a brand-new person to onboarding, so a returning visitor who
// lands back on the marketing site never has to fill out a signup form again.
// Sending them to "/" lets the root route make that decision from real auth
// state rather than guessing here.
export function signInWithGoogle(returnTo = '/') {
  base44.auth.loginWithProvider('google', returnTo);
}
