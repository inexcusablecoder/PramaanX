import { randomUUID } from "node:crypto";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  GetDashboardSummaryResponse,
  GetDocumentParams,
  GetDocumentResponse,
  ListActivityQueryParams,
  ListActivityResponse,
  ListAssetsResponse,
  ListDocumentsQueryParams,
  ListDocumentsResponse,
  ListWorkforceQueryParams,
  ListWorkforceResponse,
  UploadDocumentBody,
  UploadDocumentResponse,
  VerifyDocumentParams,
  VerifyDocumentResponse,
} from "@workspace/api-zod";
import {
  db,
  pramaanxActivityTable,
  pramaanxAssetsTable,
  pramaanxDocumentsTable,
  pramaanxVerificationDecisionsTable,
  pramaanxWorkforceTable,
  type PramaanxActivity,
  type PramaanxAsset,
  type PramaanxDocument,
  type PramaanxVerificationDecision,
  type PramaanxWorkforce,
} from "@workspace/db";

const seedDocuments = [
  {
    id: "doc-1048",
    name: "Aadhaar identity proof",
    type: "Identity",
    subject: "Ananya Sharma",
    issuer: "UIDAI",
    status: "verified",
    trustScore: 98,
    submittedAt: "2026-09-04T06:34:00.000Z",
    updatedAt: "2026-09-04T06:34:28.000Z",
  },
  {
    id: "doc-1047",
    name: "Electrical safety certificate",
    type: "Compliance",
    subject: "Rohan Mehta",
    issuer: "Bureau Veritas",
    status: "review",
    trustScore: 74,
    submittedAt: "2026-09-04T06:21:00.000Z",
    updatedAt: "2026-09-04T06:22:12.000Z",
  },
  {
    id: "doc-1046",
    name: "Heavy vehicle license",
    type: "License",
    subject: "Vikram Singh",
    issuer: "Transport Authority",
    status: "flagged",
    trustScore: 42,
    submittedAt: "2026-09-04T05:55:00.000Z",
    updatedAt: "2026-09-04T05:55:46.000Z",
  },
  {
    id: "doc-1045",
    name: "Contractor insurance policy",
    type: "Insurance",
    subject: "Nexus Field Services",
    issuer: "ICICI Lombard",
    status: "verified",
    trustScore: 94,
    submittedAt: "2026-09-04T05:33:00.000Z",
    updatedAt: "2026-09-04T05:33:21.000Z",
  },
  {
    id: "doc-1044",
    name: "Forklift operator permit",
    type: "Credential",
    subject: "Priya Nair",
    issuer: "Safety Council",
    status: "pending",
    trustScore: 0,
    submittedAt: "2026-09-04T05:06:00.000Z",
    updatedAt: "2026-09-04T05:06:00.000Z",
  },
  {
    id: "doc-1043",
    name: "GST registration certificate",
    type: "Business",
    subject: "Apex Logistics Pvt Ltd",
    issuer: "GST Network",
    status: "verified",
    trustScore: 96,
    submittedAt: "2026-09-04T04:44:00.000Z",
    updatedAt: "2026-09-04T04:44:32.000Z",
  },
] as const;

const seedWorkforce = [
  {
    id: "worker-01",
    name: "Ananya Sharma",
    role: "Site Operations Lead",
    organization: "Apex Logistics",
    status: "active",
    trustScore: 98,
    credentials: 8,
    lastVerified: "2026-09-04T06:34:28.000Z",
    shiftHours: 8,
    overtimeHours: 0,
    workloadTasks: 3,
    restBreakIndex: 4,
    stressScore: 34,
    stressLevel: "Optimal",
  },
  {
    id: "worker-02",
    name: "Rohan Mehta",
    role: "Electrical Contractor",
    organization: "Nexus Field Services",
    status: "review",
    trustScore: 74,
    credentials: 6,
    lastVerified: "2026-09-04T06:22:12.000Z",
    shiftHours: 11,
    overtimeHours: 3,
    workloadTasks: 7,
    restBreakIndex: 2,
    stressScore: 78,
    stressLevel: "Burnout Risk",
  },
  {
    id: "worker-03",
    name: "Vikram Singh",
    role: "Fleet Operator",
    organization: "Apex Logistics",
    status: "flagged",
    trustScore: 42,
    credentials: 4,
    lastVerified: "2026-09-04T05:55:46.000Z",
    shiftHours: 12,
    overtimeHours: 4,
    workloadTasks: 9,
    restBreakIndex: 1,
    stressScore: 89,
    stressLevel: "Burnout Risk",
  },
  {
    id: "worker-04",
    name: "Priya Nair",
    role: "Warehouse Specialist",
    organization: "Apex Logistics",
    status: "expiring",
    trustScore: 86,
    credentials: 7,
    lastVerified: "2026-09-03T15:16:10.000Z",
    shiftHours: 9,
    overtimeHours: 1,
    workloadTasks: 4,
    restBreakIndex: 3,
    stressScore: 57,
    stressLevel: "Elevated",
  },
];

const seedAssets = [
  {
    id: "asset-034",
    name: "Container AX-3492",
    category: "Cold-chain container",
    location: "Pune distribution hub",
    custodyStatus: "in-transit",
    trustScore: 96,
    lastSeen: "2026-09-04T06:39:00.000Z",
  },
  {
    id: "asset-033",
    name: "Forklift FL-208",
    category: "Material handling",
    location: "Nashik warehouse",
    custodyStatus: "secure",
    trustScore: 91,
    lastSeen: "2026-09-04T06:37:00.000Z",
  },
  {
    id: "asset-032",
    name: "Generator GN-018",
    category: "Power equipment",
    location: "Mumbai site 04",
    custodyStatus: "attention",
    trustScore: 63,
    lastSeen: "2026-09-04T05:48:00.000Z",
  },
  {
    id: "asset-031",
    name: "Trailer TR-441",
    category: "Fleet trailer",
    location: "NH-48 checkpoint",
    custodyStatus: "in-transit",
    trustScore: 88,
    lastSeen: "2026-09-04T06:31:00.000Z",
  },
] as const;

const seedActivity = [
  {
    id: "activity-01",
    title: "Document verified",
    description: "Aadhaar identity proof cleared all verification layers",
    type: "verification",
    actor: "PramaanX engine",
    createdAt: "2026-09-04T06:34:28.000Z",
  },
  {
    id: "activity-02",
    title: "Geofence checkpoint reached",
    description: "Container AX-3492 entered the Pune distribution zone",
    type: "asset",
    actor: "Telemetry sync",
    createdAt: "2026-09-04T06:39:00.000Z",
  },
  {
    id: "activity-03",
    title: "Credential needs review",
    description: "Electrical safety certificate has an issuer mismatch signal",
    type: "risk",
    actor: "Risk intelligence",
    createdAt: "2026-09-04T06:22:12.000Z",
  },
  {
    id: "activity-04",
    title: "Workforce record updated",
    description: "Priya Nair's compliance profile was refreshed",
    type: "workforce",
    actor: "Aditi Rao",
    createdAt: "2026-09-04T06:02:17.000Z",
  },
  {
    id: "activity-05",
    title: "Anomaly detected",
    description: "Generator GN-018 reported an unexpected custody transition",
    type: "risk",
    actor: "Risk intelligence",
    createdAt: "2026-09-04T05:48:00.000Z",
  },
] as const;

const inMemoryDocuments: PramaanxDocument[] = seedDocuments.map((document) => ({
  ...document,
  submittedAt: new Date(document.submittedAt),
  updatedAt: new Date(document.updatedAt),
}));

const inMemoryWorkforce: PramaanxWorkforce[] = seedWorkforce.map((member) => ({
  ...member,
  lastVerified: new Date(member.lastVerified),
}));

const inMemoryAssets: PramaanxAsset[] = seedAssets.map((asset) => ({
  ...asset,
  lastSeen: new Date(asset.lastSeen),
}));

const inMemoryActivity: PramaanxActivity[] = seedActivity.map((item) => ({
  ...item,
  createdAt: new Date(item.createdAt),
}));

const inMemoryDecisions: PramaanxVerificationDecision[] = seedDocuments
  .filter((document) => document.status === "verified")
  .map((document) => ({
    id: `seed-decision-${document.id}`,
    documentId: document.id,
    decision: "verified",
    trustScore: document.trustScore,
    checkedAt: new Date(document.updatedAt),
  }));

let initializationPromise: Promise<void> | undefined;

export function initializePramaanxData(): Promise<void> {
  initializationPromise ??= (async () => {
    try {
      await db.transaction(async (tx) => {
        await tx
          .insert(pramaanxDocumentsTable)
          .values(
            seedDocuments.map((document) => ({
              ...document,
              submittedAt: new Date(document.submittedAt),
              updatedAt: new Date(document.updatedAt),
            })),
          )
          .onConflictDoNothing();

        await tx
          .insert(pramaanxWorkforceTable)
          .values(
            seedWorkforce.map((member) => ({
              ...member,
              lastVerified: new Date(member.lastVerified),
            })),
          )
          .onConflictDoNothing();

        await tx
          .insert(pramaanxAssetsTable)
          .values(
            seedAssets.map((asset) => ({
              ...asset,
              lastSeen: new Date(asset.lastSeen),
            })),
          )
          .onConflictDoNothing();

        await tx
          .insert(pramaanxActivityTable)
          .values(
            seedActivity.map((item) => ({
              ...item,
              createdAt: new Date(item.createdAt),
            })),
          )
          .onConflictDoNothing();

        await tx
          .insert(pramaanxVerificationDecisionsTable)
          .values(
            seedDocuments
              .filter((document) => document.status === "verified")
              .map((document) => ({
                id: `seed-decision-${document.id}`,
                documentId: document.id,
                decision: "verified",
                trustScore: document.trustScore,
                checkedAt: new Date(document.updatedAt),
              })),
          )
          .onConflictDoNothing();
      });
    } catch (_err) {
      // In-memory demo fallback when standalone local database is not connected
    }
  })();

  return initializationPromise;
}

function getDocumentDetail(
  document: PramaanxDocument,
  activity: PramaanxActivity[],
) {
  return {
    ...document,
    fields: [
      { label: "Full name", value: document.subject, confidence: 0.99 },
      { label: "Document type", value: document.type, confidence: 0.98 },
      { label: "Issuing authority", value: document.issuer, confidence: 0.97 },
      {
        label: "Verification reference",
        value: `PX-${document.id.slice(-4)}-2026`,
        confidence: 0.95,
      },
    ],
    signals:
      document.status === "flagged"
        ? [
            {
              label: "Metadata consistency",
              value: "Review required",
              severity: "high",
            },
            {
              label: "Issuer match",
              value: "Partial match",
              severity: "medium",
            },
            {
              label: "Pixel forensics",
              value: "Copy-move pattern detected",
              severity: "high",
            },
          ]
        : [
            {
              label: "Metadata consistency",
              value: "Passed",
              severity: "low",
            },
            { label: "Issuer match", value: "Verified", severity: "low" },
            {
              label: "Pixel forensics",
              value: "No tampering detected",
              severity: "low",
            },
          ],
    timeline: activity
      .filter((item) => item.type === "verification" || item.type === "risk")
      .slice(0, 3),
  };
}

function average(values: number[]): number {
  return values.length
    ? values.reduce((total, value) => total + value, 0) / values.length
    : 0;
}

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getProcessingTrend(documents: PramaanxDocument[]) {
  const dates = documents.map((document) => document.updatedAt.getTime());
  const end = new Date(Math.max(Date.now(), ...dates));
  end.setUTCHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(end);
    date.setUTCDate(end.getUTCDate() - (6 - index));
    const key = dayKey(date);
    return {
      label: date.toLocaleDateString("en-US", {
        weekday: "short",
        timeZone: "UTC",
      }),
      verified: documents.filter(
        (document) =>
          dayKey(document.updatedAt) === key && document.status === "verified",
      ).length,
      flagged: documents.filter(
        (document) =>
          dayKey(document.updatedAt) === key && document.status === "flagged",
      ).length,
    };
  });
}

const router: IRouter = Router();

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  await initializePramaanxData();
  let documents: PramaanxDocument[] = inMemoryDocuments;
  let workforce: PramaanxWorkforce[] = inMemoryWorkforce;
  let assets: PramaanxAsset[] = inMemoryAssets;
  let decisions: PramaanxVerificationDecision[] = inMemoryDecisions;

  try {
    const [dbDocs, dbWorkers, dbAssets, dbDecisions] = await Promise.all([
      db.select().from(pramaanxDocumentsTable),
      db.select().from(pramaanxWorkforceTable),
      db.select().from(pramaanxAssetsTable),
      db.select().from(pramaanxVerificationDecisionsTable),
    ]);
    if (dbDocs.length) documents = dbDocs;
    if (dbWorkers.length) workforce = dbWorkers;
    if (dbAssets.length) assets = dbAssets;
    if (dbDecisions.length) decisions = dbDecisions;
  } catch (_err) {
    // In-memory demo fallback
  }

  const pending = documents.filter(
    (document) => document.status === "pending" || document.status === "review",
  ).length;
  const flagged = documents.filter(
    (document) => document.status === "flagged",
  ).length;
  const verified = documents.filter(
    (document) => document.status === "verified",
  ).length;
  const processingTimes = decisions
    .map((decision) => {
      const document = documents.find(
        (item) => item.id === decision.documentId,
      );
      return document
        ? (decision.checkedAt.getTime() - document.submittedAt.getTime()) / 1000
        : 0;
    })
    .filter((duration) => duration >= 0);
  const openAlerts =
    flagged +
    assets.filter((asset) => asset.custodyStatus === "attention").length;
  const averageTrust = average([
    ...documents.map((document) => document.trustScore),
    ...workforce.map((member) => member.trustScore),
    ...assets.map((asset) => asset.trustScore),
  ]);

  res.json(
    GetDashboardSummaryResponse.parse({
      verification: {
        total: documents.length,
        verified,
        pending,
        flagged,
        averageTimeSeconds: Number(average(processingTimes).toFixed(1)),
      },
      workforce: {
        total: workforce.length,
        active: workforce.filter((member) => member.status === "active").length,
        expiringSoon: workforce.filter(
          (member) => member.status === "expiring",
        ).length,
        complianceRate: workforce.length
          ? Number(
              (
                (workforce.filter((member) => member.status === "active")
                  .length /
                  workforce.length) *
                100
              ).toFixed(1),
            )
          : 0,
      },
      assets: {
        total: assets.length,
        inTransit: assets.filter(
          (asset) => asset.custodyStatus === "in-transit",
        ).length,
        secure: assets.filter((asset) => asset.custodyStatus === "secure")
          .length,
        attention: assets.filter(
          (asset) => asset.custodyStatus === "attention",
        ).length,
      },
      risk: {
        trustScore: Number(averageTrust.toFixed(1)),
        change: 0,
        openAlerts,
        severity: openAlerts > 5 ? "high" : openAlerts > 0 ? "medium" : "low",
      },
      processingTrend: getProcessingTrend(documents),
    }),
  );
});

router.get("/documents", async (req, res): Promise<void> => {
  await initializePramaanxData();
  const query = ListDocumentsQueryParams.parse(req.query);

  try {
    const filters = [];
    if (query.status && query.status !== "all") {
      filters.push(eq(pramaanxDocumentsTable.status, query.status));
    }
    if (query.q) {
      const search = `%${query.q}%`;
      filters.push(
        or(
          ilike(pramaanxDocumentsTable.name, search),
          ilike(pramaanxDocumentsTable.subject, search),
          ilike(pramaanxDocumentsTable.issuer, search),
          ilike(pramaanxDocumentsTable.type, search),
        ),
      );
    }
    const result = await db
      .select()
      .from(pramaanxDocumentsTable)
      .where(filters.length ? and(...filters) : undefined)
      .orderBy(desc(pramaanxDocumentsTable.updatedAt));
    if (result.length > 0) {
      res.json(ListDocumentsResponse.parse(result));
      return;
    }
  } catch (_err) {
    // In-memory demo fallback
  }

  let filtered = [...inMemoryDocuments];
  if (query.status && query.status !== "all") {
    filtered = filtered.filter((doc) => doc.status === query.status);
  }
  if (query.q) {
    const q = query.q.toLowerCase();
    filtered = filtered.filter(
      (doc) =>
        doc.name.toLowerCase().includes(q) ||
        doc.subject.toLowerCase().includes(q) ||
        doc.issuer.toLowerCase().includes(q) ||
        doc.type.toLowerCase().includes(q),
    );
  }
  filtered.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  res.json(ListDocumentsResponse.parse(filtered));
});

router.get("/documents/:id", async (req, res): Promise<void> => {
  await initializePramaanxData();
  const { id } = GetDocumentParams.parse(req.params);
  let document: PramaanxDocument | undefined;
  let activity: PramaanxActivity[] = inMemoryActivity;

  try {
    const [dbDoc] = await db
      .select()
      .from(pramaanxDocumentsTable)
      .where(eq(pramaanxDocumentsTable.id, id));
    if (dbDoc) {
      document = dbDoc;
      const dbAct = await db
        .select()
        .from(pramaanxActivityTable)
        .orderBy(desc(pramaanxActivityTable.createdAt));
      if (dbAct.length) activity = dbAct;
    }
  } catch (_err) {
    // In-memory demo fallback
  }

  if (!document) {
    document = inMemoryDocuments.find((doc) => doc.id === id);
  }

  if (!document) {
    res.status(404).json({ error: "Document not found" });
    return;
  }

  res.json(
    GetDocumentResponse.parse(getDocumentDetail(document, activity)),
  );
});

router.post("/documents/:id/verify", async (req, res): Promise<void> => {
  await initializePramaanxData();
  const { id } = VerifyDocumentParams.parse(req.params);
  let document = inMemoryDocuments.find((d) => d.id === id);

  try {
    const [dbDoc] = await db
      .select()
      .from(pramaanxDocumentsTable)
      .where(eq(pramaanxDocumentsTable.id, id));
    if (dbDoc) document = dbDoc;
  } catch (_err) {
    // In-memory demo fallback
  }

  if (!document) {
    res.status(404).json({ error: "Document not found" });
    return;
  }

  const status = document.status === "flagged" ? "review" : "verified";
  const trustScore =
    status === "verified" ? Math.max(document.trustScore, 91) : document.trustScore;
  const checkedAt = new Date();
  const activityId = `activity-${randomUUID()}`;

  let result: PramaanxDocument = {
    ...document,
    status,
    trustScore,
    updatedAt: checkedAt,
  };

  const idx = inMemoryDocuments.findIndex((d) => d.id === id);
  if (idx !== -1) {
    inMemoryDocuments[idx] = result;
  }
  inMemoryDecisions.unshift({
    id: `decision-${randomUUID()}`,
    documentId: id,
    decision: status,
    trustScore,
    checkedAt,
  });
  inMemoryActivity.unshift({
    id: activityId,
    title: status === "verified" ? "Document verified" : "Document escalated",
    description: `${document.name} was checked by an operations reviewer`,
    type: "verification",
    actor: "Operations reviewer",
    createdAt: checkedAt,
  });

  try {
    await db.transaction(async (tx) => {
      const [updatedDocument] = await tx
        .update(pramaanxDocumentsTable)
        .set({ status, trustScore, updatedAt: checkedAt })
        .where(eq(pramaanxDocumentsTable.id, id))
        .returning();

      await tx.insert(pramaanxVerificationDecisionsTable).values({
        id: `decision-${randomUUID()}`,
        documentId: id,
        decision: status,
        trustScore,
        checkedAt,
      });
      await tx.insert(pramaanxActivityTable).values({
        id: activityId,
        title: status === "verified" ? "Document verified" : "Document escalated",
        description: `${document.name} was checked by an operations reviewer`,
        type: "verification",
        actor: "Operations reviewer",
        createdAt: checkedAt,
      });

      if (updatedDocument) result = updatedDocument;
    });
  } catch (_err) {
    // In-memory demo fallback
  }

  res.json(
    VerifyDocumentResponse.parse({
      document: result,
      decision: status,
      trustScore,
      checkedAt,
    }),
  );
});

router.post("/documents/upload", async (req, res): Promise<void> => {
  await initializePramaanxData();
  const input = UploadDocumentBody.parse(req.body);
  const timestamp = new Date();
  const document: PramaanxDocument = {
    id: `doc-${randomUUID()}`,
    ...input,
    status: "pending",
    trustScore: 0,
    submittedAt: timestamp,
    updatedAt: timestamp,
  };

  inMemoryDocuments.unshift(document);
  inMemoryActivity.unshift({
    id: `activity-${randomUUID()}`,
    title: "Document queued",
    description: `${input.name} entered the verification pipeline`,
    type: "verification",
    actor: "Operations reviewer",
    createdAt: timestamp,
  });

  try {
    await db.transaction(async (tx) => {
      await tx.insert(pramaanxDocumentsTable).values(document);
      await tx.insert(pramaanxActivityTable).values({
        id: `activity-${randomUUID()}`,
        title: "Document queued",
        description: `${input.name} entered the verification pipeline`,
        type: "verification",
        actor: "Operations reviewer",
        createdAt: timestamp,
      });
    });
  } catch (_err) {
    // In-memory demo fallback
  }

  res.status(201).json(UploadDocumentResponse.parse(document));
});

export function calculateStressScore(params: {
  shiftHours: number;
  overtimeHours: number;
  workloadTasks: number;
  restBreakIndex: number;
}) {
  const { shiftHours, overtimeHours, workloadTasks, restBreakIndex } = params;
  const rawScore = Math.round(
    shiftHours * 4.5 + workloadTasks * 6 + overtimeHours * 8 - restBreakIndex * 5
  );
  const stressScore = Math.max(5, Math.min(99, rawScore));
  const stressLevel =
    stressScore >= 70 ? "Burnout Risk" : stressScore >= 40 ? "Elevated" : "Optimal";
  return { stressScore, stressLevel };
}

router.get("/workforce", async (req, res): Promise<void> => {
  await initializePramaanxData();
  const query = ListWorkforceQueryParams.parse(req.query);

  try {
    const filters = [];
    if (query.status && query.status !== "all") {
      filters.push(eq(pramaanxWorkforceTable.status, query.status));
    }
    if (query.q) {
      const search = `%${query.q}%`;
      filters.push(
        or(
          ilike(pramaanxWorkforceTable.name, search),
          ilike(pramaanxWorkforceTable.role, search),
          ilike(pramaanxWorkforceTable.organization, search),
        ),
      );
    }
    const result = await db
      .select()
      .from(pramaanxWorkforceTable)
      .where(filters.length ? and(...filters) : undefined)
      .orderBy(desc(pramaanxWorkforceTable.lastVerified));
    if (result.length > 0) {
      res.json(ListWorkforceResponse.parse(result));
      return;
    }
  } catch (_err) {
    // In-memory demo fallback
  }

  let filtered = [...inMemoryWorkforce];
  if (query.status && query.status !== "all") {
    filtered = filtered.filter((m) => m.status === query.status);
  }
  if (query.q) {
    const q = query.q.toLowerCase();
    filtered = filtered.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q) ||
        m.organization.toLowerCase().includes(q),
    );
  }
  filtered.sort((a, b) => b.lastVerified.getTime() - a.lastVerified.getTime());
  res.json(ListWorkforceResponse.parse(filtered));
});

router.post("/workforce/recalculate-stress", async (_req, res): Promise<void> => {
  await initializePramaanxData();

  for (let i = 0; i < inMemoryWorkforce.length; i++) {
    const worker = inMemoryWorkforce[i];
    const { stressScore, stressLevel } = calculateStressScore({
      shiftHours: worker.shiftHours || 8,
      overtimeHours: worker.overtimeHours || 0,
      workloadTasks: worker.workloadTasks || 3,
      restBreakIndex: worker.restBreakIndex || 4,
    });
    inMemoryWorkforce[i] = {
      ...worker,
      stressScore,
      stressLevel,
    };
  }

  try {
    const allWorkers = await db.select().from(pramaanxWorkforceTable);
    const updatedWorkers = [];
    for (const worker of allWorkers) {
      const { stressScore, stressLevel } = calculateStressScore({
        shiftHours: worker.shiftHours || 8,
        overtimeHours: worker.overtimeHours || 0,
        workloadTasks: worker.workloadTasks || 3,
        restBreakIndex: worker.restBreakIndex || 4,
      });

      const [updated] = await db
        .update(pramaanxWorkforceTable)
        .set({ stressScore, stressLevel })
        .where(eq(pramaanxWorkforceTable.id, worker.id))
        .returning();
      updatedWorkers.push(updated);
    }
    if (updatedWorkers.length) {
      res.json({
        message: "Workforce stress recalculation complete",
        count: updatedWorkers.length,
        workers: ListWorkforceResponse.parse(updatedWorkers),
      });
      return;
    }
  } catch (_err) {
    // In-memory demo fallback
  }

  res.json({
    message: "Workforce stress recalculation complete",
    count: inMemoryWorkforce.length,
    workers: ListWorkforceResponse.parse(inMemoryWorkforce),
  });
});

router.patch("/workforce/:id/stress", async (req, res): Promise<void> => {
  await initializePramaanxData();
  const { id } = req.params;
  const { shiftHours, overtimeHours, workloadTasks, restBreakIndex } = req.body;

  const memIdx = inMemoryWorkforce.findIndex((w) => w.id === id);
  if (memIdx === -1) {
    res.status(404).json({ error: "Workforce member not found" });
    return;
  }

  const existing = inMemoryWorkforce[memIdx];
  const newShift = shiftHours !== undefined ? Number(shiftHours) : existing.shiftHours;
  const newOT = overtimeHours !== undefined ? Number(overtimeHours) : existing.overtimeHours;
  const newWorkload = workloadTasks !== undefined ? Number(workloadTasks) : existing.workloadTasks;
  const newBreak = restBreakIndex !== undefined ? Number(restBreakIndex) : existing.restBreakIndex;

  const { stressScore, stressLevel } = calculateStressScore({
    shiftHours: newShift,
    overtimeHours: newOT,
    workloadTasks: newWorkload,
    restBreakIndex: newBreak,
  });

  let updatedWorker: PramaanxWorkforce = {
    ...existing,
    shiftHours: newShift,
    overtimeHours: newOT,
    workloadTasks: newWorkload,
    restBreakIndex: newBreak,
    stressScore,
    stressLevel,
  };
  inMemoryWorkforce[memIdx] = updatedWorker;

  try {
    const [dbUpdated] = await db
      .update(pramaanxWorkforceTable)
      .set({
        shiftHours: newShift,
        overtimeHours: newOT,
        workloadTasks: newWorkload,
        restBreakIndex: newBreak,
        stressScore,
        stressLevel,
      })
      .where(eq(pramaanxWorkforceTable.id, id))
      .returning();
    if (dbUpdated) updatedWorker = dbUpdated;
  } catch (_err) {
    // In-memory demo fallback
  }

  res.json(updatedWorker);
});

router.post("/workforce/invite", async (req, res): Promise<void> => {
  await initializePramaanxData();
  const { name, email, department = "Operations", role = "Field Specialist", manager = "Operations Lead" } = req.body || {};

  if (!email || !name) {
    res.status(400).json({ error: "Name and email are required" });
    return;
  }

  const inviteToken = `inv-${randomUUID()}`;
  const inviteUrl = `/onboarding?invite=${inviteToken}&name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&role=${encodeURIComponent(role)}&dept=${encodeURIComponent(department)}`;

  const activityItem: PramaanxActivity = {
    id: `activity-${randomUUID()}`,
    title: "Employee invitation sent",
    description: `Invite generated for ${name} (${email}) as ${role} [Dept: ${department}]`,
    type: "workforce",
    actor: "HR / Operations Lead",
    createdAt: new Date(),
  };
  inMemoryActivity.unshift(activityItem);

  try {
    await db.insert(pramaanxActivityTable).values(activityItem);
  } catch (_err) {
    // In-memory fallback
  }

  res.status(201).json({
    success: true,
    inviteToken,
    inviteUrl,
    name,
    email,
    department,
    role,
    manager,
    status: "invited",
    createdAt: activityItem.createdAt,
  });
});

router.post("/workforce/onboard", async (req, res): Promise<void> => {
  await initializePramaanxData();
  const {
    name,
    role,
    organization = "Apex Logistics",
    department = "Operations",
    manager = "Operations Lead",
    assignedAssets = [],
    documents = [],
  } = req.body || {};

  if (!name || !role) {
    res.status(400).json({ error: "Name and role are required" });
    return;
  }

  const workerId = `worker-${randomUUID().slice(0, 8)}`;
  const now = new Date();

  const newWorker: PramaanxWorkforce = {
    id: workerId,
    name,
    role,
    organization,
    status: "active",
    trustScore: 94,
    credentials: Math.max(1, documents.length),
    lastVerified: now,
    shiftHours: 8,
    overtimeHours: 0,
    workloadTasks: 3,
    restBreakIndex: 4,
    stressScore: 28,
    stressLevel: "Optimal",
  };

  inMemoryWorkforce.unshift(newWorker);

  // Add documents if provided
  const createdDocs: PramaanxDocument[] = [];
  if (Array.isArray(documents)) {
    for (const doc of documents) {
      const docRecord: PramaanxDocument = {
        id: `doc-${randomUUID().slice(0, 8)}`,
        name: doc.name || `${doc.type || "Identity"} Proof - ${name}`,
        type: doc.type || "Identity",
        subject: name,
        issuer: doc.issuer || "Verified Authority",
        status: doc.status || "verified",
        trustScore: doc.status === "verified" ? 96 : doc.status === "review" ? 72 : 35,
        submittedAt: now,
        updatedAt: now,
      };
      inMemoryDocuments.unshift(docRecord);
      createdDocs.push(docRecord);

      if (docRecord.status === "verified") {
        inMemoryDecisions.unshift({
          id: `decision-${randomUUID()}`,
          documentId: docRecord.id,
          decision: "verified",
          trustScore: docRecord.trustScore,
          checkedAt: now,
        });
      }
    }
  }

  // Add assigned assets if provided
  if (Array.isArray(assignedAssets) && assignedAssets.length > 0) {
    for (const assetName of assignedAssets) {
      inMemoryAssets.unshift({
        id: `asset-${randomUUID().slice(0, 8)}`,
        name: assetName,
        category: assetName.toLowerCase().includes("laptop") ? "IT Hardware" : assetName.toLowerCase().includes("mobile") ? "Telephony" : assetName.toLowerCase().includes("vehicle") ? "Fleet" : "Equipment",
        location: `${organization} Hub (${name})`,
        custodyStatus: "secure",
        trustScore: 98,
        lastSeen: now,
      });
    }
  }

  const activityItem: PramaanxActivity = {
    id: `activity-${randomUUID()}`,
    title: "Personnel onboarded",
    description: `${name} onboarded as ${role} [${department}]. Assigned ${assignedAssets.length} asset(s), ${createdDocs.length} credentials verified.`,
    type: "workforce",
    actor: manager || "Operations Lead",
    createdAt: now,
  };
  inMemoryActivity.unshift(activityItem);

  try {
    await db.transaction(async (tx) => {
      await tx.insert(pramaanxWorkforceTable).values(newWorker);
      for (const d of createdDocs) {
        await tx.insert(pramaanxDocumentsTable).values(d);
      }
      await tx.insert(pramaanxActivityTable).values(activityItem);
    });
  } catch (_err) {
    // In-memory fallback
  }

  res.status(201).json({
    success: true,
    member: newWorker,
    assignedAssets,
    documents: createdDocs,
  });
});

router.get("/assets", async (_req, res): Promise<void> => {
  await initializePramaanxData();
  try {
    const result = await db
      .select()
      .from(pramaanxAssetsTable)
      .orderBy(desc(pramaanxAssetsTable.lastSeen));
    if (result.length > 0) {
      res.json(ListAssetsResponse.parse(result));
      return;
    }
  } catch (_err) {
    // In-memory demo fallback
  }
  res.json(ListAssetsResponse.parse(inMemoryAssets));
});

router.get("/activity", async (req, res): Promise<void> => {
  await initializePramaanxData();
  const query = ListActivityQueryParams.parse(req.query);
  try {
    const result = await db
      .select()
      .from(pramaanxActivityTable)
      .orderBy(desc(pramaanxActivityTable.createdAt))
      .limit(query.limit);
    if (result.length > 0) {
      res.json(ListActivityResponse.parse(result));
      return;
    }
  } catch (_err) {
    // In-memory demo fallback
  }
  const items = [...inMemoryActivity]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, query.limit);
  res.json(ListActivityResponse.parse(items));
});

export default router;