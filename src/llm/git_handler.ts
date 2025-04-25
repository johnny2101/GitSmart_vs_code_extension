import { GitService } from "../git/gitService";
import { BaseLLMHandler } from "./base_handler";
import { LLMConflictHandler } from "./conflict_handler";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export class LLMGitHandler extends BaseLLMHandler {
  private conflictHandler = LLMConflictHandler.getInstance();

  private constructor() {
    super();
  }

  public static getInstance(): LLMGitHandler {
    if (!LLMGitHandler.instance) {
      LLMGitHandler.instance = new LLMGitHandler();
    }
    return LLMGitHandler.instance as LLMGitHandler;
  }

  protected initializeChatHistory(): void {}

  public async extractIntent(
    userMessage: string,
    gitStatus: string
  ): Promise<string> {
    const prompt = `You are an assistant specialized in interpreting Git commands expressed in natural language.
        Your responsibility is to identify the user's main intent and classify it into one of the following categories:
        - commit: create a commit
        - push: send changes to remote repository
        - pull: download changes from remote repository
        - merge: combine branches
        - branch: manage branches (create, delete, switch)
        - status: check repository status
        - diff: view differences
        - checkout: switch to a branch or restore files
        - reset: restore repository state
        - rebase: apply commits on a different base
        - stash: temporarily save changes
        - clone: clone a repository
        - init: initialize a repository
        - add: add files to staging area
        - rm: remove files
        - conflict resolution: resolve merge conflicts
        - other: any other Git command

        Analyze the following git status and user text and return ONLY the intent category, without further explanation and without any additional text:
        git status: ${gitStatus}
        User text: ${userMessage}`;

    const response = await this.handleMessage(prompt);
    const intent = response.trim();
    return intent;
  }

  public async getGitCommand(
    intent: string,
    userInput: string,
    gitStatus: string,
  ): Promise<string> {
    if (intent == "conflict resolution") {
      const gitStatus = await new GitService().getStatus();
      const filesToResolve = await this.conflictHandler.extractFilesToResolve(
        userInput,
        gitStatus
      );
      const conflicts = await this.conflictHandler.extractConflicts(
        filesToResolve
      );
    }

    const prompt = `You are a Git expert who translates natural language requests into precise Git commands.
        Use your knowledge of Git to generate the most appropriate command based on the intent and context.

        If the intent is "conflict resolution", then the conflict is ALREADY SOLVED. you just need to return the command to stage the resolved files.

        Intent: ${intent}
        User text: ${userInput}
        Git diff: ${gitStatus}

        Generate only the exact Git command without prefixes, comments, or explanations.
        Make sure the command is complete and includes all necessary parameters.`;

    const response = await this.handleMessage(prompt);
    const command = response.trim();
    return command;
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
