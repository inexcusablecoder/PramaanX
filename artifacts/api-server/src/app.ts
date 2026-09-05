import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import healthRouter from "./routes/health";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(healthRouter);
app.use("/api", router);


app.get(["/", "/api"], (_req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>PramaanX API Engine - Online</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          background-color: #0c0e14;
          color: #f1f5f9;
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }
        .card {
          background: #151922;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          max-width: 640px;
          width: 100%;
          padding: 36px;
          position: relative;
          overflow: hidden;
        }
        .glow {
          position: absolute;
          top: -80px;
          right: -80px;
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, rgba(249, 115, 22, 0.25) 0%, transparent 70%);
          pointer-events: none;
        }
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 9999px;
          padding: 4px 12px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 20px;
        }
        .indicator {
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
          box-shadow: 0 0 10px #10b981;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
        h1 {
          font-size: 26px;
          font-weight: 800;
          letter-spacing: -0.02em;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .logo-box {
          background: linear-gradient(135deg, #f97316, #ea580c);
          color: white;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 20px;
        }
        p.subtitle {
          color: #94a3b8;
          font-size: 14px;
          line-height: 1.6;
          margin-bottom: 28px;
        }
        .note-box {
          background: rgba(249, 115, 22, 0.08);
          border-left: 3px solid #f97316;
          padding: 12px 16px;
          border-radius: 0 8px 8px 0;
          margin-bottom: 24px;
          font-size: 13px;
          color: #cbd5e1;
        }
        .note-box strong {
          color: #f97316;
        }
        .endpoints {
          background: #0f1219;
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 28px;
        }
        .endpoint-title {
          font-size: 11px;
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 0.06em;
          color: #64748b;
          margin-bottom: 12px;
        }
        .endpoint-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
        }
        .endpoint-row:last-child { border-bottom: none; }
        .method {
          color: #10b981;
          font-weight: 700;
          margin-right: 8px;
        }
        .endpoint-link {
          color: #94a3b8;
          text-decoration: none;
          transition: color 0.15s;
        }
        .endpoint-link:hover {
          color: #f97316;
          text-decoration: underline;
        }
        .btn-group {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .btn-primary {
          background: linear-gradient(135deg, #f97316, #ea580c);
          color: #ffffff;
          padding: 12px 22px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 14px rgba(249, 115, 22, 0.35);
          transition: transform 0.15s, opacity 0.15s;
        }
        .btn-primary:hover {
          opacity: 0.95;
          transform: translateY(-1px);
        }
        .btn-secondary {
          background: rgba(255, 255, 255, 0.06);
          color: #e2e8f0;
          padding: 12px 18px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: background 0.15s;
        }
        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="glow"></div>
        <div class="badge">
          <span class="indicator"></span>
          API Backend Live &amp; Healthy
        </div>
        <h1>
          <div class="logo-box">P</div>
          PramaanX API Engine
        </h1>
        <p class="subtitle">
          High-assurance workforce compliance, biometric trust verification, and AI forensics REST API microservice.
        </p>

        <div class="note-box">
          <strong>Frontend Web Dashboard is on Port 3000:</strong><br>
          This port (<strong>5000</strong>) is dedicated to JSON REST API endpoints. To view the user interface, click the button below to open the Frontend Dashboard.
        </div>

        <div class="endpoints">
          <div class="endpoint-title">Active REST Endpoints</div>
          <div class="endpoint-row">
            <span><span class="method">GET</span><a class="endpoint-link" href="/api/health" target="_blank">/api/health</a></span>
            <span style="color:#10b981;">200 OK</span>
          </div>
          <div class="endpoint-row">
            <span><span class="method">GET</span><a class="endpoint-link" href="/api/workforce" target="_blank">/api/workforce</a></span>
            <span style="color:#64748b;">Active Personnel &amp; Stress</span>
          </div>
          <div class="endpoint-row">
            <span><span class="method">GET</span><a class="endpoint-link" href="/api/analytics" target="_blank">/api/analytics</a></span>
            <span style="color:#64748b;">Telemetry &amp; Audits</span>
          </div>
          <div class="endpoint-row">
            <span><span class="method">GET</span><a class="endpoint-link" href="/api/stress/overview" target="_blank">/api/stress/overview</a></span>
            <span style="color:#64748b;">Burnout Risk Metrics</span>
          </div>
        </div>

        <div class="btn-group">
          <a class="btn-primary" href="http://localhost:3000" target="_blank">
            Open Frontend Dashboard (Port 3000) &rarr;
          </a>
          <a class="btn-secondary" href="/api/health" target="_blank">
            Inspect Health JSON
          </a>
        </div>
      </div>
    </body>
    </html>
  `);
});

export default app;

