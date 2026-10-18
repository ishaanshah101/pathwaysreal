export async function deleteOwned(table, query) {
  // Each batch changes the query. Retrying after a failure is safe.
  while (true) {
    await table.deleteMany(query);
    if (!await table.count(query)) return;
  }
}

export async function anonymizeOwned(table, query, patch) {
  while (true) {
    await table.updateMany(query, { $set: patch });
    if (!await table.count(query)) return;
  }
}

export async function anonymizeConversations(db, email, deletedRef) {
  const query = { $or: [{ from_email: email }, { to_email: email }] };
  while (true) {
    const page = await db.Message.filter(query, { limit: 100, fields: ['from_email', 'to_email'] });
    if (!page.items.length) break;
    await db.Message.bulkUpdate(page.items.map((message) => {
      const from = message.from_email === email ? deletedRef : message.from_email;
      const to = message.to_email === email ? deletedRef : message.to_email;
      return { id: message.id, from_email: from, to_email: to,
        thread_key: [from, to].sort().join('|'),
        ...(message.from_email === email ? { from_name: 'Deleted account', attachments: [] } : {}),
      };
    }));
  }
  for (const field of ['sender_email', 'recipient_email']) {
    while (true) {
      const page = await db.MessageReceipt.filter({ [field]: email }, { limit: 100, fields: ['thread_key'] });
      if (!page.items.length) break;
      await db.MessageReceipt.bulkUpdate(page.items.map((receipt) => ({ id: receipt.id, [field]: deletedRef,
        thread_key: String(receipt.thread_key || '').split('|').map((part) => part === email ? deletedRef : part).sort().join('|'),
      })));
    }
  }
}