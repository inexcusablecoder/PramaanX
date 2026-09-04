import { createInsertSchema } from "drizzle-zod";
import { integer, pgTable, real, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const pramaanxDocumentsTable = pgTable("pramaanx_documents", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  subject: text("subject").notNull(),
  issuer: text("issuer").notNull(),
  status: text("status").notNull(),
  trustScore: real("trust_score").notNull().default(0),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});

export const pramaanxVerificationDecisionsTable = pgTable(
  "pramaanx_verification_decisions",
  {
    id: text("id").primaryKey(),
    documentId: text("document_id")
      .notNull()
      .references(() => pramaanxDocumentsTable.id, { onDelete: "cascade" }),
    decision: text("decision").notNull(),
    trustScore: real("trust_score").notNull(),
    checkedAt: timestamp("checked_at", { withTimezone: true }).notNull(),
  },
);

export const pramaanxWorkforceTable = pgTable("pramaanx_workforce", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  organization: text("organization").notNull(),
  status: text("status").notNull(),
  trustScore: real("trust_score").notNull(),
  credentials: integer("credentials").notNull(),
  lastVerified: timestamp("last_verified", { withTimezone: true }).notNull(),
});

export const pramaanxAssetsTable = pgTable("pramaanx_assets", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  location: text("location").notNull(),
  custodyStatus: text("custody_status").notNull(),
  trustScore: real("trust_score").notNull(),
  lastSeen: timestamp("last_seen", { withTimezone: true }).notNull(),
});

export const pramaanxActivityTable = pgTable("pramaanx_activity", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(),
  actor: text("actor").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});

export const insertPramaanxDocumentSchema = createInsertSchema(
  pramaanxDocumentsTable,
).omit({ id: true });
export const insertPramaanxVerificationDecisionSchema = createInsertSchema(
  pramaanxVerificationDecisionsTable,
).omit({ id: true });
export const insertPramaanxWorkforceSchema = createInsertSchema(
  pramaanxWorkforceTable,
).omit({ id: true });
export const insertPramaanxAssetSchema = createInsertSchema(
  pramaanxAssetsTable,
).omit({ id: true });
export const insertPramaanxActivitySchema = createInsertSchema(
  pramaanxActivityTable,
).omit({ id: true });

export type PramaanxDocument = typeof pramaanxDocumentsTable.$inferSelect;
export type InsertPramaanxDocument = z.infer<
  typeof insertPramaanxDocumentSchema
>;
export type PramaanxVerificationDecision =
  typeof pramaanxVerificationDecisionsTable.$inferSelect;
export type InsertPramaanxVerificationDecision = z.infer<
  typeof insertPramaanxVerificationDecisionSchema
>;
export type PramaanxWorkforce = typeof pramaanxWorkforceTable.$inferSelect;
export type InsertPramaanxWorkforce = z.infer<
  typeof insertPramaanxWorkforceSchema
>;
export type PramaanxAsset = typeof pramaanxAssetsTable.$inferSelect;
export type InsertPramaanxAsset = z.infer<typeof insertPramaanxAssetSchema>;
export type PramaanxActivity = typeof pramaanxActivityTable.$inferSelect;
export type InsertPramaanxActivity = z.infer<
  typeof insertPramaanxActivitySchema
>;