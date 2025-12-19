import { exec } from 'child_process';
import { promisify } from 'util';
import * as vscode from 'vscode';
import { getGitConfig } from './main/GitTownConfig';

const execAsync = promisify(exec);

interface CommandResult {
  success: boolean;
  output?: string;
  error?: string;
}


let outputChannel: vscode.OutputChannel | undefined;
let terminal: vscode.Terminal | undefined;

function getTerminal(): vscode.Terminal {
  if (!terminal) {
    terminal = vscode.window.createTerminal({
      name: 'Git Town',
      hideFromUser: true,
      cwd: getCwd()
    });
  }
  return terminal;
}

export function getOutputChannel(): vscode.OutputChannel {
  if (!outputChannel) {
    outputChannel = vscode.window.createOutputChannel('Git Town');
  }
  return outputChannel;
}

function getCwd(): string {
  // In a multi-root workspace, try to find the folder with a git repository
  const workspaceFolders = vscode.workspace.workspaceFolders;
  
  if (!workspaceFolders || workspaceFolders.length === 0) {
    return process.cwd();
  }
  
  // If there's only one workspace folder, use it
  if (workspaceFolders.length === 1) {
    return workspaceFolders[0].uri.fsPath;
  }
  
  const activeEditor = vscode.window.activeTextEditor;
  if (activeEditor) {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(activeEditor.document.uri);
    if (workspaceFolder) {
      return workspaceFolder.uri.fsPath;
    }
  }
  
  // Fall back to the first workspace folder
  return workspaceFolders[0].uri.fsPath;
}

function cleanAnsiCodes(text: string): string {
  // Remove ANSI escape codes (colors, formatting)
  let cleaned = text.replace(/\x1b\[[0-9;]*m/g, '');
  
  // Remove other ANSI escape sequences (cursor movement, etc.)
  cleaned = cleaned.replace(/\x1b\[[0-9;]*[A-Za-z]/g, '');
  cleaned = cleaned.replace(/\x1b[>=]/g, '');
  
  // Remove null bytes to prevent injection attacks
  cleaned = cleaned.replace(/\0/g, '');
  
  // Remove control characters (except newlines, tabs, carriage returns)
  cleaned = cleaned.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
  
  // Remove potentially dangerous Unicode characters that might be used for obfuscation
  // Zero-width characters
  cleaned = cleaned.replace(/[\u200B-\u200D\uFEFF]/g, '');
  
  // Trim whitespace from start and end
  cleaned = cleaned.trim();
  
  return cleaned;
}

export async function runCommandInLocalFolder(command: string): Promise<CommandResult> {
  const cwd = getCwd();
  try {
    const { stdout, stderr } = await execAsync(command, { 
      cwd,
      encoding: 'utf-8',
      maxBuffer: 1024 * 1024
    });
    
    const commandResult: CommandResult = {
      success: true,
      output: cleanAnsiCodes(stdout)
    };
    
    // Git commands often write warnings to stderr even when they succeed.
    // We'll log stderr as a warning but still consider the command successful
    // unless there's an actual exception (which is caught below).
    if (stderr) {
      getOutputChannel().appendLine(`Warning from command: ${stderr}`);
      commandResult.error = cleanAnsiCodes(stderr);
    }

    return commandResult;
    
  } catch (error: any) {
    const errorMsg = `Failed to execute: ${command}\n${error.message}`;
    getOutputChannel().appendLine(errorMsg);
    throw new Error(errorMsg);
  }
}

export async function isGitTownInstalled(): Promise<string | null> {
  try {
    const result = await runCommandInLocalFolder('git-town --version');
    return result.output || null;
  } catch (error) {
    return null;
  }
}

export async function isGitTownInitialized(): Promise<boolean> {
  try {
    const mainBranchResult = await runCommandInLocalFolder('git config --get gittown.main-branch');
     return (mainBranchResult?.output?.length ?? 0) > 0;
  } catch (error) {
    try {
      const mainBranchResult = await runCommandInLocalFolder('git config --get town.mainBranch');
       return (mainBranchResult?.output?.length ?? 0) > 0;
    } catch {
      return false;
    }
  }
}

export async function isGitRepository(): Promise<boolean> {
  try {
    const result = await runCommandInLocalFolder('git rev-parse --git-dir');
    return result.success;
  } catch (error) {
    return false;
  }
}

/**
 * Gets the currently checked out branch name.
 */
export async function getCurrentBranch(): Promise<string> {
  try {
    const result = await runCommandInLocalFolder('git branch --show-current');
    return result.output?.trim() || '';
  } catch (error) {
    return '';
  }
}

/**
 * Gets list of all local branches.
 * Returns array of branch names.
 */
export async function getAllBranches(): Promise<string[]> {
  try {
    const result = await runCommandInLocalFolder('git branch --format="%(refname:short)"');
    return result.output?.split('\n')
      .map(line => line.trim())
      .filter(line => line !== '') || [];
  } catch (error) {
    return [];
  }
}

/**
 * Gets the parent branch for a given branch using git-town config.
 * Git-town stores parent relationships in git config as:
 * git-town-branch.<branch-name>.parent
 */
export async function getBranchParent(branchName: string): Promise<string | undefined> {
    try {
        const parent = await getGitConfig(`git-town-branch.${branchName}.parent`);
        return parent || undefined;
    } catch (error) {
        return undefined;
    }
}

export async function getUncommittedChangesCount(): Promise<number> {
  try {
    const statusResult = await runCommandInLocalFolder('git status --porcelain');
    return statusResult?.output?.split('\n').filter(line => line.trim().length > 0).length ?? 0;
  } catch (error) {
    return 0;
  }
}

export async function getGitTownBranches(): Promise<string[]> {
  try {
    const branchesResult = await runCommandInLocalFolder('git town branch');
    return branchesResult?.output?.split('\n').map(branch => branch.replace(/"/g, '').trim()).filter(branch => branch.length > 0) ?? [];
  } catch (error) {
    getOutputChannel().appendLine('Failed to get branches');
    return [];
  }
}

function isSafeGitTownCommand(command: string): boolean {
  const trimmed = command.trim();
  // Only allow Git Town commands
  return trimmed.startsWith('git town');
}

function isSafeGitCommand(command: string): boolean {
  const trimmed = command.trim();
  // Only allow specific safe git commands
  const allowedCommands = ['git checkout', 'git switch'];
  return allowedCommands.some(cmd => trimmed.startsWith(cmd));
}

export async function runGitCommand(command: string): Promise<void> {
  const safeCommand = command.trim();
  if (!isSafeGitCommand(safeCommand)) {
    getOutputChannel().appendLine(`Refused to run unsafe git command: "${command}"`);
    vscode.window.showErrorMessage('The git command is not valid or may be unsafe and was not executed.');
    return;
  }
  const term = getTerminal();
  term.show();
  term.sendText(safeCommand);
}

export function sleep(ms: number): Promise<void> {
  return new Promise<void>(resolve => setTimeout(resolve, ms));
}

export function normalizeBranchName(branchName: string): { normalized: string; wasModified: boolean } {
  // Convert spaces to hyphens, following VSCode's pattern
  const normalized = branchName.replace(/ /g, '-');
  return {
    normalized,
    wasModified: normalized !== branchName
  };
}

export function isValidGitBranchName(branchName: string): boolean {
  // Git branch names must:
  // - Start with alphanumeric character
  // - Cannot have consecutive slashes
  // - Cannot have leading/trailing dots
  // - Can contain letters, numbers, dots, underscores, hyphens, and slashes
  
  if (!branchName || branchName.length === 0) {
    return false;
  }
  
  // Must start with alphanumeric
  if (!/^[A-Za-z0-9]/.test(branchName)) {
    return false;
  }
  
  // Only allow safe characters - no backtracking risk with simpler pattern
  if (!/^[A-Za-z0-9._\/-]+$/.test(branchName)) {
    return false;
  }
  
  // Cannot have consecutive slashes
  if (/\/\//.test(branchName)) {
    return false;
  }
  
  // Cannot end with dot or slash (Git restrictions)
  if (/[.\/]$/.test(branchName)) {
    return false;
  }
  
  return true;
}

export async function runGitTownCommand(command: string): Promise<void> {
  const safeCommand = command.trim();
  if (!isSafeGitTownCommand(safeCommand)) {
    getOutputChannel().appendLine(`Refused to run unsafe Git Town command: "${command}"`);
    vscode.window.showErrorMessage('The Git Town command is not valid or may be unsafe and was not executed.');
    return;
  }
  const term = getTerminal();
  term.show();
  term.sendText(safeCommand);
}

export function debounce<T extends (...args: unknown[]) => void>(func: T, waitMs: number): (...args: Parameters<T>) => void {
	let timeout: ReturnType<typeof setTimeout> | undefined;
	return (...args: Parameters<T>) => {
		if (timeout) {
			clearTimeout(timeout);
		}
		timeout = setTimeout(() => {
			timeout = undefined;
			func(...args);
		}, waitMs);
	};
}