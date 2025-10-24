#!/usr/bin/env node

/**
 * Simple test script to verify MCP server functionality
 * This script simulates what an MCP client would do
 */

import { spawn } from 'child_process';
import { join } from 'path';

const testMCPServer = async () => {
  console.log('🚀 Testing MCP Server...\n');

  const mcpServerPath = join(__dirname, '..', 'backend', 'src', 'mcp-server.ts');
  
  // Start the MCP server process
  const mcpProcess = spawn('npx', ['tsx', mcpServerPath], {
    stdio: ['pipe', 'pipe', 'pipe'],
    cwd: join(__dirname, '..', 'backend')
  });

  let output = '';
  
  mcpProcess.stdout.on('data', (data) => {
    output += data.toString();
    console.log('📤 MCP Server Output:', data.toString());
  });

  mcpProcess.stderr.on('data', (data) => {
    console.log('📥 MCP Server Started:', data.toString());
  });

  // Send a test message to list tools
  const listToolsMessage = JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list',
    params: {}
  }) + '\n';

  console.log('📤 Sending list tools request...');
  mcpProcess.stdin.write(listToolsMessage);

  // Test adding an expense
  setTimeout(() => {
    const addExpenseMessage = JSON.stringify({
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: 'add_expense',
        arguments: {
          title: 'Test Coffee',
          amount: 4.50,
          category: 'Food',
          description: 'Morning coffee from test script'
        }
      }
    }) + '\n';

    console.log('📤 Sending add expense request...');
    mcpProcess.stdin.write(addExpenseMessage);
  }, 1000);

  // Test listing expenses
  setTimeout(() => {
    const listExpensesMessage = JSON.stringify({
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'list_expenses',
        arguments: {
          limit: 5
        }
      }
    }) + '\n';

    console.log('📤 Sending list expenses request...');
    mcpProcess.stdin.write(listExpensesMessage);
  }, 2000);

  // Clean up after 5 seconds
  setTimeout(() => {
    console.log('\n✅ Test completed. Terminating MCP server...');
    mcpProcess.kill();
    process.exit(0);
  }, 5000);

  mcpProcess.on('error', (error) => {
    console.error('❌ Error running MCP server:', error);
    process.exit(1);
  });
};

testMCPServer().catch(console.error);