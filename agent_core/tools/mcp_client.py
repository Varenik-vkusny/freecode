"""MCP Client tool for connecting to external MCP servers."""

import asyncio
from typing import Optional
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
from .base import BaseTool, ToolDefinition

class McpClientTool(BaseTool):
    """Connect to and use tools from an external MCP server."""

    def __init__(self, command: str, args: list[str] = []):
        self.server_params = StdioServerParameters(command=command, args=args)
        self.session: Optional[ClientSession] = None
        self.client: Optional[stdio_client] = None

    @property
    def definition(self) -> ToolDefinition:
        return ToolDefinition(
            name="mcp_call",
            description="Call a tool from a connected MCP server",
            parameters={
                "type": "object",
                "properties": {
                    "tool_name": {"type": "string", "description": "Name of the MCP tool to call"},
                    "arguments": {"type": "object", "description": "Arguments for the tool"}
                },
                "required": ["tool_name", "arguments"]
            }
        )

    async def _ensure_connected(self):
        if not self.session:
            # This is simplified; in production, we'd need better management of the client context
            # For now, we open a new connection per execute or manage it persistently.
            # Stdio client requires a context manager, so this is complex.
            pass

    async def execute(self, **kwargs) -> str:
        tool_name = kwargs.get("tool_name")
        arguments = kwargs.get("arguments", {})

        try:
            async with stdio_client(self.server_params) as (read, write):
                async with ClientSession(read, write) as session:
                    await session.initialize()
                    
                    # Call the tool
                    result = await session.call_tool(tool_name, arguments)
                    return str(result)
        except Exception as e:
            return f"Error: {e}"
