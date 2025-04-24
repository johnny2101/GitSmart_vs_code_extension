import * as vscode from 'vscode';
import { GitService } from './git/gitService';
import { showChatPanel } from './chat/chatPanel';

export function activate(context: vscode.ExtensionContext) {
    const gitService = new GitService();

    context.subscriptions.push(
        vscode.commands.registerCommand('gitsmart.openChat', () => {
            showChatPanel(context.extensionUri);
        }),

        vscode.commands.registerCommand('gitsmart.showStatus', async () => {
            const status = await gitService.getStatus();
            vscode.window.showInformationMessage(`Git status:\n${status}`);
        })
    );
}

export function deactivate() {}
