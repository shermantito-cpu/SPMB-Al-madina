import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // API Routes for Google Apps Script & Spreadsheet Proxy
  app.post("/api/spreadsheet/test-connection", async (req, res) => {
    const { webAppUrl } = req.body;
    if (!webAppUrl || typeof webAppUrl !== "string" || !webAppUrl.startsWith("http")) {
      return res.status(400).json({
        success: false,
        message: "URL Web App Google Apps Script tidak valid. Pastikan berawalan https://script.google.com/macros/s/..."
      });
    }

    try {
      // Test with ping request
      const targetUrl = webAppUrl.includes("?") 
        ? `${webAppUrl}&action=ping` 
        : `${webAppUrl}?action=ping`;

      const response = await fetch(targetUrl, {
        method: "GET",
        headers: { "User-Agent": "SPMB-AlMadina-App/2.0" }
      });

      const responseText = await response.text();
      let parsedJson: any = null;
      try {
        parsedJson = JSON.parse(responseText);
      } catch (e) {
        // Not JSON, might be HTML output from doGet
      }

      return res.json({
        success: response.ok,
        status: response.status,
        message: "Berhasil terhubung ke endpoint Google Apps Script!",
        responseSample: parsedJson || responseText.slice(0, 150)
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: "Gagal menghubungi endpoint Google Apps Script: " + (err.message || String(err))
      });
    }
  });

  app.post("/api/spreadsheet/submit", async (req, res) => {
    const { webAppUrl, payload } = req.body;
    if (!webAppUrl || !payload) {
      return res.status(400).json({
        success: false,
        message: "webAppUrl dan data pendaftar (payload) harus diisi"
      });
    }

    try {
      const action = payload.action || 'submitForm';
      const targetUrl = webAppUrl.includes("?") 
        ? `${webAppUrl}&action=${action}` 
        : `${webAppUrl}?action=${action}`;

      const response = await fetch(targetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
          "User-Agent": "SPMB-AlMadina-App/2.0"
        },
        body: JSON.stringify(payload)
      });

      const responseText = await response.text();
      let parsed: any = null;
      try {
        parsed = JSON.parse(responseText);
      } catch (e) {
        parsed = { raw: responseText };
      }

      // If GAS returned a JSON with success === false, forward it as a 400 error
      if (parsed && parsed.success === false) {
        return res.status(400).json({
          success: false,
          data: parsed,
          message: parsed.message || "Script Google Apps mengembalikan error"
        });
      }

      return res.json({
        success: true,
        data: parsed,
        message: "Data berhasil dikirim ke Google Apps Script Spreadsheet"
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: "Gagal mengirim ke Google Apps Script: " + (err.message || String(err))
      });
    }
  });

  app.get("/api/spreadsheet/check-status", async (req, res) => {
    const { webAppUrl, nik } = req.query;
    if (!webAppUrl || !nik) {
      return res.status(400).json({
        success: false,
        message: "webAppUrl dan nik harus disertakan"
      });
    }

    try {
      const targetUrl = `${String(webAppUrl)}?action=cekStatus&nik=${encodeURIComponent(String(nik))}&_t=${Date.now()}`;
      const response = await fetch(targetUrl, {
        headers: { "User-Agent": "SPMB-AlMadina-App/2.0" }
      });
      const data = await response.json();
      return res.json({ success: true, data });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: "Gagal mengecek status ke Google Apps Script: " + (err.message || String(err))
      });
    }
  });

  app.get("/api/spreadsheet/cetak-kartu", async (req, res) => {
    const { webAppUrl, nik } = req.query;
    if (!webAppUrl || !nik) {
      return res.status(400).json({
        success: false,
        message: "webAppUrl dan nik harus disertakan"
      });
    }

    try {
      const targetUrl = `${String(webAppUrl)}?action=cetakKartu&nik=${encodeURIComponent(String(nik))}&_t=${Date.now()}`;
      const response = await fetch(targetUrl, {
        headers: { "User-Agent": "SPMB-AlMadina-App/2.0" }
      });
      const data = await response.json();
      return res.json({ success: true, data });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: "Gagal mencetak kartu via Google Apps Script: " + (err.message || String(err))
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server SPMB Al-Madina running on http://localhost:${PORT}`);
  });
}

startServer();
