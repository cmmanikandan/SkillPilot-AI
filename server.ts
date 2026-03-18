import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "SkillPilot AI Server is running" });
  });

  // Mock code execution endpoint (for demo purposes)
  app.post("/api/coding/run", (req, res) => {
    const { language, code } = req.body;
    // In a real app, this would use a secure sandbox like Docker or a specialized API
    // For this demo, we'll provide a simulated output
    let output = "";
    if (language === "javascript") {
      output = "Simulated JS Output: Hello, SkillPilot!";
    } else {
      output = `Simulated ${language} execution successful.\nOutput: Program finished with exit code 0.`;
    }
    res.json({ output });
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
