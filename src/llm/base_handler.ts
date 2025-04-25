import axios from "axios";
import { Logger } from "../log/Logger";

interface ChatMessage {
  role: "system" | "user" | "assistant" | "llm_git";
  content: string;
}

export abstract class BaseLLMHandler {
  protected static instance: any;
  protected logger: Logger = Logger.getInstance();
  protected chatHistory: ChatMessage[] = [];

  protected constructor() {
    this.initializeChatHistory();
  }

  protected abstract initializeChatHistory(): void;

  public async handleMessage(userMessage: string, additionalContext?: string): Promise<string> {
    try {
      const response = await axios.post("http://localhost:11434/api/chat", {
        model: "gemma3:12b",
        messages: this.prepareMessages(userMessage, additionalContext),
        stream: false,
      });

      const content = response.data.message?.content || "(No response)";
      this.logger.logResponse(content, this.constructor.name);

      this.processChatHistory(content);

      return this.processResponse(content, additionalContext);
    } catch (err) {
      const errorMessage = `Error during request to LLM: ${err}`;
      this.logger.logError(errorMessage, this.constructor.name);
      return "Error: Unable to contact the LLM model.";
    }
  }

  protected prepareMessages(userMessage: string, additionalContext?: string): ChatMessage[] {
    return this.chatHistory;
  }

  protected processChatHistory(assistantMessage: string): void {
    this.chatHistory.push({ role: "assistant", content: assistantMessage });
  }

  protected abstract processResponse(response: string, additionalContext?: string): any;

  public resetChat(): void {
    this.initializeChatHistory();
  }
}