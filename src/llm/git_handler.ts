import axios from "axios";
import fs from "fs";
import { Logger } from "../log/Logger";

export async function sendMessageToLLM(userMessage: string): Promise<string> {
  try {
    const response = await axios.post("http://localhost:11434/api/chat", {
      model: "gemma3:12b",
      messages: [
        {
          role: "system",
          content: "Sei un assistente che aiuta a gestire repository Git.",
        },
        { role: "user", content: userMessage },
      ],
      stream: false,
    });

    const content = response.data.message?.content;
    return content || "(Nessuna risposta)";
  } catch (err) {
    const errorMessage = `Errore durante la richiesta al LLM: ${err}\n`;
    fs.appendFileSync(
      "/Users/giovannieprete/projects/GitSmart/vs_code_ext/gitsmart/logs/error.log",
      errorMessage
    );

    return "Errore: impossibile contattare il modello LLM.";
  }
}

export class LLMGitHandler {
  private static instance: LLMGitHandler;
  private logger = Logger.getInstance();

  private constructor() {}

  public static getInstance(): LLMGitHandler {
    if (!LLMGitHandler.instance) {
      LLMGitHandler.instance = new LLMGitHandler();
    }
    return LLMGitHandler.instance;
  }

  public async handleMessage(userMessage: string): Promise<string> {
    try {
      const response = await axios.post("http://localhost:11434/api/chat", {
        model: "gemma3:12b",
        messages: [
          {
            role: "system",
            content: "Sei un assistente che aiuta a gestire repository Git.",
          },
          { role: "user", content: userMessage },
        ],
        stream: false,
      });

      const content = response.data.message?.content;
      return content || "(Nessuna risposta)";
    } catch (err) {
      const errorMessage = `Errore durante la richiesta al LLM: ${err}\n`;
      fs.appendFileSync(
        "/Users/giovannieprete/projects/GitSmart/vs_code_ext/gitsmart/logs/error.log",
        errorMessage
      );

      return "Errore: impossibile contattare il modello LLM.";
    }
  }

  public async extractIntent(userMessage: string, gitStatus: string): Promise<string> {
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

    try {
      const response = await this.handleMessage(prompt);
      const intent = response.trim();

      this.logger.logResponse(intent, LLMGitHandler.name);
      return intent;
    } catch (error) {
      this.logger.logError(
        `Error extracting intent: ${error}`,
        LLMGitHandler.name
      );
      return "Errore: impossibile estrarre l'intento.";
    }
  }

  public async getGitCommand(
    intent: string,
    userInput: string
  ): Promise<string> {
    const prompt = `You are a Git expert who translates natural language requests into precise Git commands.
        Use your knowledge of Git to generate the most appropriate command based on the intent and context.

        Intent: ${intent}
        User text: ${userInput}

        Generate only the exact Git command without prefixes, comments, or explanations.
        Make sure the command is complete and includes all necessary parameters.`;

    try {
      const response = await this.handleMessage(prompt);
      const command = response.trim();
      this.logger.logResponse(command, LLMGitHandler.name);
      return command;
    } catch (error) {
      this.logger.logError(
        `Error generating Git command: ${error}`,
        LLMGitHandler.name
      );

      return "Errore: impossibile generare il comando Git.";
    }
  }
}
