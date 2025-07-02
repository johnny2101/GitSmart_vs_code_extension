# GitSmart

An intelligent VS Code extension that provides an AI-powered Git assistant for streamlined repository management through natural language interactions.

## Features

- **Natural Language Git Commands**: Interact with Git using plain English instead of remembering complex Git syntax
- **Automatic Conflict Resolution**: AI-powered merge conflict detection and resolution
- **Real-time Git Status Integration**: Contextual awareness of your repository state
- **Interactive Chat Interface**: Built-in chat panel for seamless communication with the Git assistant
- **Smart Command Translation**: Converts natural language requests into precise Git commands
- **Automatic Startup**: Opens the chat interface automatically when VS Code starts

## Requirements

- **VS Code**: Version 1.99.0 or higher
- **Ollama**: Local installation with the `gemma3:12b` model
- **Git**: Git must be installed and accessible from the command line
- **Active Git Repository**: The extension requires an open workspace with a `.git` folder

## Usage

### Opening the Git Assistant

The extension automatically opens the chat interface when VS Code starts. You can also manually open it using:

- **Command Palette**: `Ctrl+Shift+P` → "GitSmart: Apri Chat LLM Git Assistant"
- **Command**: `gitsmart.openChat`

### Example Commands

The AI assistant understands natural language Git operations:

- *"I need to commit my grepper.py file that extracts patterns from specific files"*
- *"Merge the feature branch into main"*
- *"Push my changes to the remote repository"*
- *"Resolve conflicts in the current merge"*
- *"Show me the current status of my repository"*
- *"Create a new branch called feature-auth"*

### Viewing Git Status

Use the command `gitsmart.showStatus` or ask the assistant to show the current repository status.

## Architecture

The extension is built with a modular architecture:

### Core Components

- **`LLMUserHandler`**: Main coordinator that interprets user requests and routes them appropriately
- **`LLMGitHandler`**: Specialized handler for Git operations and command generation
- **`LLMConflictHandler`**: Dedicated conflict resolution system
- **`GitService`**: Git operations wrapper using simple-git
- **`ChatPanel`**: Web-based chat interface with markdown support

### AI Processing Flow

1. **User Input**: Natural language request received through chat interface
2. **Context Analysis**: Current Git status and repository state analyzed
3. **Intent Recognition**: AI determines the type of Git operation needed
4. **Command Generation**: Precise Git commands generated based on intent
5. **Conflict Handling**: Automatic detection and resolution of merge conflicts
6. **Execution Feedback**: Results communicated back to user

## Configuration

The extension connects to Ollama running on `localhost:11434` by default. Ensure your Ollama instance is running and accessible.

### Supported Git Operations

- Commit operations
- Branch management
- Merge and rebase operations
- Push/pull operations
- Conflict resolution
- Status and diff viewing
- File staging and unstaging
- Repository initialization
- Stash operations

## Project Structure

```
src/
├── chat/           # Chat interface components
├── git/            # Git service implementations
├── llm/            # AI handlers and processors
├── log/            # Logging utilities
├── utils/          # Utility functions
└── extension.ts    # Main extension entry point
```

## Dependencies

### Runtime Dependencies
- **axios**: HTTP client for LLM communication
- **simple-git**: Git operations wrapper

### Development Dependencies
- **TypeScript**: Language and compiler
- **ESLint**: Code linting
- **VS Code API types**: Extension development types

## Logging

The extension maintains detailed logs for debugging:
- **Error logs**: `logs/error.log`
- **Response logs**: `logs/response.log`

---

**Note**: This extension is still in development and it's not fully functional
