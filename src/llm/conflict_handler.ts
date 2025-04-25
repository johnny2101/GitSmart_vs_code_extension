import { extractGitConflicts, getFileContent, writeFile } from "../utils/fileEditor";
import { BaseLLMHandler } from "./base_handler";
import * as vscode from "vscode";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export class LLMConflictHandler extends BaseLLMHandler {
  public static getInstance(): LLMConflictHandler {
    if (!LLMConflictHandler.instance) {
      LLMConflictHandler.instance = new LLMConflictHandler();
    }
    return LLMConflictHandler.instance as LLMConflictHandler;
  }

  protected initializeChatHistory(): void {}

  public async extractFilesToResolve(
    userMessage: string,
    gitStatus: string
  ): Promise<string> {
    const prompt = `You are an assistant specialized in interpreting Git commands expressed in natural language.
        Your responsibility is to identify the files that need to be resolved based on the user's request and the current Git status.

        Analyze the following git status and user text and return ONLY the files that need to be resolved, without further explanation and without any additional text:
        git status: ${gitStatus}
        User text: ${userMessage}`;

    const response = await this.handleMessage(prompt);
    const filesToResolve = response.trim();
    return filesToResolve;
  }

  public async extractConflicts(filePath: string) {
    if (
      !vscode.workspace.workspaceFolders ||
      vscode.workspace.workspaceFolders.length === 0
    ) {
      throw new Error("No workspace folder is open.");
    }
    const completeFilePath = `${vscode.workspace.workspaceFolders[0].uri.path}/${filePath}`;
    const fileContent = getFileContent(completeFilePath);
    const resolvedContent =  await this.resolveConflicts(fileContent);
    await writeFile(completeFilePath, resolvedContent);

    return resolvedContent;
  }

  public async resolveConflicts(
    fileContent: string
  ): Promise<string> {
    const prompt = `You are an assistant specialized in resolving Git conflicts.
        Your responsibility is to analyze the provided file content and return the resolved version.

        Analyze the following file content and return ONLY the resolved version, without further explanation and without any additional text:
        File content: ${fileContent}`;

    const response = await this.handleMessage(prompt);
    const resolvedContent = response.trim();
    return resolvedContent;
  }

  protected prepareMessages(
    userMessage: string,
    additionalContext?: string
  ): ChatMessage[] {
    return [
      {
        role: "user",
        content: userMessage,
      },
    ];
  }

  protected processResponse(response: string, additionalContext?: string) {
    return response;
  }
}
