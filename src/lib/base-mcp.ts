import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export class BaseMCPClient {
  private client: Client;
  private transport: SSEClientTransport;
  private connected: boolean = false;

  constructor(private token?: string) {
    // The Base MCP server is accessible via SSE at the hosted URL.
    // OAuth token is required for wallet operations.
    const url = new URL("https://mcp.base.org/sse");
    
    // In a real OAuth flow, token would be passed as Authorization header
    // Currently adding as a query parameter or depending on internal OAuth handling
    this.transport = new SSEClientTransport(url);
    
    this.client = new Client({
      name: "DramaDodgeOrchestrator",
      version: "1.0.0"
    }, {
      capabilities: {
        tools: {}
      }
    });
  }

  async connect() {
    if (this.connected) return;
    try {
      await this.client.connect(this.transport);
      this.connected = true;
      console.log("Connected to Base MCP successfully.");
    } catch (error) {
      console.error("Failed to connect to Base MCP:", error);
      throw error;
    }
  }

  async listTools() {
    await this.connect();
    return this.client.listTools();
  }

  async callTool(name: string, args: Record<string, any>): Promise<CallToolResult> {
    await this.connect();
    return this.client.callTool({
      name,
      arguments: args
    });
  }
}

// Export a singleton instance 
export const baseMCP = new BaseMCPClient();
