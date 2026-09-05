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
  // 🏗️ Construction & Field Operations
  {
    id: "asset-const-01",
    name: "CAT-320 Excavator (Unit #12)",
    category: "Heavy Earthmoving",
    fieldSector: "construction",
    location: "Bandra-Kurla Complex Site B, Mumbai",
    latitude: 19.0657,
    longitude: 72.8688,
    altitudeMeters: 28.5,
    speedKmh: 0,
    headingDegrees: 45,
    batteryLevel: 92,
    custodyStatus: "secure",
    geofenceZone: "BKC Infrastructure Zone 3",
    geofenceStatus: "inside",
    geofenceRadiusMeters: 1500,
    assignedPersonnel: "Rohan Mehta",
    assignedPersonnelRole: "Electrical Contractor",
    trustScore: 94,
    lastSeen: "2026-09-04T06:40:00.000Z",
    telemetryBreadcrumbs: JSON.stringify([
      { lat: 19.0652, lng: 72.8681, time: "2026-09-04T06:10:00.000Z", speed: 4 },
      { lat: 19.0655, lng: 72.8684, time: "2026-09-04T06:25:00.000Z", speed: 2 },
      { lat: 19.0657, lng: 72.8688, time: "2026-09-04T06:40:00.000Z", speed: 0 },
    ]),
  },
  {
    id: "asset-const-02",
    name: "Concrete Transit Mixer MX-09",
    category: "Transit Mixing Vehicle",
    fieldSector: "construction",
    location: "Mumbai-Pune Expressway Km 48",
    latitude: 18.7523,
    longitude: 73.4112,
    altitudeMeters: 612.0,
    speedKmh: 54,
    headingDegrees: 310,
    batteryLevel: 85,
    custodyStatus: "in-transit",
    geofenceZone: "Expressway Construction Corridor",
    geofenceStatus: "inside",
    geofenceRadiusMeters: 5000,
    assignedPersonnel: "Rohan Mehta",
    assignedPersonnelRole: "Site Electrical Contractor",
    trustScore: 89,
    lastSeen: "2026-09-04T06:38:00.000Z",
    telemetryBreadcrumbs: JSON.stringify([
      { lat: 18.7310, lng: 73.4420, time: "2026-09-04T06:00:00.000Z", speed: 60 },
      { lat: 18.7420, lng: 73.4280, time: "2026-09-04T06:20:00.000Z", speed: 58 },
      { lat: 18.7523, lng: 73.4112, time: "2026-09-04T06:38:00.000Z", speed: 54 },
    ]),
  },
  {
    id: "asset-const-03",
    name: "Heavy Generator GN-018",
    category: "Auxiliary Power",
    fieldSector: "construction",
    location: "MIDC Andheri Industrial Site 04",
    latitude: 19.1136,
    longitude: 72.8697,
    altitudeMeters: 45.0,
    speedKmh: 0,
    headingDegrees: 0,
    batteryLevel: 64,
    custodyStatus: "attention",
    geofenceZone: "Andheri East Compound Perimeter",
    geofenceStatus: "warning",
    geofenceRadiusMeters: 500,
    assignedPersonnel: "Vikram Malhotra",
    assignedPersonnelRole: "Field Operations Lead",
    trustScore: 63,
    lastSeen: "2026-09-04T05:48:00.000Z",
    telemetryBreadcrumbs: JSON.stringify([
      { lat: 19.1130, lng: 72.8690, time: "2026-09-04T04:30:00.000Z", speed: 0 },
      { lat: 19.1136, lng: 72.8697, time: "2026-09-04T05:48:00.000Z", speed: 0 },
    ]),
  },

  // 🚚 Logistics & Fleet Operations
  {
    id: "asset-log-01",
    name: "Refrigerated Container AX-3492",
    category: "Cold-Chain Logistics",
    fieldSector: "logistics",
    location: "Pune Distribution Hub - Gate 4",
    latitude: 18.5204,
    longitude: 73.8567,
    altitudeMeters: 560.2,
    speedKmh: 42,
    headingDegrees: 135,
    batteryLevel: 96,
    custodyStatus: "in-transit",
    geofenceZone: "Chakan Industrial Logistics Corridor",
    geofenceStatus: "inside",
    geofenceRadiusMeters: 4000,
    assignedPersonnel: "Ananya Sharma",
    assignedPersonnelRole: "Site Operations Lead",
    trustScore: 98,
    lastSeen: "2026-09-04T06:39:00.000Z",
    telemetryBreadcrumbs: JSON.stringify([
      { lat: 18.5400, lng: 73.8300, time: "2026-09-04T06:00:00.000Z", speed: 45 },
      { lat: 18.5300, lng: 73.8450, time: "2026-09-04T06:20:00.000Z", speed: 40 },
      { lat: 18.5204, lng: 73.8567, time: "2026-09-04T06:39:00.000Z", speed: 42 },
    ]),
  },
  {
    id: "asset-log-02",
    name: "Fleet Heavy Trailer TR-441",
    category: "Long-Haul Trailer",
    fieldSector: "logistics",
    location: "NH-48 Checkpoint Talegaon",
    latitude: 18.7301,
    longitude: 73.6811,
    altitudeMeters: 590.0,
    speedKmh: 68,
    headingDegrees: 120,
    batteryLevel: 88,
    custodyStatus: "in-transit",
    geofenceZone: "NH-48 Freight Express Zone",
    geofenceStatus: "inside",
    geofenceRadiusMeters: 8000,
    assignedPersonnel: "Vikram Singh",
    assignedPersonnelRole: "Fleet Operator",
    trustScore: 88,
    lastSeen: "2026-09-04T06:31:00.000Z",
    telemetryBreadcrumbs: JSON.stringify([
      { lat: 18.7600, lng: 73.6400, time: "2026-09-04T06:05:00.000Z", speed: 70 },
      { lat: 18.7450, lng: 73.6600, time: "2026-09-04T06:18:00.000Z", speed: 65 },
      { lat: 18.7301, lng: 73.6811, time: "2026-09-04T06:31:00.000Z", speed: 68 },
    ]),
  },
  {
    id: "asset-log-03",
    name: "Automated Forklift FL-208",
    category: "Warehouse Robotics",
    fieldSector: "logistics",
    location: "Nashik Central Fulfillment Center",
    latitude: 19.9975,
    longitude: 73.7898,
    altitudeMeters: 600.0,
    speedKmh: 12,
    headingDegrees: 270,
    batteryLevel: 91,
    custodyStatus: "secure",
    geofenceZone: "Nashik Logistics Zone A",
    geofenceStatus: "inside",
    geofenceRadiusMeters: 800,
    assignedPersonnel: "Priya Nair",
    assignedPersonnelRole: "Warehouse Specialist",
    trustScore: 92,
    lastSeen: "2026-09-04T06:37:00.000Z",
    telemetryBreadcrumbs: JSON.stringify([
      { lat: 19.9970, lng: 73.7905, time: "2026-09-04T06:15:00.000Z", speed: 10 },
      { lat: 19.9975, lng: 73.7898, time: "2026-09-04T06:37:00.000Z", speed: 12 },
    ]),
  },

  // 🏥 Healthcare & Medical Operations
  {
    id: "asset-med-01",
    name: "Mobile Advanced ICU Ambulance MED-01",
    category: "Critical Care Transit",
    fieldSector: "medical",
    location: "AIIMS Trauma Corridor, New Delhi",
    latitude: 28.5672,
    longitude: 77.2100,
    altitudeMeters: 215.0,
    speedKmh: 62,
    headingDegrees: 340,
    batteryLevel: 95,
    custodyStatus: "in-transit",
    geofenceZone: "AIIMS Emergency Green Corridor",
    geofenceStatus: "inside",
    geofenceRadiusMeters: 10000,
    assignedPersonnel: "Dr. Ananya Roy",
    assignedPersonnelRole: "Healthcare & Medical Director",
    trustScore: 99,
    lastSeen: "2026-09-04T06:41:00.000Z",
    telemetryBreadcrumbs: JSON.stringify([
      { lat: 28.5300, lng: 77.2200, time: "2026-09-04T06:15:00.000Z", speed: 65 },
      { lat: 28.5500, lng: 28.5500, time: "2026-09-04T06:28:00.000Z", speed: 60 },
      { lat: 28.5672, lng: 77.2100, time: "2026-09-04T06:41:00.000Z", speed: 62 },
    ]),
  },
  {
    id: "asset-med-02",
    name: "Cryo Vaccine Carrier VAX-99",
    category: "Temperature-Controlled Transit",
    fieldSector: "medical",
    location: "Serum Institute Campus Gate 2, Pune",
    latitude: 18.5089,
    longitude: 73.9260,
    altitudeMeters: 570.0,
    speedKmh: 35,
    headingDegrees: 185,
    batteryLevel: 99,
    custodyStatus: "in-transit",
    geofenceZone: "State Bio-Safety Logistics Zone",
    geofenceStatus: "inside",
    geofenceRadiusMeters: 3500,
    assignedPersonnel: "Dr. Ananya Roy",
    assignedPersonnelRole: "Healthcare & Medical Director",
    trustScore: 97,
    lastSeen: "2026-09-04T06:36:00.000Z",
    telemetryBreadcrumbs: JSON.stringify([
      { lat: 18.5200, lng: 73.9200, time: "2026-09-04T06:10:00.000Z", speed: 38 },
      { lat: 18.5089, lng: 73.9260, time: "2026-09-04T06:36:00.000Z", speed: 35 },
    ]),
  },
  {
    id: "asset-med-03",
    name: "Portable Ultrasound & Diagnostic Kit US-33",
    category: "Diagnostic Equipment",
    fieldSector: "medical",
    location: "Apollo Jubilee Hills Mobile Clinic, Hyderabad",
    latitude: 17.4325,
    longitude: 78.4071,
    altitudeMeters: 540.0,
    speedKmh: 0,
    headingDegrees: 0,
    batteryLevel: 82,
    custodyStatus: "secure",
    geofenceZone: "Hyderabad Mobile Clinic Zone",
    geofenceStatus: "inside",
    geofenceRadiusMeters: 1200,
    assignedPersonnel: "Dr. Ananya Roy",
    assignedPersonnelRole: "Medical Director",
    trustScore: 95,
    lastSeen: "2026-09-04T06:22:00.000Z",
    telemetryBreadcrumbs: JSON.stringify([
      { lat: 17.4320, lng: 78.4065, time: "2026-09-04T05:30:00.000Z", speed: 0 },
      { lat: 17.4325, lng: 78.4071, time: "2026-09-04T06:22:00.000Z", speed: 0 },
    ]),
  },

  // 💻 IT & Digital Infrastructure
  {
    id: "asset-it-01",
    name: "Mobile Cryptographic HSM Node K-01",
    category: "Cryptographic Hardware",
    fieldSector: "it",
    location: "Electronic City Phase 1 Secure Vault, Bengaluru",
    latitude: 12.8452,
    longitude: 77.6602,
    altitudeMeters: 920.0,
    speedKmh: 0,
    headingDegrees: 0,
    batteryLevel: 100,
    custodyStatus: "secure",
    geofenceZone: "Tech Park High Security Perimeter",
    geofenceStatus: "inside",
    geofenceRadiusMeters: 500,
    assignedPersonnel: "Aarav Patel",
    assignedPersonnelRole: "DevOps Engineer",
    trustScore: 99,
    lastSeen: "2026-09-04T06:42:00.000Z",
    telemetryBreadcrumbs: JSON.stringify([
      { lat: 12.8450, lng: 77.6600, time: "2026-09-04T05:00:00.000Z", speed: 0 },
      { lat: 12.8452, lng: 77.6602, time: "2026-09-04T06:42:00.000Z", speed: 0 },
    ]),
  },
  {
    id: "asset-it-02",
    name: "Biometric Field Kiosk Core-X",
    category: "Identity Terminal",
    fieldSector: "it",
    location: "Whitefield Operations Center, Bengaluru",
    latitude: 12.9698,
    longitude: 77.7500,
    altitudeMeters: 890.0,
    speedKmh: 0,
    headingDegrees: 90,
    batteryLevel: 89,
    custodyStatus: "secure",
    geofenceZone: "Whitefield IT Campus Perimeter",
    geofenceStatus: "inside",
    geofenceRadiusMeters: 600,
    assignedPersonnel: "Rahul Verma",
    assignedPersonnelRole: "IT & Software Sector Lead",
    trustScore: 96,
    lastSeen: "2026-09-04T06:33:00.000Z",
    telemetryBreadcrumbs: JSON.stringify([
      { lat: 12.9695, lng: 77.7495, time: "2026-09-04T05:15:00.000Z", speed: 0 },
      { lat: 12.9698, lng: 77.7500, time: "2026-09-04T06:33:00.000Z", speed: 0 },
    ]),
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
      const assignedSector = department?.toLowerCase().includes("it") || department?.toLowerCase().includes("engineer")
        ? "it"
        : department?.toLowerCase().includes("field") || department?.toLowerCase().includes("construct")
        ? "construction"
        : department?.toLowerCase().includes("medic")
        ? "medical"
        : "logistics";

      inMemoryAssets.unshift({
        id: `asset-${randomUUID().slice(0, 8)}`,
        name: assetName,
        category: assetName.toLowerCase().includes("laptop") ? "IT Hardware" : assetName.toLowerCase().includes("mobile") ? "Telephony" : assetName.toLowerCase().includes("vehicle") ? "Fleet" : "Equipment",
        fieldSector: assignedSector,
        location: `${organization} Hub (${name})`,
        latitude: 18.5204 + (Math.random() - 0.5) * 0.04,
        longitude: 73.8567 + (Math.random() - 0.5) * 0.04,
        altitudeMeters: 550,
        speedKmh: 0,
        headingDegrees: 0,
        batteryLevel: 98,
        custodyStatus: "secure",
        geofenceZone: `${organization} Safe Zone`,
        geofenceStatus: "inside",
        geofenceRadiusMeters: 1000,
        assignedPersonnel: name,
        assignedPersonnelRole: role,
        telemetryBreadcrumbs: JSON.stringify([
          { lat: 18.5204, lng: 73.8567, time: now.toISOString(), speed: 0 },
        ]),
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

router.get("/assets", async (req, res): Promise<void> => {
  await initializePramaanxData();
  const sector = (req.query.sector as string)?.toLowerCase();
  const status = (req.query.status as string)?.toLowerCase();
  const search = (req.query.search as string)?.toLowerCase();

  let assets: PramaanxAsset[] = [];
  try {
    const result = await db
      .select()
      .from(pramaanxAssetsTable)
      .orderBy(desc(pramaanxAssetsTable.lastSeen));
    if (result.length > 0) {
      assets = result;
    }
  } catch (_err) {
    // In-memory demo fallback
  }

  if (assets.length === 0) {
    assets = inMemoryAssets;
  }

  // Filter by sector
  if (sector && sector !== "all") {
    assets = assets.filter((a) => a.fieldSector.toLowerCase() === sector);
  }

  // Filter by status
  if (status && status !== "all") {
    assets = assets.filter((a) => a.custodyStatus.toLowerCase().includes(status));
  }

  // Filter by search
  if (search) {
    assets = assets.filter(
      (a) =>
        a.name.toLowerCase().includes(search) ||
        a.category.toLowerCase().includes(search) ||
        a.location.toLowerCase().includes(search) ||
        a.assignedPersonnel.toLowerCase().includes(search)
    );
  }

  res.json(ListAssetsResponse.parse(assets));
});

router.get("/assets/:id", async (req, res): Promise<void> => {
  await initializePramaanxData();
  const { id } = req.params;

  let asset: PramaanxAsset | undefined;
  try {
    const [dbAsset] = await db
      .select()
      .from(pramaanxAssetsTable)
      .where(eq(pramaanxAssetsTable.id, id));
    asset = dbAsset;
  } catch {}

  if (!asset) {
    asset = inMemoryAssets.find((a) => a.id === id);
  }

  if (!asset) {
    res.status(404).json({ error: "Asset not found" });
    return;
  }

  res.json(asset);
});

router.post("/assets/:id/ping", async (req, res): Promise<void> => {
  await initializePramaanxData();
  const { id } = req.params;
  const now = new Date();

  const asset = inMemoryAssets.find((a) => a.id === id);
  if (!asset) {
    res.status(404).json({ error: "Asset not found" });
    return;
  }

  // Simulate satellite GPS telemetry update
  const angleRad = (asset.headingDegrees * Math.PI) / 180;
  const deltaKm = (asset.speedKmh > 0 ? asset.speedKmh : 25) * (15 / 3600);
  const deltaLat = (deltaKm / 111) * Math.cos(angleRad) + (Math.random() - 0.5) * 0.001;
  const deltaLng = (deltaKm / (111 * Math.cos((asset.latitude * Math.PI) / 180))) * Math.sin(angleRad) + (Math.random() - 0.5) * 0.001;

  const newLat = Number((asset.latitude + deltaLat).toFixed(5));
  const newLng = Number((asset.longitude + deltaLng).toFixed(5));
  const newSpeed = asset.custodyStatus === "in-transit" ? Math.max(20, Math.min(85, Math.round(asset.speedKmh + (Math.random() * 8 - 4)))) : 0;
  const newBattery = Math.max(15, asset.batteryLevel - (Math.random() > 0.8 ? 1 : 0));

  let crumbs: Array<{ lat: number; lng: number; time: string; speed: number }> = [];
  try {
    crumbs = typeof asset.telemetryBreadcrumbs === "string" ? JSON.parse(asset.telemetryBreadcrumbs) : (asset.telemetryBreadcrumbs || []);
  } catch {
    crumbs = [];
  }
  crumbs.push({ lat: newLat, lng: newLng, time: now.toISOString(), speed: newSpeed });
  if (crumbs.length > 20) crumbs.shift();

  asset.latitude = newLat;
  asset.longitude = newLng;
  asset.speedKmh = newSpeed;
  asset.batteryLevel = newBattery;
  asset.lastSeen = now;
  asset.telemetryBreadcrumbs = JSON.stringify(crumbs);

  try {
    await db
      .update(pramaanxAssetsTable)
      .set({
        latitude: newLat,
        longitude: newLng,
        speedKmh: newSpeed,
        batteryLevel: newBattery,
        lastSeen: now,
        telemetryBreadcrumbs: JSON.stringify(crumbs),
      })
      .where(eq(pramaanxAssetsTable.id, id));
  } catch {}

  res.json({ success: true, asset });
});

router.post("/assets/:id/lockdown", async (req, res): Promise<void> => {
  await initializePramaanxData();
  const { id } = req.params;
  const now = new Date();

  const asset = inMemoryAssets.find((a) => a.id === id);
  if (!asset) {
    res.status(404).json({ error: "Asset not found" });
    return;
  }

  asset.speedKmh = 0;
  asset.custodyStatus = "attention";
  asset.geofenceStatus = "warning";
  asset.lastSeen = now;

  const activityItem: PramaanxActivity = {
    id: `activity-${randomUUID()}`,
    title: "Remote asset lockdown triggered",
    description: `Emergency telemetry lockdown engaged for ${asset.name} (${asset.category}) at [${asset.latitude}, ${asset.longitude}]. Propulsion immobilized.`,
    type: "asset",
    actor: "SHREYASH (Super Admin)",
    createdAt: now,
  };
  inMemoryActivity.unshift(activityItem);

  try {
    await db
      .update(pramaanxAssetsTable)
      .set({
        speedKmh: 0,
        custodyStatus: "attention",
        geofenceStatus: "warning",
        lastSeen: now,
      })
      .where(eq(pramaanxAssetsTable.id, id));
    await db.insert(pramaanxActivityTable).values(activityItem);
  } catch {}

  res.json({ success: true, message: `Emergency lockdown engaged for ${asset.name}.`, asset });
});

router.post("/assets", async (req, res): Promise<void> => {
  await initializePramaanxData();
  const {
    name,
    category,
    fieldSector = "logistics",
    location,
    latitude = 18.5204,
    longitude = 73.8567,
    altitudeMeters = 500,
    speedKmh = 0,
    headingDegrees = 0,
    geofenceZone = "Designated Operational Zone",
    geofenceRadiusMeters = 2000,
    assignedPersonnel = "Operations Lead",
    assignedPersonnelRole = "Field Staff",
  } = req.body || {};

  if (!name || !category || !location) {
    res.status(400).json({ error: "Asset name, category, and location are required." });
    return;
  }

  const now = new Date();
  const newAsset: PramaanxAsset = {
    id: `asset-${randomUUID().slice(0, 8)}`,
    name,
    category,
    fieldSector,
    location,
    latitude: Number(latitude) || 18.5204,
    longitude: Number(longitude) || 73.8567,
    altitudeMeters: Number(altitudeMeters) || 500,
    speedKmh: Number(speedKmh) || 0,
    headingDegrees: Number(headingDegrees) || 0,
    batteryLevel: 100,
    custodyStatus: Number(speedKmh) > 0 ? "in-transit" : "secure",
    geofenceZone,
    geofenceStatus: "inside",
    geofenceRadiusMeters: Number(geofenceRadiusMeters) || 2000,
    assignedPersonnel,
    assignedPersonnelRole,
    telemetryBreadcrumbs: JSON.stringify([
      { lat: Number(latitude) || 18.5204, lng: Number(longitude) || 73.8567, time: now.toISOString(), speed: Number(speedKmh) || 0 },
    ]),
    trustScore: 98,
    lastSeen: now,
  };

  inMemoryAssets.unshift(newAsset);

  const activityItem: PramaanxActivity = {
    id: `activity-${randomUUID()}`,
    title: "New field asset registered",
    description: `${name} [${category} / ${String(fieldSector).toUpperCase()}] registered with GPS telemetry. Assigned to ${assignedPersonnel}.`,
    type: "asset",
    actor: "Fleet Command",
    createdAt: now,
  };
  inMemoryActivity.unshift(activityItem);

  try {
    await db.insert(pramaanxAssetsTable).values(newAsset);
    await db.insert(pramaanxActivityTable).values(activityItem);
  } catch {}

  res.status(201).json({ success: true, asset: newAsset });
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