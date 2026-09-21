import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSubscription, openBillingPortal } from '@/lib/useSubscription';
import { useSageChat } from '@/lib/useSageChat';
import { useNarrow } from '@/hooks/use-narrow';
import { isNativeApp } from '@/lib/platform';
import SagePaywall from '@/components/app/SagePaywall';
import ThreadList from '@/components/sage/ThreadList';
import SageMessages from '@/components/sage/SageMessages';
import SageComposer from '@/components/sage/SageComposer';
import { Spinner } from '@/components/RequireAuth';
import Seo from '@/components/Seo';
import { ArrowLeft } from 'lucide-react';

export default function SageChat() {
  const {
    subscription, hasSage, isPastDue, isCanceling, source,
    isLoadingSubscription, refetchSubscription,
  } = useSubscription();
  const [params, setParams] = useSearchParams();
  const [billingError, setBillingError] = useState('');
  const chat = useSageChat(hasSage);
  const narrow = useNarrow();
  const native = isNativeApp();

  const checkout = params.get('checkout');
  // Which conversation is open lives in the URL, so the back gesture on a phone
  // closes the chat instead of leaving the app, and a chat can be linked to.
  // "new" is a real value: an empty chat that has no id yet.
  const threadParam = params.get('thread');

  const openThread = (id) => {
    const next = new URLSearchParams(params);
    next.set('thread', id || 'new');
    setParams(next);
  };

  const closeThread = () => {
    const next = new URLSearchParams(params);
    next.delete('thread');
    setParams(next);
  };

  // URL to state.
  useEffect(() => {
    if (!threadParam) return;
    const want = threadParam === 'new' ? null : threadParam;
    if (want !== chat.activeId) chat.setActiveId(want);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadParam]);

  // State to URL, for the one case the hook moves on its own: the first question
  // in a new chat creates the thread and hands back its id.
  useEffect(() => {
    if (threadParam && chat.activeId && threadParam !== chat.activeId) {
      const next = new URLSearchParams(params);
      next.set('thread', chat.activeId);
      setParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat.activeId]);

  // Stripe redirects back here the instant payment succeeds, but the webhook
  // that actually grants access lands a moment later. Poll briefly so the user
  // is not told to pay again for something they just bought.
  useEffect(() => {
    if (checkout !== 'success' || hasSage) return undefined;
    let tries = 0;
    const id = setInterval(() => {
      tries += 1;
      refetchSubscription();
      if (tries >= 10) clearInterval(id);
    }, 1500);
    return () => clearInterval(id);
  }, [checkout, hasSage, refetchSubscription]);

  if (isLoadingSubscription) return <Spinner />;

  // The paywall is the whole page when there is no active subscription. Sage
  // is the one paid thing on Pathways, so this is the only gate in the app.
  if (!hasSage) {
    const notice =
      checkout === 'success'
        ? { tone: 'ok', text: 'Payment received. Confirming now, this usually takes a few seconds.' }
        : checkout === 'cancel'
          ? { tone: 'ok', text: 'No charge was made. You can subscribe whenever you are ready.' }
          : isPastDue
            ? { tone: 'error', text: 'Your last payment did not go through, so Sage is paused. Updating your card will switch it straight back on.' }
            : null;
    return <SagePaywall notice={notice} />;
  }

  const manageBilling = async () => {
    setBillingError('');
    try {
      await openBillingPortal();
    } catch (err) {
      setBillingError(err.message);
    }
  };

  const send = async (text, attachments) => {
    const res = await chat.ask(text, attachments);
    // The subscription lapsed mid-session. Re-read it so the paywall comes back
    // up instead of leaving them typing into a dead box.
    if (res && !res.ok && res.code === 'sage_not_subscribed') refetchSubscription();
    return res;
  };

  const renewalDate = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString(undefined, {
        month: 'long', day: 'numeric', year: 'numeric',
      })
    : null;

  const activeThread = chat.threads.find((t) => t.id === chat.activeId);

  // On a phone this is two screens, not two columns: the list, or the open chat
  // with a back button. On desktop both are always visible.
  const showList = !narrow || !threadParam;
  const showPane = !narrow || Boolean(threadParam);

  return (
    <div className="flex flex-col" style={{ gap: 16 }}>
      <Seo title="Ask Sage | Pathways" description="Chat with Sage, your AI college and career advisor on Pathways, personalized to your grade, school, and goals." path="/app/sage" noindex />

      {checkout === 'success' && (
        <div className="notice notice-success flex items-center gap-3 flex-wrap">
          You're subscribed to Sage. Ask it anything.
          <button type="button" className="btn btn-ghost" style={{ fontSize: 13, marginLeft: 'auto' }} onClick={() => setParams({})}>
            Dismiss
          </button>
        </div>
      )}

      {/* The header is a waste of a phone screen once a chat is open. */}
      {showList && (
        <div className="flex items-start gap-4 flex-wrap">
          <div style={{ flex: '1 1 340px' }}>
            <h1 style={{ fontSize: 'clamp(26px,3.2vw,36px)', margin: '0 0 6px' }}>Ask Sage anything.</h1>
            <p style={{ color: 'var(--text-muted)', margin: 0, maxWidth: '56ch', lineHeight: 1.6 }}>
              Sage knows your grade, your school, and your goals. Keep separate chats for essays, your
              college list, or summer plans, and attach a draft whenever you want it read.
            </p>
          </div>
          <div className="flex flex-col items-end" style={{ gap: 4 }}>
            {/* No link out to an external payment page from inside a native
                wrapper: Apple does not allow it. */}
            {native || source === 'apple' ? (
              <span style={{ fontSize: 11.5, color: 'var(--text-subtle)', maxWidth: 220, textAlign: 'right', lineHeight: 1.5 }}>
                {source === 'apple'
                  ? 'Manage this subscription in your device settings.'
                  : 'To manage this subscription, open Pathways in a web browser.'}
              </span>
            ) : (
              <button type="button" className="btn btn-secondary" style={{ fontSize: 13 }} onClick={manageBilling}>
                Manage subscription
              </button>
            )}
            {renewalDate && (
              <span style={{ fontSize: 11.5, color: 'var(--text-subtle)' }}>
                {isCanceling ? `Ends ${renewalDate}` : `Renews ${renewalDate}`}
              </span>
            )}
            {billingError && (
              <span className="msg msg-error" style={{ maxWidth: 220, textAlign: 'right' }} role="alert">{billingError}</span>
            )}
          </div>
        </div>
      )}

      <div
        className="grid app-split"
        style={{
          gridTemplateColumns: narrow ? 'minmax(0,1fr)' : 'minmax(0,260px) minmax(0,1fr)',
          gap: 16,
          alignItems: 'start',
        }}
      >
        {showList && (
          <ThreadList
            threads={chat.threads}
            folders={chat.folders}
            activeId={chat.activeId}
            loading={chat.loadingThreads}
            onSelect={(id) => { chat.setActiveId(id); openThread(id); }}
            onNew={() => { chat.newChat(); openThread(null); }}
            onRename={chat.renameThread}
            onDelete={(id) => { chat.deleteThread(id); if (threadParam === id) closeThread(); }}
            onArchive={chat.archiveThread}
            onMove={chat.moveThread}
            onCreateFolder={chat.createFolder}
            onRenameFolder={chat.renameFolder}
            onDeleteFolder={chat.deleteFolder}
          />
        )}

        {showPane && (
          // One scroll region: the card is sized off the viewport and the
          // transcript inside it grows to fill what is left, so the page itself
          // never becomes a second scrolling surface on a phone.
          <div
            className="card elev-sm"
            style={{
              padding: 20, gap: 14, borderRadius: 16, overflow: 'hidden',
              height: 'calc(100dvh - 260px)', minHeight: 380,
            }}
          >
            <div className="flex items-center gap-2">
              {narrow && (
                <button
                  type="button"
                  className="btn btn-quiet btn-sm"
                  onClick={closeThread}
                  aria-label="Back to your chats"
                  style={{ paddingLeft: 6, paddingRight: 8 }}
                >
                  <ArrowLeft size={16} aria-hidden="true" /> Chats
                </button>
              )}
              <span className="card-kicker">{activeThread?.title || 'New chat'}</span>
            </div>
            <SageMessages
              messages={chat.messages}
              thinking={chat.thinking}
              loading={chat.loadingMessages}
              onStarter={(s) => send(s, [])}
            />
            <SageComposer onSend={send} thinking={chat.thinking} />
          </div>
        )}
      </div>
    </div>
  );
}