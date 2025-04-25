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

  async getDiff(): Promise<string> {
    try {
      const diff = await this.git.diff();
      return diff;
    } catch (error) {
      vscode.window.showErrorMessage(
        "Errore durante la lettura del diff Git. " + error
      );
      return "";
    }
  }
}
