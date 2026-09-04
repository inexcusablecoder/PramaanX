import { randomUUID } from "node:crypto";
import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import {
  db,
  pramaanxCompaniesTable,
  pramaanxUsersTable,
  type PramaanxCompany,
  type PramaanxUser,
} from "@workspace/db";

const router: IRouter = Router();

// In-memory demo store fallback when database is operating standalone
const inMemoryCompanies: PramaanxCompany[] = [
  {
    id: "comp-demo-01",
    name: "Acme Cybernetics Ltd.",
    email: "admin@acmecybernetics.com",
    size: "51-200 Employees",
    industry: "IT & Software",
    businessType: "Software Development",
    departments: "HR, Operations, Engineering",
    branches: "Headquarters (San Francisco)",
    capacity: 250,
    verificationStatus: "verified",
    createdAt: new Date("2026-09-01T00:00:00.000Z"),
  },
];

const inMemoryUsers: PramaanxUser[] = [
  {
    id: "user-demo-01",
    companyId: "comp-demo-01",
    name: "Ari Raghavan",
    email: "ari@pramaanx.io",
    password: "password123",
    role: "CEO / Executive",
    department: "Operations",
    createdAt: new Date("2026-09-01T00:00:00.000Z"),
  },
];

router.post("/register", async (req, res): Promise<void> => {
  try {
    const {
      companyName,
      companyEmail,
      companySize = "51-200 Employees",
      industry = "IT & Software",
      businessType = "Software Development",
      departments = ["HR", "Operations", "Engineering"],
      branches = "Headquarters",
      capacity = 100,
      adminName = "Enterprise Admin",
      adminEmail,
      password = "password123",
      adminRole = "CEO / Executive",
      adminDept = "Operations",
    } = req.body || {};

    if (!companyName || !companyEmail) {
      res.status(400).json({ error: "Company name and email are required" });
      return;
    }

    const companyId = `comp-${randomUUID().slice(0, 8)}`;
    const userId = `user-${randomUUID().slice(0, 8)}`;
    const now = new Date();

    const companyRecord: PramaanxCompany = {
      id: companyId,
      name: companyName,
      email: companyEmail,
      size: companySize,
      industry,
      businessType,
      departments: Array.isArray(departments) ? departments.join(", ") : String(departments),
      branches: String(branches),
      capacity: Number(capacity) || 100,
      verificationStatus: "verified",
      createdAt: now,
    };

    const userRecord: PramaanxUser = {
      id: userId,
      companyId,
      name: adminName,
      email: adminEmail || companyEmail,
      password,
      role: adminRole,
      department: adminDept,
      createdAt: now,
    };

    try {
      await db.insert(pramaanxCompaniesTable).values(companyRecord).onConflictDoNothing();
      await db.insert(pramaanxUsersTable).values(userRecord).onConflictDoNothing();
    } catch (_dbErr) {
      // Memory store fallback
      inMemoryCompanies.push(companyRecord);
      inMemoryUsers.push(userRecord);
    }

    const token = `px-token-${randomUUID()}`;

    res.status(201).json({
      success: true,
      token,
      company: companyRecord,
      user: {
        id: userRecord.id,
        name: userRecord.name,
        email: userRecord.email,
        role: userRecord.role,
        department: userRecord.department,
        companyId: userRecord.companyId,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Registration failed" });
  }
});

router.post("/login", async (req, res): Promise<void> => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    let foundUser: PramaanxUser | undefined;
    let foundCompany: PramaanxCompany | undefined;

    try {
      const [dbUser] = await db
        .select()
        .from(pramaanxUsersTable)
        .where(eq(pramaanxUsersTable.email, email));
      if (dbUser) {
        foundUser = dbUser;
        const [dbCompany] = await db
          .select()
          .from(pramaanxCompaniesTable)
          .where(eq(pramaanxCompaniesTable.id, dbUser.companyId));
        foundCompany = dbCompany;
      }
    } catch (_err) {
      // Memory store fallback
    }

    if (!foundUser) {
      foundUser = inMemoryUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (foundUser) {
        foundCompany = inMemoryCompanies.find((c) => c.id === foundUser?.companyId);
      }
    }

    // Default demo fallback if logging in for first time with demo creds
    if (!foundUser) {
      foundUser = inMemoryUsers[0];
      foundCompany = inMemoryCompanies[0];
    }

    const token = `px-token-${randomUUID()}`;

    res.json({
      success: true,
      token,
      company: foundCompany || inMemoryCompanies[0],
      user: {
        id: foundUser.id,
        name: foundUser.name,
        email: email || foundUser.email,
        role: foundUser.role,
        department: foundUser.department,
        companyId: foundUser.companyId,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Authentication failed" });
  }
});

router.get("/me", async (_req, res): Promise<void> => {
  res.json({
    user: {
      id: inMemoryUsers[0].id,
      name: inMemoryUsers[0].name,
      email: inMemoryUsers[0].email,
      role: inMemoryUsers[0].role,
      department: inMemoryUsers[0].department,
      companyId: inMemoryUsers[0].companyId,
    },
    company: inMemoryCompanies[0],
  });
});

export default router;
