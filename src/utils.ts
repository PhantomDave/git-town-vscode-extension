import { execSync } from 'child_process';

export function isGitTownInstalled(): string {
  try {
    return execSync('git-town --version', { stdio: 'pipe', encoding: 'utf-8' });
  } catch (error) {
    throw new Error('Git Town is not installed or not found in PATH.');
  }
}