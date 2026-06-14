import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

async function test() {
  const transport = new SSEClientTransport(new URL("https://mcp.base.org/sse"));
  const client = new Client({
    name: "DramaDodgeOrchestrator",
    version: "1.0.0"
  }, {
    capabilities: {}
  });

  await client.connect(transport);
  console.log("Connected to Base MCP!");

  const tools = await client.listTools();
  console.log("Tools:", tools);
  process.exit(0);
}

test().catch(console.error);
