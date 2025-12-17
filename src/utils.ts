import { execSync } from 'child_process';

export function isGitTownInstalled(): string {
  try {
    return execSync('git-town --version', { stdio: 'pipe', encoding: 'utf-8' });
  } catch (error) {
    throw new Error('Git Town is not installed or not found in PATH.');
  }
}

export function isGitTownInitialized(): boolean {
  try {
    const mainBranch = execSync('git config --get town.mainBranch', { 
      stdio: 'pipe', 
      encoding: 'utf-8' 
    }).trim();
    return mainBranch.length > 0;
  } catch (error) {
    return false;
  }
}

export function isGitRepository(): boolean {
  try {
    execSync('git rev-parse --git-dir', { 
      stdio: 'pipe', 
      encoding: 'utf-8' 
    });
    return true;
  } catch (error) {
    return false;
  }
}