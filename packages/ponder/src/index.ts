import { ponder } from "ponder:registry";
import { domain, transfer, textRecord, addrRecord, account } from "ponder:schema";

// Registry: DomainRegistered
ponder.on("Registry:DomainRegistered", async ({ event, context }) => {
  const tokenId = event.args.tokenId.toString();
  const owner = event.args.owner.toLowerCase();

  await context.db
    .insert(domain)
    .values({
      id: tokenId,
      name: event.args.name,
      owner,
      expires: event.args.expires,
      registeredAt: event.block.timestamp,
      registeredTxHash: event.transaction.hash,
    });

  // Update account domain count
  // Note: ponder 0.9 doesn't support computed updates in onConflictDoUpdate
  // We use a simple increment approach
  const existing = await context.db.find(account, { id: owner });
  if (existing) {
    await context.db
      .update(account, { id: owner })
      .set({ domainCount: existing.domainCount + 1 });
  } else {
    await context.db
      .insert(account)
      .values({ id: owner, domainCount: 1 });
  }
});

// Registry: DomainRenewed
ponder.on("Registry:DomainRenewed", async ({ event, context }) => {
  const tokenId = event.args.tokenId.toString();

  await context.db
    .update(domain, { id: tokenId })
    .set({ expires: event.args.newExpires });
});

// Registry: Transfer (ERC-721)
ponder.on("Registry:Transfer", async ({ event, context }) => {
  const tokenId = event.args.tokenId.toString();
  const from = event.args.from.toLowerCase();
  const to = event.args.to.toLowerCase();
  const zeroAddr = "0x0000000000000000000000000000000000000000";

  // Skip mint transfers (handled by DomainRegistered)
  if (from === zeroAddr) return;

  // Record the transfer
  const transferId = `${event.transaction.hash}-${event.log.logIndex}`;
  await context.db
    .insert(transfer)
    .values({
      id: transferId,
      domainId: tokenId,
      from,
      to,
      timestamp: event.block.timestamp,
      txHash: event.transaction.hash,
      blockNumber: event.block.number,
    });

  // Update domain owner
  await context.db
    .update(domain, { id: tokenId })
    .set({ owner: to });

  // Update account counts
  if (from !== zeroAddr) {
    const fromAccount = await context.db.find(account, { id: from });
    if (fromAccount) {
      await context.db
        .update(account, { id: from })
        .set({ domainCount: fromAccount.domainCount > 0 ? fromAccount.domainCount - 1 : 0 });
    }
  }

  const toAccount = await context.db.find(account, { id: to });
  if (toAccount) {
    await context.db
      .update(account, { id: to })
      .set({ domainCount: toAccount.domainCount + 1 });
  } else {
    await context.db
      .insert(account)
      .values({ id: to, domainCount: 1 });
  }
});

// Resolver: AddrChanged
ponder.on("Resolver:AddrChanged", async ({ event, context }) => {
  const node = event.args.node.toLowerCase();

  await context.db
    .insert(addrRecord)
    .values({
      id: node,
      node,
      addr: event.args.addr.toLowerCase(),
      updatedAt: event.block.timestamp,
    })
    .onConflictDoUpdate({
      addr: event.args.addr.toLowerCase(),
      updatedAt: event.block.timestamp,
    });
});

// Resolver: TextChanged
ponder.on("Resolver:TextChanged", async ({ event, context }) => {
  const node = event.args.node.toLowerCase();
  const recordId = `${node}-${event.args.key}`;

  await context.db
    .insert(textRecord)
    .values({
      id: recordId,
      node,
      key: event.args.key,
      value: event.args.value,
      updatedAt: event.block.timestamp,
    })
    .onConflictDoUpdate({
      value: event.args.value,
      updatedAt: event.block.timestamp,
    });
});
