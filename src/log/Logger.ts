import * as fs from "fs";

export class Logger {
  private static instance: Logger;
  private errorLog: string;
  private responseLog: string;

  private constructor() {
    this.errorLog =
      "/Users/giovannieprete/projects/GitSmart/vs_code_ext/gitsmart/logs/error.log";
    this.responseLog =
      "/Users/giovannieprete/projects/GitSmart/vs_code_ext/gitsmart/logs/response.log";
    this.ensureLogFileExists(this.errorLog);
    this.ensureLogFileExists(this.responseLog);
  }

  private ensureLogFileExists(filePath: string): void {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, "");
    }
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public logError(message: string, className: string): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${className}] ${message}\n`;
    try {
      fs.appendFileSync(this.errorLog, logMessage);
    } catch (err) {
      console.error("Errore durante la scrittura nel file di log:", err);
    }
  }

    public logResponse(message: string, className: string): void {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [${className}] ${message}\n`;
        try {
        fs.appendFileSync(this.responseLog, logMessage);
        } catch (err) {
        console.error("Errore durante la scrittura nel file di log:", err);
        }
    }
}
