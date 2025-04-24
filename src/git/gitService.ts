import simpleGit from "simple-git";
import * as vscode from "vscode";

export class GitService {
  private git = simpleGit({
    baseDir: vscode.workspace.workspaceFolders?.[0].uri.fsPath,
  });

  async getStatus(): Promise<string> {
    try {
      const status = await this.git.status();
      return JSON.stringify(status, null, 2);
    } catch (error) {
      vscode.window.showErrorMessage(
        "Errore durante lettura dello stato Git. " + error
      );
      return "";
    }
  }
}
