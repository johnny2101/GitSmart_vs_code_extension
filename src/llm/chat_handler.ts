import { LLMGitHandler } from "./git_handler";
import { BaseLLMHandler } from "./base_handler";
import { GitService } from "../git/gitService";

interface ChatMessage {
  role: "system" | "user" | "assistant" | "llm_git";
  content: string;
}

export class LLMUserHandler extends BaseLLMHandler {
  private gitHandler = LLMGitHandler.getInstance();

  private constructor() {
    super();
  }

  protected initializeChatHistory(): void {
    this.chatHistory = [
      {
        role: "system",
        content: `You are an AI coordinator that manages communication between a user and a Git operations agent (llm_git). Your responsibilities are:

1. Interpret the user's requests in natural language.
2. Decide whether an action is needed from the user or from the Git operations model (llm_git).
3. Route the request accordingly, while maintaining context and a smooth interaction.
4. Ensure to return ONE and ONLY ONE action at a time, either for the user or for the Git operations model.
5. DO NOT ask for confirmation from the user.
6. Before routing a request to the Git operations model, ENSURE that the request cannot be blocked by conflicts or other issues.
7. If there are issues, make the GIT OPERATIONS model handle them. DO NOT ask the user to resolve them.
8. IF YOU THINK THERE ARE CONFLICTS TO RESOLVE, ask CLEARLY the Git operations model to resolve them.

You are not allowed to execute or explain Git operations yourself.

You must always respond with ONE and ONLY ONE action line at a time in the following format:

- [user] followed by a message intended for the human user (to ask a question, provide a status update, or confirm intent).
- [git] followed by a message intended for the Git automation model (llm_git), describing a Git-related task to perform (e.g., resolve a conflict, commit files, stage changes).

You must NEVER reply with explanations or comments outside of this format.

---

In the next message, you will receive:

1. The current state of the Git repository (e.g., status, diffs, branch, conflicts).
2. Either:
   - A message from the **user**, or
   - A response from **llm_git** (after performing an operation you requested).

Your task will be to interpret the context and return one line only, in one of the following formats and without any additional text:

[user] ...
[git] ...
`,
      },
    ];
  }

  public static getInstance(): LLMUserHandler {
    if (!LLMUserHandler.instance) {
      LLMUserHandler.instance = new LLMUserHandler();
    }
    return LLMUserHandler.instance as LLMUserHandler;
  }

  protected prepareMessages(
    userMessage: string,
    gitStatus: string
  ): ChatMessage[] {
    const combinedMessage = `[user]: ${userMessage}\n[git status]: ${gitStatus}`;
    this.chatHistory.push({ role: "user", content: combinedMessage });
    return this.chatHistory;
  }

  protected async processResponse(
    response: string,
    gitStatus?: string
  ): Promise<string> {
    if (response.startsWith("[git]")) {
      const gitDiff = await new GitService().getDiff();
      const gitOperation = response.replace("[git]", "").trim();
      const action = await this.perfromGitOperation(
        gitOperation,
        gitStatus || "",
        gitDiff || ""
      );
      this.chatHistory.push({ role: "llm_git", content: action });
      return action;
    }
    return response;
  }

  private async perfromGitOperation(
    gitOperation: string,
    gitStatus: string,
    gitDiff: string
  ): Promise<string> {
    console.log("Performing Git operation:", gitOperation);
    const intent = await this.gitHandler.extractIntent(gitOperation, gitStatus);
    const action = await this.gitHandler.getGitCommand(
      intent,
      gitOperation,
      gitStatus
    );
    return action;
  }
}
