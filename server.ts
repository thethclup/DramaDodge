import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Serve static files from public directory manually for well-known
  // Express handles well-known naturally if we serve public folder
  // Or we can just explicitly send the json if we want
  const publicPath = path.join(process.cwd(), 'public');
  app.use(express.static(publicPath, { dotfiles: 'allow' }));

  // Explicit fallback for agent-card
  app.get("/.well-known/agent-card.json", (req, res) => {
    res.sendFile(path.join(process.cwd(), "public", ".well-known", "agent-card.json"));
  });

  // MCP GET
  app.get("/api/mcp", (req, res) => {
    res.json({
      protocol: "MCP",
      version: "1.0.0",
      name: "Drama Dodge MCP Endpoint",
      status: "active",
      description: "Active MCP server for Drama Dodge Orchestrator Agent",
      capabilities: {
        tools: {},
        prompts: {},
        resources: {}
      },
      tools: [
        {
          name: "calculate_drama_score",
          description: "Calculates the drama score based on social inputs.",
          inputSchema: { type: "object", properties: { input: { type: "string" } }, required: ["input"] }
        },
        {
          name: "dodge_drama",
          description: "Dodges incoming drama.",
          inputSchema: { type: "object", properties: { dramaType: { type: "string" } }, required: ["dramaType"] }
        }
      ],
      prompts: [
        {
          name: "drama_dodge_strategy",
          description: "Suggests a strategy to dodge current drama."
        }
      ],
      resources: [
        {
          uri: "drama://current-state",
          name: "Current Drama State",
          description: "The live state of drama in the network.",
          mimeType: "application/json"
        }
      ],
      timestamp: new Date().toISOString(),
    });
  });

  // MCP POST
  app.post("/api/mcp", (req, res) => {
    try {
      const { action, command, params, method, jsonrpc, id } = req.body;

      if (method === "tools/list") {
        return res.json({
          jsonrpc: jsonrpc || "2.0",
          id: id || null,
          result: {
            tools: [
              { name: "calculate_drama_score", description: "Calculates drama score", inputSchema: { type: "object", properties: { input: { type: "string"} }, required: ["input"] } },
              { name: "dodge_drama", description: "Dodges incoming drama.", inputSchema: { type: "object", properties: { dramaType: { type: "string" } }, required: ["dramaType"] } }
            ]
          }
        });
      }
      if (method === "prompts/list" || action === "prompts/list") {
        return res.json({
          jsonrpc: jsonrpc || "2.0",
          id: id || null,
          result: { prompts: [{ name: "drama_dodge_strategy", description: "Suggests strategy" }] }
        });
      }
      if (method === "resources/list" || action === "resources/list") {
        return res.json({
          jsonrpc: jsonrpc || "2.0",
          id: id || null,
          result: { resources: [{ uri: "drama://current-state", name: "Current Drama State" }] }
        });
      }

      if (method === "tools/call" || action === "tools/call") {
        const toolName = params?.name || req.body.name;
        if (toolName === "calculate_drama_score") {
          return res.json({ jsonrpc: jsonrpc || "2.0", id: id || null, result: { content: [{ type: "text", text: "Drama score calculated: 42 (Critical)" }] } });
        }
        if (toolName === "dodge_drama") {
          return res.json({ jsonrpc: jsonrpc || "2.0", id: id || null, result: { content: [{ type: "text", text: "Successfully dodged drama: " + (params?.arguments?.dramaType || "Unknown") }] } });
        }
      }

      let result: any = {};

      switch (action || command) {
        case "status":
        case "ping":
          result = {
            status: "online",
            agent: "Drama Dodge Orchestrator",
            message: "Drama radar active - Ready to dodge",
          };
          break;

        case "execute":
          result = {
            success: true,
            action: command || params,
            executedAt: new Date().toISOString(),
            message: "Drama successfully dodged",
          };
          break;

        case "get_info":
          result = {
            name: "Drama Dodge Orchestrator",
            wallet: "0xe157F1F5e12adB38Ba013683E9Ce24efe21e5bA6",
            platform: "Base",
            version: "1.0.0",
          };
          break;

        default:
          result = {
            success: true,
            message: "Command received",
            data: req.body,
          };
      }

      res.json({
        status: "success",
        agent: "Drama Dodge Orchestrator",
        response: result,
        receivedAt: new Date().toISOString(),
      });
    } catch (error) {
      res.status(400).json({
        status: "error",
        message: "Failed to process MCP command",
      });
    }
  });

  // Agent API
  app.get("/api/agent", (req, res) => {
    res.json({
      name: "Drama Dodge Orchestrator",
      status: "active",
      wallet: "0xe157F1F5e12adB38Ba013683E9Ce24efe21e5bA6",
      platform: "Drama Dodge",
      version: "1.0.0",
    });
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
