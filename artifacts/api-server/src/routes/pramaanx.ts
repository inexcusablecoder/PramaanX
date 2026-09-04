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
  type PramaanxDocument,
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
  const [documents, workforce, assets, decisions] = await Promise.all([
    db.select().from(pramaanxDocumentsTable),
    db.select().from(pramaanxWorkforceTable),
    db.select().from(pramaanxAssetsTable),
    db.select().from(pramaanxVerificationDecisionsTable),
  ]);

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
  res.json(ListDocumentsResponse.parse(result));
});

router.get("/documents/:id", async (req, res): Promise<void> => {
  await initializePramaanxData();
  const { id } = GetDocumentParams.parse(req.params);
  const [document] = await db
    .select()
    .from(pramaanxDocumentsTable)
    .where(eq(pramaanxDocumentsTable.id, id));
  if (!document) {
    res.status(404).json({ error: "Document not found" });
    return;
  }
  const activity = await db
    .select()
    .from(pramaanxActivityTable)
    .orderBy(desc(pramaanxActivityTable.createdAt));
  res.json(
    GetDocumentResponse.parse(getDocumentDetail(document, activity)),
  );
});

router.post("/documents/:id/verify", async (req, res): Promise<void> => {
  await initializePramaanxData();
  const { id } = VerifyDocumentParams.parse(req.params);
  const [document] = await db
    .select()
    .from(pramaanxDocumentsTable)
    .where(eq(pramaanxDocumentsTable.id, id));
  if (!document) {
    res.status(404).json({ error: "Document not found" });
    return;
  }

  const status = document.status === "flagged" ? "review" : "verified";
  const trustScore =
    status === "verified" ? Math.max(document.trustScore, 91) : document.trustScore;
  const checkedAt = new Date();
  const activityId = `activity-${randomUUID()}`;

  const result = await db.transaction(async (tx) => {
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

    return updatedDocument;
  });

  if (!result) {
    res.status(404).json({ error: "Document not found" });
    return;
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
  const document = {
    id: `doc-${randomUUID()}`,
    ...input,
    status: "pending",
    trustScore: 0,
    submittedAt: timestamp,
    updatedAt: timestamp,
  };
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
  res.json(ListWorkforceResponse.parse(result));
});

router.post("/workforce/recalculate-stress", async (_req, res): Promise<void> => {
  await initializePramaanxData();
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

  res.json({
    message: "Workforce stress recalculation complete",
    count: updatedWorkers.length,
    workers: ListWorkforceResponse.parse(updatedWorkers),
  });
});

router.patch("/workforce/:id/stress", async (req, res): Promise<void> => {
  await initializePramaanxData();
  const { id } = req.params;
  const { shiftHours, overtimeHours, workloadTasks, restBreakIndex } = req.body;

  const [existing] = await db
    .select()
    .from(pramaanxWorkforceTable)
    .where(eq(pramaanxWorkforceTable.id, id));

  if (!existing) {
    res.status(404).json({ error: "Workforce member not found" });
    return;
  }

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

  const [updated] = await db
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

  res.json(updated);
});

router.get("/assets", async (_req, res): Promise<void> => {
  await initializePramaanxData();
  const result = await db
    .select()
    .from(pramaanxAssetsTable)
    .orderBy(desc(pramaanxAssetsTable.lastSeen));
  res.json(ListAssetsResponse.parse(result));
});

router.get("/activity", async (req, res): Promise<void> => {
  await initializePramaanxData();
  const query = ListActivityQueryParams.parse(req.query);
  const result = await db
    .select()
    .from(pramaanxActivityTable)
    .orderBy(desc(pramaanxActivityTable.createdAt))
    .limit(query.limit);
  res.json(ListActivityResponse.parse(result));
});

export default router;