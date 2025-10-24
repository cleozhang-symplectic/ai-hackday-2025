# Claude Desktop Setup Instructions

Follow these steps to connect the Expense Tracker MCP server to Claude Desktop:

## Step 1: Build the Project
```bash
cd expense-tracker
npm run build
```

## Step 2: Locate Your Claude Desktop Config
The Claude Desktop configuration file is typically located at:
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`  
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

## Step 3: Update the Configuration
1. Copy the contents of `claude_desktop_config.json` from this project
2. Replace `REPLACE_WITH_YOUR_PATH` with the actual full path to your expense-tracker project
3. Add this configuration to your Claude Desktop config file

Example for Windows:
```json
{
  "mcpServers": {
    "expense-tracker": {
      "command": "node",
      "args": [
        "dist/mcp-server.js"
      ],
      "cwd": "C:\\Users\\YourName\\Documents\\expense-tracker\\backend",
      "env": {}
    }
  }
}
```

## Step 4: Restart Claude Desktop
Close and reopen Claude Desktop for the changes to take effect.

## Step 5: Test the Connection
Ask Claude something like:
- "Can you help me track my expenses?"
- "Add a $12 lunch expense to my expense tracker"
- "Show me my recent expenses"

## Troubleshooting

**Claude says it can't find the expense tracker:**
- Double-check the path in your config file
- Make sure you ran `npm run build` 
- Verify that `backend/dist/mcp-server.js` exists

**MCP server won't start:**
- Ensure Node.js is installed and in your PATH
- Try running the server manually: `cd backend && npm run start:mcp`
- Check that all dependencies are installed: `npm run install:all`

**Changes aren't working:**
- Restart Claude Desktop after any config changes
- Check the Claude Desktop logs for error messages
- Verify your JSON syntax is correct (no trailing commas, proper quotes)

## Alternative: Development Mode

For development or if you want hot reloading, use this config instead:

```json
{
  "mcpServers": {
    "expense-tracker-dev": {
      "command": "npx",
      "args": [
        "tsx",
        "src/mcp-server.ts"
      ],
      "cwd": "C:\\Users\\YourName\\Documents\\expense-tracker\\backend",
      "env": {}
    }
  }
}
```

This version doesn't require building but needs the `tsx` package installed.