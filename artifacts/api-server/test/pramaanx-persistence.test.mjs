import assert from "node:assert/strict";
import { once } from "node:events";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const serverEntry = fileURLToPath(
  new URL("../dist/index.mjs", import.meta.url),
);

async function getAvailablePort() {
  const server = createServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  if (!address || typeof address === "string") {
    server.close();
    throw new Error("Could not determine an available test port");
  }
  const port = address.port;
  server.close();
  await once(server, "close");
  return port;
}

function startServer(port) {
  const child = spawn(process.execPath, ["--enable-source-maps", serverEntry], {
    cwd: fileURLToPath(new URL("..", import.meta.url)),
    env: {
      ...process.env,
      NODE_ENV: "test",
      PORT: String(port),
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  let output = "";
  child.stdout.setEncoding("utf8");
  child.stderr.setEncoding("utf8");
  child.stdout.on("data", (chunk) => {
    output += chunk;
  });
  child.stderr.on("data", (chunk) => {
    output += chunk;
  });
  child.startupOutput = () => output;
  return child;
}

async function stopServer(child) {
  if (child.exitCode !== null || child.signalCode !== null) {
    return;
  }

  const exited = once(child, "exit");
  child.kill("SIGTERM");
  await Promise.race([
    exited,
    new Promise((resolve) => setTimeout(resolve, 2_000)),
  ]);

  if (child.exitCode === null && child.signalCode === null) {
    child.kill("SIGKILL");
    await exited;
  }
}

async function waitForServer(child, baseUrl) {
  const deadline = Date.now() + 15_000;
  let lastError;

  while (Date.now() < deadline) {
    if (child.exitCode !== null || child.signalCode !== null) {
      throw new Error(
        `API server exited before becoming healthy:\n${child.startupOutput()}`,
      );
    }

    try {
      const response = await fetch(`${baseUrl}/api/healthz`, {
        signal: AbortSignal.timeout(500),
      });
      if (response.ok) {
        return;
      }
      lastError = new Error(`Health check returned ${response.status}`);
    } catch (error) {
      lastError = error;
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  throw new Error(
    `API server did not become healthy: ${lastError?.message}\n${child.startupOutput()}`,
  );
}

async function request(baseUrl, path, options) {
  const response = await fetch(`${baseUrl}${path}`, options);
  const body = await response.json();
  return { body, response };
}

test(
  "verification records survive an API process restart",
  { timeout: 45_000 },
  async (t) => {
    if (!process.env.DATABASE_URL) {
      t.skip("DATABASE_URL is required for the persistence test");
      return;
    }

    const port = await getAvailablePort();
    const baseUrl = `http://127.0.0.1:${port}`;
    let server = startServer(port);

    try {
      await waitForServer(server, baseUrl);

      const before = await request(baseUrl, "/api/dashboard/summary");
      assert.equal(before.response.status, 200);

      const documentName = `Restart persistence ${Date.now()}`;
      const upload = await request(baseUrl, "/api/documents/upload", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: documentName,
          type: "Identity",
          subject: "Persistence Test Subject",
          issuer: "PramaanX Test Issuer",
        }),
      });
      assert.equal(upload.response.status, 201);
      assert.equal(upload.body.status, "pending");

      const verify = await request(
        baseUrl,
        `/api/documents/${encodeURIComponent(upload.body.id)}/verify`,
        { method: "POST" },
      );
      assert.equal(verify.response.status, 200);
      assert.equal(verify.body.decision, "verified");
      assert.equal(verify.body.document.id, upload.body.id);
      assert.equal(verify.body.document.status, "verified");

      const afterVerify = await request(baseUrl, "/api/dashboard/summary");
      assert.equal(afterVerify.response.status, 200);
      assert.equal(
        afterVerify.body.verification.total,
        before.body.verification.total + 1,
      );
      assert.equal(
        afterVerify.body.verification.verified,
        before.body.verification.verified + 1,
      );

      await stopServer(server);
      server = startServer(port);
      await waitForServer(server, baseUrl);

      const restoredDocument = await request(
        baseUrl,
        `/api/documents/${encodeURIComponent(upload.body.id)}`,
      );
      assert.equal(restoredDocument.response.status, 200);
      assert.deepEqual(
        {
          id: restoredDocument.body.id,
          name: restoredDocument.body.name,
          status: restoredDocument.body.status,
          trustScore: restoredDocument.body.trustScore,
        },
        {
          id: verify.body.document.id,
          name: verify.body.document.name,
          status: "verified",
          trustScore: verify.body.trustScore,
        },
      );
      assert.ok(
        restoredDocument.body.timeline.some(
          (item) =>
            item.type === "verification" &&
            item.title === "Document verified" &&
            item.description.includes(documentName),
        ),
        "the verification activity should be restored with the document",
      );

      const restoredActivity = await request(baseUrl, "/api/activity?limit=50");
      assert.equal(restoredActivity.response.status, 200);
      assert.ok(
        restoredActivity.body.some(
          (item) =>
            item.type === "verification" &&
            item.title === "Document verified" &&
            item.description.includes(documentName),
        ),
        "the verification event should remain in the activity feed",
      );

      const restoredSummary = await request(
        baseUrl,
        "/api/dashboard/summary",
      );
      assert.equal(restoredSummary.response.status, 200);
      assert.deepEqual(
        restoredSummary.body.verification,
        afterVerify.body.verification,
        "dashboard verification totals and decision metrics should be persisted",
      );
    } finally {
      await stopServer(server);
    }
  },
);