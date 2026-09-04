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

export const pramaanxCompaniesTable = pgTable("pramaanx_companies", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  size: text("size").notNull(),
  industry: text("industry").notNull(),
  businessType: text("business_type").notNull(),
  departments: text("departments").notNull(),
  branches: text("branches").notNull(),
  capacity: integer("capacity").notNull().default(100),
  verificationStatus: text("verification_status").notNull().default("verified"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});

export const pramaanxUsersTable = pgTable("pramaanx_users", {
  id: text("id").primaryKey(),
  companyId: text("company_id")
    .notNull()
    .references(() => pramaanxCompaniesTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(),
  department: text("department").notNull(),
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
export const insertPramaanxCompanySchema = createInsertSchema(
  pramaanxCompaniesTable,
).omit({ id: true });
export const insertPramaanxUserSchema = createInsertSchema(
  pramaanxUsersTable,
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
export type PramaanxCompany = typeof pramaanxCompaniesTable.$inferSelect;
export type InsertPramaanxCompany = z.infer<typeof insertPramaanxCompanySchema>;
export type PramaanxUser = typeof pramaanxUsersTable.$inferSelect;
export type InsertPramaanxUser = z.infer<typeof insertPramaanxUserSchema>;