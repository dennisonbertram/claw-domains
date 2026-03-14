import { onchainTable, relations, index } from "ponder";

export const domain = onchainTable("domain", (t) => ({
  id: t.text().primaryKey(),          // tokenId as hex string
  name: t.text().notNull(),           // label (e.g. "alice")
  owner: t.text().notNull(),          // current owner address
  expires: t.bigint().notNull(),      // expiry timestamp
  registeredAt: t.bigint().notNull(), // block timestamp of registration
  registeredTxHash: t.text().notNull(),
}), (table) => ({
  ownerIdx: index().on(table.owner),
  nameIdx: index().on(table.name),
}));

export const transfer = onchainTable("transfer", (t) => ({
  id: t.text().primaryKey(),          // txHash-logIndex
  domainId: t.text().notNull(),       // references domain.id
  from: t.text().notNull(),
  to: t.text().notNull(),
  timestamp: t.bigint().notNull(),
  txHash: t.text().notNull(),
  blockNumber: t.bigint().notNull(),
}), (table) => ({
  domainIdx: index().on(table.domainId),
}));

export const textRecord = onchainTable("text_record", (t) => ({
  id: t.text().primaryKey(),          // node-key
  node: t.text().notNull(),           // namehash
  key: t.text().notNull(),
  value: t.text().notNull(),
  updatedAt: t.bigint().notNull(),
}), (table) => ({
  nodeIdx: index().on(table.node),
}));

export const addrRecord = onchainTable("addr_record", (t) => ({
  id: t.text().primaryKey(),          // node
  node: t.text().notNull(),
  addr: t.text().notNull(),
  updatedAt: t.bigint().notNull(),
}), (table) => ({
  nodeIdx: index().on(table.node),
}));

export const account = onchainTable("account", (t) => ({
  id: t.text().primaryKey(),          // address
  domainCount: t.integer().notNull().default(0),
}));

// Relations
export const domainRelations = relations(domain, ({ many }) => ({
  transfers: many(transfer),
}));

export const transferRelations = relations(transfer, ({ one }) => ({
  domain: one(domain, { fields: [transfer.domainId], references: [domain.id] }),
}));
