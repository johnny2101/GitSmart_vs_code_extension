import * as vscode from "vscode";
import { LLMUserHandler } from "../llm/chat_handler";
import { GitService } from "../git/gitService";

export function showChatPanel(extensionUri: vscode.Uri) {
  const panel = vscode.window.createWebviewPanel(
    "llmChat",
    "LLM Git Assistant",
    vscode.ViewColumn.One,
    {
      enableScripts: true,
    }
  );

  panel.webview.html = getWebviewContent();

  const llmHandler = LLMUserHandler.getInstance();
  const gitService = new GitService();

  panel.webview.onDidReceiveMessage(
    async (message) => {
      const gitStatus = await gitService.getStatus();
      let response = await llmHandler.handleMessage(message.text, gitStatus);
      panel.webview.postMessage({ role: "assistant", text: response });
    },
    undefined,
    []
  );
}

function getWebviewContent(): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>LLM Git Assistant</title>
        <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
        <style>
            body {
                font-family: sans-serif;
                margin: 20px;
            }
            #chatLog {
                margin-top: 20px;
                padding: 10px;
                border: 1px solid #ccc;
                height: 400px;
                overflow-y: auto;
                background: #f9f9f9;
            }
            .message {
                margin-bottom: 20px;
            }
            .user, .assistant {
                margin-bottom: 5px;
                font-weight: bold;
            }
            .user { color: #007acc; }
            .assistant { color: #4caf50; }
            .markdown {
                background: white;
                padding: 10px;
                border-radius: 5px;
                border: 1px solid #ddd;
                font-family: monospace;
                color: black;
                white-space: pre-wrap;
            }
            code {
                background: #eee;
                padding: 2px 4px;
                border-radius: 4px;
            }
            pre {
                background: #f5f5f5;
                padding: 10px;
                border-radius: 5px;
                overflow-x: auto;
            }
        </style>
    </head>
    <body>
        <h2>Chat con LLM</h2>
        <input type="text" id="msg" placeholder="Scrivi qui..." style="width: 80%;" value="I need to commit my grepper.py file that extract pattern from specific files" />
        <button onclick="sendMessage()">Invia</button>
        <div id="chatLog"></div>
        <script>
            const vscode = acquireVsCodeApi();

            function sendMessage() {
                const input = document.getElementById('msg');
                const text = input.value.trim();
                if (!text) return;
                vscode.postMessage({ text });
                appendMarkdownMessage('user', text);
                input.value = '';
            }

            function appendMarkdownMessage(role, markdownText) {
                const log = document.getElementById('chatLog');
                const container = document.createElement('div');
                container.className = 'message';

                const roleLabel = document.createElement('div');
                roleLabel.className = role;
                roleLabel.textContent = role + ':';

                const messageBody = document.createElement('div');
                messageBody.className = 'markdown';
                messageBody.innerHTML = marked.parse(markdownText);

                container.appendChild(roleLabel);
                container.appendChild(messageBody);
                log.appendChild(container);
                log.scrollTop = log.scrollHeight;
            }

            window.addEventListener('message', event => {
                const message = event.data;
                appendMarkdownMessage(message.role, message.text);
            });
        </script>
    </body>
    </html>
    `;
}
