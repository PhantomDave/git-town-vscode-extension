# DISCLAIMER: I vibe-coded this readme and small part of the code, so vibe-coding is allowed, but please reivew code from 🤖

# Git Town VS Code Extension

A VS Code extension that provides a powerful wrapper around [Git Town](https://www.git-town.com/) commands, enabling seamless Git workflow management directly from your editor.

## About

Git Town streamlines Git workflows with commands like `sync`, `hack`, `ship`, and `propose`. This extension brings Git Town's powerful capabilities into VS Code with an intuitive UI, command palette integration, and keyboard shortcuts.

## Features

- **Git Town Command Integration**: Execute Git Town commands (`sync`, `hack`, `ship`, `propose`, `observe`) directly from VS Code
- **Activity Bar Widget**: Dedicated Git Town explorer view in the VS Code activity bar
- **Quick Commands**: Keyboard shortcuts for common operations:
  - `Ctrl+K H` (Mac: `Cmd+K H`) - Create a new feature branch (hack)
  - `Ctrl+K Ctrl+S` (Mac: `Cmd+K Cmd+S`) - Sync with upstream
  - `Ctrl+K P` (Mac: `Cmd+K P`) - Propose a pull request
- **Settings Panel**: Configure Git Town options directly in the extension UI
- **Real-time Status**: View your branch status and Git Town configuration
- **Command Palette**: All commands available via VS Code's command palette

## Requirements

- **VS Code**: Version 1.107.0 or higher
- **Git Town**: Version 8.0.0 or higher (must be installed and available on your system PATH)
- **Node.js**: 22.x for development (optional, only needed for building from source)
- **npm**: Latest version (optional, only needed for building from source)

## Installation

### From VS Code Marketplace

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X / Cmd+Shift+X)
3. Search for "git town wrapper"
4. Click Install

### Install Git Town

This extension requires Git Town to be installed on your system:

```bash
# macOS
brew install git-town

# Ubuntu/Debian
sudo apt install git-town

# Or download from https://www.git-town.com/
```

Verify installation:
```bash
git town version
```

## Usage

### Getting Started

1. Open a Git repository in VS Code
2. Click the Git Town icon in the activity bar (left sidebar)
3. Click **"Initialize Git Town"** to set up Git Town for your repository
4. Choose your main branch and perennial branches
5. Use the command palette or keyboard shortcuts to run Git Town commands

### Available Commands

All commands are available via the command palette (`Ctrl+Shift+P` / `Cmd+Shift+P`):

- **Git Town: Initialize** - Initialize Git Town configuration for the repository
- **Git Town: Sync** - Sync the current branch with upstream changes
- **Git Town: Hack** - Create and checkout a new feature branch
- **Git Town: Ship** - Merge and delete the current feature branch
- **Git Town: Propose** - Create a pull request for the current branch
- **Git Town: Refresh** - Refresh the Git Town view

## Development

### Build from Source

#### Prerequisites

- Node.js 22.x
- npm (comes with Node.js)
- Git
- Visual Studio Code

#### Setup

1. Clone the repository:
```bash
git clone https://github.com/PhantomDave/git-town-vscode-extension.git
cd git-town-vscode-extension
```

2. Install dependencies:
```bash
npm install
```

#### Development Commands

Start the development watcher (compiles TypeScript and bundles code on file changes):
```bash
npm run watch
```

Run linting:
```bash
npm run lint
```

Check TypeScript types:
```bash
npm run check-types
```

Run tests:
```bash
npm test
```

Watch tests (re-runs on file changes):
```bash
npm run watch-tests
```

#### Build for Distribution

Production build:
```bash
npm run package
```

Create a `.vsix` package file for distribution:
```bash
npm run package-extension
```

The packaged extension will be created as `phantomdave-gittown-wrapper-*.vsix` in the project root.

#### Loading in VS Code During Development

1. In VS Code, open the Run and Debug view (Ctrl+Shift+D / Cmd+Shift+D)
2. Select "Run Extension" from the dropdown
3. Click the play button or press F5
4. A new VS Code window will open with the extension loaded
5. To reload the extension after code changes, press `Ctrl+R` / `Cmd+R` in the extension development window

#### Project Structure

```
src/
├── extension.ts              # Main extension entry point
├── commandState.ts           # Command execution state management
├── keybindings.ts           # Keyboard shortcut definitions
├── utils.ts                 # Utility functions (shell execution, etc.)
├── items/
│   ├── gitTownItem.ts       # Git Town command tree items
│   └── settingItem.ts       # Settings tree items
├── trees/
│   ├── GitTownTreeDataProvider.ts   # Git Town explorer tree
│   └── SettingsTreeDataProvider.ts  # Settings panel tree
└── test/
    └── *.test.ts            # Unit tests
dist/                        # Compiled JavaScript (generated)
esbuild.js                   # Build configuration
tsconfig.json               # TypeScript configuration
```

#### Code Style

- Uses ESLint for code linting (runs automatically before compilation)
- TypeScript strict mode enabled
- Run `npm run lint -- --fix` to auto-fix linting issues

### Creating a Release

This repository includes an automated GitHub Actions workflow for releases:

1. Go to the **Actions** tab in GitHub
2. Select the **Package and Release** workflow
3. Click **Run workflow**
4. Enter the desired tag name (e.g., `v0.1.0`)
5. Check **"Publish to VS Code Marketplace after creating release"** if you want to automatically publish the extension to the marketplace
6. Click **Run workflow**

The workflow will automatically:
- Validate code (lint, type-check)
- Package the extension into a `.vsix` file
- Create a GitHub Release with the specified tag
- Attach the `.vsix` file to the release
- Generate release notes from recent commits
- Optionally publish to VS Code Marketplace if the checkbox was selected

## Contributing

Contributions are welcome! To get started:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Run tests and linting: `npm run test && npm run lint`
5. Commit your changes: `git commit -am 'Add new feature'`
6. Push to your fork and create a Pull Request

Please ensure:
- Code passes all linting checks
- TypeScript types are correct
- Tests are updated for new features
- Commit messages are clear and descriptive

### Automated Workflows

This repository includes several automated GitHub Actions workflows:

#### CHANGELOG Updates
When a PR is merged to `main`, a workflow automatically:
1. Extracts the PR number, title, author, and commits
2. Updates the CHANGELOG.md file with a new entry under the `[Unreleased]` section
3. Creates a new PR with the CHANGELOG updates (using the built-in `secrets.GITHUB_TOKEN`)
4. The workflow prevents infinite loops by skipping changelog update PRs when determining whether to run again

> **Note:** Because changelog update PRs are created with `secrets.GITHUB_TOKEN`, they do **not** trigger other GitHub Actions workflows (including CI and the auto-approval workflow). These changelog PRs require manual review and merging.

#### Auto-Approval
When CI checks complete successfully on PRs from `github-actions[bot]` or `dependabot[bot]`, a workflow:
1. Waits for all required checks to pass
2. Automatically approves the PR with a ✅ message
3. Prevents duplicate approvals by checking existing reviews
4. Verifies that the PR author matches the workflow actor for security

These workflows work together to streamline the maintenance process and keep the CHANGELOG up-to-date automatically.

## Extension Settings

The extension contributes the following VS Code settings (editable in the Settings panel):

- **Git Town Configuration**: Configure main branch, perennial branches, and other Git Town options
- View and modify settings directly in the VS Code UI without terminal commands

## Known Issues

- Requires Git Town to be installed and available on the system PATH
- Some advanced Git Town features may require specific branch setup
- Windows support requires Git Bash or WSL with Git Town installed

See the [Issues](https://github.com/PhantomDave/git-town-vscode-extension/issues) page for more details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Related Projects

- [Git Town](https://www.git-town.com/) - The core Git workflow management tool
- [VS Code Extension API](https://code.visualstudio.com/api) - VS Code extension development documentation

## Support

For issues, questions, or feature requests, please visit:
- [GitHub Issues](https://github.com/PhantomDave/git-town-vscode-extension/issues)

## Following Extension Guidelines

This extension adheres to the [VS Code Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines) to ensure quality and reliability.

**Enjoy!**
