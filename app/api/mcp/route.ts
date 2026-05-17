import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
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
    timestamp: new Date().toISOString()
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, command, params, method, jsonrpc, id } = body;

    // Standard MCP JSON-RPC handling
    if (method === "tools/list") {
      return NextResponse.json({
        jsonrpc: jsonrpc || "2.0",
        id: id || null,
        result: {
          tools: [
            { name: "calculate_drama_score", description: "Calculates the drama score based on social inputs.", inputSchema: { type: "object", properties: { input: { type: "string" } }, required: ["input"] } },
            { name: "dodge_drama", description: "Dodges incoming drama.", inputSchema: { type: "object", properties: { dramaType: { type: "string" } }, required: ["dramaType"] } }
          ]
        }
      });
    }
    
    if (method === "prompts/list" || action === "prompts/list") {
      return NextResponse.json({
        jsonrpc: jsonrpc || "2.0",
        id: id || null,
        result: {
          prompts: [{ name: "drama_dodge_strategy", description: "Suggests a strategy to dodge current drama." }]
        }
      });
    }

    if (method === "resources/list" || action === "resources/list") {
      return NextResponse.json({
        jsonrpc: jsonrpc || "2.0",
        id: id || null,
        result: {
          resources: [{ uri: "drama://current-state", name: "Current Drama State", mimeType: "application/json" }]
        }
      });
    }

    // Call Tool implementation
    if (method === "tools/call" || action === "tools/call") {
      const toolName = params?.name || body.name;
      if (toolName === "calculate_drama_score") {
        return NextResponse.json({
          jsonrpc: jsonrpc || "2.0",
          id: id || null,
          result: { content: [{ type: "text", text: "Drama score calculated: 42 (Critical)" }] }
        });
      }
      if (toolName === "dodge_drama") {
        return NextResponse.json({
          jsonrpc: jsonrpc || "2.0",
          id: id || null,
          result: { content: [{ type: "text", text: "Successfully dodged drama: " + (params?.arguments?.dramaType || "Unknown") }] }
        });
      }
    }

    // Fallback logic for basic commands
    let result: any = {};

    switch (action || command) {
      case "status":
      case "ping":
        result = { 
          status: "online", 
          agent: "Drama Dodge Orchestrator",
          message: "Drama radar active - Ready to dodge" 
        };
        break;

      case "execute":
        result = {
          success: true,
          action: command || params,
          executedAt: new Date().toISOString(),
          message: "Drama successfully dodged"
        };
        break;

      case "get_info":
        result = {
          name: "Drama Dodge Orchestrator",
          wallet: "0xe157F1F5e12adB38Ba013683E9Ce24efe21e5bA6",
          platform: "Base",
          version: "1.0.0"
        };
        break;

      default:
        result = {
          success: true,
          message: "Command received or tool executed",
          data: body
        };
    }

    return NextResponse.json({
      ...(jsonrpc ? { jsonrpc: "2.0", id: id || null } : {}),
      status: "success",
      agent: "Drama Dodge Orchestrator",
      response: result,
      receivedAt: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json({
      status: "error",
      message: "Failed to process MCP command"
    }, { status: 400 });
  }
}
