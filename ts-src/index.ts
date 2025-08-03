#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import * as yaml from "js-yaml";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { convertJsonToMarkdown, convertBooleanToString } from "./converter.js";
import { LIMITLESS_API_KEY } from "./validator.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = new Server(
  {
    name: "limitless",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

interface QueryParams {
  [key: string]: any;
}

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "limitless_get_lifelog_by_id",
        description: "Get a specific lifelog by ID",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "The ID of the lifelog to retrieve",
            },
          },
          required: ["id"],
        },
      },
      {
        name: "limitless_list_lifelogs_by_date",
        description: "List lifelogs for a specific date",
        inputSchema: {
          type: "object",
          properties: {
            date: {
              type: "string",
              description: "Date in YYYY-MM-DD format",
            },
            limit: {
              type: "integer",
              description: "Maximum number of lifelogs to return (max 10)",
              default: 5,
            },
            isStarred: {
              type: "boolean",
              description: "Filter by starred status",
            },
          },
          required: ["date"],
        },
      },
      {
        name: "limitless_list_lifelogs_by_range", 
        description: "List lifelogs within a date/time range",
        inputSchema: {
          type: "object",
          properties: {
            start: {
              type: "string",
              description: "Start datetime in ISO-8601 format",
            },
            end: {
              type: "string", 
              description: "End datetime in ISO-8601 format",
            },
            limit: {
              type: "integer",
              description: "Maximum number of lifelogs to return (max 10)",
              default: 5,
            },
            isStarred: {
              type: "boolean",
              description: "Filter by starred status",
            },
          },
          required: ["start", "end"],
        },
      },
      {
        name: "limitless_list_recent_lifelogs",
        description: "List recent lifelogs",
        inputSchema: {
          type: "object",
          properties: {
            limit: {
              type: "integer",
              description: "Maximum number of lifelogs to return (max 10)",
              default: 5,
            },
            cursor: {
              type: "string",
              description: "Cursor for pagination",
            },
            isStarred: {
              type: "boolean",
              description: "Filter by starred status",
            },
          },
        },
      },
      {
        name: "limitless_search_lifelogs",
        description: "Search lifelogs using hybrid search (keyword + semantic)",
        inputSchema: {
          type: "object",
          properties: {
            search: {
              type: "string",
              description: "Search query",
            },
            limit: {
              type: "integer",
              description: "Maximum number of lifelogs to return (max 10)",
              default: 5,
            },
            isStarred: {
              type: "boolean",
              description: "Filter by starred status",
            },
          },
          required: ["search"],
        },
      },
    ],
  };
});

async function makeLifelogRequest(endpoint: string, params: QueryParams) {
  // Load config file
  const configPath = path.resolve(__dirname, "../config/config.yml");
  const configFile = fs.readFileSync(configPath, "utf8");
  const config = yaml.load(configFile) as any;
  const baseParams: QueryParams = config.query_parameters || {};

  // Merge with provided params
  const finalParams = { ...baseParams, ...params };

  // Convert boolean values to strings for API
  const queryParams: Record<string, string> = {};
  for (const [key, value] of Object.entries(finalParams)) {
    if (value !== null && value !== undefined) {
      queryParams[key] = convertBooleanToString(value);
    }
  }

  // Make API request
  const response = await axios.get(`https://api.limitless.ai/v1/${endpoint}`, {
    headers: {
      "X-API-Key": LIMITLESS_API_KEY,
    },
    params: queryParams,
  });

  return convertJsonToMarkdown(response.data);
}

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const args = request.params.arguments || {};
  
  try {
    let result: string;

    switch (request.params.name) {
      case "limitless_get_lifelog_by_id":
        result = await makeLifelogRequest(`lifelogs/${args.id}`, {});
        break;

      case "limitless_list_lifelogs_by_date":
        result = await makeLifelogRequest("lifelogs", {
          date: args.date,
          limit: args.limit,
          isStarred: args.isStarred,
        });
        break;

      case "limitless_list_lifelogs_by_range":
        result = await makeLifelogRequest("lifelogs", {
          start: args.start,
          end: args.end,
          limit: args.limit,
          isStarred: args.isStarred,
        });
        break;

      case "limitless_list_recent_lifelogs":
        result = await makeLifelogRequest("lifelogs", {
          limit: args.limit,
          cursor: args.cursor,
          isStarred: args.isStarred,
        });
        break;

      case "limitless_search_lifelogs":
        result = await makeLifelogRequest("lifelogs", {
          search: args.search,
          limit: args.limit,
          isStarred: args.isStarred,
        });
        break;

      default:
        throw new Error(`Unknown tool: ${request.params.name}`);
    }

    return {
      content: [
        {
          type: "text",
          text: result,
        },
      ],
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`APIリクエストエラー: ${error.message}`);
    } else {
      throw new Error(`エラー: ${error}`);
    }
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Limitless MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});