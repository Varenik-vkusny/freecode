import json
from pathlib import Path
from agent_core.tools.base import BaseTool, ToolDefinition

class AddMcpServerTool(BaseTool):
    """Tool to add a new MCP server configuration and hot-reload."""
    
    def __init__(self, mcp_manager, tool_registry):
        self.mcp_manager = mcp_manager
        self.tool_registry = tool_registry

    @property
    def definition(self) -> ToolDefinition:
        return ToolDefinition(
            name="add_mcp_server",
            description="Add a new MCP server to the configuration and hot-reload to make its tools available immediately.",
            parameters={
                "type": "object",
                "properties": {
                    "name": {"type": "string", "description": "A unique, short identifier for the MCP server (e.g. 'sqlite')"},
                    "command": {"type": "string", "description": "The command to run the server (e.g. 'npx', 'uvx', 'python')"},
                    "args": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Arguments to pass to the command (e.g. ['-y', '@modelcontextprotocol/server-sqlite', '--', 'db.sqlite'])"
                    }
                },
                "required": ["name", "command", "args"]
            }
        )

    async def execute(self, **kwargs) -> str:
        name = kwargs.get("name")
        command = kwargs.get("command")
        args = kwargs.get("args", [])
        
        if not name or not command:
            return "Error: name and command are required parameters."
            
        config_path = self.mcp_manager.config_path
        config_path.parent.mkdir(parents=True, exist_ok=True)
        
        if config_path.exists():
            with open(config_path, "r") as f:
                try:
                    config = json.load(f)
                except Exception:
                    config = {"servers": {}}
        else:
            config = {"servers": {}}
            
        if "servers" not in config:
            config["servers"] = {}
            
        config["servers"][name] = {
            "type": "stdio",
            "command": command,
            "args": args
        }
        
        with open(config_path, "w") as f:
            json.dump(config, f, indent=2)
            
        # Hot reload!
        await self.mcp_manager.reload_all(self.tool_registry)
        
        return f"Successfully added MCP server '{name}' to {config_path} and hot-reloaded tools!"
