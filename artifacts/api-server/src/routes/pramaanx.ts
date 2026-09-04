import { Router, type IRouter } from "express";
import {
  GetDashboardSummaryResponse,
  GetDocumentParams,
  GetDocumentResponse,
  ListActivityQueryParams,
  ListActivityResponse,
  ListDocumentsQueryParams,
  ListDocumentsResponse,
  ListWorkforceQueryParams,
  ListWorkforceResponse,
  UploadDocumentBody,
  UploadDocumentResponse,
  VerifyDocumentParams,
  VerifyDocumentResponse,
} from "@workspace/api-zod";

type DocumentRecord = {
  id: string;
  name: string;
  type: string;
  subject: string;
  issuer: string;
  status: string;
  trustScore: number;
  submittedAt: string;
  updatedAt: string;
};

const documents: DocumentRecord[] = [
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
];

const workforce = [
  {
    id: "worker-01",
    name: "Ananya Sharma",
    role: "Site Operations Lead",
    organization: "Apex Logistics",
    status: "active",
    trustScore: 98,
    credentials: 8,
    lastVerified: "2026-09-04T06:34:28.000Z",
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
  },
];

const assets = [
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
];

type ActivityRecord = {
  id: string;
  title: string;
  description: string;
  type: string;
  actor: string;
  createdAt: string;
};

const activity: ActivityRecord[] = [
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
];

function getDocumentDetail(document: DocumentRecord) {
  return {
    ...document,
    fields: [
      { label: "Full name", value: document.subject, confidence: 0.99 },
      { label: "Document type", value: document.type, confidence: 0.98 },
      { label: "Issuing authority", value: document.issuer, confidence: 0.97 },
      { label: "Verification reference", value: `PX-${document.id.slice(-4)}-2026`, confidence: 0.95 },
    ],
    signals:
      document.status === "flagged"
        ? [
            { label: "Metadata consistency", value: "Review required", severity: "high" },
            { label: "Issuer match", value: "Partial match", severity: "medium" },
            { label: "Pixel forensics", value: "Copy-move pattern detected", severity: "high" },
          ]
        : [
            { label: "Metadata consistency", value: "Passed", severity: "low" },
            { label: "Issuer match", value: "Verified", severity: "low" },
            { label: "Pixel forensics", value: "No tampering detected", severity: "low" },
          ],
    timeline: activity.filter((item) => item.type === "verification" || item.type === "risk").slice(0, 3),
  };
}

const router: IRouter = Router();

router.get("/dashboard/summary", (_req, res) => {
  const data = GetDashboardSummaryResponse.parse({
    verification: { total: 248, verified: 218, pending: 18, flagged: 12, averageTimeSeconds: 24.8 },
    workforce: { total: 184, active: 171, expiringSoon: 9, complianceRate: 93.5 },
    assets: { total: 64, inTransit: 18, secure: 43, attention: 3 },
    risk: { trustScore: 91.8, change: 2.4, openAlerts: 7, severity: "low" },
    processingTrend: [
      { label: "Mon", verified: 31, flagged: 3 },
      { label: "Tue", verified: 38, flagged: 4 },
      { label: "Wed", verified: 35, flagged: 2 },
      { label: "Thu", verified: 48, flagged: 5 },
      { label: "Fri", verified: 56, flagged: 3 },
      { label: "Sat", verified: 42, flagged: 2 },
      { label: "Sun", verified: 49, flagged: 4 },
    ],
  });
  res.json(data);
});

router.get("/documents", (req, res) => {
  const query = ListDocumentsQueryParams.parse(req.query);
  const search = query.q?.toLowerCase();
  const result = documents.filter((document) => {
    const matchesStatus = !query.status || query.status === "all" || document.status === query.status;
    const matchesSearch =
      !search ||
      [document.name, document.subject, document.issuer, document.type].some((value) =>
        value.toLowerCase().includes(search),
      );
    return matchesStatus && matchesSearch;
  });
  res.json(ListDocumentsResponse.parse(result));
});

router.get("/documents/:id", (req, res) => {
  const { id } = GetDocumentParams.parse(req.params);
  const document = documents.find((item) => item.id === id);
  if (!document) {
    res.status(404).json({ error: "Document not found" });
    return;
  }
  res.json(GetDocumentResponse.parse(getDocumentDetail(document)));
});

router.post("/documents/:id/verify", (req, res) => {
  const { id } = VerifyDocumentParams.parse(req.params);
  const document = documents.find((item) => item.id === id);
  if (!document) {
    res.status(404).json({ error: "Document not found" });
    return;
  }
  document.status = document.status === "flagged" ? "review" : "verified";
  document.trustScore = document.status === "verified" ? Math.max(document.trustScore, 91) : document.trustScore;
  document.updatedAt = new Date().toISOString();
  activity.unshift({
    id: `activity-${Date.now()}`,
    title: document.status === "verified" ? "Document verified" : "Document escalated",
    description: `${document.name} was checked by an operations reviewer`,
    type: "verification",
    actor: "Operations reviewer",
    createdAt: document.updatedAt,
  });
  res.json(
    VerifyDocumentResponse.parse({
      document,
      decision: document.status === "verified" ? "verified" : "review",
      trustScore: document.trustScore,
      checkedAt: document.updatedAt,
    }),
  );
});

router.post("/documents/upload", (req, res) => {
  const input = UploadDocumentBody.parse(req.body);
  const timestamp = new Date().toISOString();
  const document = {
    id: `doc-${1050 + documents.length}`,
    ...input,
    status: "pending",
    trustScore: 0,
    submittedAt: timestamp,
    updatedAt: timestamp,
  };
  documents.unshift(document);
  activity.unshift({
    id: `activity-${Date.now()}`,
    title: "Document queued",
    description: `${input.name} entered the verification pipeline`,
    type: "verification",
    actor: "Operations reviewer",
    createdAt: timestamp,
  });
  res.status(201).json(UploadDocumentResponse.parse(document));
});

router.get("/workforce", (req, res) => {
  const query = ListWorkforceQueryParams.parse(req.query);
  const search = query.q?.toLowerCase();
  const result = workforce.filter((member) => {
    const matchesStatus = !query.status || query.status === "all" || member.status === query.status;
    const matchesSearch =
      !search ||
      [member.name, member.role, member.organization].some((value) => value.toLowerCase().includes(search));
    return matchesStatus && matchesSearch;
  });
  res.json(ListWorkforceResponse.parse(result));
});

router.get("/assets", (_req, res) => {
  res.json(assets);
});

router.get("/activity", (req, res) => {
  const query = ListActivityQueryParams.parse(req.query);
  res.json(ListActivityResponse.parse(activity.slice(0, query.limit)));
});

export default router;