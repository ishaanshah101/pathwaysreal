import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSubscription, openBillingPortal } from '@/lib/useSubscription';
import { useSageChat } from '@/lib/useSageChat';
import SagePaywall from '@/components/app/SagePaywall';
import ThreadList from '@/components/sage/ThreadList';
import SageMessages from '@/components/sage/SageMessages';
import SageComposer from '@/components/sage/SageComposer';
import { Spinner } from '@/components/RequireAuth';
import Seo from '@/components/Seo';

export default function SageChat() {
  const {
    subscription, hasSage, isPastDue, isCanceling,
    isLoadingSubscription, refetchSubscription,
  } = useSubscription();
  const [params, setParams] = useSearchParams();
  const [billingError, setBillingError] = useState('');
  const chat = useSageChat(hasSage);

  const checkout = params.get('checkout');

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
        ? { tone: 'ok', text: 'Payment received. Confirming with Stripe now, this usually takes a few seconds.' }
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

      <div className="flex items-start gap-4 flex-wrap">
        <div style={{ flex: '1 1 340px' }}>
          <h1 style={{ fontSize: 'clamp(26px,3.2vw,36px)', margin: '0 0 6px' }}>Ask Sage anything.</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, maxWidth: '56ch', lineHeight: 1.6 }}>
            Sage knows your grade, your school, and your goals. Keep separate chats for essays, your
            college list, or summer plans, and attach a draft whenever you want it read.
          </p>
        </div>
        <div className="flex flex-col items-end" style={{ gap: 4 }}>
          <button type="button" className="btn btn-secondary" style={{ fontSize: 13 }} onClick={manageBilling}>
            Manage subscription
          </button>
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

      <div
        className="grid app-split"
        style={{ gridTemplateColumns: 'minmax(0,260px) minmax(0,1fr)', gap: 16, alignItems: 'start' }}
      >
        <ThreadList
          threads={chat.threads}
          folders={chat.folders}
          activeId={chat.activeId}
          loading={chat.loadingThreads}
          onSelect={chat.setActiveId}
          onNew={chat.newChat}
          onRename={chat.renameThread}
          onDelete={chat.deleteThread}
          onArchive={chat.archiveThread}
          onMove={chat.moveThread}
          onCreateFolder={chat.createFolder}
          onRenameFolder={chat.renameFolder}
          onDeleteFolder={chat.deleteFolder}
        />

        <div className="card elev-sm" style={{ padding: 20, gap: 14, borderRadius: 16, minHeight: 540 }}>
          <span className="card-kicker">{activeThread?.title || 'New chat'}</span>
          <SageMessages
            messages={chat.messages}
            thinking={chat.thinking}
            loading={chat.loadingMessages}
            onStarter={(s) => send(s, [])}
          />
          <SageComposer onSend={send} thinking={chat.thinking} />
        </div>
      </div>
    </div>
  );
}