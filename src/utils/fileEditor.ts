import * as fs from "fs";
import * as path from "path";

export interface GitConflict {
  startMarker: string;
  headVersion: string[];
  incomingVersion: string[];
  endMarker: string;
}

export interface GitConflictExtraction {
  conflicts: GitConflict[];
  localVersion: string;
  incomingVersion: string;
}

export function getFileContent(filePath: string): string {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  const content = fs.readFileSync(filePath, "utf-8");
  return content;
}

export function extractGitConflicts(filePath: string): GitConflictExtraction {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split(/\r?\n/);

  const conflicts: GitConflict[] = [];
  let i = 0;

  const localLines: string[] = [];
  const incomingLines: string[] = [];

  while (i < lines.length) {
    if (lines[i].startsWith("<<<<<<<")) {
      const conflict: GitConflict = {
        startMarker: lines[i].trim(),
        headVersion: [],
        incomingVersion: [],
        endMarker: "",
      };
      i++;

      // Read HEAD version
      while (i < lines.length && !lines[i].startsWith("=======")) {
        conflict.headVersion.push(lines[i]);
        i++;
      }

      i++; // skip "======="

      // Read incoming version
      while (i < lines.length && !lines[i].startsWith(">>>>>>>")) {
        conflict.incomingVersion.push(lines[i]);
        i++;
      }

      if (i < lines.length) {
        conflict.endMarker = lines[i].trim();
        i++;
      }

      conflicts.push(conflict);

      // Append versions to reconstructed files
      localLines.push(...conflict.headVersion);
      incomingLines.push(...conflict.incomingVersion);
    } else {
      // Normal line, not part of conflict
      localLines.push(lines[i]);
      incomingLines.push(lines[i]);
      i++;
    }
  }

  return {
    conflicts,
    localVersion: localLines.join("\n"),
    incomingVersion: incomingLines.join("\n"),
  };
}

export async function writeFile(filePath: string, content: string): Promise<void> {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content, "utf-8");
}
